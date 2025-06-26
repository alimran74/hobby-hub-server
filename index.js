const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@imran.chugnik.mongodb.net/?retryWrites=true&w=majority&appName=Imran`;

// MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect to MongoDB
    // await client.connect();

    const groupCollection = client.db("hobbyDB").collection("groups");

    // Create a new group
    app.post("/groups", async (req, res) => {
      const newGroup = req.body;
      try {
        const result = await groupCollection.insertOne(newGroup);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to create group" });
      }
    });

    // Get groups, optionally filter by createdByEmail
    app.get("/groups", async (req, res) => {
      try {
        const query = {};
        if (req.query.createdByEmail) {
          query.createdByEmail = req.query.createdByEmail;
        }
        const groups = await groupCollection.find(query).toArray();
        res.send(groups);
      } catch (error) {
        res.status(500).send("Server Error");
      }
    });

    // Get featured groups (currently all groups)
    app.get("/featured-groups", async (req, res) => {
      try {
        const groups = await groupCollection.find().toArray();
        res.send(groups);
      } catch (error) {
        res.status(500).send("Server Error");
      }
    });

    // Get single group by ID
    app.get("/groups/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const group = await groupCollection.findOne({ _id: new ObjectId(id) });
        if (!group) {
          return res.status(404).send("Group not found");
        }
        res.send(group);
      } catch (error) {
        res.status(500).send("Server Error");
      }
    });

    // Delete a group only if createdByEmail matches (email passed as query param)
    app.delete("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;

      if (!email) {
        return res.status(400).send({ success: false, message: "Missing email query parameter" });
      }

      try {
        const result = await groupCollection.deleteOne({
          _id: new ObjectId(id),
          createdByEmail: email,
        });

        if (result.deletedCount === 0) {
          return res.status(403).send({ success: false, message: "Unauthorized or group not found" });
        }

        res.send({ success: true, message: "Group deleted successfully" });
      } catch (error) {
        res.status(500).send({ success: false, message: "Failed to delete group" });
      }
    });

    // Update group only if createdByEmail matches (sent inside body)
    app.put("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const { createdByEmail } = updatedData;

      if (!createdByEmail) {
        return res.status(400).send({ message: "Missing creator email" });
      }

      // Optional: Remove _id from updatedData if it exists to avoid errors
      if (updatedData._id) delete updatedData._id;

      try {
        const result = await groupCollection.updateOne(
          { _id: new ObjectId(id), createdByEmail: createdByEmail },
          { $set: updatedData }
        );

        if (result.matchedCount === 0) {
          return res.status(403).send({ message: "Unauthorized or group not found" });
        }

        res.send({
          message: result.modifiedCount > 0 ? "Group updated successfully" : "No changes made",
          modifiedCount: result.modifiedCount,
        });
      } catch (err) {
        console.error("Failed to update group:", err);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // update profile info api 

    // server/routes/userRoutes.js
app.put("/api/users/:email", async (req, res) => {
  const email = req.params.email;
  const { displayName, photoURL } = req.body;

  try {
    const result = await userCollection.updateOne(
      { email },
      {
        $set: {
          displayName,
          photoURL,
        },
      },
      { upsert: true } // optional: insert if not exists
    );

    res.send({ success: true, result });
  } catch (err) {
    res.status(500).send({ success: false, message: "Server Error", error: err });
  }
});


    console.log("Connected to MongoDB!");
  } finally {
    // await client.close(); // Keep connection open for server life
  }
}

run().catch(console.dir);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 HobbyHub Server is Running!");
});

app.listen(port, () => {
  console.log(`✅ HobbyHub backend running on port ${port}`);
});
