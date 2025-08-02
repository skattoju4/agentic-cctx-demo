import request from 'supertest';
import express from 'express';
import { KafkaClient, Producer } from 'kafka-node';

const mockSend = jest.fn((payload, cb) => cb(null, 'test'));
jest.mock('kafka-node', () => {
  const originalKafka = jest.requireActual('kafka-node');
  return {
    ...originalKafka,
    Producer: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      send: mockSend,
    })),
    KafkaClient: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
    }))
  };
});

const app = express();
app.use(express.json());
const router = require('../index');
app.use('/transactions', router);

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
      userId: 1,
      cardId: 1,
      amount: 10.0,
      description: 'test',
    };

    const response = await request(app)
      .post('/transactions')
      .send(transaction);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(transaction);
    expect(mockSend).toHaveBeenCalledWith(
      [{ topic: 'transactions', messages: JSON.stringify(transaction) }],
      expect.any(Function)
    );
  });
});
