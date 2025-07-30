import express, { Request, Response } from 'express';
import { KafkaClient, Producer, ProduceRequest } from 'kafka-node';

const app = express();
app.use(express.json());

const client = new KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new Producer(client);

interface Transaction {
    userId: number;
    cardId: number;
    amount: number;
    description: string;
}

producer.on('ready', () => {
    console.log('Kafka Producer is connected and ready.');
});

producer.on('error', (error) => {
    console.error('Error in Kafka Producer:', error);
});

const router = express.Router();

router.post('/', (req: Request, res: Response) => {
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

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.use('/transactions', router);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = router;
