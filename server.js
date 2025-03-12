// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = process.env.DATABASE_NAME;

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectDB();

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const database = client.db(dbName);
  const users = database.collection("users");

  try {
    const user = await users.findOne({ username });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        res.json({ success: true, message: "Login successful." });
      } else {
        res.json({ success: false, message: "Invalid username or password." });
      }
    } else {
      res.json({ success: false, message: "Invalid username or password." });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.json({ success: false, message: "Database error." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.get("/success.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/success.html"));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

async function addUser(username, password) {
  try {
    const database = client.db(dbName);
    const users = database.collection("users");
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      username: username,
      password: hashedPassword,
    }); // Corrected line
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } catch (err) {
    console.error(`Error adding user: ${err}`);
  }
}

async function createTestUser() {
  const testUser = await client
    .db(dbName)
    .collection("users")
    .findOne({ username: "testuser" });
  if (!testUser) {
    addUser("testuser", "testpassword");
  }
}

createTestUser();
