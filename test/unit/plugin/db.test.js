'use strict';

var chai = require('chai');
var sinon = require('sinon');
var should = chai.should();
var expect = chai.expect;
var SandboxedModule = require('sandboxed-module');
var Promise = require('bluebird');
var modulePath = '../../../lib/plugin/db';
var _ = require('lodash');

describe('db.js', function(){
 before(function(){
   var name = this.name = 'asq-canvas'
   var session_id = this.session_id = '83928sadjk';

   this.pluginCustomData = {
       '_id': 'plugin-custom-data-id-123',
       'pluginName': name,
       'session': session_id,
       'data': { 'exampleData': 'hi'},
       'save': sinon.stub().returns(Promise.resolve(this))
     }

   //mock db
   var db = {model: function(){}};
   var createStub = this.createStub = sinon.stub().returns(Promise.resolve(this.pluginCustomData));
   var findOneStub = this.findOneStub = sinon.stub().returns(Promise.resolve(this.pluginCustomData));
   var exec = { exec: sinon.stub().returns(Promise.resolve(true))}
   var findByIdAndUpdateStub = this.findByIdAndUpdateStub = sinon.stub().returns(exec);

   sinon.stub(db, 'model')
   .withArgs('PluginCustomData').returns({
     'create' : createStub,
     'findOne': findOneStub
   })


   this.pluginDb = SandboxedModule.require(modulePath, {
     requires: {},
     globals : { db : db }
   });

  });

  describe('savePluginSessionData', function(){
    beforeEach(function(){
      // do before every test
      this.createStub.reset();
      this.findOneStub.reset();
      this.pluginCustomData.save.reset()
    });

    it('should save new pluginSessionData if it does not already exist in the db', function(done){
      // we want findOneStub to return null
      this.findOneStub = sinon.stub().returns(Promise.resolve(null));
      const payload = {
        'test' : 'payload'
      };

      this.pluginDb.savePluginSessionData('testPluginName', 'testSessionId', payload).then(function(){
        this.findOneStub.calledWith({
            pluginName: 'testPluginName',
            type: 'session',
            session: 'testSessionId'
          }).should.equal(true);

        this.createStub.calledWith({
            pluginName: 'testPluginName',
            type: 'session',
            session: 'testSessionId',
            data: payload
          }).should.equal(true);

        done();
      }.bind(this));
    });

    it.skip('should overwrite existing pluginSessionData when new data is provided', function(){
      // make db return existing pluginSessionData
      this.findOneStub = sinon.stub().returns(Promise.resolve(this.pluginCustomData));

      this.pluginDb.savePluginSessionData('testPluginName', 'testSessionId', payload).then(function(){
        this.pluginCustomData.save.calledOnce.should.equal(true);
        done();
      });
    });
  });
});
