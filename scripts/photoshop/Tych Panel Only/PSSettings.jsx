///////////////////////////////////////////////////////////////////////////
// PSSettings.jsx
//
// Copyright: (c)2010, wolf benz
// License: http://www.opensource.org/licenses/bsd-license.php
// Contact: suprflow@googlemail.com
//
// Use this script to load and save single or multiple settings in
// Photoshop.
// All data is serialized and could be pre-processed prior to saving,
// as well as post-processed directly after loading.
// Ideal for keeping userdata for your tools.
//
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
//@include Json.jsx
//@include Delegate.jsx
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
var SettingsType = {
	'MULTIPLE':'multiple',
	'SINGLE'  :'single'
}
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
// Entry constructor
///////////////////////////////////////////////////////////////////////////
var Entry = function(){
	this.key   = '';
	this.value = '';
}
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
// SettingsContainer constructor
///////////////////////////////////////////////////////////////////////////
var SettingsContainer = function(){
	this.uid   = '';
	this.data  = '';
}
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
// SettingsWrapper constructor
///////////////////////////////////////////////////////////////////////////
var SettingsWrapper = function(){
	this.settings  = {};
	this.name      = '';
	this.index     = -1;
}
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
// Settings constructor
///////////////////////////////////////////////////////////////////////////
var Settings = function(){
	this._uid   = '';
	this._msg   = '';
	this._data  = [];
	this._type  = SettingsType.SINGLE;
	this._pre   = null;
	this._post  = null;
	this._class = Object;
	this._idx   = -1;
}
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
// setter
///////////////////////////////////////////////////////////////////////////
Settings.prototype.setUID = function (uid){
	this._uid = uid;
}
///////////////////////////////////////////////////////////////////////////
Settings.prototype.setMSG = function (msg){
	this._msg = msg;
}
///////////////////////////////////////////////////////////////////////////
Settings.prototype.setType = function (type){
	switch(type){
		case SettingsType.SINGLE:
		case SettingsType.MULTIPLE:
			this._type = type;
			break;
	}
}
///////////////////////////////////////////////////////////////////////////
Settings.prototype.setPre = function (pre){
	this._pre = pre;
}
///////////////////////////////////////////////////////////////////////////
Settings.prototype.setPost = function (post){
	this._post = post;
}
///////////////////////////////////////////////////////////////////////////
Settings.prototype.setClass = function (sclass){
	this._class = sclass;
}
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Function: addEntry
// Usage:    replaces Setting at given index
// Input:    index[Number] -1 for last entry
//           entry[Object]
// Return:   Object
///////////////////////////////////////////////////////////////////////////
Settings.prototype.addEntry = function (name, data){
	if(!name || name == '') name = 'setting '+(this._data.length+1);
	var entry = new SettingsWrapper();
	entry.name = name;
	entry.index = this._data.length;
	entry.settings = data;
	
	if(this._type == SettingsType.SINGLE && this._data.length > 0)
		this.replaceEntryAt(0,entry);
	else
		this._data.push(entry);
}
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Function: replaceEntryDataAt
// Usage:    replaces Setting at given index
// Input:    index[Number] -1 for last entry
//           entry[Object]
// Return:   Object
///////////////////////////////////////////////////////////////////////////
Settings.prototype.replaceEntryDataAt = function (index, data){
	if(index == -1) index = this._data.length-1;
	
	if(index < 0 || index >= this._data.length) return null;
	else{
		this._data[index].settings = data;
	}
}
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Function: replaceEntryAt
// Usage:    replaces SettingWrapper at given index
// Input:    index[Number] -1 for last entry
//           entry[SettingsWrapper]
// Return:   Object
///////////////////////////////////////////////////////////////////////////
Settings.prototype.replaceEntryAt = function (index, entry){
	if(index == -1) index = this._data.length-1;
	
	if(index < 0 || index >= this._data.length) return null;
	else{
		entry.index = index;
		this._data[index] = entry;
	}
}
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Function: getEntryAt
// Usage:    returns Setting of given position
// Input:    Number index(0-based) or -1 for last entry
// Return:   Object
///////////////////////////////////////////////////////////////////////////
Settings.prototype.getEntryAt = function (index){
	if(index == -1) index = this._data.length-1;
	if(index < 0 || index >= this._data.length) return null;
	else{
		this._idx = index;
		return this._data[index].settings;
	}
}
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Function: getEntryByName
// Usage:    returns Setting of given name
// Input:    String - name of setting
// Return:   Object
///////////////////////////////////////////////////////////////////////////
Settings.prototype.getEntryByName = function (name){
	var item;
	for(var i=0; i< this._data.length; i++){
		if(this._data[i].name == name){
			item = this._data[i].settings;
			this._idx = i;
			break;
		}
	}
	return item;
}
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Function: getLastEntry
// Usage:    returns last stored Setting
// Input:    null
// Return:   Object
///////////////////////////////////////////////////////////////////////////
Settings.prototype.getLastEntry = function (){
	return this.getEntryAt(-1);
}
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Function: numEntries
// Usage:    returns the number of available Entrys
// Input:    null
// Return:   Number
///////////////////////////////////////////////////////////////////////////
Settings.prototype.numEntries = function (){
	return this._data == null ? 0 : this._data.length;
}
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Function: getEntries
// Usage:    returns an Array of Entry objects
// Input:    null
// Return:   Array
///////////////////////////////////////////////////////////////////////////
Settings.prototype.getEntries = function (){
	var entries = [];
	for(var i=0; i< this._data.length; i++){
		var e = new Entry();
		e.key   = this._data[i].name;
		e.value = this._data[i].setting;
		entries.push(e);
	}
	return entries;
}
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Function: clearSettings
// Usage:    clear all settings data
// Input:    null
// Return:   void
///////////////////////////////////////////////////////////////////////////
Settings.prototype.clearSettings = function (){
	this._data = null;
}
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Function: loadSettings
// Usage:    load settings data
// Input:    null
// Return:   void
///////////////////////////////////////////////////////////////////////////
Settings.prototype.loadSettings = function (){
	if(this._uid == ''){
		alert('UID unset. loadSettings canceled.');
		return item;
	}
	if(this._msg == ''){
		alert('MSG unset. loadSettings canceled.');
		return item;
	}
	
	var container = new SettingsContainer();
	
	try {
		var post  = Delegate.create(this, this.postProcess);
		var data  = app.getCustomOptions(this._uid);
		var clone = descriptorToObject(container, data, this._msg, post);
	}
	catch(ea) {
		// it's ok if we don't have any options, continue with defaults
		// alert(ea+" - no stored settings available.");
	}
}

