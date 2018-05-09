var Global = require('../global.js');
var fs = require('fs');

function generateOutputFile(channel, member) {
	const fileName = `./voice_recordings/${channel.id}-${member.id}-${Date.now()}.pcm`;
	return fs.createWriteStream(fileName);
}

module.exports = {
	voicerec : function(message){
		console.log(Global.args);
		if (Global.args.length == 0)
		{
			Global.toChannel.send(Global.log_mess + 'Usage: $voicerec start/stop to start/stop the voice recording.*');
			return;
		}
		if (Global.args[0] == 'start')
		{
			if (!message.member.voiceChannel)
			{
				Global.toChannel.send(Global.log_mess + 'You must be connected to a voice channel!*');
	            return;
			}
			if (!message.guild.voiceConnection)
			{
				message.member.voiceChannel.join().then(connection => {
					const receiver = connection.createReceiver();
					connection.on('speaking', (user, speaking) => {
						if (speaking)
						{
							message.channel.sendMessage(`I'm listening to ${user}`);
					        // this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
					        const audioStream = receiver.createPCMStream(user);
					        // create an output stream so we can dump our data in a file
					        const outputStream = generateOutputFile(voiceChannel, user);
					        // pipe our audio data into the file stream
					        audioStream.pipe(outputStream);
					        outputStream.on("data", console.log);
					        // when the stream ends (the user stopped talking) tell the user
					        audioStream.on('end', () => {
					        msg.channel.sendMessage(`I'm no longer listening to ${user}`)});
						}
					})
				})
			}
		}
		if (Global.args[0] == 'stop')
		{
			if (message.guild.voiceConnection) 
	        {
	            Global.bot.voiceConnections.get(Global.guild_id).channel.leave();
	        }
	        else Global.toChannel.send(Global.log_mess + 'I am not connected to a voice channel!*');
	        return;
		}

		Global.toChannel.send(Global.log_mess + 'Usage: $voicerec start/stop to start/stop the voice recording.*');
		return;
	}
}