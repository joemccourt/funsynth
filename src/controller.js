"use strict";
var FS = {};
FS.canvasID = "#funCanvas";
FS.dirtyCanvas = true;
FS.lastFrameTime = 0;
FS.mousePos = {'x':0.5,'y':0.5};
FS.mouseState = "up";
FS.mouseDownDelta = {'x':0,'y':0};
FS.moduleSelected = undefined;

FS.time = 0;

FS.maxZIndex = 100;

FS.modules = [];

FS.addModule = function(module) {
	FS.sanitizeModule(module)
	FS.modules.push(module);
	FS.reorderModules();
};

FS.main = function() {
	FS.startSession();

	requestNextAnimationFrame(FS.gameLoop);
};

window.onload = FS.main;

FS.startSession = function() {
	FS.canvas = $(FS.canvasID)[0];
	FS.ctx = FS.canvas.getContext("2d");

	//FS.setLevelRenderBox();
	// FS.loadGameState();
	FS.resizeToFit();

	FS.reorderModules();

	FS.dirtyCanvas = true;
	FS.initEvents();


//Prototype module assembly
var moduleDisplay = {
		'type': 'funDisplay',
		'box': {x:0.04,y:0.01,w:0.4,h:0.3},
		'fillStyle': 'rgba(255,255,255,1)',
		'name': 'demoFunction',
		'eval': function(p){return p.x;},
		'z-index': 2
	};

FS.addModule(moduleDisplay);

var moduleInputX = {
		'type': 'input',
		'box': {x:0.7,y:0.85,w:0.2,h:0.1},
		'fillStyle': 'rgba(200,150,50,1)',
		'name': 'x',
		'z-index': 1
	};

FS.addModule(moduleInputX);

var moduleInputT = {
		'type': 'input',
		'box': {x:0.6,y:0.4,w:0.2,h:0.1},
		'fillStyle': 'rgba(200,50,200,1)',
		'name': 't',
		'z-index': 1
	};

FS.addModule(moduleInputT);

var moduleSin = {
		'type': 'node',
		'box': {x:0.18,y:0.43,w:0.2,h:0.1},
		'fillStyle': 'rgba(200,150,200,1)',
		'name': 'sin(x)',
		'eval': function(p){return Math.sin(p.x);},
		'z-index': 3
	};

FS.addModule(moduleSin);
moduleDisplay.children = [moduleSin];

// var moduleCos = {
// 		'type': 'node',
// 		'box': {x:0.6,y:0.1,w:0.25,h:0.1},
// 		'fillStyle': 'rgba(150,150,50,1)',
// 		'name': 'cos(x)',
// 		'eval': function(p){return Math.cos(p.x);},
// 		'z-index': 0
// 	};

var moduleAdd = FS.createNewModule("node","add");
var moduleMul = FS.createNewModule("node","mul");

moduleSin.children = [moduleAdd];

var modulePI = {
		'type': 'node',
		'box': {x:0.4,y:0.8,w:0.25,h:0.1},
		'fillStyle': 'rgba(50,150,150,1)',
		'name': 'PI',
		'eval': function(){return Math.PI;},
		'z-index': 2
	};

FS.addModule(modulePI);
moduleAdd.children = [moduleMul, moduleInputT];
moduleMul.children = [modulePI, moduleInputX];



var moduleConstant = {
		'type': 'node',
		'nodeType': 'constant',
		'box': {x:0.2,y:0.7,w:0.25,h:0.1},
		'fillStyle': 'rgba(50,150,150,1)',
		'value': 2,
		'name': 'Constant',
		'eval': function(){return this.value;},
		'z-index': 2
	};

FS.addModule(moduleConstant);



var moduleMenu = {
		'type': 'menu',
		'box': {x:0.85,y:0,w:0.15,h:1},
		'fillStyle': 'rgba(50,150,150,1)',
		'value': 2,
		'name': 'Menu',
		'eval': function(){return this.value;},
		'z-index': 2
	};

FS.addModule(moduleMenu);

	// {
	// 	'type': 'input',
	// 	'box': {x:0.3,y:0.4,w:0.2,h:0.1},
	// 	'fillStyle': 'rgba(250,150,250,1)',
	// 	'name': 'x',
	// 	'eval': function(p){return p.x+p.y;},
	// 	'z-index': 9
	// },

// parent.children;


	FS.setModulesIOPoints();
};

