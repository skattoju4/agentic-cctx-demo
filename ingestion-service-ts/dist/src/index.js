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
const express_1 = __importDefault(require("express"));
const kafkajs_1 = require("kafkajs");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const kafkaHost = process.env.KAFKA_HOST || 'localhost';
const kafkaPort = process.env.KAFKA_PORT || '9092';
const kafka = new kafkajs_1.Kafka({
    clientId: 'ingestion-service-ts',
    brokers: [`${kafkaHost}:${kafkaPort}`]
});
const producer = kafka.producer();
const transactionRouter = express_1.default.Router();
transactionRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = req.body;
    try {
        yield producer.send({
            topic: 'transactions',
            messages: [{ value: JSON.stringify(transaction) }],
        });
        console.log('Message sent to Kafka:', transaction);
        res.status(200).json(transaction);
    }
    catch (error) {
        console.error('Error sending message to Kafka:', error);
        res.status(500).send('Error sending message to Kafka');
    }
}));
const healthzRouter = express_1.default.Router();
healthzRouter.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    yield producer.connect();
    if (require.main === module) {
        const port = process.env.PORT || 3000;
        app.use('/transactions', transactionRouter);
        app.use('/healthz', healthzRouter);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
});
run().catch(console.error);
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    yield producer.disconnect();
    process.exit();
}));
module.exports = { transactionRouter, healthzRouter };
