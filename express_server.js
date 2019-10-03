const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

// Generates random 6 character string
function generateRandomString() {
    let final = '';
    let string       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let stringLength = string.length;
    for ( let i = 0; i < 6; i++ ) {
       final += string.charAt(Math.floor(Math.random() * stringLength));
    }
    return final;
};

// Returns true if checkThis(email) already exists in users object
function emailLookup(checkThis) {
  for (let userId in users) {
    if (checkThis === users[userId].email) {
      return true;
    } 
  } 
  return false;
};

// returns the userId if their email and password exist
function findUser(email, password) {
  for (let userId in users) {
    if (email === users[userId].email) {
      if (bcrypt.compareSync(password, users[userId].password)) {
        return users[userId];
      }
      // break;
    }
  } return false;
}

app.set("view engine", "ejs");



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
    password: "q"
  }
}

// URL database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  let user = {user: req.cookies["user_name"]};
  if(user) {
  let templateVars = { user: req.cookies["user_name"] }
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/register");
  }
});

// myURLS page
app.get("/urls", (req, res) => {
  let userId = req.cookies["user_name"]; // same as users[newUserId].id]
 
  const urlsForUser = function(userId) {
    let usersUrls = {};
    for (shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === userId) {
        usersUrls[shortURL] = urlDatabase[shortURL];
      }
    } return usersUrls
  }

  let templateVars = {
    user: users[userId],
    urls: urlsForUser(userId)
  }
  if (userId) {
    res.render("urls_index", templateVars);
  } else {
    res.send("<html><body>Ola amigo... <b>You must login or register!</b></body></html>\n")
  }
  // res.render("urls_index", templateVars);
});



// // User login form
// app.post("/urls/login", (req, res) => {
//   let username = req.body.username;
//   res.cookie("user_name", username);
//   res.redirect("/urls");
//   // console.log(username);
// });

// User logout form/button
app.post("/logout", (req, res) => {
  res.clearCookie("user_name");
  res.redirect("/login");
})

// urls_show/edit page
app.get("/urls/:shortURL", (req, res) => {
  let userId = req.cookies["user_name"];
  
  if (userId) {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL]; // <------long URL
  urlDatabase[shortURL] = longURL;
  let templateVars = { shortURL: shortURL, longURL: longURL, user: req.cookies["user_name"] };
  res.render("urls_show", templateVars);
  } else {
    res.redirect("/register");
  }
});

// urls_show/edit page
app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.longURL;
  let short = req.params.shortURL;

  urlDatabase[short].longURL =  longURL;
  
  res.redirect("/urls");
})

// Generates random string and redirects to short URL view page
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  let userId = req.cookies["user_name"];
  urlDatabase[randomString] = { longURL:req.body.longURL, userID: userId } ;
  // console.log('testing', urlDatabase);  
  res.redirect("/urls/" + randomString);
});

// Saves new short URL to database and redirects user to the actual,
// page of the URL if they want
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  
  const longURL = urlDatabase[shortURL].longURL;
  console.log(urlDatabase[shortURL]);
  // console.log("this is the longURL: ",longURL);
  res.redirect(longURL);
});

// Delete URL button...redirect to URL index page
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`User deleted short URL`);
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Delete GET
app.get("/urls/:shortURL/delete", (req, res) => {
  let userId = req.cookies["user_name"];
  if(userId) {
  console.log(`User deleted short URL`);
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
  } else {
    res.redirect("/register")
  }
});

// Edit URL form urls_show
app.post("/urls/:id", (req, res) => {
  const newURL = req.body.longURL;
  const shortURL = req.params.id;
  console.log(`User edited their URL to: ${newURL}`);
  // console.log('test',urlDatabase)
  urlDatabase["user_name"] = newURL;
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
  let hash = bcrypt.hashSync(req.body.password, 10);
  console.log('password: ',hash);

  if (newEmail === "" || hash === "" || emailLookup(newEmail) === true ) {
    res.send("<html><body>Ola amigo... <b>400 Bad Request</b></body></html>\n") 
  } else {
    users[newUserId] = {id: newUserId, email: newEmail, password: hash};
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


