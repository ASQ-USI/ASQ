const Promise     = require('bluebird');
const coroutine   = Promise.coroutine;
const _     = require('lodash');
const questionsApi = require('../../api/questions.js');
const resources = Object.create(null);

resources.questions = coroutine(function *handleQuestionsGen(socket, evt){
  switch (evt.body.method){
    case 'read':
      const questions = yield questionsApi.list();
      socket.send(module.exports.createResponseEvent(socket, evt, questions));
      break;
    default:
      console.log('TODO: handle `socket/api/index:resources.questions()` error');
  }
})

module.exports = {
  createResponseEvent: function(socket, reqEvt, payload){
    return {
      type: 'response',
      reply_to: reqEvt.id,
      ts: new Date().toISOString(),
      body: _.assign(
        {},
        _.pick(reqEvt.body, ['method', 'entity']),
        { data: payload}
      )
    };
  },

  validateResourceAndMethod: function(socket, evt){
    const supportedResources = {
      questions: ['read']
    }; 

    if(typeof evt.body === "undefined"){
      throw new Error(`request has no 'body' field`);
    }

    if(typeof supportedResources[evt.body.entity] === "undefined"){
      throw new Error(`entity '${evt.entity}' is not supported`);
    }

    if(supportedResources[evt.body.entity].indexOf(evt.body.method) < 0){
      throw new Error(`method '${evt.body.method}' for entity '${evt.body.entity}' is not supported`);
    }
  },

  validateAndRegisterRequestId: function(socket, evt){
    const id = parseInt(evt.id)
    if(! _.isInteger(id) || id < 1){
      throw new Error('field \'id\' should exist and be a positive integer');
    }
    if(socket.requestIds[id]){
      throw new Error(`There was already an event with 'id' equal to ${id}`);
    }
    socket.requestIds[id] = true;
  },

  validateRequest: function (socket, evt){
    module.exports.validateResourceAndMethod(socket, evt);
    module.exports.validateAndRegisterRequestId(socket, evt);
  },

  handleRequest: function(socket, evt){
    try {
      module.exports.validateRequest(socket, evt);
      resources[evt.body.entity](socket, evt);
    } catch (err){
      console.log('TODO: handle `socket/api/index:handleRequest()` error', err);
    }
  }
}
