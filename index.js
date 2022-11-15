const express = require('express')
var jwt = require('jsonwebtoken');
var cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000






app.get('/', (req, res) => {
    res.send("Doctors's portal is running......");
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7incky7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const appOpCollection = client.db("doctorsPortal").collection("appointmentOptions");

    } finally {
    }
}
run().catch(console.dir);







app.listen(port, () => {
    console.log(`Doctors's portal is running on port ${port}`)
})