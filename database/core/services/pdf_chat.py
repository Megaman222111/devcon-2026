"""Self-hosted PDF Q&A using llama-cpp-python + a 4-bit GGUF model.

Default: Qwen2.5-3B-Instruct in Q4_K_M (~2 GB on disk, runs at ~10-20
tokens/sec on CPU — answers in ~5-15 seconds vs. ~3 minutes for the
transformers version). Override via PDF_CHAT_GGUF_REPO and
PDF_CHAT_GGUF_FILE.
"""

from __future__ import annotations

import base64
import io
import logging
import os
import threading
from typing import Iterable, Optional

logger = logging.getLogger(__name__)

DEFAULT_REPO = os.getenv("PDF_CHAT_GGUF_REPO", "bartowski/Qwen2.5-3B-Instruct-GGUF")
DEFAULT_FILE = os.getenv("PDF_CHAT_GGUF_FILE", "Qwen2.5-3B-Instruct-Q4_K_M.gguf")
N_CTX = int(os.getenv("PDF_CHAT_N_CTX", "8192"))
N_THREADS = int(os.getenv("PDF_CHAT_N_THREADS", "0")) or (os.cpu_count() or 4)
MAX_INPUT_CHARS = int(os.getenv("PDF_CHAT_MAX_CHARS", "20000"))
MAX_NEW_TOKENS = int(os.getenv("PDF_CHAT_MAX_NEW_TOKENS", "320"))

SYSTEM_INSTRUCTION = (
    "You are a careful study assistant answering questions about a PDF the user uploaded.\n"
    "\n"
    "Accuracy rules — follow them strictly:\n"
    "1. Ground every answer in the contents of the attached PDF. Do not use outside knowledge.\n"
    "2. If the PDF does not contain the information needed, reply: \"I could not find that in the document.\"\n"
    "   Then suggest one or two related topics that ARE in the document, if any.\n"
    "3. Quote short phrases from the PDF in double quotes when helpful so the user can verify.\n"
    "4. Cite the page number in parentheses like (p. 4) when identifiable. If a page number is not visible,\n"
    "   cite the section or heading instead, e.g. (Section: \"Reporting Procedures\"). Never guess.\n"
    "5. Keep answers concise (3-6 sentences). Use short bullet lists for steps or comparisons.\n"
    "6. For multi-part questions, answer each part separately.\n"
    "7. For summary requests, use bullet points organized by topic.\n"
    "8. Preserve the document's exact terminology; do not paraphrase technical terms loosely.\n"
    "9. If asked something unrelated to the document, briefly answer if possible but make clear it is not from the PDF.\n"
    "\n"
    "Tone: clear, direct, friendly. No filler like \"Great question\" or \"Certainly\"."
)


def extract_pdf_text(b64: str) -> str:
    """Decode a base64 PDF and return its text with page-number markers."""
    if not b64:
        return ""
    raw = base64.b64decode(b64)
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(raw))
    parts: list[str] = []
    for index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if not text.strip():
            continue
        parts.append(f"--- Page {index} ---\n{text.strip()}")
    return "\n\n".join(parts)


class PdfChat:
    _instance: Optional["PdfChat"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        from llama_cpp import Llama

        logger.info(
            "Loading PDF-chat GGUF %s/%s (n_ctx=%d, n_threads=%d)",
            DEFAULT_REPO,
            DEFAULT_FILE,
            N_CTX,
            N_THREADS,
        )
        self.llm = Llama.from_pretrained(
            repo_id=DEFAULT_REPO,
            filename=DEFAULT_FILE,
            n_ctx=N_CTX,
            n_threads=N_THREADS,
            verbose=False,
        )
        self._infer_lock = threading.Lock()

    @classmethod
    def get(cls) -> "PdfChat":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def _build_messages(
        self,
        question: str,
        history: Iterable[dict],
        pdf_text: str,
    ) -> list[dict]:
        messages: list[dict] = [{"role": "system", "content": SYSTEM_INSTRUCTION}]

        if pdf_text:
            truncated = pdf_text[:MAX_INPUT_CHARS]
            note = ""
            if len(pdf_text) > MAX_INPUT_CHARS:
                note = (
                    "\n\n[Note: the PDF was truncated to fit the model's context window. "
                    "If your question concerns later pages, say so and I will look only at what is present.]"
                )
            messages.append(
                {
                    "role": "user",
                    "content": (
                        "Below is the full text of the PDF I want to ask about. "
                        "Use ONLY this text to answer my next questions.\n\n"
                        f"{truncated}{note}"
                    ),
                }
            )
            messages.append(
                {
                    "role": "assistant",
                    "content": "Got it. I'll answer only from this document and cite page numbers when I can.",
                }
            )

        for turn in history or []:
            role = turn.get("role")
            content = (turn.get("content") or "").strip()
            if not content:
                continue
            if role == "assistant":
                messages.append({"role": "assistant", "content": content})
            elif role == "user":
                messages.append({"role": "user", "content": content})

        messages.append({"role": "user", "content": question})
        return messages

    def answer(
        self,
        question: str,
        history: Iterable[dict] | None = None,
        pdf_text: str = "",
    ) -> str:
        messages = self._build_messages(question, history or [], pdf_text)

        with self._infer_lock:
            output = self.llm.create_chat_completion(
                messages=messages,
                max_tokens=MAX_NEW_TOKENS,
                temperature=0.2,
                top_p=0.9,
            )
        choices = output.get("choices") or []
        if not choices:
            return ""
        message = choices[0].get("message") or {}
        return (message.get("content") or "").strip()
