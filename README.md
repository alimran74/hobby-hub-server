# 🎯 HobbyHub - Server

This is the **backend server** for [HobbyHub](https://github.com/alimran74/HobbyHub-client), a full-stack hobby group management platform where users can discover, create, and join local interest-based communities. This server handles all data and API logic using **Node.js**, **Express.js**, **MongoDB**, and **JWT authentication**.

---

## 🚀 Live Site

🌐 [Client Frontend](https://hobbyhub-27dd6.web.app)

---

## 📦 Features

- 🔐 JWT-based user authentication and route protection
- 📝 CRUD operations for hobby groups and user interactions
- ⚙️ RESTful API with proper error handling
- 🧩 Modular folder structure for scalability
- 🌐 CORS enabled for frontend-backend integration

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Auth:** Firebase (client) + JWT (server-side verification)
- **Environment Management:** dotenv
- **Tools:** Postman, Thunder Client

---

## 🔐 Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
