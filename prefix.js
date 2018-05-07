module.exports = {
	changePrefix: function(String_Args)
	{
		const adapter = new FileSync('../db.json');
		const db = low(adapter);
		var args = String_Args.split(' ');
		if (args.length == 0)
				{
					toChannel.send(log_mess + "Usage: "+cur_prefix+"prefix [desired_prefix]. You can use "+cur_prefix+"prefix show to show the default prefix.*");
				}
				else
				{
					if (message.member.permissions.has('MANAGE_GUILD') || (author_id == "176963972044423168"))
					{
						var req_prefix = msg_content.substring(cur_prefix.length);
						req_prefix = req_prefix.substr(req_prefix.indexOf(" ") + 1);
						db.get('servers').find({'guild_id' : guild_id}).assign({'prefix' : req_prefix}).write();
						toChannel.send(log_mess + "The prefix has been set to* `" + req_prefix + "`.");
						cur_prefix = req_prefix;
					}
					else
					{
						toChannel.send(log_mess + "You are not authorized to change the prefix!*");
					}
				}
		return;
	}
}