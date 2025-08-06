import csv
import requests
import json
import os

def bulk_ingest(file_path, url):
    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            transaction = {
                "user": int(row["User"]),
                "card": int(row["Card"]),
                "year": int(row["Year"]),
                "month": int(row["Month"]),
                "day": int(row["Day"]),
                "time": row["Time"],
                "amount": row["Amount"],
                "use_chip": row["Use Chip"],
                "merchant_name": int(row["Merchant Name"]),
                "merchant_city": row["Merchant City"],
                "merchant_state": row["Merchant State"],
                "zip": float(row["Zip"]) if row["Zip"] else None,
                "mcc": int(row["MCC"]),
                "errors": row["Errors?"],
                "is_fraud": row["Is Fraud?"]
            }
            response = requests.post(url, data=json.dumps(transaction), headers={'Content-Type': 'application/json'})
            response.raise_for_status()


if __name__ == "__main__":
    # Get the directory of the script
    script_dir = os.path.dirname(os.path.realpath(__file__))
    # Go up one directory and then into the data directory
    file_path = os.path.join(script_dir, '..', 'data', 'transactions.csv')
    bulk_ingest(file_path, 'http://localhost:8000/transactions/')
