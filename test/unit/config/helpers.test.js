'use strict';

var chai = require('chai')
var sinon = require('sinon');
var path = require('path')
var should = chai.should();
var expect = chai.expect;
var SandboxedModule = require('sandboxed-module');
var modulePath = '../../../config/helpers';


describe('config/helpers.js', function(){

  before(function(){

    this.helpers = SandboxedModule.require(modulePath, {
      requires: {
        'lodash': require('lodash'),
      },
      globals : {
        db : this.db
      }
    });
  
  })

  describe('createMongoUri()', function(){

    beforeEach(function(){
      // this.exerciseCopy = JSON.parse(JSON.stringify(parsed.exercises[0]));
    });

    it('should throw an error when there is no configuration object', function(){
      expect(this.helpers.createMongoUri.bind(this.helpers))
        .to.throw(/No mongo configuration object/)
    });

    it('should throw an error when there is no host in configuration object', function(){
      expect(this.helpers.createMongoUri.bind(this.helpers, {}))
        .to.throw(/No mongo.host specified/)
    });

    it('should throw an error when there is no port in configuration object', function(){
      expect(this.helpers.createMongoUri.bind(this.helpers, {host: '127.0.0.1'}))
        .to.throw(/No mongo.port specified/)
    });

    it('should throw an error when there is a username but not a password', function(){
      var conf = {
        host: '127.0.0.1',
        port: '27102',
        username: 'testuser'
      }
      expect(this.helpers.createMongoUri.bind(this.helpers, conf))
        .to.throw(/No mongo.password in config/)
    });

    it('should return the correct configuration when username is NOT specified', function(){
      var conf = {
        host: '127.0.0.1',
        port: '27102'
      }
      var result = this.helpers.createMongoUri(conf);
      result.should.equal("mongodb://127.0.0.1:27102/");

      conf.dbName = "testdb";
      var result = this.helpers.createMongoUri(conf);
      result.should.equal("mongodb://127.0.0.1:27102/testdb");
    });

    it('should return the correct configuration when username is specified', function(){
      var conf = {
        host: '127.0.0.1',
        port: '27102',
        username: 'testuser',
        password: 'testpassword'
      }
      var result = this.helpers.createMongoUri(conf);
      result.should.equal("mongodb://testuser:testpassword@127.0.0.1:27102/");

      conf.dbName = "testdb";
      var result = this.helpers.createMongoUri(conf);
      result.should.equal("mongodb://testuser:testpassword@127.0.0.1:27102/testdb");
    });

  });
});
