const _ = require('lodash');

module.exports = {
  /**
  * Returns the number of items per page after taking into consideration the default, max
  * and user-submitted values. Important: all arguments must already be integers so make sure
  * to sanitize them
  * @param {Number} defaultN The default number of items per page. Must be an integer
  * @param {Number} maxN The Maximum allowed number of items per page. Must be an integer
  * @param {Number} userN The user requested number of items per page. Must be an integer
  * @returns the number of items per page 
  */
  calcNumOfItemsPerPage: function (defaultN, maxN, userN){
    if(defaultN > maxN) throw new Error("default page size cannnot be bigger than max");

    if(userN <= 0) {
      return defaultN
    }else{
      if(userN > maxN){
        return maxN
      }
    }
    return userN;
  }, 

  /**
  * Calculates the number of pages of a query given the total items and the items per page
  * If the properties are missing, default values are used instead.
  * @param {Number} totalItems. The total items of the query we want pagination for. Must be a positive integer
  * @param {Number} totalItems. The items per page. Must be a positive integer greater than 0
  * @returns {Number} the number of pages 
  */
  calcNumOfPages: function (totalItems, perPage){
    if(totalItems < 0 ) throw new Error("totalItems should be a positive Integer");
    if(perPage < 1) throw new Error("perPage should be a positive Integer greater than 0");
    const fullPages = Math.floor(totalItems / perPage)
    const nonFullPages = (totalItems % perPage > 0) ? 1 : 0
    return fullPages + nonFullPages;
  },

  /**
  * Sanitizes and returns the `perPage` and `page` properties of the supplied object.
  * If the properties are missing, default values are used instead.
  * @param {Object} options. An object with the properties to sanitize
  * @returns {Object} an object with `perPage` and `page` sanitized.
  */
  sanitizePaginationOptions: function (options){
    const perPageToInt = parseInt(options.perPage);
    const pageToInt = parseInt(options.page);
    const perPage = _.isInteger(perPageToInt)? perPageToInt : -1;
    const page = _.isInteger(pageToInt)? pageToInt : 0;

    return {
      perPage,
      page
    }
  }
}
