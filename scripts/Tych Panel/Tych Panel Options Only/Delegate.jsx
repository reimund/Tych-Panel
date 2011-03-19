///////////////////////////////////////////////////////////////////////////
// Delegate.jsx
//
// Copyright: (c)2010, wolf benz
// License: http://www.opensource.org/licenses/bsd-license.php
// Contact: suprflow@googlemail.com
//
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// Target
///////////////////////////////////////////////////////////////////////////////
#target photoshop

var Delegate = {};

Delegate.create = function(target, method){
	var args = [];
	for(var i=2; i<arguments.length; i++) args.push(arguments[i]);
	var fnc  = function(){
		var fargs = [];
		for(var a=0; a<arguments.length; a++) fargs.push(arguments[a]);
		var cargs = fargs.concat(args);
		method.apply(target, cargs);};
	return fnc;
};