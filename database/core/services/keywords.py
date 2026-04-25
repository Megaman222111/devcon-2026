"""Keyword extraction using KeyBERT + sentence-transformers.

Replaces the Gemini-based /api/lesson-insights call. Returns keywords that
are *literal substrings* of the source text (matching the previous contract)
and pairs each with its translation via the local Translator.
"""

from __future__ import annotations

import logging
import os
import re
import threading
from typing import Optional

from .translator import Translator

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = os.getenv(
    "KEYWORD_EMBEDDING_MODEL",
    "sentence-transformers/all-MiniLM-L6-v2",
)


def _normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip().lower()


class KeywordExtractor:
    _instance: Optional["KeywordExtractor"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        from keybert import KeyBERT
        from sentence_transformers import SentenceTransformer
        import torch

        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info("Loading keyword embedding model %s on %s", EMBEDDING_MODEL, device)
        embedder = SentenceTransformer(EMBEDDING_MODEL, device=device)
        self._kw = KeyBERT(model=embedder)

    @classmethod
    def get(cls) -> "KeywordExtractor":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def extract(self, text: str, top_n: int = 20) -> list[str]:
        if not text or not text.strip():
            return []
        # Pull single tokens and 2-3 word phrases. MMR keeps the list diverse.
        candidates = self._kw.extract_keywords(
            text,
            keyphrase_ngram_range=(1, 3),
            stop_words="english",
            use_mmr=True,
            diversity=0.6,
            top_n=top_n * 2,
        )
        normalized_text = _normalize(text)
        seen: set[str] = set()
        kept: list[str] = []
        for keyword, _score in candidates:
            normalized = _normalize(keyword)
            if not normalized or normalized in seen:
                continue
            if len(normalized) < 4:
                continue
            # Must appear literally in the source text (the existing contract).
            if normalized not in normalized_text:
                continue
            seen.add(normalized)
            kept.append(keyword.strip())
            if len(kept) >= top_n:
                break
        return kept


def extract_with_translation(
    text: str,
    target_lang: str = "fr",
    source_lang: str = "en",
    top_n: int = 20,
) -> dict:
    keywords = KeywordExtractor.get().extract(text, top_n=top_n)
    translator = Translator.get()
    paired = []
    for keyword in keywords:
        try:
            translated = translator.translate(keyword, target_lang=target_lang, source_lang=source_lang)
        except Exception:  # noqa: BLE001
            translated = keyword
        paired.append({"english": keyword, "french": translated})
    return {
        "keyIdeas": ["Review the section and focus on the highlighted study terms."],
        "keywords": paired,
    }
