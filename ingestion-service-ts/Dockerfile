FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY common ./common
COPY ingestion-service-ts/. .

RUN npm run build --if-present

ENV KAFKA_HOST="localhost"
ENV KAFKA_PORT="9092"

CMD ["node", "dist/index.js"]
