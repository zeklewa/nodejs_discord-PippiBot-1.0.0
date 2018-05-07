module.exports = {
	banWord: function(String_Args){
		const adapter = new FileSync('../db.json');
		const db = low(adapter);
		var args = String_Args.split(' ');
		var cur_bwords = db.get('servers').find({'guild_id' : guild_id}).get('banned_words').value();
            if ((args.length >= 2) && ((args[0] == 'add') || (args[0] == 'remove')))
            {
                var key_word = msg_content.substring(1);
                key_word = key_word.substr(key_word.indexOf(" ") + 1);

                // Used to remove "add"/"remove" in string
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
                else toChannel.send(log_mess + "Usage: "+cur_prefix+"bword add [banned_word], "+cur_prefix+"bword remove [banned_word], "+cur_prefix+"bword show.*");
            }
        return;
	}
}
