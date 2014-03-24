/**
  @fileoverview tests for authentication routes/handlers/
**/
var config    = require('../config')
  , mongoose  = require('mongoose')
  , models = require('../models')

// mongodb connection (Global)  
db = mongoose.createConnection(config.host, config.dbName);


var postSignupCampus = require('../routes/handlers').postSignupCampus
  , chai            = require('chai')
  , expect          = chai.expect
  , express         = require('express')
  , request         = require('supertest')
  , passport       = require('passport')
  , flash           = require('connect-flash')
  , cons          = require('consolidate')
  , dust            = require('dustjs-linkedin')

app = express();
app.configure(function() {
   //configure passport
  require('../lib/passport')(passport);

  app.set('views', require('path').resolve(__dirname, '../views'));
  app.set('view engine', 'dust');
  app.enable('view cache');
  app.engine('dust', cons.dust);
  //Setup Dust.js helpers and options
  require('dustjs-helpers');
  require('../lib').dustHelpers(dust);

  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'Ti kapsoura einai auth re miky'
  }));

  app.use(passport.initialize());
  app.use(flash());
  app.use(passport.session());
  app.use(app.router);
  // error handler that route is going to 'next' to, if
  // there's an error
  app.use(function(err, req, res, next){
    console.log('An error occured', err)
    throw err;
  });
});

var ldapUser = {
    uid: "ldapuser",
    uidNumber : "123456789",
    gecos : "LDAPfirstname LDAPLastname"
  }

function ldapMiddleware(req, res, next){
  req.ldapUser = ldapUser;
  next(null, ldapUser)
}

//setup routes
app.post('/signup-campus', ldapMiddleware,  postSignupCampus);


app.listen(3000, function(){
  console.log('Server is listening on http://127.0.0.1:3000')
});

describe('routes/handlers.postSignupCampus', function() {
  var res;

  before(function(done){
    var User = db.model('User');

    User.remove({}, function(err){
      if (err) {done(err)};
      done();
    })
  })

  it("should create a valid LDAP user that submits a valid asq username ", function(done){
    request(app)
    .post('/signup-campus') 
    .type('form')
    .send({signupusername: "asqldap"})
    .expect(302)
    .expect('location', '/asqldap/?alert=Registration%20Succesful&type=success')
    .end(function(err, res){
      if (err) return done(err);

      //make sure user is in
      var User = db.model('User');

      User.findOne({"ldap.id" : ldapUser.uidNumber }, function(err, user){
        if (err) {done(err)};
        expect(user).to.exist;
        expect(user.ldap.username).to.equal(ldapUser.uid)
        expect(user.firstname).to.equal(ldapUser.gecos.split(" ")[0])
        expect(user.lastname).to.equal(ldapUser.gecos.split(" ")[1])
        done();
      })
    });
  });

  it.skip("should reject an existing username ", function(done){
    request(app)
    .post('/signup-campus') 
    .type('form')
    .send({signupusername: "asqldap"})
    .expect(200)
    .end(function(err, res){
      // expect(res.text).to.contain('You need to register an ASQ username')
      if (err) return done(err);
      done()
    });
  });
});

