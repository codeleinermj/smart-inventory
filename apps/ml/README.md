# Smart Inventory ML Service

FastAPI-based ML service for stock prediction. Exposes a `/health` endpoint and will serve prediction models in future phases.

## Setup

### Linux / Mac

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### Windows (Git Bash)

```bash
python -m venv .venv
source .venv/Scripts/activate
pip install -e ".[dev]"
```

> Note: On Windows the virtual environment activation script lives under `Scripts/` instead of `bin/`.

## Run Tests

```bash
pytest
```

## Run Service (development)

```bash
uvicorn app.main:app --reload
```

The service binds to `http://localhost:8000` by default.

## Environment Variables

| Variable    | Required | Description                          |
|-------------|----------|--------------------------------------|
| `SENTRY_DSN`| No       | Sentry DSN. Omit to disable Sentry.  |
| `LOG_LEVEL` | No       | Logging level (default: `INFO`)      |
