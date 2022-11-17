const express = require('express')
const jwt = require('jsonwebtoken');
var cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7incky7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authoraization;
    if (!authHeader) {
        return res.status(401).send('Unathorized Access !')
    }
    const token = authHeader.split(' ')[1];
    console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access!' })
        }
        req.decoded = decoded
        next()
    });
}
async function run() {
    try {
        const appOpCollection = client.db("doctorsPortal").collection("appointmentOptions");
        const usersCollection = client.db('doctorsPortal').collection("user")
        const bookingCollection = client.db('doctorsPortal').collection("bookingAppointment")


        //# jwt-token-create 
        app.get('/jwt', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })



        //? Appointment-options 
        //!----------------- bad way aggregate function in mongodb-----------------------------
        // app.get('/appointment-options', async (req, res) => {
        //     const date = req.query.date
        //     // console.log(date);
        //     const options = await appOpCollection.find({}).toArray();
        //     const bookingQuery = { appointmentDate: date }
        //     const booked = await bookingCollection.find(bookingQuery).toArray();

        //     options.forEach(op => {
        //         const optionBooked = booked.filter(book => book.treatment === op.name)
        //         const bookedSlots = optionBooked.map(book => book.slot)
        //         const remaningSlots = op.slots.filter(slot => !bookedSlots.includes(slot))
        //         op.slots = remaningSlots
        //     })
        //     res.send(options)

        // })

        //*----------------- best way aggregate function in mongodb--------------------
        app.get('/v2/appointment-options', async (req, res) => {
            const date = req.query.date
            const options = await appOpCollection.aggregate([
                {
                    $lookup:
                    {
                        from: 'bookingAppointment',
                        localField: 'name',
                        foreignField: 'treatment',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$appointmentDate', date]
                                    }
                                }
                            }
                        ],
                        as: 'booked'
                    }
                },
                {
                    $project:
                    {
                        name: 1,
                        slots: 1,
                        booked: {
                            $map: {
                                input: "$booked",
                                as: "book",
                                in: '$$book.slot'
                            }
                        }
                    }
                },
                {
                    $project: {
                        name: 1,
                        slots: {
                            $setDifference: ['$slots', '$booked']
                        }
                    }
                }
            ]).toArray();
            res.send(options)
        })

        //? Users
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        //? User-Bookings
        app.post('/booking-appointment', async (req, res) => {
            const booking = req.body;
            const query = {
                appointmentDate: booking.appointmentDate,
                treatment: booking.treatment,
                email: booking.email
            }
            const booked = await bookingCollection.find(query).toArray();

            if (booked.length) {
                const message = `You have alreand a booking for this day ${booking.appointmentDate}`
                return res.send(({ acknowledge: false, message }))
            }
            const result = await bookingCollection.insertOne(booking);
            res.send(result)
        })

        app.get('/booking-appointments', verifyJWT, async (req, res) => {
            const email = req.query.email
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'Forbidden Access!' })
            }
            const query = { email: email }
            const result = await bookingCollection.find(query).toArray()
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