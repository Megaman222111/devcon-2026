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
