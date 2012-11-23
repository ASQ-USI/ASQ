
exports.world = function(req, res){

   // You can also use the end method: res.end('hello world!')
   res.send('hello world!')
   
   // And you can also use templates
   //res.render('index', { title: 'This is my hello world' })   
};