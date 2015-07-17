/** @module lib/settings/index
    @description Exposes all util functionality
*/

'use script';

var _ =  require('lodash');
var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var errors = require('../../errors');
var Setting = db.model('Setting');

module.exports = {
  /**
   * ### List
   * @param {Object} options
   * @returns {*}
   */
  list: function (options) {

    var query = options || {};

    var attrs = ['key'];
    var data = _.pick(options, attrs);
    options = _.omit(options, attrs);

    return  Setting.find(query).lean().exec();
   },

  /**
   * ### Read
   * Find a setting by key
   *
   * @public
   * @param {{id_or_slug (required), context, status, include, ...}} options
   * @return {Promise(Setting)} Setting
   */
  read: coroutine(function *readGen(options) {
    if (_.isString(options)) {
      options = {key: options};
    }

    var attrs = ['key'];
    var query = _.pick(options, attrs);

    if(!query.key){
      var error = new TypeError('Bad Argument');
      error.help = 'settings.read() argument should be a string or an object' +
      'with the `key` property set'
      throw error();
    }

    var result = yield Setting.findOne(query).lean().exec();

    if (result){
      return result;
    }

    return Promise.reject(new errors.NotFoundError('Setting not found.'));
  }),

  /**
   * ### Update
   * Update a setting by key
   *
   * @public
   * @param {{id_or_slug (required), context, status, include, ...}} options
   * @param {{id_or_slug (required), context, status, include, ...}} options
   * @return {Promise(Setting)} Setting
   */
  update: coroutine(function *readGen(name, val) {
    if (_.isString(name)) {
      name = {key: name};
    }

    var attrs = ['key'];
    var query = _.pick(name, attrs);

    if(!query.key){
      var error = new TypeError('Bad Argument');
      error.help = 'settings.update() first argument should be a string or an object' +
      'with the `key` property set'
      throw error();
    }

    var result = yield Setting.update(query,  { $set: { value: val }}).lean().exec();

    if (result.n > 0){
      return result;
    }

    return Promise.reject(new errors.NotFoundError('Update failed: Setting not found.'));
  }),

  presentationSettings          : require('./presentationSettings')

}