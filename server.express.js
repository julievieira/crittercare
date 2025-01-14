const express = require("express"),
  { MongoClient, ObjectId } = require("mongodb"),
  hbs = require("express-handlebars").engine,
  cookie = require("cookie-session"),
  app = express(),
  //mime = require("mime"),
  dir = "public/",
  port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(dir));
app.use(express.static("views"));

app.engine("handlebars", hbs());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(
  cookie({
    name: "session",
    keys: ["username", "password"],
  })
);

const url = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.soifdqr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(url);

// connect to plant data set
let collection = null;
let userCollection = null;
let user = null;

async function run() {
  await client.connect();
  collection = await client.db("FinalProjectWebware").collection("Points");
  userCollection = await client.db("FinalProjectWebware").collection("Users");
}

run();

// middleware to check connection so you don't have to check inside of every route handler
app.use((req, res, next) => {
  if (collection !== null && userCollection != null) {
    next();
  } else {
    res
      .status(503)
      .send("Service Unavailable: Database connection not established.");
  }
});

// user login
app.post("/create", async (req, res) => {
  let username = req.body.username;
  const userAlreadyCreated = await userCollection.findOne({
    username: username,
  });
  if (userAlreadyCreated) {
    //   let label = document.getElementById("createAccountFail")
    //   label.innerHTML = "Username already used, please choose a different username"
  } else {
    const result = await userCollection.insertOne(req.body);
    req.session.username = username;
    res.redirect("game.html");
  }
});

app.get("/createUser", (req, res, next) => {
  res.render("createUser", {msg: "", layout: false});
});

app.post("/login", async (req, res, next) => {
  user = req.body.username;
  let password = req.body.password;
  const accounts = await client
    .db("FinalProjectWebware")
    .collection("Users")
    .find()
    .toArray();

  req.session.login = false;

  accounts.forEach((e) => {
    if (password === e.password && user === e.username) {
      req.session.login = true;
      req.session.username = user;
    }
  });

  if (req.session.login) {
    res.redirect("game.html");
  } else {
    res.render("index", {
      msg: "login failed: incorrect password",
      layout: false,
    });
  }
});

app.get("/", (req, res, next) => {
  res.render("index", { msg: "", layout: false });
});

app.get("/createUser", (req, res, next) => {
  res.render("createUser", { msg: "", layout: false });
});

// add some middleware that always sends unauthenicaetd users to the login page
app.use(function (req, res, next) {
  if (req.session.login === true) {
    next();
  } else
    res.render("index", {
      msg: "login failed: please try again",
      layout: false,
    });
});

app.get("/main.html", (req, res) => {
  res.render("main", { msg: "success you have logged in", layout: false });
});

// get user data
app.get("/getUserData", async (req, res) => {
  
  try {
    const username = req.session.username;
    
    if (!username) {
      // Ensure the user is logged in
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userData = await userCollection
      .find({ username: req.session.username })
      .toArray();

    res.status(200).json(userData);
    
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update money value
app.post("/updateMoney", async (req, res) => {
  try {
    const username = req.session.username;
    const newMoneyValue = req.body.money;

    if (!username || typeof newMoneyValue !== "number") {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Update the user's money value in the database
    const result = await userCollection.updateOne(
      { username },
      { $set: { money: newMoneyValue } }
    );

    if (result.modifiedCount === 1) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: "Failed to update user data" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update food value
app.post("/updateFood", async (req, res) => {
  try {
    const username = req.session.username;
    const newFoodValue = req.body.food;

    if (!username || typeof newFoodValue !== "number") {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Update the user's food value in the database
    const result = await userCollection.updateOne(
      { username },
      { $set: { food: newFoodValue } }
    );

    if (result.modifiedCount === 1) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: "Failed to update user data" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update exercise value
app.post("/updateExercise", async (req, res) => {
  try {
    const username = req.session.username;
    const newExerciseValue = req.body.exercise;

    if (!username || typeof newExerciseValue !== "number") {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Update the user's exercise value in the database
    const result = await userCollection.updateOne(
      { username },
      { $set: { exercise: newExerciseValue } }
    );

    if (result.modifiedCount === 1) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: "Failed to update user data" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update sleep value
app.post("/updateSleep", async (req, res) => {
  try {
    const username = req.session.username;
    const newSleepValue = req.body.sleep;

    if (!username || typeof newSleepValue !== "number") {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Update the user's sleep value in the database
    const result = await userCollection.updateOne(
      { username },
      { $set: { sleep: newSleepValue } }
    );

    if (result.modifiedCount === 1) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: "Failed to update user data" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// to insert document into database
app.post("/addCritter", async (req, res) => {
  let result = await collection.insertOne({
    user: user,
    name: req.body.name,
    type: req.body.type,
    lifepoints: req.body.lifepoints,
  });

  const userList = await collection.find({ user: user }).toArray();
  userList.forEach((item) => {
    console.log("add: " + JSON.stringify(Object.values(item)));
  });
  res.json(userList);
});

app.get("/data", async (req, res) => {
  const userList = await collection.find({ user: user }).toArray();
  res.json(userList);
});

// Start the server
app.listen(process.env.PORT || port);