///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
// Function: postProcess
// Usage:    post-process settings data
// Input:    string
// Return:   object
///////////////////////////////////////////////////////////////////////////
Settings.prototype.postProcess = function (obj){
	var _objData = Json.eval(obj.data);
	
	for(var i=0; i<_objData.length; i++){
		var top = typeof(this._post);
		if(!_objData[i].settings) continue;
		
		if(top == "function"){
			_objData[i].settings = this._post(_objData[i].settings);
		}
		_objData[i].index = i;
	}
	this._data = _objData;
	return _objData;
}
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
// Function: saveDimSettings
// Usage:    save settings
// Input:    null
// Return:   void
///////////////////////////////////////////////////////////////////////////
Settings.prototype.saveSettings = function (){
	// save settings then quit
	try {
		var _strData = Json.encode(this._data);
		var storage  = new SettingsContainer ();
		storage.uid  = this._uid;
		storage.data = _strData;
		
		var object = objectToDescriptor(storage, this._msg);
		app.putCustomOptions(this._uid, object);
	}
	catch(eb) {
		alert("Error saving settings...\n"+eb);
	}
}
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// Function: objectToDescriptor
// Usage:    create an ActionDescriptor from a JavaScript Object
// Input:    JavaScript Object (o)
//           object unique string (s)
//           Pre process converter (f)
// Return:   ActionDescriptor
// NOTE:     Only boolean, string, number and UnitValue are supported, use a pre processor
//           to convert (f) other types to one of these forms.
// REUSE:    This routine is used in other scripts. Please update those if you 
//           modify. I am not using include or eval statements as I want these 
//           scripts self contained.
///////////////////////////////////////////////////////////////////////////////
function objectToDescriptor (o, s, f){
	if (undefined != f) {
		o = f(o);
	}
	var d = new ActionDescriptor;
	var l = o.reflect.properties.length;

	var xx="", n="\n\nProps:", eShow=false, eK, eN, eV;
	
	d.putString( app.charIDToTypeID( 'Msge' ), s );
	for (var i = 0; i < l; i++ ) {
		var k = o.reflect.properties[i].toString();
		if (k == "__proto__" || k == "__count__" || k == "__class__" || k == "reflect")
			continue;
		var v = o[ k ];
		var kk = k;
		k = app.stringIDToTypeID(k);
		switch ( typeof(v) ) {
			case "boolean":
				d.putBoolean(k, v);
				break;
			case "string":
				d.putString(k, v);
				break;
			case "number":
				d.putDouble(k, v);
				break;
			default:
			{
				if ( v instanceof UnitValue ) {
					var uc = new Object;
					uc["px"] = charIDToTypeID("#Rlt"); // unitDistance
					uc["%"] = charIDToTypeID("#Prc"); // unitPercent
					d.putUnitDouble(k, uc[v.type], v.value);
				} else {
					eShow = true;
					eV    = v;
					eK    = k;
					eN    = typeof(v);
					xx    = "x";
				}
			}
		}
		n += "\n "+xx+"["+kk+"]("+k+")";
		xx = "";
	}

	if(eShow){
		throw( new Error("Unsupported type in objectToDescriptor  eK["+eK+"] eV["+eV+"]" + eN + n ) );
	}
	
    return d;
}
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// Function: descriptorToObject
// Usage:    update a JavaScript Object from an ActionDescriptor
// Input:    JavaScript Object (o), current object to update (output)
//           Photoshop ActionDescriptor (d), descriptor to pull new params for object from
//           object unique string (s)
//           JavaScript Function (f), post process converter utility to convert
// Return:   Nothing, update is applied to passed in JavaScript Object (o)
// NOTE:     Only boolean, string, number and UnitValue are supported, use a post processor
//           to convert (f) other types to one of these forms.
// REUSE:    This routine is used in other scripts. Please update those if you 
//           modify. I am not using include or eval statements as I want these 
//           scripts self contained.
///////////////////////////////////////////////////////////////////////////////
function descriptorToObject (o, d, s, f) {
	var l = d.count;
	if (l) {
	    var keyMessage = app.charIDToTypeID( 'Msge' );
        if ( d.hasKey(keyMessage) && ( s != d.getString(keyMessage) )) return;
	}
	for (var i = 0; i < l; i++ ) {
		var k = d.getKey(i); // i + 1 ?
		var t = d.getType(k);
		strk = app.typeIDToStringID(k);
		var _k = app.typeIDToStringID(k);
		switch (t) {
			case DescValueType.BOOLEANTYPE:
				o[strk] = d.getBoolean(k);
				break;
			case DescValueType.STRINGTYPE:
				o[strk] = d.getString(k);
				break;
			case DescValueType.DOUBLETYPE:
				o[strk] = d.getDouble(k);
				break;
			case DescValueType.UNITDOUBLE:
				{
				var uc = new Object;
				uc[charIDToTypeID("#Rlt")] = "px"; // unitDistance
				uc[charIDToTypeID("#Prc")] = "%"; // unitPercent
				uc[charIDToTypeID("#Pxl")] = "px"; // unitPixels
				var ut = d.getUnitDoubleType(k);
				var uv = d.getUnitDoubleValue(k);
				o[strk] = new UnitValue( uv, uc[ut] );
				}
				break;
			case DescValueType.INTEGERTYPE:
			case DescValueType.ALIASTYPE:
			case DescValueType.CLASSTYPE:
			case DescValueType.ENUMERATEDTYPE:
			case DescValueType.LISTTYPE:
			case DescValueType.OBJECTTYPE:
			case DescValueType.RAWTYPE:
			case DescValueType.REFERENCETYPE:
			default:
				throw( new Error("Unsupported type in descriptorToObject k["+k+"] i["+i+"] strk["+strk+"]" + t ) );
		}
	}
	if (undefined != f) {
		o = f(o);
	}
	return o;
}
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// Demo
///////////////////////////////////////////////////////////////////////////////
//var Demo = new Settings();
//Demo.setUID("MyDemoSettingsUniqueID");
//Demo.setMSG("MyDemoSettings");
//Demo.setType(SettingsType.MULTIPLE);
//Demo.loadSettings();
//if(Demo.numEntries()<1){
	//var Test = {};
	//Test.somevalue = "some value";
	//Test.othervalue = 20;
	//Demo.addEntry("test", Test);
	//Demo.saveSettings();
	//alert("Please run again...");
