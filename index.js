const express = require('express');
const mongoose = require("mongoose");
const app = express();
const port = 3230;
require("dotenv").config();
const TeamRouter = require("./Routes/TeamRoute");
app.use(express.json());

// Database Details
const DB_USER = process.env['DB_USER'];
const DB_PWD = process.env['DB_PWD'];
const DB_URL = process.env['DB_URL'];
const DB_NAME = "task-jeff";
const DB_COLLECTION_NAME = "players";

const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://" + DB_USER + ":" + DB_PWD + "@" + DB_URL + "/" + DB_NAME + "/?retryWrites=true&w=majority";
const uri = "mongodb+srv://sandy_rtt:sandy12345@cluster0.4no4wy8.mongodb.net/"+DB_NAME;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function run() {
  try {
    console.log("URI -> ", uri);
    await client.connect(uri);
    await client.db("admin").command({ ping: 1 });

    db = client.db(DB_NAME);

    console.log("You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}


// Sample create document
async function sampleCreate() {
  const demo_doc = {
    "demo": "doc demo",
    "hello": "world"
  };
  const demo_create = await db.collection(DB_COLLECTION_NAME).insertOne(demo_doc);

  console.log("Added!")
  console.log(demo_create.insertedId);
}


// Endpoints

app.get('/', async (req, res) => {
  res.status(200).send('Hello World!');
});

app.get('/demo', async (req, res) => {
  await sampleCreate();
  res.status(200).json({ status: 1, message: "demo" });
});

app.use("/teams", TeamRouter)

//

// app.listen(port, () => {
//   console.log(`App listening on port ${port}`);
// });

// Connect to the MongoDB database using the MONGO_URI from the environment variables
mongoose
    .connect(uri)
    .then(() => {
        console.log("DB Connection Successfull");
        console.log("Node Environment :", process.env.NODE_ENV);
        // Start the Express server once the database connection is established
        app.listen(port, () => {
            console.log(`Listening to port : ${port}`);
        });
    })
    .catch((err) => {
        // Log any errors that occur during the database connection process
        console.log("Error -> ", err.message);
    });

run();