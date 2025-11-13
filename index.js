const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Food Lover server is on!')
})


const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();


    const db = client.db("foodLoversDB");
    const foodsCollection = db.collection("foods-info");

    
    const favoritesCollection = client.db("local-food-lovers-db").collection("favorite-foods-info");


    // To Get all Reviews
    app.get("/reviews", async (req, res) => {
      try {
        const cursor = foodsCollection.find().sort({ date: -1 });
        const reviews = await cursor.toArray();
        res.send(reviews);
      } catch (error) {
        res.status(500).send({ message: "Error fetching reviews", error });
      }
    });

    // To Get top 6 Rated Reviews
    app.get("/featured-reviews", async (req, res) => {
      try {
        const cursor = foodsCollection.find().sort({ rating: -1 }).limit(6);
        const featured = await cursor.toArray();
        res.send(featured);
      } catch (error) {
        res.status(500).send({ message: "Error fetching featured reviews", error });
      }
    });




    // To Get All Reviews with search option
    app.get("/all-reviews", async (req, res) => {
      try {
        const search = req.query.search || "";

        let query = {};
        if (search) {
          query = { foodName: { $regex: search, $options: "i" } };
        }

        const cursor = foodsCollection.find(query).sort({ date: -1 });
        const reviews = await cursor.toArray();
        res.send(reviews);
      } catch (error) {
        res.status(500).send({ message: "Error fetching all reviews", error });
      }
    });





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
