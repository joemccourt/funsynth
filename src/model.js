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
			funValues[i] = fun.eval(variables);
		}
	}

	return funValues;
};