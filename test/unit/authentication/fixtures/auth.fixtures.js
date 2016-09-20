// fixtures for authentication.test.js
var ids = {

  publicSession: "publicSessionId",
  anonymousSession: "anonymousSessionId",

  validUser0: "validUser0Id",
  validUser1: "validUser1Id",
  validUser2: "validUser2Id",
  validGuest1: "validGuest1Id",
  validGuest2: "validGuest2Id",
};

var browserSessionTokens = {
  validUser0  : 'validUser0SessionToken',
  validUser1  : 'validUser1SessionToken',
  validUser2  : 'validUser2SessionToken',
  validUser3  : 'validUser3SessionToken',
  validGuest1 : 'validUser4SessionToken',
  validGuest2 : 'validUser5SessionToken',
  validGuest3 : 'validUser6SessionToken',
};

var fixtures = {};

fixtures.GuestUser = [
  {
    _id : ids.validGuest1,
    browserSessionToken : browserSessionTokens.validGuest3,
    screenName : 'Guest 1 screen'
  }, {
    _id : ids.validGuest2,
    browserSessionToken : browserSessionTokens.validGuest2,
    screenName : 'Guest 2 screen'
  }
];

fixtures.User = [
  {
    _id: ids.validUser0,
    screenName: 'Owner User',
  },
  {
    _id: ids.validUser1,
    screenName: 'Test User',
  },
  {
    _id: ids.validUser2,
    screenName: 'New User',
  },
];

fixtures.Session = [
  {
    _id                  : ids.publicSession,
    authLevel            : 'public',
  },
  {
    _id                  : ids.anonymousSession,
    authLevel            : 'anonymous',
  }
];

var reqs = {
  public : {
    missingSessionID : {
    "liveSession" : fixtures.Session[0],
    "isAuthenticated" : function isAuthenticated() { return false; }
    },
    registeredNotWhite : {
      "sessionID" : browserSessionTokens.validUser2,
      "user" : fixtures.User[2],
      "liveSession" : fixtures.Session[0],
      "session" : {
        "touch" : function touch() {}
      },
      "isAuthenticated" : function isAuthenticated() { return true; }
    },
    registeredWhite : {
      "sessionID" : browserSessionTokens.validUser3,
      "user" : fixtures.User[2],
      "liveSession" : fixtures.Session[0],
      "session" : {
        "touch" : function touch() {}
      },
      "isAuthenticated" : function isAuthenticated() { return true; }
    },
    newGuest : {
      "sessionID": browserSessionTokens.validGuest1,
      "liveSession" : fixtures.Session[0],
      "session" : {
        "touch" : function touch() {},
        "save" : function save() {}

      },
      "isAuthenticated" : function isAuthenticated() { return false; }
    },
    guestNotWhite : {
      "sessionID": browserSessionTokens.validGuest2,
      "liveSession" : fixtures.Session[0],
      "session" : {
        "touch" : function touch() {}
      },
      "isAuthenticated" : function isAuthenticated() { return false; }
    },
    guestWhite : {
      "sessionID": browserSessionTokens.validGuest3,
      "liveSession" : fixtures.Session[0],
      "session" : {
        "touch" : function touch() {}
      },
      "isAuthenticated" : function isAuthenticated() { return false; }
    }
  },
  anonymous : {
    missingSessionID : {
      "liveSession" : fixtures.Session[1],
      "isAuthenticated" : function isAuthenticated() { return false; },
      "session" : {}
    },
    registeredNotWhite : {
      "sessionID" : browserSessionTokens.validUser2,
      "user" : fixtures.User[2],
      "liveSession" : fixtures.Session[1],
      "session" : {
        "touch" : function touch() {}
      },
      "isAuthenticated" : function isAuthenticated() { return true; }
    },
    registeredWhite : {
      "sessionID" : browserSessionTokens.validUser3,
      "user" : fixtures.User[2],
      "liveSession" : fixtures.Session[1],
      "session" : {
        "touch" : function touch() {}
      },
      "isAuthenticated" : function isAuthenticated() { return true; }
    },
  },
  private : {
    missingSessionID : {
      "liveSession" : fixtures.Session[1],
      "isAuthenticated" : function isAuthenticated() { return false; },
      "session" : {}
    },
    registeredNotWhite : {
      "sessionID" : browserSessionTokens.validUser2,
      "user" : fixtures.User[2],
      "liveSession" : fixtures.Session[1],
      "session" : {
        "touch" : function touch() {}
      },
      "isAuthenticated" : function isAuthenticated() { return true; }
    },
    registeredWhite : {
      "sessionID" : browserSessionTokens.validUser3,
      "user" : fixtures.User[2],
      "liveSession" : fixtures.Session[1],
      "session" : {
        "touch" : function touch() {}
      },
      "isAuthenticated" : function isAuthenticated() { return true; }
    },
  }
}

module.exports = {
  reqs : reqs
};
