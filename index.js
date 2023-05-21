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
        // await client.connect();

        const database = client.db('electro_kidz');
        const toysCollection = database.collection('toys');

        // get all toys
        app.get('/all-toys', async (req, res) => {
            const searchTerm = req.query.search;

            let cursor;
            if (searchTerm) {
                cursor = toysCollection.find({ name: { $regex: searchTerm, $options: 'i' } });
            } else {
                cursor = toysCollection.find().limit(20);
            }

            const result = await cursor.toArray();
            res.send(result);
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

        // get all my toys and data sorting by price
        app.get('/my-toys', async (req, res) => {
            const email = req.query.email;
            const sort = req.query.sort;
            const query = { email: email }

            let cursor;

            if (sort === 'low') {
                cursor = toysCollection.aggregate([
                    { $match: query },
                    { $addFields: { priceNumeric: { $toDouble: "$price" } } },
                    { $sort: { priceNumeric: 1 } }
                ]);
            } else if (sort === 'high') {
                cursor = toysCollection.aggregate([
                    { $match: query },
                    { $addFields: { priceNumeric: { $toDouble: "$price" } } },
                    { $sort: { priceNumeric: -1 } }
                ]);
            } else {
                cursor = toysCollection.find(query);
            }

            const result = await cursor.toArray();
            res.send(result)
        })

        // update toys
        app.patch('/my-toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedToy = req.body;
            const updateDoc = {
                $set: {
                    name: updatedToy.name,
                    img: updatedToy.img,
                    price: updatedToy.price,
                    rating: updatedToy.rating,
                    subCategory: updatedToy.subCategory,
                    quantity: updatedToy.quantity,
                    des: updatedToy.des,
                    seller: updatedToy.seller,
                    email: updatedToy.email,
                },
            };

            const result = await toysCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        // toys delete
        app.delete('/my-toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result);
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