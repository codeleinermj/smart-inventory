import logging
import os
import math

from fastapi import FastAPI
from pydantic import BaseModel, Field
from pythonjsonlogger.json import JsonFormatter

# JSON logging setup
logger = logging.getLogger()
handler = logging.StreamHandler()
formatter = JsonFormatter("%(asctime)s %(name)s %(levelname)s %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())


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


# ─── Stock prediction ─────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    product_id: str
    current_stock: int = Field(..., ge=0)
    min_stock: int = Field(..., ge=0)
    avg_daily_usage: float | None = Field(default=None, ge=0)
    recent_movements: list[dict] = Field(default_factory=list)


class PredictResponse(BaseModel):
    product_id: str
    status: str
    days_until_reorder: float | None
    recommended_reorder_qty: int
    avg_daily_usage: float
    confidence: float


def _estimate_daily_usage(current_stock: int, recent_movements: list[dict]) -> float:
    out_movements = [m for m in recent_movements if m.get("type") == "out"]

    if len(out_movements) >= 3:
        from datetime import datetime
        quantities = [m.get("quantity", 0) for m in out_movements]
        total_qty = sum(quantities)
        try:
            dates = [
                datetime.fromisoformat(m["created_at"].replace("Z", "+00:00"))
                for m in out_movements if "created_at" in m
            ]
            if len(dates) >= 2:
                date_range_days = (max(dates) - min(dates)).days or 1
                return round(total_qty / date_range_days, 2)
        except Exception:
            pass
        return round(total_qty / 30, 2)

    return round(max(current_stock, 1) / 30, 2)


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    avg_usage = req.avg_daily_usage
    if avg_usage is None or avg_usage == 0:
        avg_usage = _estimate_daily_usage(req.current_stock, req.recent_movements)
    avg_usage = max(avg_usage, 0.01)

    buffer = req.current_stock - req.min_stock
    days_until_reorder = 0.0 if buffer <= 0 else round(buffer / avg_usage, 1)
    recommended_qty = math.ceil(avg_usage * 30)

    if req.current_stock <= 0:
        status = "critical"
    elif req.current_stock <= req.min_stock:
        status = "low"
    elif req.current_stock <= req.min_stock * 2:
        status = "normal"
    else:
        status = "excess"

    n_out = sum(1 for m in req.recent_movements if m.get("type") == "out")
    confidence = round(min(0.95, 0.4 + n_out * 0.055), 2)

    return PredictResponse(
        product_id=req.product_id,
        status=status,
        days_until_reorder=days_until_reorder,
        recommended_reorder_qty=recommended_qty,
        avg_daily_usage=avg_usage,
        confidence=confidence,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)