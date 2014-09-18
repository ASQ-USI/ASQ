// this is the entry for the ./example/js/asq-impress-adapter.js script

//congig logger
require('bows').config({ padLength: 18 })

//fun starts here
var asqSocket = require('./asqSocketMock');
var adapter = require('./asqImpressAdapter')(asqSocket);