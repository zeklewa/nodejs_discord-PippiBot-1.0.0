module.exports = {
	defaultChannel: function(String_Args)
	{
		const adapter = new FileSync('../db.json');
		const db = low(adapter);
		var args = String_Args.split(' ');
		if (para == "")
            {
                toChannel.send(log_mess + "Usage: "+cur_prefix+"defchan channel_name_here. Use "+cur_prefix+"defchan default to clear the default channel and "+cur_prefix+"defchan show to show the default channel.*");
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
        return;
	}
}