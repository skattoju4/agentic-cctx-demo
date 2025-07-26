from fastapi import FastAPI
from pydantic import BaseModel
from kafka import KafkaProducer
import json
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
    producer = KafkaProducer(bootstrap_servers='localhost:9092',
                             value_serializer=lambda v: json.dumps(v).encode('utf-8'))
    yield
    producer.close()

app = FastAPI(lifespan=lifespan)


@app.post("/transactions/")
async def create_transaction(transaction: Transaction):
    producer.send('transactions', transaction.dict())
    return transaction
