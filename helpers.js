// helper function to check if the value exits or not using it's key and if matched returns corresponding userid as well 
const getUserByEmail = function (key, value, usersDatabase) {
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


  module.exports = {
    getUserByEmail,
  }