var LocalStrategy = require('passport-local').Strategy
  , LdapStrategy = require('passport-ldapauth').Strategy
  , userModel =  require('../models/user');

var ldapOptions = {
  passReqToCallback: true,
  server: {
    url: 'ldap://ldap.inf.unisi.ch',
    searchBase: 'dc=inf,dc=unisi,dc=ch',
    searchFilter: '(uid={{username}})'
  }
};

// var ldapOptions = {
//   passReqToCallback: true,
//   server: {
//     url: 'ldap://192.168.64.1:389',
//     searchBase: 'dc=usilu,dc=net',
//     searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))',
//     searchAttributes: ['displayName', 'mail'],
//    }
//  }


function init(passport) {
  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into a`nd deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    var User = db.model('User', schemas.userSchema);
    var out = User.findById(id, function (err, user) {
      if (user) {
          done(err, user);
      } else {
          done(null,new Error('User ' + id + ' does not exist'));
      }
    });
  });

  // LDAP Strategy
  passport.use(new LdapStrategy(ldapOptions, 
    function(req, user, done) {
    process.nextTick(function () {
      var User = db.model('User', schemas.registeredUserSchema);
      User.findOne({"ldap.id" : user.uidNumber}, function(err, dbuser){
        if (err) { return done(err); }

        //user was found just log him in
        if (dbuser) {
          return done(null, dbuser); 
        } else {
          //will register user but registration is incomplete
          //without an username for ASQ
          var newUser = new User();
          newUser.ldap.id = user.uidNumber;
          newUser.ldap.username = user.uid;
          newUser.screenName = user.gecos;
          var name = user.gecos.split(' ');
          newUser.firstname = name[0] || newUser.ldap.username;
          newUser.lastname = name[1] || newUser.ldap.username;

          newUser.save(function(err, savedUser){
             if (err) { return done(err); }

             return done(null, savedUser); 
          })

          // req.flash('username', user.uid)
          // return done(null, false, { message: 'User has not registered' }); 
        }
      });
    });
  }));

  // //Local Strategy
  passport.use(new LocalStrategy(
    function(username, password, done) {
      // asynchronous verification
      process.nextTick(function () {
        var User = db.model('User', schemas.registeredUserSchema);
        User.isValidUser(username, password, done);
      });
    }
  ));
}

module.exports = init;