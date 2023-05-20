const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ijvq5c.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db('electro_kidz');
        const toysCollection = database.collection('toys');

        // get all toys
        app.get('/all-toys', async (req, res) => {
            const searchTerm = req.query.search;
            if (searchTerm) {
                const cursor = toysCollection.find({ name: { $regex: searchTerm, $options: 'i' } });
                const result = await cursor.toArray();
                return res.send(result)
            } else {
                const cursor = toysCollection.find().limit(20);
                const result = await cursor.toArray();
                return res.send(result)
            }
        })

        // get single toy by id
        app.get('/all-toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result)
        })

        // post toy
        app.post('/all-toys', async (req, res) => {
            const newToy = req.body;
            const result = await toysCollection.insertOne(newToy);
            res.send(result)
        })

        // get my toys
        app.get('/my-toys', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = toysCollection.find(query);
            const result = await cursor.toArray();
            return res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Electro Kidz is running')
})

app.listen(port, () => {
    console.log(`Electro Kidz is running on port ${port}`)
})