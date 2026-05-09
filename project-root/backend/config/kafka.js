const { Kafka } = require('kafkajs');

// Initialize Kafka with the broker address from your .env file
const kafka = new Kafka({
    clientId: 'crm-app',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

module.exports = kafka;