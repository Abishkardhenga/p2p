from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from constants import WHITELIST_URL


def configure(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=WHITELIST_URL,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
