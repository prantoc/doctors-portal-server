const express = require('express')
var jwt = require('jsonwebtoken');
var cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000






app.get('/', (req, res) => {
    res.send("Doctors's portal is running......");
})

app.listen(port, () => {
    console.log(`Doctors's portal is running on port ${port}`)
})