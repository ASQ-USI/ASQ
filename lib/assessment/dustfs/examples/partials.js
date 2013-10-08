
/* Foreach examples -- Automatic format */

var dustfs = require('dustfs');

dustfs.debug(true);

dustfs.dirs('templates');

dustfs.render('partial.dust', {'name':'Captain Jack'}, function(err, out) {
	if(err) console.log('Error: '+err);
	else console.log('Output:\n' + out);
});

/* EOF */
