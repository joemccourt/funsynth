FS.funBox = {x:0.25,y:0.25,w:0.5,h:0.5};

FS.drawClear = function(){
	var ctx = FS.ctx;
	ctx.clearRect(0,0,FS.canvas.width,FS.canvas.height);
};

FS.drawFun = function(module) {
	var ctx = FS.ctx;
	ctx.save();

	var w = FS.canvas.width;
	var h = FS.canvas.height;

	var y = 1-FS.mousePos.y*2;
	var x = 2*FS.mousePos.x - 1;

	var n = w;
	var inputData = {
		'scale': 'linear',
		'variables': {'x':0,'t':FS.time/1000,'amp':y,'freq':10*x},
		'independentVariable': 'x',
		'range': [0,1],
		'numPoints': n
	};

	// var fun = FS.generateFun("Math.cos(Math.PI*2*4*%x)-0.1*%t");
	var outData = FS.getFunValues(module, inputData);

	ctx.lineWidth = 2;
	ctx.fillStyle = 'black';
	ctx.joinCap = 'round';

	ctx.fillStyle = module.fillStyle;
	
	var b = module.box;
	ctx.beginPath();
	ctx.lineTo(b.x*w,b.y*h);
	ctx.lineTo((b.x+b.w)*w,b.y*h);
	ctx.lineTo((b.x+b.w)*w,(b.y+b.h)*h);
	ctx.lineTo(b.x*w,(b.y+b.h)*h);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	ctx.beginPath();

	for(var i = 0; i < n; i++){
		var drawX = (i/n*b.w + b.x)*w;
		var drawY = ((-0.5*outData[i]+0.5)*b.h + b.y)*h;

		ctx.lineTo(drawX, drawY);
	}

	ctx.stroke();
	ctx.restore();
};

FS.drawNode = function(module) {
	var ctx = FS.ctx;
	ctx.save();

	var w = FS.canvas.width;
	var h = FS.canvas.height;

	var b = module.box;

	ctx.fillStyle = module.fillStyle;

	ctx.beginPath();
	ctx.lineTo(b.x*w,b.y*h);
	ctx.lineTo((b.x+b.w)*w,b.y*h);
	ctx.lineTo((b.x+b.w)*w,(b.y+b.h)*h);
	ctx.lineTo(b.x*w,(b.y+b.h)*h);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();

	var height = 0.4*Math.min(w*b.w,h*b.h);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = height + "px Lucida Console";
	ctx.fillStyle = 'black';

	if(typeof module.value === "number"){
		ctx.fillText(module.name + ": " + module.value.toPrecision(4),(b.x+b.w/2)*w,(b.y+b.h/2)*h);
	}

	ctx.restore();
};

FS.drawEdges = function() {
	var ctx = FS.ctx;
	ctx.save();

	var w = FS.canvas.width;
	var h = FS.canvas.height;

	for(var i = 0; i < FS.modules.length; i++){
		var m = FS.modules[i];
		var b = m.box;
		if(m.children){
			for(var j = 0; j < m.children.length; j++){
				ctx.beginPath();
				var b2 = m.children[j].box;
				ctx.moveTo((b.x+b.w/2)*w,(b.y+b.h/2)*h);
				ctx.lineTo((b2.x+b2.w/2)*w,(b2.y+b2.h/2)*h);
				ctx.stroke();
			}
		}
	}

	ctx.restore();
};

FS.drawModules = function() {

	FS.drawEdges();

	for(var i = 0; i < FS.modules.length; i++){
		var m = FS.modules[i];

		if(m.type == 'node' || m.type == 'input'){
			FS.drawNode(m);
		}else if(m.type == 'funDisplay'){
			FS.drawFun(m);
		}
	}
};