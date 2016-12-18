#!/usr/bin/env node

require('dotenv').config();
const conf = require('../config');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const data = require('../data/sampleData.js');


const dropDb = coroutine(function *dropDbGen(){
  try{
    yield mongoose.connect(conf.mongo.mongoUri);
    console.log(`Dropping database: ${conf.mongo.dbName} ...`);
    yield mongoose.connection.dropDatabase();
    console.log('Done!');
  }catch(err){
    throw err;
    process.exit(1);
  }
})

const populateModels = coroutine(function *populateModelsGen(){
  try{
    console.log(`Connecting to ${conf.mongo.dbName} ...`);
    global.db = mongoose.createConnection(conf.mongo.mongoUri);
    console.log('Done!')

    const models = require('../models');
    yield Promise.map(Object.keys(data), function(model){
      console.log(`Creating documents for the ${model} model`);
      const Model = mongoose.model(model);
      return Model.create(data[model]).then(function(){
        console.log(`Model ${model} done!`);
      });
    });
  }catch(err){
    throw err;
    process.exit(1);
  }
})

const main = coroutine(function *mainGen(){
  yield dropDb();
  yield populateModels();

  process.exit(0);
})

// async
main();