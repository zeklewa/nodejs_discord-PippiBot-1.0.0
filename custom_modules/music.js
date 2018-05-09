var Global = require('../global.js');
// Music function

function play(connection, message, toChannel)
{
    var server = Global.servers[message.guild.id];

    // Show now playing for each server
    Global.np_servers[message.guild.id] = server.queue[0];

    toChannel.send("*Now playing:* `" + server.queue[0].title + "`.");

    server.dispatcher = connection.playStream(Global.ytdl(server.queue[0].link, {filter: 'audioonly'}));

    server.queue.shift();

    server.dispatcher.on("end", function(){
        if (server.queue[0]) play(connection, message, Global.toChannel);
        else 
        {
            delete Global.np_servers[message.guild.id];
            connection.disconnect();
            toChannel.send('*Queue concluded.*');
        } 
    });
}

module.exports = {
    play : function(message){
        // Check if queue exists
        if (Global.args.length == 0)
        {
            Global.toChannel.send(Global.log_mess + 'Usage: $play [youtube search query]*, $skip to skip the current song, $stop to stop playing and $queue to display the current queue.*');
            return;
        }

        if (!message.member.voiceChannel)
        {
            Global.toChannel.send(Global.log_mess + 'You must be connected to a voice channel!*');
            return;
        }

        if (!Global.servers[message.guild.id])
        {
            Global.servers[message.guild.id] = {queue : []};
        }

        // Get query
        var query = Global.msg_content.substring(1);
        query = query.substr(query.indexOf(" ") + 1);

        var opts = {
            maxResults: 5,
            key: Global.auth.youtubeAPI
        };

        // Process query here first -> push query to queue
        Global.search(query, opts, function(err, results) {
            // Select first object from search
            if (results)
            {
                var result_song = results[0];

                // Push to queue
                Global.toChannel.send(Global.log_mess + 'The song* `' + result_song.title + '` *has been added to the queue*');
                var server = Global.servers[message.guild.id];
                server.queue.push(result_song); 
                    
                if (!message.guild.voiceConnection)
                {
                    message.member.voiceChannel.join().then(connection => {
                        play(connection, message, Global.toChannel);
                    })
                }
            }
            else
            {
                Global.toChannel.send(Global.log_mess + "Sorry, I couldn't find anything with that query.*");
            }
        if(err) return console.log(err); });
        return;
    },

    skip : function(message){
        // Skip current song
        var server = Global.servers[message.guild.id];
        if (server.dispatcher) server.dispatcher.end();
        return;
    },

    stop: function(message){
        // Stop playing
        var server = Global.servers[message.guild.id];
        if (message.guild.voiceConnection) 
        {
            Global.bot.voiceConnections.get(Global.guild_id).channel.leave();
        }
        else Global.toChannel.send(Global.log_mess + 'I am not connected to a voice channel!*');
        return;
    },

    volume: function(message){
        if (!Global.servers[message.guild.id])
        {
            Global.servers[message.guild.id] = {queue : []};
        }

        var server = Global.servers[message.guild.id];

        if (Global.args.length != 1)
        {
            Global.toChannel.send(Global.log_mess + 'Usage: $volume [desired volume] [0-200](%) (100% being the normal perceived volume)). Use $volume show to display the current volume level.*');
            return;
        }
        if (!server.dispatcher)
        {
            Global.toChannel.send(Global.log_mess + "I am not connected to a voice channel!*");
            return;
        }

        else
        {
            if (Global.args[0] == 'show')
                Global.toChannel.send(Global.log_mess + "The current volume is set at `" + server.dispatcher.volumeLogarithmic*100 + "%`.*");
            else if (isNaN(Global.args[0]))
                Global.toChannel.send(Global.log_mess + "Please provide a number for the desired volume!*");
            else
            {
                var set_volume = Number(Global.args[0])/100;
                if ((set_volume >= 2) || (set_volume <= 0))
                {
                    Global.toChannel.send(Global.log_mess + "Please provide a number within the specified bounds!*");
                }
                server.dispatcher.setVolumeLogarithmic(set_volume);
                Global.toChannel.send(Global.log_mess + 'The volume has been set to* `' + Number(Global.args[0]) + '%`.');
                //Global.toChannel.send(Global.log_mess + 'Usage: $volume [desired volume] [0-200](%) (100% being the normal perceived volume). Use $volume show to display the current volume level.*');
            }
        }     
        return;
    },

    np : function(message){
        // Show currently playing
        if (np_servers[message.guild.id])
        {
            Global.toChannel.send(Global.log_mess + "Currently playing:* `" + np_servers[message.guild.id].title + '`.\n' + np_servers[message.guild.id].link);
            return;
        }
        Global.toChannel.send(Global.log_mess + "No songs are currently being played.*");
        return;
    },

    queue : function(message){
        // Add song to queue
        if (!Global.servers[message.guild.id])
        {
            Global.servers[message.guild.id] = {queue : []};
        }

        var server = Global.servers[message.guild.id];
        if (Global.args.length == 0)
        {
            if (server.queue.length)
            {
                var string_mess = "*Current songs in the queue:* \n" + "```";
                var i;
                for (i = 0; i < server.queue.length; i++)
                {
                    string_mess += (i + 1) + ". " + server.queue[i].title + "\n";
                }
                string_mess += "```";
                Global.toChannel.send(string_mess);
            }
            else
            {
                Global.toChannel.send("*There are currently no songs in the queue. Use $play [song name] to add one to the queue!*");
            }
        }
        else
        {
            if (Global.args[0] == 'remove')
            {        
                if (Global.args.length == 2)
                {
                    var index = Number(Global.args[1]);
                    if (!server.queue.length)
                        Global.toChannel.send("*There are currently no songs in the queue. Use $play [song name] to add one to the queue!*");
                    else
                    {
                        if ((index >= 1) && (index <= server.queue.length))
                        {
                            Global.toChannel.send(Global.log_mess + "Successfully removed `" + server.queue[index - 1].title + "` from the queue.*");
                            server.queue.splice(index - 1, 1);
                        }
                        else
                            Global.toChannel.send(Global.log_mess + "Please enter a valid index between 1 and " + server.queue.length + "*.");
                    }
                }
                else
                    Global.toChannel.send(Global.log_mess + "Usage: $queue remove [index_of_song_in_queue].*");
            }
            else
                Global.toChannel.send(Global.log_mess + "Usage: $queue remove [index_of_song_in_queue].*");
        }
        return;
    }
}