const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const cookieSession = require('cookie-session');
const {
  getUserByEmail,
  generateRandomString,
  dataBaseGenerator,
  hashedPasswordGenerator
} = require('./helpers');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["Kapala Kapala who is kekadaman", "Oggy Poggy"]
}));
app.set("view engine", "ejs");
const PORT = 8080;

//Helper function to find urls created by a user
const urlsForUser = (id) => {
  const filteredURLs = {};
  const keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if (urlDatabase[key]["userID"] === id) {
      filteredURLs[key] = urlDatabase[key];
    }
  }
  return filteredURLs;
};

//urls Database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

// users Database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPasswordGenerator("apple")
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPasswordGenerator("dishwasher-funk")
  }
};

app.get("/", (req, res) => {
  let user_id = req.session.user_id;
  let user = users[user_id];
  if (!user_id) {
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  let user = users[user_id];
  if (!user_id) {
    res.redirect("/login");
    return;
  }
  let userURL = urlsForUser(user_id);
  const templateVars = { urls: userURL, user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let user_id = req.session.user_id;
  let userID = user_id; // to match key with fresh urlDatabase
  if (!user_id) {
    res.status(403).send("You have to log in first to create new URL");
    return;
  }
  let longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, userID};  // adding new shorturl and corresponding longURL and userID as per fresh urlDatabase structure
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
    return;
  }
  let user = users[user_id];
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.session.user_id;
  let user = users[user_id];
  if (!user_id) {
    res.render("urls_promptLogin", {user: null});
    return;
  }
  const filteredURLs = urlsForUser(user_id);
  const key = Object.keys(filteredURLs);
  if (!key.includes(req.params.shortURL)) {
    return res.status(401).send("Access Denied!!! Requested urls does not belong to you."); // functional improvement as per feedback
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("Error!!! Please check shortURL");
    return;
  }
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_register", {user: null});
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please fill both email and password!!!");
    return;
  }
  let email = req.body.email;
  let password = req.body.password;
  let hashPassword = hashedPasswordGenerator(password);
  let userRegistered = getUserByEmail(email, users);
  if (userRegistered) {
    res.status(400).send("Already registered with this email id");
    return;
  }
  const id = generateRandomString();
  users[id] = {id, email, password: hashPassword};
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {
    res.send("Not authorized to delete");
    return;
  }
  const filteredURLs = urlsForUser(user_id);
  const key = Object.keys(filteredURLs);
  if (!key.includes(req.params.shortURL)) {
    return res.status(401).send("Access Denied!!! Requested urls does not belong to you."); // functional improvement as per feedback
  }
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let user_id = req.session.user_id;
  
  if (!user_id) {
    res.status(403).send("Please log in first to edit shortURL");
    return;
  }
  const filteredURLs = urlsForUser(user_id);
  const key = Object.keys(filteredURLs);
  if (!key.includes(req.params.shortURL)) {
    return res.status(401).send("Access Denied!!! Requested urls does not belong to you."); // functional improvement as per feedback
  }
  urlDatabase[shortURL]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("urls_login", {user:null});
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userRegistered = getUserByEmail(email, users);

  if (!userRegistered) {
    res.status(403).send("Emaild ID does not match. Please check your email id!");
    return;
  }
  const savedUserhashPassword = users[getUserByEmail(email, users)]["password"];
  let isPasswordCorrect = bcrypt.compareSync(password, savedUserhashPassword);

  if (!isPasswordCorrect) {
    res.status(403).send("Password does not match!!!");
    return;
  }
  const id = getUserByEmail(email, users);
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
