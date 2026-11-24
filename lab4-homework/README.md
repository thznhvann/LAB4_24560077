# ShopAdmin – Lab 4 Homework

## Prerequisites
- Node.js
- MongoDB running locally on port 27017

## Setup & Run Backend
1. Navigate to the backend folder:
   ```bash
   cd be

  npm install

  PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/shopadmin_lab4
JWT_SECRET=your_jwt_secret_key

node server.js

Run Frontend
Open fe/index.html with Live Server / Five Server in VS Code.