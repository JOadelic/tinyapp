const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

function generateRandomString() {
    let final = '';
    let string       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let stringLength = string.length;
    for ( let i = 0; i < 6; i++ ) {
       final += string.charAt(Math.floor(Math.random() * stringLength));
    }
    return final;
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World!</b></body></html>\n");
});

// Enter urls_new form
app.get("/urls/new", (req, res) => {  
  let templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

// myURLS page
app.get("/urls", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// User login form
app.post("/urls/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
  console.log(username);
});

// User logout form/button
app.post("/urls/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { shortURL: shortURL, longURL: longURL, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

// Generates random string and redirects to short URL view page
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;  
  res.redirect("/urls/" + randomString);
});

// Saves new short URL to database and redirects user to the actual,
// page of the URL if they want
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// Delete URL button...redirect to URL index page
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`User deleted short URL`);
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Update URL form urls_show
app.post("/urls/:id", (req, res) => {
  const newURL = req.body.longURL;
  const shortURL = req.params.id;
  console.log(`User edited their URL to: ${newURL}`);
  urlDatabase[shortURL] = newURL;
  res.redirect("/urls");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});


