from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch, MagicMock

import datetime

@patch('main.KafkaProducer', new_callable=MagicMock)
def test_create_transaction(mock_kafka_producer):
    with TestClient(app) as client:
        transaction = {
            "user": 1,
            "card": 1,
            "year": 2023,
            "month": 1,
            "day": 1,
            "time": "12:00:00",
            "amount": "$10.00",
            "use_chip": "Swipe Transaction",
            "merchant_name": 123456789,
            "merchant_city": "New York",
            "merchant_state": "NY",
            "zip": 10001.0,
            "mcc": 5411,
            "errors": "",
            "is_fraud": "No"
        }
        response = client.post(
            "/transactions/",
            json=transaction,
        )
        assert response.status_code == 200
        assert response.json() == transaction

        expected_kafka_payload = transaction.copy()
        expected_kafka_payload["time"] = datetime.time(12, 0)
        mock_kafka_producer.return_value.send.assert_called_once_with('transactions', expected_kafka_payload)

@patch('main.KafkaProducer', new_callable=MagicMock)
def test_healthz(mock_kafka_producer):
    with TestClient(app) as client:
        response = client.get("/healthz")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
