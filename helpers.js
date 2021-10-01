const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);


// helper function to check if the value exits or not using it's key and if matched returns corresponding userid as well 
const getUserByEmail = function (email, usersDatabase) {
  for (let user in usersDatabase){
    let userDetails = (usersDatabase[user]);
    // console.log(userDetails['email'])
    if(userDetails["email"]=== email){
      //let userIDandResult = {id:user, result: true}
  return user;
    }
  }
  
  return null;
  }


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



  // Helper function which generates database of individual user based on key, value(used_id) and database
const dataBaseGenerator = function(key,value, database) {
  let userDatabase ={}
  for (let i in database){
  if(database[i][key] === value){
      
      userDatabase[i] = database[i];
      return userDatabase

    }
  }
  }

  //Helper function to generate hashed password

  let hashedPasswordGenerator = function (password) {
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
  }


  //Helper function to check if password and hashed password are the SAME
  let hashedPasswordChecker = function(password, hashedPassword) {
    return(bcrypt.compareSync(password, hashedPassword));
  }
  


  module.exports = {
    getUserByEmail,
    generateRandomString,
    dataBaseGenerator,
    hashedPasswordGenerator
  }