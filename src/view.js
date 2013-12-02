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

	var points = module.inputPoints.concat(module.outputPoints);
	for(var i = 0; i < points.length; i++) {
		var bOffset = points[i];
		ctx.fillStyle = 'rgba(0,0,0,1)';

		ctx.beginPath();
		ctx.lineTo((b.x+bOffset.x*b.w)*w,(b.y+bOffset.y*b.h)*h);
		ctx.lineTo(((b.x+bOffset.x*b.w)+bOffset.w*b.w)*w,(b.y+bOffset.y*b.h)*h);
		ctx.lineTo(((b.x+bOffset.x*b.w)+bOffset.w*b.w)*w,((b.y+bOffset.y*b.h)+bOffset.h*b.h)*h);
		ctx.lineTo((b.x+bOffset.x*b.w)*w,((b.y+bOffset.y*b.h)+bOffset.h*b.h)*h);
		ctx.closePath();
		ctx.fill();
	};

	if(typeof module.value === "number"){
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = 'black';
		var text = module.name + ": " + module.value.toPrecision(4);
		var height = 0.5*Math.min(w*b.w,h*b.h);
		ctx.font = height + "px Lucida Console";
		var metrics = ctx.measureText(text);

		if(metrics.width > w*b.w){
			height *= w*b.w/metrics.width;
			ctx.font = height + "px Lucida Console";
		}

		ctx.fillText(text,(b.x+b.w/2)*w,(b.y+b.h/2)*h);
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
				var bIn = m.inputPoints[j];
				var cIn = {
					x: (b.x+(bIn.x+bIn.w/2)*b.w)*w,
					y: (b.y+(bIn.y+bIn.h/2)*b.h)*h
				};

				var b2, bOut;
				var child = m.children[j];
				if(typeof child === "undefined" || child == null){
					if(FS.moduleSelected == m && FS.mouseDownRelinkIndex == j){
						b2 = {x:FS.mousePos.x-0.02,y:FS.mousePos.y,w:0.04,h:0.04};
						bOut = {x:0.5,y:0,w:0,h:0};
					}else{
						continue;
					}
				}else{
					b2 = child.box;
					bOut = child.outputPoints[0];
				}

				var cOut = {
					x: (b2.x+(bOut.x+bOut.w/2)*b2.w)*w,
					y: (b2.y+(bOut.y+bOut.h/2)*b2.h)*h
				};

				var deltaY = Math.abs(5*(cOut.y - cIn.y));

				var ctrlOut = {
					x: cOut.x,
					y: cOut.y - b2.h*deltaY
				};

				var ctrlIn = {
					x: cIn.x,
					y: cIn.y + b.h*deltaY
				};

				ctx.moveTo(cIn.x,cIn.y);
				ctx.bezierCurveTo(ctrlIn.x,ctrlIn.y,ctrlOut.x,ctrlOut.y,cOut.x,cOut.y);
				ctx.stroke();
			}
		}
	}


	if(FS.mouseDownType == "relinkOutput" && FS.mouseState == "down"){
		var m = FS.moduleSelected;
		if(m){
			var b = m.box;
			var bOut = m.outputPoints[FS.mouseDownRelinkIndex];
			ctx.moveTo(FS.mousePos.x*w,FS.mousePos.y*h);
			ctx.lineTo((b.x+(bOut.x+bOut.w/2)*b.w)*w,(b.y+(bOut.y+bOut.h/2)*b.h)*h);
			ctx.stroke();
		}
	}

	ctx.restore();
};

FS.drawModules = function() {


	for(var i = 0; i < FS.modules.length; i++){
		var m = FS.modules[i];

		if(m.type == 'node' || m.type == 'input'){
			FS.drawNode(m);
		}else if(m.type == 'funDisplay'){
			FS.drawFun(m);
		}
	}
	FS.drawEdges();
};