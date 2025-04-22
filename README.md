## Service Broker System

A full-stack distributed service broker application allowing service providers to register services (e.g., hash generator, random number generator) and requesters to search and invoke them. The system includes authentication, two-factor verification via OTP, and role-based routing.

## Features

🔐 User Authentication (Signup & Login)

🧪 OTP-based Two-Factor Authentication for secure service registration/removal

⚙️ Service Provider Interface to add and manage services

🔍 Service Requester Interface to search and invoke services

📤 Dynamic Invocation of microservices over HTTP (Hash Generator, RNG, etc.)

🗂️ Services are isolated per provider and cannot be overwritten

## Tech Stack

Frontend: React.js

Backend: Node.js + Express

Database: MySQL

Microservices:

Hash Value Generator (port 5001)

Random Number Generator (port 5002)

## How It Works

1. User Signup/Login

Users create an account using id, email, and password.

Passwords are hashed using bcrypt and stored securely.

2. Provider Authentication + OTP

After login, the service provider requests an OTP via /generateOtp.

OTP is displayed on the console and must be entered before accessing the dashboard.

3. Service Registration/Removal

Providers can add or remove services using their user ID and OTP.

Duplicate services (same name and port) are not allowed.

4. Requester Interface

Requesters search services (e.g., random or hash) and invoke them.

For hashValueGenerator, users enter input text and select a hash algorithm.

5. Dynamic Routing

On invocation, the broker dynamically forwards the request to the corresponding service based on IP & port.

## Example Services

1. Random Number Generator
Port: 5002
Endpoint: /random
Method: GET
Output: { "number": 42 }

2. Hash Value Generator
Port: 5001
Endpoint: /hash
Method: POST
Input: { "input": "hello", "method": "md5" }
Output: { "hash": "5d41402abc4b2a76b9719d911017c592" }

## Setup Instructions

## 1. Clone the Repository

git clone https://github.com/yourusername/service-broker-app.git

cd service-broker-app

## 2. Install Dependencies

npm install

## 3. Configure MySQL

CREATE DATABASE service_broker;

CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100),
  passwordHash VARCHAR(255)
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serviceName VARCHAR(100),
  ip VARCHAR(50),
  port INT,
  userId VARCHAR(50),
  FOREIGN KEY (userId) REFERENCES users(id)
);

## 4. Start the Microservices

### In separate terminals:
node hashService.js

node randomService.js

## 5. Start the Broker Server

node broker.js

## 6. Start the React Frontend

npm start

## Demo Credentials

Use dummy credentials to test:

Provider:

ID: provider1
Email: p1@example.com
Password: pass123

## Feedback & Contributions
Feel free to open issues or pull requests. Contributions and suggestions are welcome!

