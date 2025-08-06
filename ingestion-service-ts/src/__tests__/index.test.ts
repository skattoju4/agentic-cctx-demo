import request from 'supertest';
import express from 'express';
import { Kafka } from 'kafkajs';

const mockSend = jest.fn(() => Promise.resolve());
jest.mock('kafkajs', () => {
    const originalKafka = jest.requireActual('kafkajs');
    return {
        ...originalKafka,
        Kafka: jest.fn().mockImplementation(() => ({
            producer: jest.fn(() => ({
                connect: jest.fn(() => Promise.resolve()),
                send: mockSend,
                disconnect: jest.fn(() => Promise.resolve()),
            })),
        })),
    };
});

const app = express();
app.use(express.json());
const { transactionRouter, healthzRouter } = require('../index');
app.use('/transactions', transactionRouter);
app.use('/healthz', healthzRouter);

app.get('/healthz', (req, res) => {
    res.status(200).json({status: 'ok'});
});

describe('GET /healthz', () => {
    it('should return 200 OK', async () => {
        const response = await request(app)
            .get('/healthz')
            .send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({status: 'ok'});
    });
});

describe('POST /transactions', () => {
  it('should send a message to Kafka and return the transaction', async () => {
    const transaction = {
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
    };

    const response = await request(app)
      .post('/transactions')
      .send(transaction);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(transaction);
    expect(mockSend).toHaveBeenCalledWith({
        topic: 'transactions',
        messages: [{ value: JSON.stringify(transaction) }],
    });
  });
});
