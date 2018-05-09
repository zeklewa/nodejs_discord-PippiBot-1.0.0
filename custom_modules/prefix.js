var Global = require('../global.js');

module.exports = {
	changePrefix: function(message){
		args = Global.args;
		if (args.length == 0){
			Global.toChannel.send(Global.log_mess + "Usage: $prefix [desired_prefix]. You can use $prefix show to show the default prefix.*");
		}
		else {
			if (message.member.permissions.has('MANAGE_GUILD') || (author_id == "176963972044423168"))
			{
				var msg_content = Global.msg_content;
				console.log(msg_content);
				var req_prefix = msg_content.substring(Global.cur_prefix.length);
				req_prefix = req_prefix.substr(req_prefix.indexOf(" ") + 1);
				Global.db.get('servers').find({'guild_id' : Global.guild_id}).assign({'prefix' : req_prefix}).write();
				Global.toChannel.send(Global.log_mess + "The prefix has been set to* `" + req_prefix + "`.");
				Global.cur_prefix = req_prefix;
			}
			else
			{
				Global.toChannel.send(Global.log_mess + "You are not authorized to change the prefix!*");
			}
		}
		return;
	}
	
}