"""HTTP endpoints exposing the local AI services to the Next.js frontend.

Contracts mirror the previous Gemini/Google routes so the frontend doesn't
need to change its request/response shapes.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET

from .services.keywords import extract_with_translation
from .services.pdf_chat import PdfChat, extract_pdf_text
from .services.translator import Translator

logger = logging.getLogger(__name__)


def _json_body(request: HttpRequest) -> dict[str, Any]:
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return {}


@csrf_exempt
@require_GET
def healthcheck(_request: HttpRequest) -> JsonResponse:
    return JsonResponse({"status": "ok"})


@csrf_exempt
@require_POST
def translate(request: HttpRequest) -> JsonResponse:
    payload = _json_body(request)
    text = (payload.get("text") or "").strip()
    target_lang = (payload.get("targetLang") or "fr").strip() or "fr"
    source_lang = (payload.get("sourceLang") or "en").strip() or "en"

    if not text:
        return JsonResponse({"error": "Missing text"}, status=400)

    try:
        translated = Translator.get().translate(text, target_lang=target_lang, source_lang=source_lang)
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)
    except Exception:  # noqa: BLE001
        logger.exception("Translation failed")
        return JsonResponse({"error": "Translation failed"}, status=500)

    return JsonResponse({"translatedText": translated})


@csrf_exempt
@require_POST
def lesson_insights(request: HttpRequest) -> JsonResponse:
    payload = _json_body(request)
    text = (payload.get("text") or "").strip()
    target_lang = (payload.get("targetLang") or "fr").strip() or "fr"

    if not text:
        return JsonResponse({"error": "Missing section text"}, status=400)

    try:
        result = extract_with_translation(text, target_lang=target_lang)
    except Exception:  # noqa: BLE001
        logger.exception("Lesson insights failed")
        return JsonResponse({"error": "Could not extract keywords"}, status=500)

    return JsonResponse(result)


@csrf_exempt
@require_POST
def chat_pdf(request: HttpRequest) -> JsonResponse:
    payload = _json_body(request)
    question = (payload.get("question") or "").strip()
    history = payload.get("history") or []
    pdf = payload.get("pdf") or {}
    pdf_b64 = (pdf.get("data") or "").strip() if isinstance(pdf, dict) else ""

    if not question:
        return JsonResponse({"error": "Missing question"}, status=400)

    pdf_text = ""
    if pdf_b64:
        try:
            pdf_text = extract_pdf_text(pdf_b64)
        except Exception:  # noqa: BLE001
            logger.exception("PDF extraction failed")
            return JsonResponse({"error": "Could not read the PDF"}, status=400)

    try:
        answer = PdfChat.get().answer(question=question, history=history, pdf_text=pdf_text)
    except Exception:  # noqa: BLE001
        logger.exception("Chat generation failed")
        return JsonResponse({"error": "Generation failed"}, status=500)

    if not answer:
        return JsonResponse({"error": "No answer was returned. Try rephrasing your question."}, status=502)

    return JsonResponse({"answer": answer})


@csrf_exempt
@require_POST
def warmup(_request: HttpRequest) -> JsonResponse:
    """Pre-load every model. Useful right after starting the server so the
    first user-facing request isn't a multi-minute cold start."""
    try:
        Translator.get()
    except Exception:  # noqa: BLE001
        logger.exception("Translator warmup failed")
        return JsonResponse({"warmed": False, "error": "translator"}, status=500)

    try:
        # The keyword extractor uses the translator internally, so import lazily.
        from .services.keywords import KeywordExtractor

        KeywordExtractor.get()
    except Exception:  # noqa: BLE001
        logger.exception("KeywordExtractor warmup failed")
        return JsonResponse({"warmed": False, "error": "keywords"}, status=500)

    try:
        PdfChat.get()
    except Exception:  # noqa: BLE001
        logger.exception("PdfChat warmup failed")
        return JsonResponse({"warmed": False, "error": "pdf_chat"}, status=500)

    return JsonResponse({"warmed": True})
