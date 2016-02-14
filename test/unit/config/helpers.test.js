'use strict';

const chai = require('chai')
const sinon = require('sinon');
const path = require('path')
const should = chai.should();
const expect = chai.expect;
const SandboxedModule = require('sandboxed-module');
const modulePath = '../../../config/helpers';


describe('config/helpers.js', function(){

  before(function(){

    this.helpers = SandboxedModule.require(modulePath, {
      requires: {
        'lodash': require('lodash')
      },
      globals : {
        db : this.db
      }
    });
  
  })

  describe('booleanOrDefault()', function(){

    it('should return the val if it is boolean(y)', function(){
      let result = this.helpers.booleanOrDefault(false, false);
      result.should.equal(false);
      result = this.helpers.booleanOrDefault(false, true);
      result.should.equal(false);
      result = this.helpers.booleanOrDefault(true, false);
      result.should.equal(true);
      result = this.helpers.booleanOrDefault(true, true);
      result.should.equal(true);
      result = this.helpers.booleanOrDefault('true', false);
      result.should.equal(true);
    })

    it('should return default if value is missing or is not boolean', function(){
      let result = this.helpers.booleanOrDefault(null, true);
      result.should.equal(true);
      result = this.helpers.booleanOrDefault(undefined, true);
      result.should.equal(true);
      result = this.helpers.booleanOrDefault("hi", false);
      result.should.equal(false);
      result = this.helpers.booleanOrDefault(1, false);
      result.should.equal(false);
    })

  })

  describe('createMongoUri()', function(){

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
      let conf = {
        host: '127.0.0.1',
        port: '27102',
        username: 'testuser'
      }
      expect(this.helpers.createMongoUri.bind(this.helpers, conf))
        .to.throw(/No mongo.password in config/)
    });

    it('should return the correct configuration when username is NOT specified', function(){
      let conf = {
        host: '127.0.0.1',
        port: '27102'
      }
      let result = this.helpers.createMongoUri(conf);
      result.should.equal("mongodb://127.0.0.1:27102/");

      conf.dbName = "testdb";
      result = this.helpers.createMongoUri(conf);
      result.should.equal("mongodb://127.0.0.1:27102/testdb");
    });

    it('should return the correct configuration when username is specified', function(){
      let conf = {
        host: '127.0.0.1',
        port: '27102',
        username: 'testuser',
        password: 'testpassword'
      }
      let result = this.helpers.createMongoUri(conf);
      result.should.equal("mongodb://testuser:testpassword@127.0.0.1:27102/");

      conf.dbName = "testdb";
      result = this.helpers.createMongoUri(conf);
      result.should.equal("mongodb://testuser:testpassword@127.0.0.1:27102/testdb");
    });

  });
});
