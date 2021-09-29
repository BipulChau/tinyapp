const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

const PORT = 8080; // default port 8080

function generateRandomString() {
  const strings = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * strings.length);
    randomString += strings[randomIndex];
  }
  return randomString;
}

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  //res.send(generateRandomString());         // Respond with 'Ok' (we will replace this)
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  //res.send(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
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

app.post("/login", (req, res) => {
  //console.log('username: ', req.cookies)
  //res.cookie({username})
  // var cookie = req.cookies.cookieName;
console.log(req.body.username)
res.cookie('username', req.body.username)
//console.log (req);
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
