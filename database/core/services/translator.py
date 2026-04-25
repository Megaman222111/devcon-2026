"""Self-hosted translation using facebook/nllb-200-distilled-600M.

One model, ~1.2 GB in fp16, handles 200 languages. Lazy-loaded the first
time `translate()` is called; subsequent calls reuse the in-memory model.
"""

from __future__ import annotations

import logging
import os
import threading
from typing import Optional

logger = logging.getLogger(__name__)

# Map common short codes (what the Next.js frontend already sends) to the
# Flores-200 codes that NLLB expects. Anything missing falls through to the
# raw input, which lets advanced callers pass Flores codes directly.
LANG_CODE_MAP = {
    "en": "eng_Latn",
    "fr": "fra_Latn",
    "es": "spa_Latn",
    "de": "deu_Latn",
    "pt": "por_Latn",
    "it": "ita_Latn",
    "zh": "zho_Hans",
    "zh-cn": "zho_Hans",
    "zh-tw": "zho_Hant",
    "ja": "jpn_Jpan",
    "ko": "kor_Hang",
    "ar": "arb_Arab",
    "ru": "rus_Cyrl",
    "hi": "hin_Deva",
    "vi": "vie_Latn",
    "tl": "tgl_Latn",
    "id": "ind_Latn",
    "nl": "nld_Latn",
    "pl": "pol_Latn",
    "tr": "tur_Latn",
    "uk": "ukr_Cyrl",
    "fa": "pes_Arab",
}

DEFAULT_MODEL = os.getenv(
    "TRANSLATION_MODEL",
    "facebook/nllb-200-distilled-600M",
)
MAX_CHUNK_TOKENS = 384  # NLLB context budget; we chunk longer inputs


def normalize_lang(code: str) -> str:
    if not code:
        return "eng_Latn"
    cleaned = code.strip().lower()
    return LANG_CODE_MAP.get(cleaned, code)


class Translator:
    _instance: Optional["Translator"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        # Imports are local so module import doesn't pull in torch/transformers
        # until the service is actually used (Django startup stays fast).
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device == "cuda" else torch.float32

        logger.info("Loading translation model %s on %s", DEFAULT_MODEL, device)
        self.tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(
            DEFAULT_MODEL,
            torch_dtype=dtype,
        ).to(device)
        self.model.eval()
        self.device = device
        self._torch = torch
        # Serialize calls — the NLLB fast tokenizer mutates internal state
        # when src_lang is set, so concurrent requests collide with
        # `RuntimeError: Already borrowed`.
        self._infer_lock = threading.Lock()

    @classmethod
    def get(cls) -> "Translator":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def _chunk(self, text: str) -> list[str]:
        # Split on paragraphs first, then by sentence-ish punctuation if a
        # paragraph is still too long for the model's encoder window.
        paragraphs = [p for p in text.split("\n") if p.strip()]
        chunks: list[str] = []
        for paragraph in paragraphs:
            tokens = self.tokenizer(paragraph, return_tensors="pt").input_ids[0]
            if len(tokens) <= MAX_CHUNK_TOKENS:
                chunks.append(paragraph)
                continue
            # naive sentence split; good enough for lesson markdown
            buffer: list[str] = []
            buffer_len = 0
            for sentence in paragraph.replace("? ", "?|").replace("! ", "!|").replace(". ", ".|").split("|"):
                sent_tokens = len(self.tokenizer(sentence, return_tensors="pt").input_ids[0])
                if buffer_len + sent_tokens > MAX_CHUNK_TOKENS and buffer:
                    chunks.append(" ".join(buffer))
                    buffer = [sentence]
                    buffer_len = sent_tokens
                else:
                    buffer.append(sentence)
                    buffer_len += sent_tokens
            if buffer:
                chunks.append(" ".join(buffer))
        return chunks or [text]

    def translate(self, text: str, target_lang: str = "fr", source_lang: str = "en") -> str:
        if not text or not text.strip():
            return ""

        src = normalize_lang(source_lang)
        tgt = normalize_lang(target_lang)

        with self._infer_lock:
            self.tokenizer.src_lang = src

            forced_bos_token_id = self.tokenizer.convert_tokens_to_ids(tgt)
            if forced_bos_token_id is None or forced_bos_token_id == self.tokenizer.unk_token_id:
                raise ValueError(f"Unsupported target language: {target_lang} (mapped to {tgt})")

            outputs: list[str] = []
            with self._torch.inference_mode():
                for chunk in self._chunk(text):
                    inputs = self.tokenizer(chunk, return_tensors="pt", truncation=True).to(self.device)
                    generated = self.model.generate(
                        **inputs,
                        forced_bos_token_id=forced_bos_token_id,
                        max_new_tokens=512,
                        num_beams=2,
                    )
                    outputs.append(self.tokenizer.batch_decode(generated, skip_special_tokens=True)[0])

            return "\n".join(outputs)
