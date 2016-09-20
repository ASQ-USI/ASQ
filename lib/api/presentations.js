const Promise     = require("bluebird");
const coroutine   = Promise.coroutine;
const _ = require('lodash');
const sanitizeMongo = require('mongo-sanitize');
const Presentations  = db.model('Slideshow')
const pagination = require('../utils/pagination');
const DEFAULT_PER_PAGE = 30;
const MAX_PER_PAGE = 100;

module.exports = {
  list: coroutine(function *listGen(options){

    // filter and sanitize options
    const filters = ['title', 'owner', 'course', 'presentationFramework', 'lastSession', 'lastEdit', 'conversionStatus'];
    const filterOptions = _.pick(options || {}, filters);
    const sanitizedFilterOptions = _.forOwn(filterOptions, sanitizeMongo);

    // pagination
    const {page, perPage: perPageUser} = pagination.sanitizePaginationOptions(options);
    const perPage = pagination.calcNumOfItemsPerPage(DEFAULT_PER_PAGE, MAX_PER_PAGE, perPageUser);

    
    const p1 = Presentations
      .find(sanitizedFilterOptions)
      .sort({'lastEdit': -1})
      .skip(perPage * (page-1))
      .limit(perPage)
      .lean()
      .exec();


    const p2 = Presentations
      .count(sanitizedFilterOptions)
      .exec();

    const results = yield Promise.all([p1, p2]);

    // replace `_id` with `id`
    const presentations = results[0];
    presentations.forEach((p) => {
      p.id = p._id.toString();
      delete(p._id)
    });

    return {
      presentations: presentations,
      page,
      pages: pagination.calcNumOfPages(results[1], perPage)
    }
  })
}
