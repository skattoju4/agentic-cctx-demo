import express, { Request, Response } from 'express';
import { KafkaClient, Producer, ProduceRequest } from 'kafka-node';

const app = express();
app.use(express.json());

const kafkaHost = process.env.KAFKA_HOST || 'localhost';
const kafkaPort = process.env.KAFKA_PORT || '9092';

const client = new KafkaClient({ kafkaHost: `${kafkaHost}:${kafkaPort}` });
const producer = new Producer(client);

interface Transaction {
    user_id: number;
    card_id: number;
    amount: number;
    description: string;
}

const transactionRouter = express.Router();

transactionRouter.post('/', (req: Request, res: Response) => {
    const transaction: Transaction = req.body;
    const payload: ProduceRequest[] = [
        {
            topic: 'transactions',
            messages: JSON.stringify(transaction),
        },
    ];

    producer.send(payload, (error, data) => {
        if (error) {
            console.error('Error sending message to Kafka:', error);
            res.status(500).send('Error sending message to Kafka');
        } else {
            console.log('Message sent to Kafka:', data);
            res.status(200).json(transaction);
        }
    });
});

const healthzRouter = express.Router();

producer.on('ready', () => {
    console.log('Kafka Producer is connected and ready.');

    healthzRouter.get('/', (req: Request, res: Response) => {
        res.status(200).json({status: 'ok'});
    });

    if (require.main === module) {
        const port = process.env.PORT || 3000;
        app.use('/transactions', transactionRouter);
        app.use('/healthz', healthzRouter);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
});

producer.on('error', (error) => {
    console.error('Error in Kafka Producer:', error);
});

process.on('SIGINT', () => {
    producer.close(() => {
        client.close(() => {
            process.exit();
        });
    });
});

module.exports = {transactionRouter, healthzRouter};
