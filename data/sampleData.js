const ObjectId = require('mongoose').Types.ObjectId;

const User = [
  {
    _id : new ObjectId(),
    username: 't',
    password: 'Tt123456',
    firstname: 't',
    lastname: 't',
    regComplete: true
  }
]

module.exports = {
  User
}