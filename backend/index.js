require('dotenv').config();

const express = require ('express')
const mongoose = require ('mongoose')
const bcrypt = require ('bcrypt')

const authRoutes = require ('./routes/auth.routes')
const applicationRoutes = require ('./routes/application.routes')

const app = express()
app.use(express.json())

app.use("/api/application", applicationRoutes)
app.use("/api/auth", authRoutes)

mongoose
.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err))

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port 3000`)
})