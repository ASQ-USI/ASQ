/**
 * @module models/settings
 * @description the Settings Model
*/

'use strict';

const logger = require('logger-asq');
const _ = require('lodash');
const mongoose = require('mongoose')
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const InvalidSettingError  = require('../errors').InvalidSettingError;


const kinds = [ 'string',   
              'number',   
              'date',     
              'boolean',  
              'select',
              'range',
              'ObjectId'
            ];


const levels = [ 'presentation',
               'exercise',
               'question'
             ];

const presentationSettingSchema = new Schema({
    key       : { type : String, required : true},
    value     : { type : {} },
    kind      : { type : String, required: true, enum: kinds},
    params    : { type: {} },
    level     : { type : String , required : true, enum: levels},

    createdAt : { type : Date, default: Date.now },
    createdBy : { type : ObjectId, ref: 'User' },
    updatedAt : { type : Date, default: Date.now },
    updatedBy : { type : ObjectId, ref: 'User' }
});

presentationSettingSchema.statics.getDefaultSettingsOfLevel = function(level, format) {
  return getDefaultSettingsOfLevel(level, format);
}


presentationSettingSchema.pre('save', true, function checkParams(next, done){
  next();
  // if it's null no need to validate
  if(_.isNull(this.value)) {
    return done();
  }

  if(validatorFn.hasOwnProperty(this.kind)){
    const r = validatorFn[this.kind].bind(this)();
    if ( !r.valid ) {
      return done(new InvalidSettingError(this.key));
    }
  } else {
    const message = '`Kind` ' + this.kind + ' is not valid.';
    return done(new Error(message));
  }

  done();
})


const isValidNumber = function(value) {
  let valid = false;
  if ( _.isNumber(value) ) 
    valid = true;
  else {
    value = Number(value);
    valid = _.isNumber(value) && ! isNaN(value);
  }
  return valid
}

const contains = function(array, value) {
  for (let x of array) {
    if ( x === value ) return true
  }
  return false
}

const validatorFn = {
  'string' : function stringValidator(){ 
    const valid = _.isString(this.value);
    const message = valid ? 'OK' : 'Field `value` should be a string.'
    return {
      valid: valid,
      message: message
    };
  },   
  'number' : function numberValidator(){ 
    const valid = isValidNumber(this.value);

    const message = '';
    if (!valid) return {
      valid: valid,
      message : 'Field `value(' + this.value +'`) should be a number.' 
    };

    return {
      valid: true,
      message: 'OK'
    }
  },   
  'date'   : function dateValidator(){ 
    const valid = _.isDate(this.value);
    const message = valid ? 'OK' : 'Field `value` should be a Date object.'
    return {
      valid: valid,
      message: message
    };
  },     
  'boolean': function booleanValidator(){ 
    const regexTrue = /^true$/i;
    const regexFalse = /^false$/i;
    const valid = _.isBoolean(this.value) || regexTrue.test(this.value) || regexFalse.test(this.value); 
    const message = valid ? 'OK' : 'Field `value` should be a boolean.'
    return {
      valid: valid,
      message: message
    };
  },  
  'select' : function selectValidator(){
    // const defaultPresentationSettings = getDefaultPresentationSettings();

    let valid = _.isString(this.value);
    let message = '';
    if (!valid) return {
      valid: valid,
      message : 'Field `value` should be a string.'
    };

    if ( ! (this.params.hasOwnProperty('options') && _.isArray(this.params['options']) ) ) {
      valid = false;
      message = 'Parameter `options` not found or `options` is not an array.';
    }
    if (!valid) return {
      valid: valid,
      message: message
    };
    for ( let i in this.params.options) {
      if ( !_.isString(this.params.options[i]) ) {
        return {
          valid: false,
          message: 'Parameter `options` can only contain strings.'
        }
      } 
    }

    // if (!_.isEqual(defaultPresentationSettings[this.key].params, this.params) ) {
    //   return {
    //     valid: false,
    //     message: 'Parameters are not valid.'
    //   }
    // }

    
    
    if ( ! contains(this.params.options, this.value) ) {
      return {
        valid: false,
        message: 'Invalid value: ' + this.value
      }
    }

    return {
      valid: true,
      message: 'OK'
    }

  },
  'range'  : function rangeValidator(){ 
    let valid = isValidNumber(this.value);

    let message = '';
    if (!valid) return {
      valid: valid,
      message : 'Field `value` should be a number.'
    };

    if ( ! (this.params.hasOwnProperty('min') && isValidNumber(this.params['min']) ) ) {
      valid = false;
      message = 'Parameter `min` not found or `min` is not a number.';
    }

    if ( ! (this.params.hasOwnProperty('max') && isValidNumber(this.params['max']) ) ) {
      valid = false;
      message = 'Parameter `max` not found or `min` is not a number.';
    }

    if ( ! (this.params.hasOwnProperty('step') && isValidNumber(this.params['step']) ) ) {
      valid = false;
      message = 'Parameter `step` not found or `min` is not a number.';
    }

    if (!valid) return {
      valid: valid,
      message: message
    };

    if ( this.params.max < this.params.min ) return {
      valid: false,
      message: 'Parameter `max` should bigger or equal than `min`.'
    }
    return {
      valid: true,
      message: 'OK'
    }

  },
  'ObjectId' : function objectIdValidator(){
    const valid = mongoose.Types.ObjectId.isValid(this.value);
    const message = valid ? 'OK' : 'Field `value` should be a valid ObjectId.'
    return {
      valid: valid,
      message: message
    };
  }
}

logger.debug('Loading presentationSetting model');

// mongoose.model('PresentationSetting', presentationSettingSchema);
// module.exports = mongoose.model('PresentationSetting');

module.exports = presentationSettingSchema;
























