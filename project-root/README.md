# 🌸 TicketBloom

**Real-Time Customer Support Ticket CRM**

TicketBloom is an enterprise-grade, full-stack web application designed to streamline customer support operations. Built with a scalable **Event-Driven Architecture** using **Apache Kafka**, the system allows customers to raise support tickets while support agents efficiently view, manage, and resolve them. 

---

## 🚀 Features

- **Role-Based Access Control (RBAC):** Secure layout and API endpoints separated for `customer` and `agent` roles.
- **Event-Driven Architecture:** REST APIs decoupled from background tasks using **Apache Kafka** (Producer & Consumer bots) for fast, non-blocking operations.
- **Secure Authentication:** JSON Web Tokens (JWT) for stateless sessions and `bcryptjs` for secure password hashing.
- **Premium UI/UX:** A modern, fully responsive frontend completely styled using a **Glassmorphism** aesthetic with dynamic real-time statistics.S

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Message Broker:** Apache Kafka, KafkaJS
- **Security:** JWT (jsonwebtoken), bcryptjs, CORS
- **Frontend:** HTML5, CSS3, Vanilla JavaScript

---

## 📁 Project Structure

```text
project-root/
│
├── backend/
│   ├── config/         # Database and Kafka configuration
│   ├── controllers/    # API logic (auth & tickets)
│   ├── middleware/     # JWT authentication & RBAC guards
│   ├── models/         # Mongoose Schemas (User, Ticket)
│   ├── routes/         # Express routing definitions
│   ├── services/       # Kafka Producer and Consumer logic
│   └── server.js       # Express Application Entry Point
│
├── frontend/
│   ├── css/            # Glassmorphism stylings
│   ├── js/             # Client-side API fetch logic
│   ├── login.html      
│   ├── register.html   
│   └── dashboard.html  # Premium Role-Aware Dashboard
│
├── package.json
└── docker-compose.yml  # For Local Kafka/Zookeeper Setup
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- **Apache Kafka** installed locally OR running via Docker/Docker-Compose.

### 1. Clone the Repository & Install Dependencies
```bash
cd project-root
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in `project-root/backend/.env` containing:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
KAFKA_CLIENT_ID=ticketbloom-app
KAFKA_BROKERS=localhost:9092
```

### 3. Start Apache Kafka
Make sure your Kafka broker and Zookeeper instances are running on `localhost:9092`. (If using the provided `docker-compose.yml`, run `docker-compose up -d`).

### 4. Start the Application
```bash
# From within the project-root directory
node backend/server.js
```

### 5. Access the Frontend
Open `project-root/frontend/login.html` directly in your browser or run it using a VS Code Live Server extension. 

---

## 📡 API Endpoints

### Authentication `/api/auth`
- `POST /register` : Register a new user (Customer or Agent)
- `POST /login` : Authenticate user & return JWT

### Tickets `/api/tickets` (Protected)
- `POST /` : Create a new ticket (Customers)
- `GET /` : Retrieve tickets (Agents see all, Customers see only their own)
- `PUT /:id/status` : Update ticket status (Agents Only — requires 'Open', 'In-Progress', or 'Closed')

---

## 🎓 Academic Context

**Developer:** Arpita Maleth | Reg No: CU23BCA0011A  
**Course:** BCA Programme, Chanakya University  
**Timeline:** Sprint 1 to 3 (March - April 2026)  

This project was built from scratch spanning three sprints to demonstrate full-stack proficiency, database modeling, and the transition from standard CRUD structures to decoupling architecture via Message Brokers (Kafka).