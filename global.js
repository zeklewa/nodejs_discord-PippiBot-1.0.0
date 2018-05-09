// Database files
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// Discord things
const Discord = require('discord.js');
const bot = new Discord.Client();

// Prerequisites
var logger = require('winston');
var auth = require('./auth.json');
var plotly = require('plotly')('zeklewa','sC8bIL6vurb1J24M7zNN');
var fs = require('fs');
var request = require('request');
var ytdl = require('ytdl-core');
var search = require('youtube-search');

// Login with specified token
bot.login(auth.token);

// Default parameters
var start_up_time;
var default_channel = "";
var cur_prefix = "$";

var servers = {}; // Key = server, Value = music queue for that server
var np_servers = {}

var mess;
var author_id;
var guild_id;
var msg_content;
var toChannel;
var log_mess;

// Export static stuffs
exports.logger = logger;
exports.auth = auth;
exports.plotly = plotly;
exports.fs = fs;
exports.request = request;
exports.ytdl = ytdl;
exports.search = search;

exports.db = db;
exports.bot = bot;

exports.start_up_time = start_up_time;
exports.default_channel = default_channel;
exports.cur_prefix = cur_prefix;

// Initialize all variable associated with user's message here
exports.setMessage = function(message){
	mess = message;
	//Add to database
	author_id = mess.author.id;
	guild_id = mess.guild.id;
	msg_content = mess.content;
	
	toChannel = mess.channel;
	log_mess = '*<@' + author_id + '> ';
	if (default_channel){
		toChannel = default_channel;
	}
	exports.author_id = author_id;
	exports.guild_id = guild_id;
	exports.msg_content = msg_content;
	exports.toChannel = toChannel;
	exports.log_mess = log_mess;
	exports.message = mess;

	var uncen_channels = db.get('servers').find({'guild_id' : guild_id}).get('uncen').value();
	exports.uncen_channels = uncen_channels;

	// Special bot commands
	var args = msg_content.substring(cur_prefix.length).split(' ');
	var cmd = args[0];
	var para = "";

	if (args.length > 1)
	{
		para = args[1];
	}		

	args = args.splice(1);

	exports.args = args;
	exports.cmd = cmd;
	exports.para = para;

	// Update prefix
	if (db.get('servers').find({'guild_id' : guild_id}).get('prefix').value())
	{
		cur_prefix = db.get('servers').find({'guild_id' : guild_id}).get('prefix').value();
	}

	exports.cur_prefix = cur_prefix;

	// Update server data in database
	if (db.get('servers').find({'guild_id': guild_id}).value())
	{
		var defchan_id = db.get('servers').find({'guild_id': guild_id}).get('defchan').value();
		default_channel = bot.channels.find("id", defchan_id);
	}
	else
	{
		db.get('servers').push({ 'guild_id': guild_id, 'defchan': "", 'banned_words': [], 'uncen': [], 'prefix': "" }).write();
	}

	exports.default_channel = default_channel;
	exports.servers = servers;
	exports.np_servers = np_servers;
	return;
}
