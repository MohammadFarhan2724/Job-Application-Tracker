require('dotenv').config();

const express = require ('express')
const mongoose = require ('mongoose')
const app = express()

app.use(express.json())

mongoose
.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err))

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port 3000`)
})