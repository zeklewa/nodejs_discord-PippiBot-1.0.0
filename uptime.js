module.exports = {
	uptime: function()
	{
		var uptime = + new Date() - start_up_time;
     	console.log(uptime);
        toChannel.send(log_mess + "I have been up for " + rqfunc.timeConverter(uptime) + ". Beep boop.*");
        return;
	}
}