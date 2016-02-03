/**
  @fileoverview tests for authentication routes/handlers/
**/
var config    = require('../config')
  , mongoose  = require('mongoose')

// mongodb connection (Global)
db = mongoose.createConnection(config.mongo.mongoUri);


var chai          = require('chai')
, expect          = chai.expect
, express         = require('express')
, request         = require('supertest')
, passport        = require('passport')
, flash           = require('connect-flash')
, cons            = require('consolidate')
, dust            = require('dustjs-linkedin')
, models          = require('../models')
, postLoginCampus = require('../routes/handlers').postLoginCampus

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
    cn: "LDAPUserFirstname LDAPUserLastname",
    sn: "LDAPUserLastname",
    givenName: "ldapuser",
    dn : "CN=LDAPUserFirstname LDAPUserLastname,OU=PersonalDesktop,OU=Desktop,OU=_UsersW7,OU=CAMPUS_USI,DC=usilu,DC=net"
  }

function ldapMiddleware(req, res, next){
  req.ldapUser = ldapUser;
  next(null, ldapUser)
}

//setup routes
app.post('/login-campus', ldapMiddleware,  postLoginCampus);


app.listen(3000, function(){
  console.log('Server is listening on http://127.0.0.1:3000')
});

describe('routes/handlers.postLoginCampus', function() {
  var res;

  before(function(done){
    var User = db.model('User');

    User.remove({}, function(err){
      if (err) {done(err)};
      done();
    })
  })

  it.skip("should create a valid LDAP user that submits a valid asq username ", function(done){
    request(app)
    .post('/login-campus')
    .type('form')
    .expect(302)
    .expect('location', '/asqldap/?alert=Registration%20Succesful&type=success')
    .end(function(err, res){
      if (err) return done(err);

      //make sure user is in
      var User = db.model('User');

      User.findOne({"ldap.dn" : ldapUser.dn }, function(err, user){
        if (err) {done(err)};
        expect(user).to.exist;
        expect(user.ldap.cn).to.equal(ldapUser.cn)
        expect(user.firstname).to.equal(ldapUser.givenName)
        expect(user.lastname).to.equal(ldapUser.sn)
        done();
      })
    });
  });

  it.skip("should reject a non existing username ", function(done){
    request(app)
    .post('/login-campus')
    .type('form')
    .expect(200)
    .end(function(err, res){
      expect(res.text).to.contain('<p class="taken error active"><span class="glyphicon glyphicon-remove"></span>This username is already taken!</p>')
      if (err) return done(err);
      done()
    });
  });

  it.skip("should reject when username is empty ", function(done){
    request(app)
    .post('/login-campus')
    .type('form')
    .expect(200)
    .end(function(err, res){
      expect(res.text).to.contain('p class="blank error active"><span class="glyphicon glyphicon-remove"></span>A username is required!</p>');
      if (err) return done(err);
      done()
    });
  });
});

