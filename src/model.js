FS.fun = {
	'name': 'demo function',
	'eval': function(params){return params.amp*Math.sin(params.x*Math.PI*2*params.freq+params.t);}
};

// This uses eval, unsure of any other way of doing this
// This is very slow hmmmmm.
FS.generateFun = function(inputStr){
	inputStr = inputStr.replace(/%/g,'params.','m');

	return {
		'name': 'generated',
		'eval': function(params){return eval(inputStr);}
	};
};

FS.getFunValues = function(fun, inputData) {
	var scale = inputData.scale;
	var numPoints = inputData.numPoints;
	var range = inputData.range;

	var variables = inputData.variables;
	var independentVar = inputData.independentVariable;

	var funValues = [];

	if(numPoints <= 1){return;}

	if(scale === 'linear'){
		for(var i = 0; i < numPoints; i++){

			variables[independentVar] = range[0] + i * (range[1]-range[0]) / (numPoints-1);
			funValues[i] = FS.evalModule(fun,variables);//fun.eval(variables);
		}
	}

	return funValues;
};

FS.evalModule = function(module,variables){
	if(typeof module === "undefined" || module == null){return 0;}
	if(module.type == "input"){
		module.value = variables[module.name];
	}else{
		if(module.children.length > 0){
			if(module.children.length == 2){
				var c1 = module.children[0];
				var c2 = module.children[1];
				module.value = module.eval({x:FS.evalModule(c1,variables),y:FS.evalModule(c2,variables)});
			}else if(module.children.length == 1){
				var c1 = module.children[0];
				module.value = module.eval({x:FS.evalModule(c1,variables)});
			}
		}else{
			module.value = module.eval();
		}
	}

	// module.displayValue = 
	return module.value;
};