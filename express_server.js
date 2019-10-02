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
};

// Returns true if checkThis (email) already exists in users object
function emailLookup(checkThis) {
  for (let userId in users) {
    if (checkThis === users[userId].email) {
      return true;
    } 
  } 
  return false;
};

function findUser(email, password) {
  for (let userId in users) {
    if (email === users[userId].email) {
      if (password === users[userId].password) {
        return users[userId];
      }
    }
  } return false;
}

function findId(newUserId) {
  for (let id in users[userId]) {
    if (newUserId === users[userId]) {
      return true
    }
  } return false;
}


app.set("view engine", "ejs");

// URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

// User database
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "q"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


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
  let templateVars = { user: req.cookies["user_name"] }
  res.render("urls_new", templateVars);
});

// myURLS page
app.get("/urls", (req, res) => {
  // console.log("this is the cookie", req.cookies);
  let newUserId = req.cookies["user_name"];
  // console.log("this is the userId:", newUserId);
  let templateVars = {
    user: users[newUserId],
    urls: urlDatabase
  }

  res.render("urls_index", templateVars);
});

// User login form
app.post("/urls/login", (req, res) => {
  let username = req.body.username;
  res.cookie("user_name", username);
  res.redirect("/urls");
  // console.log(username);
});

// User logout form/button
app.post("/logout", (req, res) => {
  res.clearCookie("user_name");
  res.redirect("/login");
})

// urls_show page
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { shortURL: shortURL, longURL: longURL, user: req.cookies["user_name"] };
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

// Register page
app.get("/register", (req, res) => {
  let templateVars = { 
    user: req.cookies["user_name"],
    urls: urlDatabase,
  };
  
  res.render("urls_register", templateVars)
});

//Register new user
app.post("/register", (req, res) => {
  let newUserId = generateRandomString();
  let newEmail = req.body.email;
  let newPassword = req.body.password;
  
  // console.log(users[newUserId]);
  // console.log(newEmail, newPassword, emailLookup(newEmail));

  if (newEmail === "" || newPassword === "" || emailLookup(newEmail) === true ) {
    res.send("<html><body>Ola amigo... <b>400 Bad Request</b></body></html>\n") 
  } else {
    users[newUserId] = {id: newUserId, email: newEmail, password: newPassword};
    // console.log(req.body);
    res.cookie("user_name", newUserId);
    res.redirect("/urls");
  }
});

// GET login page
app.get("/login", (req, res) => {
  let newUserId = req.cookies["user_name"];
  let templateVars = { 
    user: undefined,
    urls: urlDatabase,
  };
  res.render("urls_login", templateVars);
});

// POST login page
app.post("/login", (req, res) => {
  let password = req.body.password;
  let email = req.body.email;

  let templateVars = { 
    user: undefined,
    urls: urlDatabase,
  };
  let foundUser = findUser(email, password);
  // console.log("passwaors and emails match:", foundUser.id);

  if (foundUser) {
    // console.log(users["userId"]);
    res.cookie("user_name", foundUser.id);
    res.redirect("/urls");
  } else {
    res.send("<html><body>Sorry...<b>Wrong password or email my friend...403</b></body></html>\n")
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});


