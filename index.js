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

    // ✅ Create a group
    app.post("/groups", async (req, res) => {
      const newGroup = req.body;
      try {
        const result = await groupCollection.insertOne(newGroup);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to create group" });
      }
    });

    // ✅ Get all groups (optionally by creator)
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

    // ✅ Get featured groups (same as all for now)
    app.get("/featured-groups", async (req, res) => {
      try {
        const groups = await groupCollection.find().toArray();
        res.send(groups);
      } catch (error) {
        res.status(500).send("Server Error");
      }
    });

    // ✅ Get a single group
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

    // ✅ Delete a group (only if createdByEmail matches)
    app.delete("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.query.email; // must send ?email=...

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

    // ✅ Update a group (only if createdByEmail matches)
    app.put("/groups/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  try {
    const group = await groupCollection.findOne({ _id: new ObjectId(id) });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check ownership
    if (group.createdByEmail !== updatedData.createdByEmail) {
      return res.status(403).json({ message: "Unauthorized or group not found" });
    }

    const result = await groupCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    res.json({
      message: result.modifiedCount > 0 ? "Group updated successfully" : "No changes made",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Failed to update group:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


    console.log("Connected to MongoDB!");
  } finally {
    // await client.close();
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
