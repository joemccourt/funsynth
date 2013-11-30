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

FS.addModule = function(moduleName) {
	FS.modules.push(moduleName);
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
		'box': {x:0.25,y:0.25,w:0.3,h:0.2},
		'fillStyle': 'rgb(255,200,200)',
		'name': 'demoFunction',
		'eval': function(p){return p.x;},
		'z-index': 2
	};

FS.addModule(moduleDisplay);

var moduleInputX = {
		'type': 'input',
		'box': {x:0.65,y:0.25,w:0.2,h:0.1},
		'fillStyle': 'rgb(200,150,50)',
		'name': 'x',
		'z-index': 1
	};

FS.addModule(moduleInputX);

var moduleInputT = {
		'type': 'input',
		'box': {x:0.15,y:0.25,w:0.2,h:0.1},
		'fillStyle': 'rgb(200,50,200)',
		'name': 't',
		'z-index': 1
	};

FS.addModule(moduleInputT);

var moduleSin = {
		'type': 'node',
		'box': {x:0.1,y:0.1,w:0.2,h:0.1},
		'fillStyle': 'rgb(200,150,200)',
		'name': 'sin(x)',
		'eval': function(p){return Math.sin(p.x);},
		'z-index': 3
	};

FS.addModule(moduleSin);
moduleDisplay.children = [moduleSin];

// var moduleCos = {
// 		'type': 'node',
// 		'box': {x:0.6,y:0.1,w:0.25,h:0.1},
// 		'fillStyle': 'rgb(150,150,50)',
// 		'name': 'cos(x)',
// 		'eval': function(p){return Math.cos(p.x);},
// 		'z-index': 0
// 	};

var moduleAdd = {
		'type': 'node',
		'box': {x:0.2,y:0.3,w:0.2,h:0.1},
		'fillStyle': 'rgb(250,150,250)',
		'name': 'x+y',
		'eval': function(p){return p.x+p.y;},
		'z-index': 7
	};

FS.addModule(moduleAdd);
moduleSin.children = [moduleAdd];

var moduleMul = {
		'type': 'node',
		'box': {x:0.6,y:0.3,w:0.2,h:0.1},
		'fillStyle': 'rgb(250,150,150)',
		'name': 'x*y',
		'eval': function(p){return p.x*p.y;},
		'z-index': 5
	};

FS.addModule(moduleMul);

var modulePI = {
		'type': 'node',
		'box': {x:0.4,y:0.8,w:0.25,h:0.1},
		'fillStyle': 'rgb(50,150,150)',
		'name': 'PI',
		'eval': function(){return Math.PI;},
		'z-index': 2
	};

FS.addModule(modulePI);
moduleAdd.children = [moduleMul, moduleInputT];
moduleMul.children = [modulePI, moduleInputX];

	// {
	// 	'type': 'input',
	// 	'box': {x:0.3,y:0.4,w:0.2,h:0.1},
	// 	'fillStyle': 'rgb(250,150,250)',
	// 	'name': 'x',
	// 	'eval': function(p){return p.x+p.y;},
	// 	'z-index': 9
	// },

// parent.children;

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
			m.box.x = x-d.x;
			m.box.y = y-d.y;
		}
	}
};

FS.mousedown = function(x,y){
	FS.mousePos = {'x':x,'y':y};
	FS.mouseState = "down";

	FS.moduleSelected = undefined;
	for(var i = 0; i < FS.modules.length; i++){
		var m = FS.modules[i];
		var b = m.box;

		if(b.x <= x && b.x+b.w >= x && b.y <= y && b.y+b.h >= y){
			if(!FS.moduleSelected || FS.moduleSelected['z-index'] < m['z-index']){
				FS.moduleSelected = FS.modules[i];
				FS.mouseDownDelta = {x:x-b.x,y:y-b.y};
			}
		}
	}

	if(FS.moduleSelected) {
		FS.moduleSelected['z-index'] = FS.maxZIndex;
		FS.maxZIndex++;
		FS.reorderModules(); //Inefficeint, but whatever
	}
};

FS.mouseup = function(x,y){
	FS.mousePos = {'x':x,'y':y};
	FS.mouseState = "up";
};

FS.resizeToFit = function(){
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