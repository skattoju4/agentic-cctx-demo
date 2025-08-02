from fastapi import FastAPI
from pydantic import BaseModel
from kafka import KafkaProducer
import json
import os
from contextlib import asynccontextmanager


class Transaction(BaseModel):
    user_id: int
    card_id: int
    amount: float
    description: str

producer = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global producer
    kafka_host = os.environ.get("KAFKA_HOST", "localhost")
    kafka_port = os.environ.get("KAFKA_PORT", "9092")
    producer = KafkaProducer(bootstrap_servers=f"{kafka_host}:{kafka_port}",
                             value_serializer=lambda v: json.dumps(v).encode('utf-8'))
    yield
    producer.close()

app = FastAPI(lifespan=lifespan)


@app.post("/transactions/")
async def create_transaction(transaction: Transaction):
    producer.send('transactions', transaction.dict())
    return transaction

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
