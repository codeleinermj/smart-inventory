import logging
import os

from fastapi import FastAPI
from pythonjsonlogger.json import JsonFormatter

# JSON logging setup
logger = logging.getLogger()
handler = logging.StreamHandler()
formatter = JsonFormatter("%(asctime)s %(name)s %(levelname)s %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(os.getenv("LOG_LEVEL", "INFO"))


def init_sentry() -> None:
    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        logger.info("Sentry disabled (no DSN)")
        return
    import sentry_sdk

    sentry_sdk.init(dsn=dsn, traces_sample_rate=0.1)
    logger.info("Sentry initialized")


init_sentry()

app = FastAPI(title="Smart Inventory ML", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ml"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
