var Global = require('../global.js');

module.exports = {
	modify_bword: function(message){
		var cur_bwords = Global.db.get('servers').find({'guild_id' : Global.guild_id}).get('banned_words').value();
		if ((Global.args.length >= 2) && ((Global.args[0] == 'add') || (Global.args[0] == 'remove')))
		{
			var key_word = Global.msg_content.substring(1);
			key_word = key_word.substr(key_word.indexOf(" ") + 1);

			// Used to remove "add"/"remove" in string
			key_word = key_word.substr(key_word.indexOf(" ") + 1);

			//var key_word = Global.args[1];
			console.log(key_word);

			if (Global.args[0] == 'show')
				Global.toChannel.send(Global.log_mess + "`Currently banned words: " + cur_bwords + "`");
			// If word exists

			if (cur_bwords.includes(key_word))
			{
				if (message.member.permissions.has('MANAGE_MESSAGES') || (Global.author_id == "176963972044423168"))
				{
					if (Global.args[0] == 'add')
					{
						Global.toChannel.send(Global.log_mess + "The word '" + key_word + "' already exists!*");
					}
					else
					{
						cur_bwords.splice(cur_bwords.indexOf(key_word), 1);
						Global.db.get('servers').find({'guild_id' : Global.guild_id}).assign({'banned_words' : cur_bwords}).write();
						Global.toChannel.send(Global.log_mess + "The word '" + key_word + "' has been deleted from the ban list.*");
					}
				}
				else
					Global.toChannel.send(Global.log_mess + "You are not authorized to edit messages!*");
			}   
			// If word doesn't exist
			else
			{
				if (message.member.permissions.has('MANAGE_MESSAGES') || (Global.author_id == "176963972044423168"))
				{
					if (Global.args[0] == 'add')
					{
						if (key_word == "*")
						{
							Global.toChannel.send(Global.log_mess + "Uh oh, you're not allowed to do that you cheeky bastard.*"); 
						}
						else
						{
							cur_bwords.push(key_word);
							Global.db.get('servers').find({'guild_id' : Global.guild_id}).assign({'banned_words' : cur_bwords}).write();
							Global.toChannel.send(Global.log_mess + "The word '" + key_word + "' has been banned.*"); 
						} 
					}
					else
					{
						if (key_word == "*")
						{
							Global.toChannel.send(Global.log_mess + "The ban list has been cleared.*"); 
							Global.db.get('servers').find({'guild_id' : Global.guild_id}).assign({'banned_words' : []}).write();
						}
						else
							Global.toChannel.send(Global.log_mess + "The word '" + key_word + "' doesn't exist in the database!*");
					}
				}
				else
					Global.toChannel.send(Global.log_mess + "You are not authorized to edit messages!*");
			}
		}
		else
		{
			if ((Global.args.length == 1) && (Global.args[0] == 'show'))
			{
				Global.toChannel.send(Global.log_mess + "`Currently banned words: " + cur_bwords + "`");
			}
			// Display all banned words and documentation for bword
			else Global.toChannel.send(Global.log_mess + "Usage: $bword add [banned_word], $bword remove [banned_word], $bword show.*");
		}
	return;
	}
}