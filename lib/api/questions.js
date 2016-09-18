const Promise     = require("bluebird");
const coroutine   = Promise.coroutine;
const _ = require('lodash');
const sanitizeMongo = require('mongo-sanitize');
const Question  = db.model('Question')
const pagination = require('../utils/pagination');
const DEFAULT_PER_PAGE = 30;
const MAX_PER_PAGE = 100;

module.exports = {
  list: coroutine(function *listGen(options){

    // filter and sanitize options
    const filters = ['type', 'author', 'date_created', 'date_modified'];
    const filterOptions = _.pick(options || {}, filters);
    const sanitizedFilterOptions = _.forOwn(filterOptions, sanitizeMongo);

    // pagination
    const {page, perPage: perPageUser} = pagination.sanitizePaginationOptions(options);
    const perPage = pagination.calcNumOfItemsPerPage(DEFAULT_PER_PAGE, MAX_PER_PAGE, perPageUser);

    
    const q1 = Question
      .find(sanitizedFilterOptions)
      .sort({'date_modified': -1})
      .skip(perPage * (page-1))
      .limit(perPage)
      .lean()
      .exec();


    const q2 = Question
      .count(sanitizedFilterOptions)
      .exec();

    const results = yield Promise.all([q1, q2]);

    // replace `_id` with `id`
    const questions = results[0];
    questions.forEach((q) => {
      q.id = q._id.toString()
      delete(q._id)
    });

    return {
      questions: questions,
      page,
      pages: pagination.calcNumOfPages(results[1], perPage)
    }
  })
}
