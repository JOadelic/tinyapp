// checks to see if user email exists in database
const getUserByEmail = function(email, users) {
  for (let userId in users) {
    if (email === users[userId].email) {
      return users[userId].id;
    } 
 } return undefined;
};


const testUsers = {
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
};

// console.log(getUserByEmail("user@example.com", testUsers ));

module.exports = { getUserByEmail };