// webpack checks  is going to first check the "browser" field of the package.json
// of the required module
module.exports = {
  // "impress" : require('impress-asq-adapter'),
  "impress.js" : require('impress-asq-fork-asq-adapter'),
  "reveal.js" : require('../reveal-asq-fork-asq-adapter.js')
}