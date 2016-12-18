'use strict';

const chai = require('chai')
const sinon = require('sinon');
const path = require('path')
const should = chai.should();
const expect = chai.expect;
const _ = require('lodash');
const SandboxedModule = require('sandboxed-module');
const modulePath = '../../../config/index';
const origHelpers = require('../../../config/helpers');


describe('config/index.js', function(){

  let helpers = this.helpers = {
    booleanOrDefault: function(){},
    createMongoUri: sinon.stub()
  }

  sinon.stub(helpers, 'booleanOrDefault', function(){
    return origHelpers.booleanOrDefault.apply(origHelpers, arguments)
  })

  const loadConfiguration = function(){
    return SandboxedModule.require(modulePath, {
        requires: {
          'logger-asq': require('logger-asq'),
          'lodash': _,
          'path': require('path'),
          './helpers': helpers,
        }
      });
  }

  describe('parsing', function(){

    beforeEach(function(){
      helpers.booleanOrDefault.reset()
      helpers.createMongoUri.reset()
      this.backupEnv = _.cloneDeep(process.env);
      process.env = {};
    });

    afterEach(function(){
      process.env = this.backupEnv;
    })

    it('should assign correct default values when the ENV is not set', function(){

      this.config = loadConfiguration();
      expect(this.config.host).to.equal('127.0.0.1');
      expect(this.config.HTTPPort).to.equal(3000);
      expect(this.config.HTTPSPort).to.equal(3443);
      expect(this.config.mongo.host).to.equal('127.0.0.1');
      expect(this.config.mongo.port).to.equal(27017);
      expect(this.config.mongo.dbName).to.equal('asq');
    });

    it('should handle default Boolean values correctly', function(){
      this.config = loadConfiguration();

      helpers.booleanOrDefault.callCount.should.equal(7);

      let spyCall = helpers.booleanOrDefault.getCall(0);
      expect(spyCall.args[0]).to.equal(undefined);
      expect(spyCall.args[1]).to.equal(false); 

      spyCall = helpers.booleanOrDefault.getCall(2);
      expect(spyCall.args[0]).to.equal(undefined);
      expect(spyCall.args[1]).to.equal(true); 
    });

    it('should assign the corresponding ENV values if present', function(){
      process.env.HOST='asq.demo.com';
      process.env.HTTP_PORT=3030;
      process.env.MONGO_HOST='mongo.asq.demo.com';
      process.env.MONGO_DB_NAME='asq-demo';

      this.config = loadConfiguration();

      expect(this.config.host).to.equal('asq.demo.com');
      expect(this.config.HTTPPort).to.equal(3030);
      expect(this.config.HTTPSPort).to.equal(3443);
      expect(this.config.mongo.host).to.equal('mongo.asq.demo.com');
      expect(this.config.mongo.port).to.equal(27017);
      expect(this.config.mongo.dbName).to.equal('asq-demo');

      delete process.env.HOST;
      delete process.env.HTTP_PORT;
      delete process.env.MONGO_HOST;
      delete process.env.MONGO_DB_NAME;
    });

    it('should handle default Boolean values correctly', function(){
      process.env.ENABLE_HTTPS = 'true';
      this.config = loadConfiguration();

      helpers.booleanOrDefault.callCount.should.equal(7);

      let spyCall = helpers.booleanOrDefault.getCall(0);
      expect(spyCall.args[0]).to.equal('true');
      expect(spyCall.args[1]).to.equal(false); 

      spyCall = helpers.booleanOrDefault.getCall(2);
      expect(spyCall.args[0]).to.equal(undefined);
      expect(spyCall.args[1]).to.equal(true); 

      delete process.env.ENABLE_HTTPS;
    });

    it('should create a mongo uri', function(){
      this.config = loadConfiguration();
      helpers.createMongoUri.calledWith({
        host: '127.0.0.1',
        port:  27017,
        dbName: 'asq',
      });

      process.env.MONGO_HOST = 'mongo.asq.demo.com';
      process.env.MONGO_PORT = 27018;
      process.env.MONGO_DB_NAME = 'asq-demo';

      helpers.createMongoUri.calledWith({
        host: 'mongo.asq.demo.com',
        port:  27018,
        dbName: 'asq-demo',
      });

      delete process.env.MONGO_HOST;
      delete process.env.MONGO_PORT;
      delete process.env.MONGO_DB_NAME;
    });

    it('should generate a valid rootUrl when reverse proxy is disabled', function(){
      this.config = loadConfiguration();
      expect(this.config.rootUrl).to.equal('http://127.0.0.1:3000');

      process.env.HOST='asq.demo.com';
      process.env.HTTP_PORT = 3030;
      this.config = loadConfiguration();
      expect(this.config.rootUrl).to.equal('http://asq.demo.com:3030');

      process.env.ENABLE_HTTPS = true;
      this.config = loadConfiguration();
      expect(this.config.rootUrl).to.equal('https://asq.demo.com:3443');

      process.env.HTTPS_PORT = 443;
      this.config = loadConfiguration();
      expect(this.config.rootUrl).to.equal('https://asq.demo.com');

      delete process.env.HOST;
      delete process.env.HTTP_PORT;
      delete process.env.ENABLE_HTTPS;
      delete process.env.HTTPS_PORT;
    });

    it('should generate a valid rootUrl when reverse proxy is enabled', function(){
      // test if default port for proxy works
      process.env.USE_REVERSE_PROXY=true
      this.config = loadConfiguration();
      expect(this.config.rootUrl).to.equal('https://www.example.com');

      process.env.REVERSE_PROXY_SECURE=false
      this.config = loadConfiguration();
      expect(this.config.rootUrl).to.equal('http://www.example.com');

      // test extra options
      process.env.REVERSE_PROXY_SECURE = true;
      process.env.REVERSE_PROXY_HOST = 'asq.demo.com';
      process.env.REVERSE_PROXY_PORT = 444;
      this.config = loadConfiguration();
      expect(this.config.rootUrl).to.equal('https://asq.demo.com:444');

      process.env.REVERSE_PROXY_SECURE = false;
      process.env.REVERSE_PROXY_PORT = 81;
      this.config = loadConfiguration();
      expect(this.config.rootUrl).to.equal('http://asq.demo.com:81');

      delete process.env.USE_REVERSE_PROXY;
      delete process.env.REVERSE_PROXY_SECURE;
      delete process.env.REVERSE_PROXY_HOST;
      delete process.env.REVERSE_PROXY_PORT;
    });

  });
});
