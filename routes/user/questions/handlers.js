const path = require('path');
const questionsApi = require('../../../lib/api/questions.js')

module.exports = {
  listQuestions: function(req, res){
    //HTML
    
    if(req.accepts('html')){
      const viewPath = path.resolve(__dirname, '../../../public/ui/index.html');
      return res.sendFile(viewPath);
    }

    //JSON
    const options = {
      author: req.user._id
    }

    return questionsApi.list(options).then(function(resObj){
      res.json(resObj)
    })
  }
}