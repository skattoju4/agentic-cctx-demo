import requests
import json
from kafka import KafkaConsumer
import time
import os
import subprocess

def get_kafka_host():
    """Gets the Kafka host from the load balancer IP."""
    kafka_release_name = os.environ.get("KAFKA_RELEASE_NAME", "kafka")
    service_name = f"{kafka_release_name}-kafka-external-bootstrap"
    cmd = [
        "kubectl", "get", "svc", service_name,
        "-n", "default",
        "-o", "jsonpath={.status.loadBalancer.ingress[0].ip}"
    ]
    # The IP address might take a moment to be available
    for _ in range(5):
        try:
            host = subprocess.check_output(cmd).decode('utf-8')
            if host:
                print(f"Discovered Kafka host: {host}")
                return host
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass
        print(f"Waiting for Kafka service '{service_name}' to get an external IP...")
        time.sleep(10)
    raise Exception("Failed to get Kafka host from load balancer")


def main():
    # Send a request to the ingestion service
    transaction = {
        "user_id": 1,
        "card_id": 1,
        "amount": 10.0,
        "description": "e2e test"
    }
    ingestion_service_host = os.environ.get("INGESTION_SERVICE_HOST", "localhost")
    ingestion_service_port = os.environ.get("INGESTION_SERVICE_PORT", "8000")
    print(f"Sending transaction: {transaction}")
    response = requests.post(f"http://{ingestion_service_host}:{ingestion_service_port}/transactions/", json=transaction)
    response.raise_for_status()
    print("Waiting for message to be processed by Kafka...")
    time.sleep(5)

    # Check if the message is in Kafka
    kafka_host = get_kafka_host()
    kafka_port = os.environ.get("KAFKA_PORT", "9092")
    consumer = KafkaConsumer(
        'transactions',
        bootstrap_servers=f"{kafka_host}:{kafka_port}",
        auto_offset_reset='earliest',
        consumer_timeout_ms=10000,
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )

    for message in consumer:
        print(f"Received message: {message.value}")
        if message.value == transaction:
            print("Successfully received message from Kafka")
            return

    raise Exception("Failed to receive message from Kafka")

if __name__ == "__main__":
    main()
