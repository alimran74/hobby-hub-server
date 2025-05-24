const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

// /////////////////////////////////////////////

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@imran.chugnik.mongodb.net/?retryWrites=true&w=majority&appName=Imran`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // db collection

    const groupCollection = client.db("hobbyDB").collection("groups");

    // create post group api

    app.post("/groups", async (req, res) => {
      const newGroup = req.body;
      console.log("Received group:", newGroup);

      const result = await groupCollection.insertOne(newGroup);
      res.send(result);
    });

    // get operation

    // app.get("/groups", async (req, res) => {
    //   try {
    //     const groups = await groupCollection.find().toArray();
    //     res.json(groups);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).send("Server Error");
    //   }
    // });

    // featured group get section

    app.get("/featured-groups", async (req, res) => {
      try {
        const groups = await groupCollection.find().toArray();
        res.json(groups);
      } catch (error) {
        res.status(500).send("Server Error");
      }
    });

    // end point for single group

    app.get("/groups/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const group = await groupCollection.findOne({ _id: new ObjectId(id) });
        if (!group) {
          return res.status(404).send("Group not found");
        }
        res.json(group);
      } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
      }
    });

    
    

    // my group er end point
// app.get("/groups", async (req, res) => {
//   try {
//     const query = {};
//     if (req.query.createdByEmail) {
//       query.createdByEmail = req.query.createdByEmail;
//     }

//     const groups = await groupCollection.find(query).toArray();
//     res.json(groups);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// });

app.get("/groups", async (req, res) => {
  console.log("Query received:", req.query.createdByEmail);
  try {
    const query = {};
    if (req.query.createdByEmail) {
      query.createdByEmail = req.query.createdByEmail;
    }
    const groups = await groupCollection.find(query).toArray();
    console.log("Groups found:", groups);
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});



    

    // delete api for per group

    app.delete("/groups/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await groupCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Group not found" });
        }

        res.send({ success: true, message: "Group deleted successfully" });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ success: false, message: "Failed to delete group" });
      }
    });

    // update group from database

    app.put("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      try {
        const result = await groupCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        res.send({
          message:
            result.modifiedCount > 0
              ? "Group updated successfully"
              : "No changes made",
          modifiedCount: result.modifiedCount,
        });
      } catch (err) {
        console.error("Failed to update group:", err);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// /////////////////////////////////////////////

app.get("/", (req, res) => {
  res.send("HobbyHub is getting to started");
});

app.listen(port, () => {
  console.log(`Hobby Hub is running on port ${port}`);
});
