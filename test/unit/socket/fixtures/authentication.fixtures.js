module.exports = {
  socketMissingSession : { 
    request: {}
  },
  socketMissingUser : { 
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      }
    }
  },
  socketUnauthorisedPresenter : {
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      },
      user: {
        _id: 'nonauthorizedWlId'
      }
    }
  },
  socketNonExistingSession: { 
    request: {
      _query: {
        asq_sid: 'nonexistinglivessessionid'
      },
      user: {
        _id: 'testWlId'
      }
    }
  },
  socketValidPresenter: { 
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      },
      user: {
        _id: 'testWlId'
      }
    }
  },

  // fixtues for liveAuthorize
  socketMissingSessionLA : { 
    request: {}
  },
  socketMissingHeaderLA: { 
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      }
    }
  },
  socketMissingHeaderCookieLA: { 
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      },
      headers: {}
    }
  },
  socketNonExistingSessionLA: {
    request: {
      _query: {
        asq_sid: 'nonexistinglivessessionid'
      },
      headers: {
        cookie: "testCookie"
      }
    }
  },
  socketUnauthorizedGuestLA: {
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      },
      sessionID: 'testSessionId',
      headers: {
        cookie: "testCookie"
      },
      user: {
        logged_in: false
      }
    }
  },
  socketNonExistingGuestLA: {
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      },
      sessionID: 'testSessionId',
      headers: {
        cookie: "testCookie"
      },
      user: {
        logged_in: false
      }
    }
  },
  socketValidGuestLA: {
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      },
      sessionID: 'testSessionId',
      headers: {
        cookie: "testCookie"
      },
      user: {
        logged_in: false
      }
    }
  },
  socketUnauthorizedRegisteredUserLA: {
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      },
      sessionID: 'testSessionId',
      headers: {
        cookie: "testCookie"
      },
      user: {
        _id: 'unauthorizedUserId',
        logged_in: true
      }
    }
  },
  socketNonExistingRegisteredUserLA: {
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      },
      sessionID: 'testSessionId',
      headers: {
        cookie: "testCookie"
      },
      user: {
        _id: 'nonExistingUserId',
        logged_in: true
      }
    }
  },
  socketValidRegisteredUserLA: {
    request: {
      _query: {
        asq_sid: 'testlivessessionid'
      },
      sessionID: 'testSessionId',
      headers: {
        cookie: "testCookie"
      },
      user: {
        _id: 'validUserId',
        logged_in: true
      }
    }
  },

  // fixtues for persistAuthenticatedUserToRedis
  socketNotLoggedInPropPersist : { 
    request: {
      user: {}
    }
  },
  socketNotLoggedInPersist : { 
    request: {
      user: {
        logged_in: false
      }
    }
  },
  socketLoggedInPersist : { 
    request: {
      user: {
        id: 'validUserId',
        logged_in: true
      }
    }
  },
}