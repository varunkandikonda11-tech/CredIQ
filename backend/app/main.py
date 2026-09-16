from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.routers import assistant, explain, features, lender, predict, score

app = FastAPI(title="CreditIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.(vercel\.app|netlify\.app|onrender\.com)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(explain.router)
app.include_router(features.router)
app.include_router(lender.router)
app.include_router(score.router)
app.include_router(assistant.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
