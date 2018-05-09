var Global = require('../global.js');

module.exports = {
	plot : function(){
		try {
			var Original_args = " ";
			for (var i=0, len=Global.args.length; i<len; i++){
				Original_args += Global.args[i];
				if (i<len) Original_args += " ";
			}
			var args = Original_args.split(',');
			console.log(args);
			if ((args.length < 3) || (args.length > 6))
				Global.toChannel.send(Global.log_mess + "Usage: $plot [function#], [begin#], [end#], [no. of points]\n For special functions in the JS math library, use prefix $. Ex: $sin, $cos, etc. \n Still under development, will have more functionalities in the future.*");
			else
			{
				Global.db.update('plot_no', n => n + 1).write();
				var plot_no = Global.db.get('plot_no').value();

				var func = args[0].replace('$', 'Math.').replace('^', '**');
				var begin = Number(args[1]);
				var end = Number(args[2]);
				var steps;

				if (begin > end)
				{
					var temp = begin;
					begin = end;
					end = temp;
				}

				im_w = 600;
				im_h = 600;
				steps = 100;

				if (args.length == 4)
				{
					steps = Number(args[3]);
				}

				var f = new Function("x", "return " + func);

				console.log(begin + " " + end + " " + steps);

				var xs = [];
				var ys = [];

				var k;
				for (k = 0; k < steps; k++)
				{
					x = begin + (end - begin)*k*1.0/steps;
					y = f(x);
					xs.push(x);
					ys.push(y);
				}

				var trace1 = {
				  x: xs,
				  y: ys,
				  type: "scatter"
				};
				 
				var figure = { 'data': [trace1] };
				 
				var imgOpts = {
					format: 'png',
					width: im_w,
					height: im_h
				};
				 
				var plot_path = 'Plots/' + plot_no +'.png';

				Global.plotly.getImage(figure, imgOpts, function (error, imageStream) {
					if (error) return console.log (error);
					var fileStream = Global.fs.createWriteStream(plot_path);
					fileStream.on('close', function(){
						Global.toChannel.send(Global.log_mess + "Plot created.*", {files: ['Plots/' + plot_no +'.png']});
					})
					imageStream.pipe(fileStream);
				});
			}
		} catch(err) {
			Global.toChannel.send(Global.log_mess + "Wrong syntax error!* `" + err + '`');
		}
		return;
	}
}