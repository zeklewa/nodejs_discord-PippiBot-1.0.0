var Global = require('./global.js');
var controller = require('./controller.js');

// External functions
var rqfunc = require('./required');

Global.db.defaults({users: [], usercount: 0, servers: [], plot_no: 0}).write();

// Configure Global.logger settings
Global.logger.remove(Global.logger.transports.Console);
Global.logger.add(Global.logger.transports.Console, {
	colorize: true
});
Global.logger.level = 'debug';

// Login with specified token
Global.bot.login(Global.auth.token);

// Actions to take when bot's ready
Global.bot.on('ready', () => {
	console.log(`Logged in as ${Global.bot.user.tag}!`);
	Global.bot.user.setActivity('ur mother $help', { type: 'PLAYING' });
	Global.start_up_time = new Date();
});

Global.bot.on('message', message => {

	// Initialize all variables associated with the user's message
	Global.setMessage(message);
	
	// Our bot needs to know if it will execute a command
	// It will listen for messages that will start with `$`
	// Ignore bots

	// Global user database
	if (!(Global.db.get('users').find({ 'id' : Global.author_id })).value()){
		Global.db.get('users').push({ 'id': Global.author_id, 'name': message.author.username, 'swear_count': 0, 'line_count': 0, 'contribution_points': 0 }).write();
		Global.db.update('usercount', n => n + 1).write();
		//console.log('here');
	}

	Global.db.get('users').find({ 'id': Global.author_id }).update("line_count", n => n + 1).write();

	if (message.author.bot) return;
	console.log("received message: " + message);

	// -------------------------------------------------------------------------------------------------------------------------------
	// Save attachments here

	var gen_name = (new Date()).toString().substr(0, 24);
	gen_name = gen_name.replace(/ /g, "_");
	gen_name = gen_name.replace(/:/g, "-");
	folder_path = "saved_files/" + message.guild.name;

	if (!Global.fs.existsSync(folder_path)){
		Global.fs.mkdirSync(folder_path);
	}

	gen_path = folder_path + "/" + gen_name;
	
	//write file
	try
	{
		if (message.attachments.array()[0].url)
		{
			gen_ext = "." + rqfunc.getExtension(message.attachments.array()[0].filename);

			var download = function(uri, filename, callback){
				Global.request.head(uri, function(err, res, body){
					console.log('content-type:', res.headers['content-type']);
					console.log('content-length:', res.headers['content-length']);
					Global.request(uri).pipe(Global.fs.createWriteStream(filename)).on('close', callback);
				});
			};

			download(message.attachments.array()[0].url, gen_path + gen_ext, function(){
				console.log('done');
			});

		}
	} catch(error){}

	// See if contains a link that leads to an image
	var test_string = message.content;
	var matches = test_string.match(/\bhttps?:\/\/\S+/gi);
	gen_ext = ".jpg";

	var iter;
	try{
		for (iter = 0; iter < matches.length; iter++)
		{
			var match = matches[iter];
			var download = function(uri, filename, callback){
				Global.request.head(uri, function(err, res, body){
					console.log('content-type:', res.headers['content-type']);
					console.log('content-length:', res.headers['content-length']);
					Global.request(uri).pipe(Global.fs.createWriteStream(filename)).on('close', callback);
				});
			};

			
			download(match, gen_path + gen_ext, function(){
				console.log('done');
			});
		}
	}catch(error){}
	
	// ------------------------------------------------------------------------------------------------------------------------------

	// Profanity Filter here
	var banned_words = Global.db.get('servers').find({'guild_id' : Global.guild_id}).get('banned_words').value();
	var stripped_message = Global.msg_content.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
	lower_message = stripped_message.toLowerCase();

	var i;
	var del_mes = false;
	var del_indice = [];

	// Delete message only when channel is censored
	if (!Global.uncen_channels.includes(message.channel.name))
	{
		for (i = 0; i < banned_words.length; i++){
			bword = banned_words[i];
			var len_bword = bword.length;
			var j;

			// Remembers begin-end to erase;
			for (j = 0; j < lower_message.length - len_bword + 1; j++){
				var cur_str = lower_message.substring(j, j + len_bword);
				//console.log("CURRENT STRING: " + cur_str);
				if (cur_str == bword){
					del_indice.push([j, j + len_bword]);
					del_mes = true;
				}
			}
		}
	}

	if ((del_mes) && (!message.content.includes("bword remove")) && (!message.content.includes("bword add")))
	{
		message.delete();

		Global.db.get('users').find({ 'id': Global.author_id }).update("swear_count", n => n + 1).write();

		var spit = "*<@" + Global.author_id + ">" + " said:* `";
		// Replace the specific parts
		var j;
		for (j = 0; j < stripped_message.length; j++){
			var k;
			var rep_char_bool = false;
			for (k = 0; k < del_indice.length; k++){
				if ((j >= del_indice[k][0]) && (j < del_indice[k][1])){
					rep_char_bool = true;
				}
			}
			
			if (rep_char_bool) spit = spit + "#";
			else spit = spit + stripped_message[j];
		}

		spit = spit + "`\n";

		var s_count = Global.db.get('users').find({ 'id': Global.author_id }).get('swear_count').value();
		//var l_count = Global.db.get('users').find({ 'id': Global.author_id }).get('line_count').value();

		spit = spit + "*Please keep the conversation civil and avoid foul language.*\n";
		spit = spit + "*You have sworn " + s_count + " times.*\n";


		console.log("spit: ", spit);
		message.channel.send(spit);
	}

	// ------------------------------------------------------------------------------------------------------------------------------

	if (Global.default_channel){
		Global.toChannel = Global.default_channel;
	}

	/* Because this is stupid so I'll change it for better flexibility in the future */
	let available_command = ["ping","uptime","defchan","rdimgur","plot",
							"bword","uncen","prefix","play","stop",
							"skip","np","queue","volume"];
	// Help
	if (Global.msg_content.substring(0, 5) == "$help")
	{
		var mess;
		mess  = "Pippi Bot v1.0.0 - Zeklewa\n";
		mess += "Possible commands: ";
		for (var i=0, len=available_command.length; i<len; i++){
			mess += "`" + Global.cur_prefix + available_command[i] + "`";
			if (i<len-1) mess += ",";
		}
		mess += "\n";
		mess += "The current prefix is* `" + Global.cur_prefix + "`.";
		Global.toChannel.send(Global.log_mess + mess);
	}

	// Default prefix settings
	else if (Global.msg_content.substring(0, Global.cur_prefix.length) == Global.cur_prefix)
	{
		switch(Global.cmd) {
			// Change prefix
			case 'prefix':
				controller.changePrefix(message);
			break;

			// uncen stuff
			case 'uncen':
				controller.uncensored(message);
			break;

			// !ping
			case 'ping':
				Global.toChannel.send(Global.log_mess + 'Pong!*');
			break;

			// Display uptime
			case 'uptime':
				var uptime = + new Date() - Global.start_up_time;
				console.log(uptime);
				Global.toChannel.send(Global.log_mess + "I have been up for " + rqfunc.timeConverter(uptime) + ". Beep boop.*");
			break;

			// Set default channel
			case 'defchan':
				controller.defchan(message);
			break;

			// Generate random imgur image
			case 'rdimgur':
				controller.rdimgur();
			break;

			// Banned words
			case 'bword':
				controller.bword(message);
			break;

			// Plot
			case 'plot':
				controller.plot();
			break;

			case 'play':
				controller.play(message);
			break;

			case 'stop':
				controller.stop(message);
			break;

			case 'skip':
				controller.skip(message);
			break;

			case 'volume':
				controller.volume(message);
			break;

			case 'np':
				controller.np(message);
			break;

			case 'queue':
				controller.queue(message);
			break;
			}
		}
});