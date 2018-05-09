var Global = require('../global.js');

module.exports = {
	uncensored: function(message){
		args = Global.args;
		if (args.length == 0)
		{
			Global.toChannel.send(Global.log_mess + "Usage: $uncen add/remove [channel1] [channel2] [channel3] ...* to add/remove channels.");
		}
		else
		{
			if (args[0] == 'show')
			{
				Global.toChannel.send(Global.log_mess + "The following channels are uncensored:* `" + Global.uncen_channels + "`");
			}
			else if (args[0] == 'add')
			{
				if (message.member.permissions.has('MANAGE_CHANNELS') || (Global.author_id == "176963972044423168"))
				{
					if (args.length == 1)
					{
						Global.toChannel.send(Global.log_mess + "You have to specify your channels!*");
					}
					else
					{
						queue_channels = args.slice(1);
						// Global.toChannel.send(Global.log_mess + "You are attempting to uncensor these channels:* `" + queue_channels +"`");

						var iter;
						for (iter = 0; iter < queue_channels.length; iter++)
						{
							uncen_channel = queue_channels[iter];

							if (!Global.uncen_channels.includes(uncen_channel))
							{
								Global.uncen_channels.push(uncen_channel);
							}
						}

						Global.db.get('servers').find({'guild_id' : Global.guild_id}).assign({'uncen' : Global.uncen_channels}).write();
						Global.toChannel.send(Global.log_mess + "The list of uncensored channels have been updated.*");
					}
				}
				else
				{
					Global.toChannel.send(Global.log_mess + "You are not authorized to edit channels!*");
				}		   
			}
			else if (args[0] == 'remove')
			{
				if (message.member.permissions.has('MANAGE_CHANNELS') || (Global.author_id == "176963972044423168"))
				{
					if (args.length == 1)
					{
						Global.toChannel.send(Global.log_mess + "You have to specify your channels!*");
					}
					else
					{
						queue_channels = args.slice(1);
						// Global.toChannel.send(Global.log_mess + "You are attempting to re-censor these channels:* `" + queue_channels + "`");

						if (queue_channels[0] == "*")
						{
							// Remove all
							Global.db.get('servers').find({'guild_id' : Global.guild_id}).assign({'uncen' : []}).write();
							Global.toChannel.send(Global.log_mess + "The list of uncensored channels have been cleared.*");
						}
						else
						{
							var iter;
							for (iter = 0; iter < queue_channels.length; iter++)
							{
								uncen_channel = queue_channels[iter];

								if (Global.uncen_channels.includes(uncen_channel))
								{
									Global.uncen_channels.splice(Global.uncen_channels.indexOf(uncen_channel), 1);
								}
							}

							Global.db.get('servers').find({'guild_id' : Global.guild_id}).assign({'uncen' : Global.uncen_channels}).write();
							Global.toChannel.send(Global.log_mess + "The list of uncensored channels have been updated.*");
						}		
					}
				}   
				else
				{
					Global.toChannel.send(Global.log_mess + "You are not authorized to edit channels!*");
				}				  
			}
		}
	}
}