FS.sanitizeModule = function(module) {
	if(typeof module !== 'object'){module = {};}

	var defaultModule = {
		'type': 'node',
		'box': {x:0.4,y:0.4,w:0.2,h:0.2},
		'fillStyle': 'rgba(128,128,128,1)',
		'name': '0',
		'eval': function(){return 0;},
		'z-index': 0,
		'children': []
	};

	for(var key in defaultModule){
		if(defaultModule.hasOwnProperty(key) && module[key] == null){
			module[key] = defaultModule[key];
		}
	}
};

FS.setModulesIOPoints = function() {
	for(var i = 0; i < FS.modules.length; i++){
		FS.setModuleIOPoints(FS.modules[i]);
	}
};

FS.setModuleIOPoints = function(module) {
	var outputPoints = [{x:0.45,y:0,w:0.1,h:0.1}];
	var inputPoints = [];

	for(var i = 0; i < module.children.length; i++){
		var point = {y:0.9,w:0.1,h:0.1};
		point.x = 0.45 + 0.25*(i+0.5-module.children.length/2);
		inputPoints.push(point);
	}

	module.outputPoints = outputPoints;
	module.inputPoints = inputPoints;
};

FS.createNewModule = function(type,nodeType,name){
	var evalFunction = function(){return 0;};
	if(!name){name = "";}

	var numInput = 0;
	if(nodeType == "add"){
		evalFunction = function(p){return p.x+p.y;};
		name = "x+y";
		numInput = 2;
	}else if(nodeType == "mul"){
		evalFunction = function(p){return p.x*p.y;};
		name = "x*y";
		numInput = 2;
	}else if(nodeType == "pow"){
		evalFunction = function(p){return Math.pow(p.x,p.y);};
		name = "x^y";
		numInput = 2;
	}else if(nodeType == "sin"){
		evalFunction = function(p){return Math.sin(p.x);};
		name = "sin(x)";
		numInput = 1;
	}else if(nodeType == "exp"){
		evalFunction = function(p){return Math.exp(p.x);};
		name = "e^x";
		numInput = 1;
	}else if(nodeType == "neg"){
		evalFunction = function(p){return -p.x;};
		name = "-x";
		numInput = 1;
	}else if(nodeType == "constant"){
		evalFunction = function(p){return p.x+p.y;};
		name = "x+y";
		numInput = 0;
	}

	var module = {
			'type': type,
			'nodeType': nodeType,
			'box': {x:0.5,y:0.5,w:0.2,h:0.1},
			'fillStyle': 'rgba(128,150,150,1)',
			'name': name,
			'value': 1,
			'eval': evalFunction,
			'children': [],
			'z-index': FS.maxZIndex
		};

	for(var i = 0; i < numInput; i++){
		module.children.push(undefined);
	}

	FS.maxZIndex++;
	FS.addModule(module);
	FS.setModuleIOPoints(module);
	return module;
};

FS.gameLoop = function(time) {
	var ctx = FS.ctx;
	FS.time = time;

	if(FS.dirtyCanvas){
		// FS.dirtyCanvas = false;
		FS.drawClear();
		FS.drawModules();
	}

	requestNextAnimationFrame(FS.gameLoop);

	FS.frameRenderTime = time - FS.lastFrameTime;
	FS.lastFrameTime = time;
};

FS.reorderModules = function() {
	FS.modules.sort(function(a, b) {
		return a['z-index'] - b['z-index'];
	});
};

