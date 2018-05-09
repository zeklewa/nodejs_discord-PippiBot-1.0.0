var Global = require('../global.js');

module.exports = {
	default_channel: function(message){
		if (Global.para == "")
		{
			Global.toChannel.send(Global.log_mess + "Usage: $defchan channel_name_here. Use $defchan default to clear the default channel and $defchan show to show the default channel.*");
		}

		else if (Global.para == "default")
		{
			if ((message.member.permissions.has('MANAGE_CHANNELS')) || (Global.author_id == "176963972044423168"))
			{
				Global.toChannel.send(Global.log_mess + "Default channel has been cleared.*");
				Global.db.get('servers').find({'guild_id': Global.guild_id}).assign({ "defchan": "" }).write();
			}
			else
				Global.toChannel.send(Global.log_mess + "You are not authorized to edit channels!.*")
		}

		else if (Global.para == "show")
		{
			if (!Global.default_channel)
				Global.toChannel.send(Global.log_mess + "No default channel is currently set on this server.*");
			else
				Global.toChannel.send(Global.log_mess + "The default channel is currently <#" + Global.default_channel.id + ">*");
		}

		else
		{
			if (message.member.permissions.has('MANAGE_CHANNELS') || (Global.author_id == "176963972044423168"))
			{
				var channel_found = false;
				var mess;

				found_channel = message.guild.channels.find("name", Global.para);

				if (found_channel)
				{
					mess = 'Channel found! Default channel has been set.*';
					Global.default_channel = found_channel;
					Global.db.get('servers').find({'guild_id': Global.guild_id}).assign({ "defchan": Global.default_channel.id }).write();
				}

				else mess = 'Channel not found. Try again.*';
				Global.toChannel.send(Global.log_mess + mess);
			}
			else
				Global.toChannel.send(Global.log_mess + "You are not authorized to edit channels!.*")
		}
		return;
	}
}