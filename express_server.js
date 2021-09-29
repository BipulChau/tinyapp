const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const uuid = require('uuid');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//activate cookie parser
app.use(cookieParser())

app.set("view engine", "ejs");

const PORT = 8080; // default port 8080

//Helper function to generate random id
function generateRandomString() {
  const strings = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * strings.length);
    randomString += strings[randomIndex];
  }
  return randomString;
}

// helper function to check if the value exits or not using it's key and returning corresponding userid as well
const checkIfMatched = function (key, value, usersDatabase) {
  for (let user in usersDatabase){
    let userDetails = (usersDatabase[user]);
    // console.log(userDetails['email'])
    if(userDetails[key]=== value){
      let userIDandResult = {id:user, result: true}
  return userIDandResult;
    }
  }
  let userIDandResult = {result: false}
  return userIDandResult;
  }


// global urls Database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// global users Database

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"]
  let user = users[user_id];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  //res.send(generateRandomString());         // Respond with 'Ok' (we will replace this)
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  //res.send(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"]
  let user = users[user_id];
  const templateVars = {user}
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies["user_id"]
  let user = users[user_id];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  if (!longURL) {
    res.send("<html><body>Error!!</body></html>\n");
    return;
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  
  res.render("urls_register", {user: null});
});

app.post("/register", (req, res) => {
  //console.log(req.body)
if (!req.body.email || !req.body.password){
  res.status(400).send("Please fill both email and password!!!");
  return;
}

let email = req.body.email;
let password = req.body.password;

let userRegistered = checkIfMatched("email",email, users).result

// console.log (userRegistered)

if (userRegistered){
  res.status(400).send("Already registered with this email id");
  return;
}

  const id = generateRandomString();
  users[id] = {id, email, password};
  // console.log(users)
  res.cookie('user_id', id)

  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {  
//console.log(req.body.username)
  //res.cookie('username', req.body.username)
//console.log (req);
  res.render("urls_login", {user:null});
});

// login - post
app.post("/login", (req, res) => {  
//console.log(req.body.username)
  //res.cookie('username', req.body.username)
//console.log (req.body);
const email = req.body.email
const password = req.body.password

let userRegistered = checkIfMatched("email", email, users).result

//console.log (userRegistered)

if (!userRegistered) {
  res.status(403).send("Emaild ID does not match. Please check your email id!");
  return;
}

let isPasswordCorrect = checkIfMatched("password", password, users  ).result;

if (!isPasswordCorrect) {
  res.status(403).send("Password does not match!!!");
  return;
}


res.redirect("/urls");
});

// logout - post
app.post("/logout", (req, res) => {  
  res.clearCookie('user_id', {path:'/'});

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
