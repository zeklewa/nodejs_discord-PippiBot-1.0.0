// Database files
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({users: [], usercount: 0, servers: [], plot_no: 0}).write();

// Discord things
const Discord = require('discord.js');
const bot = new Discord.Client();

// Prerequisites
var logger = require('winston');
var auth = require('./auth.json');
var plotly = require('plotly')('zeklewa','sC8bIL6vurb1J24M7zNN');
var fs = require('fs');
var request = require('request');

var rqfunc = require('./required');
//var rqcmd = require();

// Default parameters
var start_up_time;
var default_channel = "";

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Login with specified token
bot.login(auth.token);

// Actions to take when bot's ready
bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
  bot.user.setActivity('ur mother $help', { type: 'PLAYING' });
  start_up_time = new Date();
});

bot.on('message', message => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `$`
    // Ignore bots

    // Add to database
    var author_id = message.author.id;
    var guild_id = message.guild.id;
    var msg_content = message.content;

    // Global user database
    if (!(db.get('users').find({ 'id': author_id })).value()){
        db.get('users').push({ 'id': author_id, 'name': message.author.username, 'swear_count': 0, 'line_count': 0, 'contribution_points': 0 }).write();
        db.update('usercount', n => n + 1).write();
        //console.log('here');
    }

    // Update server data in database
    if (db.get('servers').find({'guild_id': guild_id}).value())
    {
        var defchan_id = db.get('servers').find({'guild_id': guild_id}).get('defchan').value();
        default_channel = bot.channels.find("id", defchan_id);
    }
    else
    {
        db.get('servers').push({ 'guild_id': guild_id, 'defchan': "", 'banned_words': [], 'uncen': [] }).write();
    }

    db.get('users').find({ 'id': author_id }).update("line_count", n => n + 1).write();

    if (message.author.bot) return;
    console.log("received message: " + message);

    // -------------------------------------------------------------------------------------------------------------------------------
    // Save attachments here

    var gen_name = (new Date()).toString().substr(0, 24);
    gen_name = gen_name.replace(/ /g, "_");
    gen_name = gen_name.replace(/:/g, "-");
    folder_path = "saved_files/" + message.guild.name;

    if (!fs.existsSync(folder_path)){
        fs.mkdirSync(folder_path);
    }

    gen_path = folder_path + "/" + gen_name;
    
    //write file
    try
    {
        if (message.attachments.array()[0].url)
        {
            gen_ext = "." + rqfunc.getExtension(message.attachments.array()[0].filename);

            var download = function(uri, filename, callback){
                request.head(uri, function(err, res, body){
                    console.log('content-type:', res.headers['content-type']);
                    console.log('content-length:', res.headers['content-length']);
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
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
                request.head(uri, function(err, res, body){
                    console.log('content-type:', res.headers['content-type']);
                    console.log('content-length:', res.headers['content-length']);
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                });
            };

            
            download(match, gen_path + gen_ext, function(){
                console.log('done');
            });
        }
    }catch(error){}
    
    // ------------------------------------------------------------------------------------------------------------------------------

    // Profanity Filter here
    var banned_words = db.get('servers').find({'guild_id' : guild_id}).get('banned_words').value();
    var uncen_channels = db.get('servers').find({'guild_id' : guild_id}).get('uncen').value();

    var stripped_message = msg_content.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    lower_message = stripped_message.toLowerCase();

    var i;
    var del_mes = false;
    var del_indice = [];

    // Delete message only when channel is censored
    if (!uncen_channels.includes(message.channel.name))
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

        db.get('users').find({ 'id': author_id }).update("swear_count", n => n + 1).write();

        var spit = "*<@" + author_id + ">" + " said:* `";
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

        var s_count = db.get('users').find({ 'id': author_id }).get('swear_count').value();
        //var l_count = db.get('users').find({ 'id': author_id }).get('line_count').value();

        spit = spit + "*Please keep the conversation civil and avoid foul language.*\n";
        spit = spit + "*You have sworn " + s_count + " times.*\n";


        console.log("spit: ", spit);
        message.channel.send(spit);
    }

    // ------------------------------------------------------------------------------------------------------------------------------

    // Special bot commands
    if (msg_content.substring(0, 1) == '$') {
        var args = msg_content.substring(1).split(' ');
        var cmd = args[0];
        var para = "";

        if (args.length > 1)
        {
            para = args[1];
        }        

        args = args.splice(1);

        // If default_channel has not been set, reply to current channel
        var toChannel = message.channel;

        if (default_channel){
            toChannel = default_channel;
        }

        var log_mess = '*<@' + author_id + '> ';

        switch(cmd) {
            // uncen stuff
            case 'uncen':
                if (args.length == 0)
                {
                    toChannel.send(log_mess + "Usage: $uncen add/remove [channel1] [channel2] [channel3] ...* to add/remove channels.");
                }
                else
                {
                    if (args[0] == 'show')
                    {
                        toChannel.send(log_mess + "The following channels are uncensored:* `" + uncen_channels + "`");
                    }
                    else if (args[0] == 'add')
                    {
                        if (message.member.permissions.has('MANAGE_CHANNELS') || (author_id == "176963972044423168"))
                        {
                            if (args.length == 1)
                            {
                                toChannel.send(log_mess + "You have to specify your channels!*");
                            }
                            else
                            {
                                queue_channels = args.slice(1);
                                // toChannel.send(log_mess + "You are attempting to uncensor these channels:* `" + queue_channels +"`");

                                var iter;
                                for (iter = 0; iter < queue_channels.length; iter++)
                                {
                                    uncen_channel = queue_channels[iter];

                                    if (!uncen_channels.includes(uncen_channel))
                                    {
                                        uncen_channels.push(uncen_channel);
                                    }
                                }

                                db.get('servers').find({'guild_id' : guild_id}).assign({'uncen' : uncen_channels}).write();
                                toChannel.send(log_mess + "The list of uncensored channels have been updated.*");
                            }
                        }
                        else
                        {
                            toChannel.send(log_mess + "You are not authorized to edit channels!*");
                        }           
                    }
                    else if (args[0] == 'remove')
                    {
                        if (message.member.permissions.has('MANAGE_CHANNELS') || (author_id == "176963972044423168"))
                        {
                            if (args.length == 1)
                            {
                                toChannel.send(log_mess + "You have to specify your channels!*");
                            }
                            else
                            {
                                queue_channels = args.slice(1);
                                // toChannel.send(log_mess + "You are attempting to re-censor these channels:* `" + queue_channels + "`");

                                if (queue_channels[0] == "*")
                                {
                                    // Remove all
                                    db.get('servers').find({'guild_id' : guild_id}).assign({'uncen' : []}).write();
                                    toChannel.send(log_mess + "The list of uncensored channels have been cleared.*");
                                }
                                else
                                {
                                    var iter;
                                    for (iter = 0; iter < queue_channels.length; iter++)
                                    {
                                        uncen_channel = queue_channels[iter];

                                        if (uncen_channels.includes(uncen_channel))
                                        {
                                            uncen_channels.splice(uncen_channels.indexOf(uncen_channel), 1);
                                        }
                                    }

                                    db.get('servers').find({'guild_id' : guild_id}).assign({'uncen' : uncen_channels}).write();
                                    toChannel.send(log_mess + "The list of uncensored channels have been updated.*");
                                }        
                            }
                        }   
                        else
                        {
                            toChannel.send(log_mess + "You are not authorized to edit channels!*");
                        }                  
                    }
                }
            break;

            // !ping
            case 'ping':
                toChannel.send(log_mess + 'Pong!*');
            break;

            // Display uptime
            case 'uptime':
                var uptime = + new Date() - start_up_time;
                console.log(uptime);
                toChannel.send(log_mess + "I have been up for " + rqfunc.timeConverter(uptime) + ". Beep boop.*");
            break;

            // Set default channel
            case 'defchan':
                if (para == "")
                {
                    toChannel.send(log_mess + "Usage: $defchan channel_name_here. Use $defchan default to clear the default channel and $defchan show to show the default channel.*");
                }

                else if (para == "default")
                {
                    if ((message.member.permissions.has('MANAGE_CHANNELS')) || (author_id == "176963972044423168"))
                    {
                        toChannel.send(log_mess + "Default channel has been cleared.*");
                        db.get('servers').find({'guild_id': guild_id}).assign({ "defchan": "" }).write();
                    }
                    else
                        toChannel.send(log_mess + "You are not authorized to edit channels!.*")
                }

                else if (para == "show")
                {
                    if (!default_channel)
                        toChannel.send(log_mess + "No default channel is currently set on this server.*");
                    else
                        toChannel.send(log_mess + "The default channel is currently <#" + default_channel.id + ">*");
                }

                else
                {
                    if (message.member.permissions.has('MANAGE_CHANNELS') || (author_id == "176963972044423168"))
                    {
                        var channel_found = false;
                        var mess;

                        found_channel = message.guild.channels.find("name", para);

                        if (found_channel)
                        {
                            mess = 'Channel found! Default channel has been set.*';
                            default_channel = found_channel;
                            db.get('servers').find({'guild_id': guild_id}).assign({ "defchan": default_channel.id }).write();
                        }

                        else mess = 'Channel not found. Try again.*';
                        toChannel.send(log_mess + mess);
                    }
                    else
                        toChannel.send(log_mess + "You are not authorized to edit channels!.*")
                }
            break;
            // Generate random imgur image
            case 'rdimgur':
                var iter;
                var not_found = true;

                for (iter = 0; iter < 20; iter++)
                {
                    var imgur_link = rqfunc.genImgur();
                    if (rqfunc.imageExists(imgur_link)){
                        toChannel.send(log_mess + imgur_link + "*");
                        not_found = false;
                        break;
                    }
                }

                if (not_found)
                {
                    toChannel.send(log_mess + "Fuck imgur.");
                }
            break;

            // Help:
            case 'help':
                var mess;
                mess  = "Pippi Bot v1.0.0 - Zeklewa\n";
                mess += "Possible commands: `$ping`, `$uptime`, `$defchan`, `$rdimgur`, `$plot`, `$bword`, `$uncen`.";
                toChannel.send(log_mess + mess);
            break;

            case 'bword':
                var cur_bwords = db.get('servers').find({'guild_id' : guild_id}).get('banned_words').value();
                if ((args.length >= 2) && ((args[0] == 'add') || (args[0] == 'remove')))
                {
                    var key_word = msg_content.substring(1);
                    key_word = key_word.substr(key_word.indexOf(" ") + 1);
                    key_word = key_word.substr(key_word.indexOf(" ") + 1);

                    //var key_word = args[1];
                    console.log(key_word);

                    if (args[0] == 'show')
                        toChannel.send(log_mess + "`Currently banned words: " + cur_bwords + "`");
                    // If word exists

                    if (cur_bwords.includes(key_word))
                    {
                        if (message.member.permissions.has('MANAGE_MESSAGES') || (author_id == "176963972044423168"))
                        {
                            if (args[0] == 'add')
                            {
                                toChannel.send(log_mess + "The word '" + key_word + "' already exists!*");
                            }
                            else
                            {
                                cur_bwords.splice(cur_bwords.indexOf(key_word), 1);
                                db.get('servers').find({'guild_id' : guild_id}).assign({'banned_words' : cur_bwords}).write();
                                toChannel.send(log_mess + "The word '" + key_word + "' has been deleted from the ban list.*");
                            }
                        }
                        else
                            toChannel.send(log_mess + "You are not authorized to edit messages!*");
                    }   
                    // If word doesn't exist
                    else
                    {
                        if (message.member.permissions.has('MANAGE_MESSAGES') || (author_id == "176963972044423168"))
                        {
                            if (args[0] == 'add')
                            {
                                if (key_word == "*")
                                {
                                    toChannel.send(log_mess + "Uh oh, you're not allowed to do that you cheeky bastard.*"); 
                                }
                                else
                                {
                                    cur_bwords.push(key_word);
                                    db.get('servers').find({'guild_id' : guild_id}).assign({'banned_words' : cur_bwords}).write();
                                    toChannel.send(log_mess + "The word '" + key_word + "' has been banned.*"); 
                                } 
                            }
                            else
                            {
                                if (key_word == "*")
                                {
                                    toChannel.send(log_mess + "The ban list has been cleared.*"); 
                                    db.get('servers').find({'guild_id' : guild_id}).assign({'banned_words' : []}).write();
                                }
                                else
                                    toChannel.send(log_mess + "The word '" + key_word + "' doesn't exist in the database!*");
                            }
                        }
                        else
                            toChannel.send(log_mess + "You are not authorized to edit messages!*");
                    }
                }
                else
                {
                    if ((args.length == 1) && (args[0] == 'show'))
                    {
                        toChannel.send(log_mess + "`Currently banned words: " + cur_bwords + "`");
                    }
                    // Display all banned words and documentation for bword
                    else toChannel.send(log_mess + "Usage: $bword add [banned_word], $bword remove [banned_word], $bword show.*");
                }
            break;
            // Plot
            case 'plot':
                try {
                    // args = msg_content.substring(1).split(' ');
                    console.log(args);
                    if ((args.length < 3) || (args.length > 6))
                        toChannel.send(log_mess + "Usage: $plot [function#], [begin#], [end#], [no. of points]\n For special functions in the JS math library, use prefix $. Ex: $sin, $cos, etc. \n Still under development, will have more functionalities in the future.*");
                    else
                    {
                        db.update('plot_no', n => n + 1).write();
                        var plot_no = db.get('plot_no').value();

                        var func = args[0].replace('$', 'Math.').replace('^', '**');
                        var begin = Number(args[1]);
                        var end = Number(args[2]);
                        var steps;

                        if (begin > end)
                        {
                            var temp = begin;
                            begin = end;
                            end = temp;
                        }

                        im_w = 600;
                        im_h = 600;
                        steps = 100;

                        if (args.length == 4)
                        {
                            steps = Number(args[3]);
                        }

                        var f = new Function("x", "return " + func);

                        console.log(begin + " " + end + " " + steps);

                        var xs = [];
                        var ys = [];

                        var k;
                        for (k = 0; k < steps; k++)
                        {
                            x = begin + (end - begin)*k*1.0/steps;
                            y = f(x);
                            xs.push(x);
                            ys.push(y);
                        }

                        var trace1 = {
                          x: xs,
                          y: ys,
                          type: "scatter"
                        };
                         
                        var figure = { 'data': [trace1] };
                         
                        var imgOpts = {
                            format: 'png',
                            width: im_w,
                            height: im_h
                        };
                         
                        var plot_path = 'Plots/' + plot_no +'.png';

                        plotly.getImage(figure, imgOpts, function (error, imageStream) {
                            if (error) return console.log (error);
                            var fileStream = fs.createWriteStream(plot_path);
                            fileStream.on('close', function(){
                                toChannel.send(log_mess + "Plot created.*", {files: ['Plots/' + plot_no +'.png']});
                            })
                            imageStream.pipe(fileStream);
                        });
                    }
                } catch(err) {
                    toChannel.send(log_mess + "Wrong syntax error!* `" + err + '`');
                }
            break;
            }
        }
});