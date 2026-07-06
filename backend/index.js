require('dotenv').config();

const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const cors = require('cors')

const authRoutes = require('./routes/auth.routes')
const applicationRoutes = require('./routes/application.routes')

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // needed if you're sending cookies/auth headers
}));

app.use(express.json())

app.use("/api/applications", applicationRoutes)
app.use("/api/auth", authRoutes)

mongoose
.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});