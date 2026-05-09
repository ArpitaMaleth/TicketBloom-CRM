require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initKafka } = require('./services/kafkaService'); // ✅ Enabled Kafka Bot

const app = express();

// Connect to Database
connectDB();

// Initialize The Kafka Bot Consumer
initKafka();

app.use(cors());
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});