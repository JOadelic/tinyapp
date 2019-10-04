const express = require("express");
const app = express();
const PORT = 8080;
// const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers');


// Generates random 6 character string
function generateRandomString() {
    let final = '';
    let string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let stringLength = string.length;
    for ( let i = 0; i < 6; i++ ) {
       final += string.charAt(Math.floor(Math.random() * stringLength));
    }
    return final;
};

// ORIGINAL FUNCTION FOR REGISTERING NEW USER
// Returns true if users email already exists in users object when registering
// function emailLookup(checkThis) {
//   for (let userId in users) {
//     if (checkThis === users[userId].email) {
//       return true;
//     } 
//   } 
//   return false;
// };

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
};

// checks to see if user email exists in database
// const getUserByEmail = function(email, users) {
//   for (let userId in users) {
//     if (email === users[userId].email) {
//       return users[userId];
//     } 
//  } return false;
// };

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['asdf'],
}))

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
};

// URL database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  let user = {user: req.session.user_id};
  if (user) {
    res.redirect("/urls");
  } 
  res.redirect("/login")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World!</b></body></html>\n");
});

// Enter urls_new form
app.get("/urls/new", (req, res) => {  
  let user = {user: req.session.user_id};
  if(user) {
  let templateVars = { user: req.session.user_id }
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


const urlsForUser = function(userId) {
  let usersUrls = {};
  for (shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      usersUrls[shortURL] = urlDatabase[shortURL];
    }
  } return usersUrls
}
// myURLS page
app.get("/urls", (req, res) => {
  let userId = req.session.user_id;
 
  let templateVars = {
    user: users[userId],
    urls: urlsForUser(userId)
  }
  if (userId) {
    res.render("urls_index", templateVars);
  } else {
    res.send("<html><body>Ola amigo... <b>You must login or register!</b></body></html>\n")
  }
});


// Might need this later...maybe
// // User login form
// app.post("/urls/login", (req, res) => {
//   let username = req.body.username;
//   res.cookie("user_name", username);
//   res.redirect("/urls");
//   // console.log(username);
// });

// User logout form/button
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/login");
})

// urls_show/edit page 
app.get("/urls/:shortURL", (req, res) => {
  let userId = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (userId) {
    let userUrls = urlsForUser(userId);
    if (userUrls[shortURL]) {
       let longURL = urlDatabase[shortURL];
       urlDatabase[shortURL] = longURL;
       let templateVars = { shortURL: shortURL, longURL: longURL, user: req.session.user_id };
       res.render("urls_show", templateVars);
    } else if (!userUrls[shortURL]) {
      res.send("<html><body>Ola amigo... <b>that URL doesn't belong to you :P</b></body></html>\n")
    }
    else {
      res.send("<html><body>Ola amigo... <b>that URL doesn't exist :(</b></body></html>\n")
    }
  } 
    else {
      res.send("<html><body>Ola amigo... <b>Maybe you should login and create a link yourself :D</b></body></html>\n")
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
  let userId = req.session.user_id;
  urlDatabase[randomString] = { longURL:req.body.longURL, userID: userId } ;
  res.redirect("/urls/" + randomString);
});

// Saves new short URL to database and redirects user to the actual,
// page of the URL if they want
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Delete POST: URL button...redirect to URL index page
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`User deleted short URL`);
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Delete GET
app.get("/urls/:shortURL/delete", (req, res) => {
  let userId = req.session.user_id;
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
  urlDatabase["user_name"] = newURL;
  res.redirect("/urls");
});

// Register GET page
app.get("/register", (req, res) => {
  let templateVars = { 
    user: req.session.user_id,
    urls: urlDatabase,
  };
  // Hey mentor...if you're reading this leave a message here:____________
  res.render("urls_register", templateVars)
});

//Register POST page
app.post("/register", (req, res) => {
  let newUserId = generateRandomString();
  let newEmail = req.body.email;
  let hash = bcrypt.hashSync(req.body.password, 10);
  
  if (newEmail === "" || hash === "" || getUserByEmail(newEmail, users)) {
    res.send("<html><body>Ola amigo... <b>400 Bad Request</b></body></html>\n") 
  } else {
    users[newUserId] = {id: newUserId, email: newEmail, password: hash};
    req.session.user_id = newUserId;
    res.redirect("/urls");
  }
});

// GET login page
app.get("/login", (req, res) => {
  let newUserId = req.session.user_id;
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
  
  if (foundUser) {
    req.session.user_id = foundUser.id;
    res.redirect("/urls");
  } else {
    res.send("<html><body>Sorry...<b>Wrong password or email my friend...403</b></body></html>\n")
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});


