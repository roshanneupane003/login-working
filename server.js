const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend"))); // Serve static files from the frontend folder

const uri = "mongodb://127.0.0.1:27017"; // Replace with your MongoDB URI
const client = new MongoClient(uri);

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
  const database = client.db("mydb"); // Replace 'mydb' with your database name
  const users = database.collection("users");

  try {
    const user = await users.findOne({ username, password });

    if (user) {
      res.json({ success: true, message: "Login successful." });
    } else {
      res.json({ success: false, message: "Invalid username or password." });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.json({ success: false, message: "Database error." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html")); // Serve the login.html from frontend folder
});

app.get("/success.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/success.html")); // Serve the success.html from frontend folder
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Example of how to add a user to the database, for testing.
// You would normally have a separate registration page for this.
async function addUser(username, password) {
  try {
    const database = client.db("mydb");
    const users = database.collection("users");
    const result = await users.insertOne({ username, password });
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } catch (err) {
    console.error(`Error adding user: ${err}`);
  }
}

// Adding a test user
addUser("testuser", "testpassword"); // Remove this line after adding your test user.
