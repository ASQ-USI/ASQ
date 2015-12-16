// webpack checks  is going to first check the "browser" field of the package.json
// of the required module
module.exports = {
  "impress" : require('impress-asq-adapter'),
  "impressAsqFork" : require('impress-asq-fork-asq-adapter'),
  'revealAsqFork' : require('../reveal-asq-fork-asq-adapter.js')



}