var Global = require('../global.js');
var rqfunc = require('../required.js');

module.exports = {
	rdimgur: function(message){
		var iter;
		var not_found = true;

		for (iter = 0; iter < 20; iter++)
		{
			var imgur_link = rqfunc.genImgur();
			if (rqfunc.imageExists(imgur_link)){
				Global.toChannel.send(Global.log_mess + imgur_link + "*");
				not_found = false;
				break;
			}
		}

		if (not_found)
		{
			Global.toChannel.send(Global.log_mess + "Fuck imgur.");
		}
	}
}