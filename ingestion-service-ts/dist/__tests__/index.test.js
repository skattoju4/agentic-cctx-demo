"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const mockSend = jest.fn(() => Promise.resolve());
jest.mock('kafkajs', () => {
    const originalKafka = jest.requireActual('kafkajs');
    return Object.assign(Object.assign({}, originalKafka), { Kafka: jest.fn().mockImplementation(() => ({
            producer: jest.fn(() => ({
                connect: jest.fn(() => Promise.resolve()),
                send: mockSend,
                disconnect: jest.fn(() => Promise.resolve()),
            })),
        })) });
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
const { transactionRouter, healthzRouter } = require('../index');
app.use('/transactions', transactionRouter);
app.use('/healthz', healthzRouter);
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
describe('GET /healthz', () => {
    it('should return 200 OK', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/healthz')
            .send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    }));
});
describe('POST /transactions', () => {
    it('should send a message to Kafka and return the transaction', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield (0, supertest_1.default)(app)
            .post('/transactions')
            .send(transaction);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(transaction);
        expect(mockSend).toHaveBeenCalledWith({
            topic: 'transactions',
            messages: [{ value: JSON.stringify(transaction) }],
        });
    }));
});
