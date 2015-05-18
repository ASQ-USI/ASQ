'use strict';

var $ = require('jquery')
  , request = require('superagent')


  // proactive rendering: To make the experience for the user better,
  //when you do an AJAX request, wherever possible, render the result immidiately 
  //even if you don;t have a response from the server yet. When the get the response:
  // if it's an error, revert things. 

  // It donesn't work for logging in through ajax.
  // It doesnt' work when you need the data of the response

// GET read
// POST create new resource
// PUT replace resource (entirely), creates it if doesn't exist
// DELETE remove
// PATCH http://williamdurand.fr/2014/02/14/please-do-not-patch-like-an-idiot/

// If you want to replace the whole settings
// PUT /presentation/id/settings and send all the variables to make a complete replace

// If you want to replace a property of settings
// (1) PUT /presentation/id/settings/parametername and send the parameter
// (2) PATCH /presentation/id/settings/ 
// [
//    { "op": "replace", "path": "/maxnumsubission", "value": "4" }
//]


function run(){
  // when document is ready
  $(function(){
   // send delete request to server
    request
      .put('settings')
      .send({ maxnumsubmission: '2' })
      .set('Accept', 'application/json')
      .end(function(err, res){
        // handle error
        if(err || res.statusType!=2){
    
          alert('Something went wrong with removing your presentation: ' + 
            (err!=null ? err.message : JSON.stringify(res.body)));
          return;
        }
        console.log(res)
        //everythings good
      });
  });
}

module.exports =  run;