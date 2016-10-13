function rpad(str, size) {
	str = str + "";
	if (str.length >= size) {
		return str;
	}
	return str + "                                                                                ".slice(0, size - str.length);
}

function errorHandler(err) {
	console.error(err.message || err);
	process.exit();
}

function eachLine(content, callback) {
	var lines = ("" + content).replace(/\r\n/g, "\n").split("\n");
	lines.forEach((line) => {
		callback(line)
	});
}

module.exports = {
	rpad: rpad,
	errorHandler: errorHandler,
	eachLine: eachLine
}