/* 
 * Simplified interface to dust and filesystem templates
 * Copyright (C) 2011 by Jaakko-Heikki Heusala <jheusala@iki.fi>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of 
 * this software and associated documentation files (the "Software"), to deal in 
 * the Software without restriction, including without limitation the rights to 
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
 * of the Software, and to permit persons to whom the Software is furnished to do 
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE.
 */

module.exports = (function() {
	var _debug = false,
	    dust = require('dustjs-linkedin'),
	    fs = require('fs'),
	    path = require('path'),
	    foreach = require('snippets').foreach,
	    _compiled = {},
		_dirs = [],
		_mod = {},
	    _dir_load_id = 0,
	    _dirs_loading = {},
	    EventEmitter = require('events').EventEmitter;
	
	/* Wait until ongoing loading is finished */
	function wait_loading(callback) {
		var undefined,
		    events = 0,
		    foreach_loading = true,
		    errors = [];
		
		function do_end() {
			callback( (errors.length === 0) ? undefined : 'Errors:\n * ' + errors.join(' * \n') );
		}
		
		foreach(_dirs_loading).do(function(e, id) {
			events++;
			e.on('end', function(err) {
				if(err) errors.push(err);
				events--;
				if( (!foreach_loading) && (events === 0) ) do_end();
			});
		});
		
		foreach_loading = false;
		if(events === 0) do_end();
	}
	
	/* Returns the directory where file exists */
	function search_dir(file) {
		var matches = [];
		foreach(_dirs).do(function(dir) {
			if(path.existsSync(dir+"/"+file+'.dust')) matches.push(dir);
		});
		if(matches.length != 0) return matches.shift();
	}
	
	/* Compile template from filesystem */
	function do_compile(file, name) {
		var name = name || file;
		if(!file) throw new Error("file not defined");
		if(_compiled[name]) return _compiled[name];
		var source = fs.readFileSync(file, "UTF-8");
		    _compiled[name] = dust.compile(source, name);
		if(_debug) console.log("[dustfs] [" + name + "] Template compiled from " + file);
		return _compiled[name];
	}
	
	/* Load template from filesystem */
	function do_load(file, name) {
		var name = name || file;
		if(!file) throw new Error("file not defined");
		var c = do_compile(file, name);
		dust.loadSource(c);
		if(_debug) console.log("[dustfs] [" + name + "] Template loaded: " + file);
		return c;
	}
	
	/* Create context for dust */
	function do_create_context(context) {
		var context = context || {};
		
		if(!context.replace) {
			context.replace = (function(chunk, context, bodies, params) {
					return chunk.tap(function(data) {
						return (params.from && params.to && (data === params.from) ) ? params.to : data;
					}).render(bodies.block, context).untap();
				});
		}
		
		if(!context.toFixed) {
			context.toFixed = (function(chunk, context, bodies, params) {
					return chunk.tap(function(data) {
						return parseFloat(data).toFixed(params.x || 0);
					}).render(bodies.block, context).untap();
				}); // end of context
		}
		
		return context;
	}
	
	/* Render template with dust */
	function do_render(name, user_context, callback) {
		if(_debug) console.log("[dustfs] [" + name + "] Waiting until directory loading is done before rendering...");
		wait_loading(function(err) {
			if(err) console.log("[dustfs] " + err);
			if(_debug) console.log("[dustfs] [" + name + "] Loading done! Let's render!");
			var context = do_create_context(user_context),
			    dir;
			if(!_compiled[name]) {
				dir = search_dir(name);
				if(!dir) {
					callback("Could not find template: "+name);
					return;
				}
				do_load(dir+"/"+name, name);
			}
			if(_debug) console.log("[dustfs] ["+name+"] Rendering template...");
			dust.render(name, context, callback);
		});
	}
	
	/* Set directories to search files */
	function do_dirs() {
		var undefined,
		    dirs = [],
			errs = [], 
		    callback,
		    dirs_left,
		    session = new EventEmitter();
		
		_dir_load_id++;
		
		_dirs_loading[_dir_load_id] = session;
		
		foreach(arguments).do(function(dir) {
			dirs.push(dir);
		});
		
		callback = dirs.pop();
		if(! (callback && typeof callback === 'function') ) {
			dirs.push(callback);
			callback = undefined;
		}
		
		dirs_left = dirs.length;
		
		foreach(dirs).do(function(dir) {
			fs.readdir(dir, function(err, files) {
				var error_summary;
				if(err) {
					session.emit('error', err);
					errs.push(err);
				} else {
					foreach(files).do(function(file) {
						if(path.extname(file) !== ".dust") return;
						do_load(dir+"/"+file, file.slice(0, -5));
					});
				}
				dirs_left--;
				if(dirs_left === 0) {
					error_summary = (errs.length === 0) ? undefined : 'There was ' + errs.length + ' errors:\n * ' + errs.join('\n * ');
					if(callback) callback(error_summary);
					session.emit('end', error_summary);
					delete _dirs_loading[_dir_load_id];
				}
			});
		});
		
		return session;
	}
	
	/* Enable or disable debug to console */
	function do_debug(enabled) {
		_debug = (enabled === true) ? true : false;
	}
	
	/* Export functions */
	
	_mod.debug = do_debug;

	_mod.search_dir = search_dir;
	_mod.compile = do_compile;
	_mod.load = do_load;
	
	_mod.render = do_render;
	_mod.dirs = do_dirs;
	
	return _mod;
})();

/* EOF */