FS.mousemove = function(x,y){
	var w = FS.canvas.width;
	var h = FS.canvas.height;

	FS.mousePos = {'x':x,'y':y};

	if(FS.mouseState === "down"){
		var d = FS.mouseDownDelta;
		var m = FS.moduleSelected;
		if(m && d){
			var b = m.box;
			if(FS.mouseDownType == "adjustValue"){
				var p0 = FS.mouseDownPos;
				var p = FS.mousePos;
				var gain = 3.5;
				m.value = m.value0 * Math.exp(-gain*(p.y-p0.y));
			}else if(FS.mouseDownType == "move"){
				b.x = x-d.x;
				b.y = y-d.y;
			}else if(FS.mouseDownType == "scale"){
				b.w = Math.max(0.03,x-b.x);
				b.h = Math.max(0.03,y-b.y);
			}
		}else{
			for(var i = 0; i < FS.modules.length; i++) {
				var m = FS.modules[i];
				var b = m.box;
				b.x = b.x0 + x-FS.mouseDownPos.x;
				b.y = b.y0 + y-FS.mouseDownPos.y;
			}
		}
	}
};

FS.mousedown = function(x,y){
	FS.mousePos = {'x':x,'y':y};
	FS.mouseDownPos = {'x':x,'y':y};
	FS.mouseState = "down";

	FS.moduleSelected = undefined;
	for(var i = FS.modules.length-1; i >= 0; i--){
		var m = FS.modules[i];
		var b = m.box;

		b.x0 = b.x;
		b.y0 = b.y;

		if(b.x <= x && b.x+b.w >= x && b.y <= y && b.y+b.h >= y){
			if(!FS.moduleSelected || FS.moduleSelected['z-index'] < m['z-index']){
				FS.moduleSelected = m;
				FS.mouseDownDelta = {x:x-b.x,y:y-b.y};
				FS.mouseDownType = "move";

				if(m.type == "menu"){
					FS.menuMousedown(m,x,y);
				}

				var xRel = (x-b.x)/b.w;
				var yRel = (y-b.y)/b.h;
				if(xRel > 0.9 && yRel > 0.9){
					FS.mouseDownType = "scale";
				}else if(xRel > 0.5 && m.type=="node" && m.nodeType == "constant"){
					FS.mouseDownType = "adjustValue";
					m.value0 = m.value;
				}

				for(var j = 0; j < m.inputPoints.length; j++){
					var bR = m.inputPoints[j];
					if(xRel > bR.x && xRel < bR.x+bR.w && yRel > bR.y && yRel < bR.y+bR.h){
						FS.mouseDownType = "relinkInput";
						FS.mouseDownRelinkIndex = j;
						m.children[j] = undefined;
						break;
					}
				}

				for(var j = 0; j < m.outputPoints.length; j++){
					var bR = m.outputPoints[j];
					if(xRel > bR.x && xRel < bR.x+bR.w && yRel > bR.y && yRel < bR.y+bR.h){
						FS.mouseDownType = "relinkOutput";
						FS.mouseDownRelinkIndex = j;

						for(var k = 0; k < FS.modules.length; k++){
							var mP = FS.modules[k];

							if(mP != m){
								for(var p = 0; p < mP.children.length; p++){
									if(mP.children[p] == m){
										mP.children[p] = undefined;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	if(FS.moduleSelected) {
		FS.moduleSelected['z-index'] = FS.maxZIndex;
		FS.maxZIndex++;
		FS.reorderModules(); //Inefficeint, but whatever
	}
};

FS.mouseup = function(x,y) {
	var w = FS.canvas.width;
	var h = FS.canvas.height;

	FS.mousePos = {'x':x,'y':y};
	FS.mouseState = "up";

	var d = FS.mouseDownDelta;
	var m = FS.moduleSelected;
	if(m && d){
		if(FS.mouseDownType == "relinkInput"){
			var index = FS.mouseDownRelinkIndex;
			var b = m.box;
			for(var i = FS.modules.length - 1; i >= 0; i--){
				var mI = FS.modules[i];
				var bI = mI.box;

				if(mI == m){continue;}
				if(bI.x <= x && bI.x+bI.w >= x && bI.y <= y && bI.y+bI.h >= y){
					m.children[index] = mI;

					break;
				}
			}
		}else if(FS.mouseDownType == "relinkOutput"){
			var b = m.box;
			for(var i = FS.modules.length - 1; i >= 0; i--){
				var mI = FS.modules[i];
				var bI = mI.box;

				if(mI == m){continue;}
				if(bI.x <= x && bI.x+bI.w >= x && bI.y <= y && bI.y+bI.h >= y){
					if(mI.children.length > 0){
						var closest = 99999;
						var closestI = 0;
						for(var j = 0; j < mI.inputPoints.length; j++){
							var p = mI.inputPoints[j];
							var dist = Math.sqrt(Math.pow(mI.box.x + (p.x+p.w/2)*mI.box.w - x,2)+Math.pow(mI.box.y + (p.y+p.h/2)*mI.box.h - y,2));
							if(dist < closest){
								closest = dist;
								closestI = j;
							}
						}
						mI.children[closestI] = m;
						break;
					}
				}
			}
		}
	}
};

FS.resizeToFit = function() {
	var w = $(window).width();
	var h = $(window).height();

	FS.canvas.width  = w;
	FS.canvas.height = h;

	FS.dirtyCanvas = true;
};

// *** Event binding *** //
FS.initEvents = function(){
	$(window).resize(function(){
		FS.resizeToFit();
	});

    $(window).mousemove(function (e) {
        var offset = $(FS.canvasID).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;

		var w = FS.canvas.width;
		var h = FS.canvas.height;

        FS.mousemove(x/w,y/h);
    });

    $(window).mousedown(function (e) {
        var offset = $(FS.canvasID).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;

		var w = FS.canvas.width;
		var h = FS.canvas.height;

        FS.mousedown(x/w,y/h);
    });

    $(window).mouseup(function (e) {
        var offset = $(FS.canvasID).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;

		var w = FS.canvas.width;
		var h = FS.canvas.height;

        FS.mouseup(x/w,y/h);
    });
};

// *** LocalStorage Check ***
function supports_html5_storage() {
	try{
		return 'localStorage' in window && window['localStorage'] !== null;
	}catch (e){
		return false;
	}
}

// Reprinted from Core HTML5 Canvas
// By David Geary
window.requestNextAnimationFrame =
   (function () {
      var originalWebkitRequestAnimationFrame = undefined,
          wrapper = undefined,
          callback = undefined,
          geckoVersion = 0,
          userAgent = navigator.userAgent,
          index = 0,
          self = this;

      // Workaround for Chrome 10 bug where Chrome
      // does not pass the time to the animation function
      
      if (window.webkitRequestAnimationFrame) {
         // Define the wrapper

         wrapper = function (time) {
           if (time === undefined) {
              time = +new Date();
           }
           self.callback(time);
         };

         // Make the switch
          
         originalWebkitRequestAnimationFrame = window.webkitRequestAnimationFrame;    

         window.webkitRequestAnimationFrame = function (callback, element) {
            self.callback = callback;

            // Browser calls the wrapper and wrapper calls the callback
            
            originalWebkitRequestAnimationFrame(wrapper, element);
         }
      }

      // Workaround for Gecko 2.0, which has a bug in
      // mozRequestAnimationFrame() that restricts animations
      // to 30-40 fps.

      if (window.mozRequestAnimationFrame) {
         // Check the Gecko version. Gecko is used by browsers
         // other than Firefox. Gecko 2.0 corresponds to
         // Firefox 4.0.
         
         index = userAgent.indexOf('rv:');

         if (userAgent.indexOf('Gecko') != -1) {
            geckoVersion = userAgent.substr(index + 3, 3);

            if (geckoVersion === '2.0') {
               // Forces the return statement to fall through
               // to the setTimeout() function.

               window.mozRequestAnimationFrame = undefined;
            }
         }
      }
      
      return window.requestAnimationFrame   ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame    ||
         window.oRequestAnimationFrame      ||
         window.msRequestAnimationFrame     ||

         function (callback, element) {
            var start,
                finish;


            window.setTimeout( function () {
               start = +new Date();
               callback(start);
               finish = +new Date();

               self.timeout = 1000 / 60 - (finish - start);

            }, self.timeout);
         };
      }
   )
();