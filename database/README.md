# Django Database Backend

This folder now contains a minimal Django backend configured for PostgreSQL on AWS RDS.

## Setup

1. Create a virtual environment:

   ```bash
   cd database
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Copy the AWS RDS CA bundle into this folder as `global-bundle.pem`.

3. Update `.env` with the real database password, or fetch it from AWS Secrets Manager before running Django.

   If your shell already has valid AWS credentials, you can use:

   ```bash
   ./scripts/run_with_rds_secret.sh migrate
   ```

   The helper will use the `aws` CLI when available, and otherwise fall back to `boto3` from the local virtualenv.

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

5. Start the server:

   ```bash
   python manage.py runserver
   ```

## Existing Database Introspection

If the RDS database already has tables and you want Django models generated from them:

```bash
./scripts/run_with_rds_secret.sh inspectdb > core/models.py
```

---

## AI inference endpoints

This backend also exposes the self-hosted AI services that replace Google
Translate and Gemini in the frontend. Endpoints (all `POST`, JSON in/out):

| Endpoint | Purpose | Request shape |
|---|---|---|
| `/api/translate/` | Translate text | `{ text, targetLang, sourceLang? }` → `{ translatedText }` |
| `/api/lesson-insights/` | Extract literal keywords + translations for a lesson section | `{ text, targetLang? }` → `{ keyIdeas, keywords: [{ english, french }] }` |
| `/api/chat-pdf/` | PDF Q&A | `{ question, history, pdf: { data: <base64>, mimeType, name } }` → `{ answer }` |
| `/api/warmup/` | Pre-load every model | `{}` → `{ warmed: true }` |
| `/api/health/` | Liveness probe | `{ status: "ok" }` |

Models used (all configurable via env):

- Translation: `facebook/nllb-200-distilled-600M` (200 languages, ~1.2 GB fp16)
- Keywords: `KeyBERT` + `sentence-transformers/all-MiniLM-L6-v2`
- PDF chat: `Qwen/Qwen2.5-3B-Instruct` (~6 GB fp16, 32K context)

All three load lazily on first request and stay resident; nothing is sent
to a third-party model provider once the server is up.

### Running on Kaggle (free T4 GPU)

1. Create a new Kaggle notebook. **Settings → Accelerator: GPU T4 x1** and
   **Internet: On**.

2. Clone the repo into the working directory and install dependencies:

   ```python
   !git clone https://github.com/<your-org>/devcon-2026.git
   %cd devcon-2026/database
   !pip install -q -r requirements.txt
   !pip install -q torch --index-url https://download.pytorch.org/whl/cu121  # if torch needs the CUDA wheel
   ```

3. Skip Postgres on Kaggle by leaving `DB_HOST` empty — settings.py falls
   back to a local SQLite file. Run the no-op migration so Django stops
   complaining:

   ```python
   !python manage.py migrate --noinput
   ```

4. Start the server in the background and warm up the models:

   ```python
   import subprocess, time, requests

   subprocess.Popen(
       ["python", "manage.py", "runserver", "0.0.0.0:8000", "--noreload"],
       cwd="/kaggle/working/devcon-2026/database",
   )
   time.sleep(5)
   requests.post("http://localhost:8000/api/warmup/", timeout=600).json()
   ```

5. Expose it via a Cloudflare quick-tunnel (no account needed):

   ```python
   !wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared
   !chmod +x /usr/local/bin/cloudflared
   import subprocess
   tunnel = subprocess.Popen(
       ["cloudflared", "tunnel", "--url", "http://localhost:8000"],
       stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
   )
   for line in tunnel.stdout:
       print(line, end="")
       if "trycloudflare.com" in line:
           break
   ```

   Copy the printed `https://<random>.trycloudflare.com` URL — that is your
   `AI_BACKEND_URL`.

6. In `frontend/.env.local`, set:

   ```
   AI_BACKEND_URL=https://<random>.trycloudflare.com
   ```

   Restart `npm run dev`. The Next.js routes
   (`/api/translate`, `/api/lesson-insights`, `/api/chat-pdf`) now forward
   to the Kaggle backend.

### Running locally (CPU)

Everything still works without a GPU — translation takes a few seconds
per call and the LLM is slow but functional. Same install steps minus the
CUDA wheel:

```bash
cd database
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Then `curl http://localhost:8000/api/health/` and point
`AI_BACKEND_URL=http://localhost:8000` in the frontend.

### Smoke-test the backend

Once the server is up (locally or via cloudflared), check each endpoint:

```bash
BASE=http://localhost:8000   # or your https://*.trycloudflare.com URL

curl -s "$BASE/api/health/"

curl -s -X POST "$BASE/api/translate/" \
  -H 'Content-Type: application/json' \
  -d '{"text":"Security professionals must observe and report.","targetLang":"fr"}'

curl -s -X POST "$BASE/api/lesson-insights/" \
  -H 'Content-Type: application/json' \
  -d '{"text":"Security professionals observe, document, and report incidents accurately.","targetLang":"fr"}'

# Chat with a PDF (replace sample.pdf with a real file).
PDF_B64=$(base64 -w0 sample.pdf)
curl -s -X POST "$BASE/api/chat-pdf/" \
  -H 'Content-Type: application/json' \
  -d "{\"question\":\"Summarize this document.\",\"history\":[],\"pdf\":{\"name\":\"sample.pdf\",\"mimeType\":\"application/pdf\",\"data\":\"$PDF_B64\"}}"
```

The first call to each endpoint will be slow (it loads the model). Subsequent
calls reuse the in-memory model.

### Environment variables

| Var | Default | Purpose |
|---|---|---|
| `TRANSLATION_MODEL` | `facebook/nllb-200-distilled-600M` | Override the translator |
| `PDF_CHAT_MODEL` | `Qwen/Qwen2.5-3B-Instruct` | Override the chat LLM |
| `KEYWORD_EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Override the keyword embedder |
| `PDF_CHAT_MAX_CHARS` | `60000` | Truncate PDF text past this length |
| `PDF_CHAT_MAX_NEW_TOKENS` | `512` | Cap on generated answer length |
| `CORS_ALLOWED_ORIGINS` | empty (= allow all) | Comma-separated origins to accept |
| `ALLOWED_HOSTS` | `*` | Django host whitelist |
