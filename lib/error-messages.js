
module.exports = errors = {};

errors.firstname = {
  notEmpty : 'Firstname missing.',
  notNull  : 'Firstname missing.',
  len      : 'The firstname should between 6 and 64 characters long.'
};

errors.lastname = {
  notEmpty : 'Lastname missing.',
  notNull  : 'Lastname missing.',
  len      : 'The lastname should between 2 and 64 characters long.'
};

errors.username = {
  notEmpty : 'Username missing.',
  notNull  : 'Username missing.',
  isIn     : 'Username not available.',
  regex    : 'Allowed: 3 to 12 characters among letters, digit or . - _.'
};

errors.email = {
  notEmpty : 'Email missing.',
  notNull  : 'Email missing.',
  len      : 'The email should between 6 and 64 characters long.',
  isEmail  : 'This email is invalid.'
};

errors.password = {
  notEmpty : 'Password missing',
  notNull  : 'Password missing',
  regex    : ['Allowed: 8 to 30 characters, at least a lower and a an upper ',
              'case characters and a digit, the following characters are ',
              'allowed: ! @ # % : _ ( ) $ ^ & * - . ?'].join('')
}

errors.passwordConfirm = {
  equals : 'Passwords are not matching.'
}
