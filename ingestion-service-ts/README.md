# TypeScript Ingestion Service

This service is a TypeScript-based implementation of the transaction ingestion service. It uses Express to create a REST API and `kafka-node` to produce messages to a Kafka topic.

## Running the service

To run the service locally, you will need to have Node.js and npm installed.

1. Install the dependencies:
```bash
npm install
```

2. Compile the TypeScript:
```bash
npx tsc
```

3. Run the service:
```bash
node dist/index.js
```

## Running the tests

To run the tests, you will need to have `jest` installed.

```bash
npm test
```
