///////////////////////////////////////////////////////////////////////////
// Json.jsx
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


///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////
var ESCAPEABLE = /["\\\x00-\x1f\x7f-\x9f]/g;
var META = {'\b':'\\b', '\t':'\\t', '\n':'\\n', '\f':'\\f', '\r':'\\r', '"':'\\"','\\':'\\\\'};


///////////////////////////////////////////////////////////////////////////////
// JsonUtils Class
///////////////////////////////////////////////////////////////////////////////
var Json = {};


///////////////////////////////////////////////////////////////////////////////
// Class Methods
///////////////////////////////////////////////////////////////////////////////
Json.encode = function(obj){
	if(obj === null) return "null";
	
	var type = typeof(obj);
	var result;
	
	switch(type){
		case "undefined":
			result = undefined;
			break;
		case "string":
			result = Json.quoteString(obj);
			break;
		case "number":
		case "boolean":
			result = obj+"";
			break;
		case "object":
			switch(true){
				case(typeof obj.encode == "function"):
					result = Json.encode(obj.encode());
					break;
					
				case(obj.constructor === Date):
					var mon = obj.getUTCMonth()+1;
					if (mon < 10) mon = '0'+mon;

					var day = obj.getUTCDate();
					if (day < 10) day = '0'+day;

					var yer = obj.getUTCFullYear();

					var hrs = obj.getUTCHours();
					if (hrs < 10) hrs = '0'+hrs;

					var min = obj.getUTCMinutes();
					if (min < 10) min = '0'+min;

					var sec = obj.getUTCSeconds();
					if (sec < 10) sec = '0'+sec;

					var msc = obj.getUTCMilliseconds();
					if (msc < 100) msc = '0'+msc;
					if (msc < 10) msc = '0'+msc;

					var ts = '"'+yer+'-'+mon+'-'+day+'T'+hrs+':'+min+':'+sec+'.'+msc+'Z"';
					result = ts;
					break;

				case (obj.constructor === Array):
					var ret = [];
					for (var i = 0; i < obj.length; i++)
					ret.push( Json.encode(obj[i]) || "null" );

					result = "["+ret.join(",")+"]";
					break;
			
				default:
					var pairs = [];
					
					for (var key in obj){
						var name;
						var type = typeof key;

						if(type == "number"){
							name = '"'+key+'"';
						}else if(type == "string"){
							name = Json.quoteString(key);
						}else{
							continue;
						}
					
						if(typeof obj[key] == "function") continue;
						
						var val = Json.encode(obj[key]);
						pairs.push(name+":"+val);
					}

					result = "{"+pairs.join(", ")+"}";
					break;
			}
	}
	return result;
};

///////////////////////////////////////////////////////////////////////////////
Json.eval = function(src){
	return eval("("+src+")");
};

///////////////////////////////////////////////////////////////////////////////
Json.secureEval = function(src){
	if (typeof(JSON) == 'object' && JSON.parse)
	return JSON.parse(src);

	var filtered = src;
	filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
	filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
	filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');

	if (/^[\],:{}\s]*$/.test(filtered)){
		var aw = eval(src);
		return aw;
	}else{
		throw new SyntaxError("Error parsing JSON, source is not valid.");
	}
};

///////////////////////////////////////////////////////////////////////////////
Json.quoteString = function(string){
	if (string.match(ESCAPEABLE)){
		return '"'+string.replace(ESCAPEABLE, function(a){
			var c = META[a];
			if (typeof c === 'string') return c;
			c = a.charCodeAt();
			return '\\u00'+Math.floor(c / 16).toString(16)+(c % 16).toString(16);
		})+'"';
	}
	return '"'+string+'"';
};
///////////////////////////////////////////////////////////////////////////////


