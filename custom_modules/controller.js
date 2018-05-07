var prefix = require('prefix.js');
var uncen = require('uncen.js');
var uptime = require('uptime.js');
var defchan = require('defchan.js');
var bword = require('bword.js');
var plot = require('plot.js');

module.exports = {
	changePrefix: function(String_Args)
	{
		prefix.changePrefix(String_Args);
		return;
	}
	uncen: function(String_Args)
	{
		uncen.uncensored(String_Args);
		return;
	}
	uptime: function()
	{
		uptime.uptime();
		return;
	}
	defchan: function(String_Args)
	{
		defchan.defaultChannel(String_Args);
		return;
	}
	bword: function(String_Args)
	{
		bword.banWord(String_Args);
		return;
	}
	plot: function(String_Args)
	{
		plot.drawPlot(String_Args);
		return;
	}
}
