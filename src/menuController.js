FS.menuMousedown = function(m,x,y) {
	
	var buttons = FS.menu.buttons;
	var n = buttons.length;
	var b = m.box;
	for(var i = 0; i < n; i++){
		var bOffset = {x:0.1,y:(0.1+i)/n,w:0.8,h:0.8/n};
		var button = buttons[i];

		var left = b.x+bOffset.x*b.w;
		var right = left+bOffset.w*b.w;

		var top = b.y+bOffset.y*b.h;
		var bottom = top + bOffset.h*b.h;

		if(x >= left && x <= right && y >= top && y <= bottom){
			var moduleAdd = FS.createNewModule(button.type,button.nodeType,button.name);
			break;
		}
	}

};

FS.menuMousemove = function(x,y) {
	

};