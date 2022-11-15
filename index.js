const express = require('express')
var jwt = require('jsonwebtoken');
var cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7incky7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {


    try {
        const appOpCollection = client.db("doctorsPortal").collection("appointmentOptions");
        const bookingCollection = client.db('doctorsPortal').collection("bookingAppointment")
        app.get('/appointment-options', async (req, res) => {
            const result = await appOpCollection.find({}).toArray();
            res.send(result)
        })

        app.post('/booking-appointment', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result)
        })

    } finally {
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Doctors's portal is running......");
})

app.listen(port, () => {
    console.log(`Doctors's portal is running on port ${port}`)
})