//}else{
	//if(Demo.numEntries()==1){
		//var t1 = Demo.getLastEntry();
		//alert("var t1 = Demo.getLastEntry();\nt1.somevalue = '"+t1.somevalue+"'\nt1.othervalue = "+t1.othervalue);
		//var t2 = Demo.getEntryAt(0);
		//alert("var t2 = Demo.getEntryAt(0);\nt2.somevalue = '"+t2.somevalue+"'\nt2.othervalue = "+t2.othervalue);
		//var t3 = Demo.getEntryAt(1);
		//if(t3) alert("var t3 = Demo.getEntryAt(1);\nt3.somevalue = '"+t3.somevalue+"'\nt3.othervalue = "+t3.othervalue);
		//var t4 = Demo.getEntryByName("test");
		//if(t4){
			//alert("var t4 = Demo.getEntryByName(\"test\");\nt4.somevalue = '"+t4.somevalue+"'\nt4.othervalue = "+t4.othervalue);
			//t4 = {};
			//t4.othervalue = 40;
			//t4.somevalue = t2.somevalue+" extended";
			//Demo.addEntry("testX", t4);
			//Demo.saveSettings();
		//}
		//alert("Please run again...");
	//}else{
		//var t1 = Demo.getLastEntry();
		//alert("var t1 = Demo.getLastEntry();\nt1.somevalue = '"+t1.somevalue+"'\nt1.othervalue = "+t1.othervalue);
		//var t2 = Demo.getEntryAt(0);
		//alert("var t2 = Demo.getEntryAt(0);\nt2.somevalue = '"+t2.somevalue+"'\nt2.othervalue = "+t2.othervalue);
		//var t3 = Demo.getEntryAt(1);
		//alert("var t3 = Demo.getEntryAt(1);\nt3.somevalue = '"+t3.somevalue+"'\nt3.othervalue = "+t3.othervalue);
		//var t4 = Demo.getEntryByName("test");
		//alert("var t4 = Demo.getEntryByName(\"test\");\nt4.somevalue = '"+t4.somevalue+"'\nt4.othervalue = "+t4.othervalue);
		//var t5 = Demo.getEntryByName("testX");
		//alert("var t5 = Demo.getEntryByName(\"testX\");\nt5.somevalue = '"+t5.somevalue+"'\nt5.othervalue = "+t5.othervalue);
		
		//Demo.clearSettings();
		//Demo.saveSettings();
	//}
//}

