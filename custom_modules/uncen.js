module.exports = {
    uncensored: function(String_Args)
    {
        const adapter = new FileSync('../db.json');
        const db = low(adapter);
        var args = String_Args.split(' ');
        if (args.length == 0)
            {
                toChannel.send(log_mess + "Usage: "+cur_prefix+"uncen add/remove [channel1] [channel2] [channel3] ...* to add/remove channels.");
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
        return;
    }
}
