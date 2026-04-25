#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ ! -f "${PROJECT_DIR}/.env" ]]; then
  echo "Missing ${PROJECT_DIR}/.env"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to parse the Secrets Manager response."
  exit 1
fi

set -a
source "${PROJECT_DIR}/.env"
set +a

if [[ -z "${DB_SECRET_ARN:-}" ]]; then
  echo "DB_SECRET_ARN is not set in .env"
  exit 1
fi

if command -v aws >/dev/null 2>&1; then
  export DB_PASSWORD="$(
    aws secretsmanager get-secret-value \
      --secret-id "${DB_SECRET_ARN}" \
      --query SecretString \
      --output text | jq -r '.password'
  )"
else
  export DB_PASSWORD="$(
    "${PROJECT_DIR}/.venv/bin/python" - <<'PY'
import json
import os

import boto3

client = boto3.client("secretsmanager", region_name="us-west-2")
value = client.get_secret_value(SecretId=os.environ["DB_SECRET_ARN"])
print(json.loads(value["SecretString"])["password"])
PY
  )"
fi

cd "${PROJECT_DIR}"
exec "${PROJECT_DIR}/.venv/bin/python" manage.py "$@"
