const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;

var serviceAccount = require("./Configs/burj-luxury-firebase-adminsdk-cpx5j-9665265201.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

require('dotenv').config()
console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.suylw.mongodb.net/burjLuxury?retryWrites=true&w=majority`;

const port = 5000

const app = express()

app.use(cors())
app.use(bodyParser.json())

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjLuxury").collection("bookings");
//   console.log('db connected successfully');
//   client.close();
app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result => {
        res.send(result.insertedCount > 0);
    })
    console.log(newBooking);
});

    app.get('/bookings', (req, res) => {
        // console.log(req.query.email)
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(" ")[1];
            console.log({idToken});
            admin
            .auth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
            let tokenEmail = decodedToken.email;
            if(tokenEmail == req.query.email){
                bookings.find({email: req.query.email})
        .toArray((err, documents) => {
            res.status(200).send(documents);
        })
            }
            else{
                res.status(401).send('Unauthorize access')
            }
            // ...
            })
            .catch((error) => {
                res.status(401).send('Unauthorize access')
            });
        }

        else{
            res.status(401).send('Unauthorize access')
        }

        // idToken comes from the client app
        
    })
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)