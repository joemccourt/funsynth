FS.drawClear = function(){
	var ctx = FS.ctx;
	ctx.clearRect(0,0,FS.canvas.width,FS.canvas.height);
};

FS.drawFun = function(time) {
	var ctx = FS.ctx;
	ctx.save();

	var w = FS.canvas.width;
	var h = FS.canvas.height;

	var y = 1-FS.mousePos.y*2;
	var x = 2*FS.mousePos.x - 1;

	var n = w;
	var inputData = {
		'scale': 'linear',
		'variables': {'x':0,'t':time/1000,'amp':y,'freq':10*x},
		'independentVariable': 'x',
		'range': [0,1],
		'numPoints': n
	};

	// var fun = FS.generateFun("Math.cos(Math.PI*2*4*%x)-0.1*%t");

	var outData = FS.getFunValues(FS.fun,inputData);

	ctx.lineWidth = 3;
	ctx.fillStyle = 'black';
	ctx.joinCap = 'round';
	ctx.beginPath();
	
	for(var i = 0; i < n; i++){
		ctx.lineTo(i*w/n, h*(-0.5*outData[i]+0.5));
	}

	ctx.stroke();

	ctx.restore();
};