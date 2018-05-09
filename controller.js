var prefix = require('./custom_modules/prefix.js');
var uncen = require('./custom_modules/uncen.js');
var defchan = require('./custom_modules/defchan.js');
var bword = require('./custom_modules/bword.js');
var plot = require('./custom_modules/plot.js');
var music = require('./custom_modules/music.js');
var rdimgur = require('./custom_modules/rdimgur.js');

module.exports = {
	changePrefix : function(message){
		prefix.changePrefix(message);
		return;
	},
	uncensored : function(message){
		uncen.uncensored(message);
		return;
	},
	defchan: function(message){
		defchan.default_channel(message);
		return;
	},
	bword : function(message){
		bword.modify_bword(message);
		return;
	},
	plot : function(){
		plot.plot();
		return;
	},
	play : function(message){
		music.play(message);
		return;
	},
	skip : function(message){
		music.skip(message);
		return;
	},
	stop : function(message){
		music.stop(message);
		return;
	},
	volume : function(message){
		music.volume(message);
		return;
	},
	np : function(message){
		music.np(message);
		return;
	},
	queue : function(message){
		music.queue(message);
		return;
	},
	rdimgur : function(){
		rdimgur.rdimgur();
		return;
	}
}