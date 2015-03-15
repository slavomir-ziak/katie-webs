

var questions = require('../../theproject/questions.json');

var data = questions.start;

//console.log(questions.start);
//console.log(data.length);

var off = 28;

// colors:
// green, yellow, black, red
for (var i = 0; i<data.length; i++) {
	console.log("cas " + data[i].color + " " + (off+(i*3)));
	console.log("vyhodnotenie " + data[i].color + " " + (off+(i*3)+2));
}