// $Id: layerMaskLib.jsx,v 2.5 2005/12/09 anonymous Exp $
//@show include
///////////////////////////////////////////////////////////////////////////////
// Function: layerMask
// Description: A collection of layer mask functions
// Usage: layerMask.functionName()
// Functions: make(), makeFromSelection(), remove(), enabled(), editMode(), link(),
//			  makeSelection(), isLinked(), isEnabled()
// Input:
// Return:
///////////////////////////////////////////////////////////////////////////////
layerMask = function(){}
lMID = new Object()

//lMID.isBackground = app.activeDocument.activeLayer.isBackgroundLayer
lMID.error = undefined;
lMID.maskHides = 1214529900;//"HdAl"
lMID.maskRevealsAll = 1383492673;//"RvlA"
lMID.maskReveals = 1383492691;//"Rvls"
lMID.newObject = 1316429856;//"Nw  "
lMID.channel = 1130917484;//"Chnl"
lMID.mask = 1299409696;//"Msk "
lMID.at = 1098129440;//"At  "
lMID.using = 1433628263;//"Usng"
lMID.userMask = 1433629261;//"UsrM"
lMID.make = 1298866208;//"Mk  "
lMID.indexNumber = 1332896878;//"Ordn"
lMID.target = 1416783732;//"Trgt"
lMID.Null = 1853189228;//"null"
lMID.apply = 1097886841;//"Aply"
lMID.Delete = 1147958304;//"Dlt "
lMID.layer = 1283027488;//"Lyr "
lMID.to = 1411391520;//"T   "
lMID.visible = 1298880115;//"MkVs"
lMID.select = 1936483188;//"slct"
lMID.selection =1718838636;//"fsel"
lMID.set = 1936028772;//"setd"
lMID.userMaskLinked = 1433629299;//"Usrs"
lMID.property = 1349677170;//"Prpr"

///////////////////////////////////////////////////////////////////////////////
// Function: make
// Description: Makes a layer mask. Also see makeFromSelection
// Usage: layerMask.make(revealAll/hideALL As boolean)
// Input: Boolean. True to create a reveal all mask
// Return: Boolean. False if error. Read lMID.error for error
///////////////////////////////////////////////////////////////////////////////
layerMask.make = function(bool){

if(layerMask.selectLayerMask() == false){
	if(bool == false){
		var type = lMID.maskHides;
	}else{
 		var type = lMID.maskRevealsAll;
 	}	
 	 try {
		var desc = new ActionDescriptor();
		desc.putClass( lMID.newObject, lMID.channel );
        var ref = new ActionReference();
        	ref.putEnumerated( lMID.channel, lMID.channel, lMID.mask );
			desc.putReference( lMID.at, ref );
		desc.putEnumerated( lMID.using, lMID.userMask, type );
		executeAction( lMID.make, desc, DialogModes.NO );
	} catch (e) {
		return false;
  }
  returnToLayer();
  lMID.eror = ""
  return true;
 }else{
 	lMID.error = "has mask";
 	return false;
 }
}
///////////////////////////////////////////////////////////////////////////////
// Function: makeFromSelection
// Description: Makes a layer mask from active selection
// Usage: layerMask.makeFromSelection(). 
// Input: 
// Return: Boolean. False if error. Read lMID.error for error
///////////////////////////////////////////////////////////////////////////////
layerMask.makeFromSelection = function() {

if(hasSelection() == false){
	lMID.error = "no selection";
	return false;
	}
if(layerMask.selectLayerMask() == false){
	try {
		var desc = new ActionDescriptor();
		desc.putClass( lMID.newObject, lMID.channel );
			var ref = new ActionReference();
			ref.putEnumerated( lMID.channel, lMID.channel, lMID.mask );
		desc.putReference( lMID.at, ref );
		desc.putEnumerated( lMID.using, lMID.userMask, lMID.maskReveals );
		executeAction( lMID.make, desc, DialogModes.NO );	
	} catch (e) {
		return false;
  }
  returnToLayer();
  lMID.eror = "";
  return true;
}else{
 	lMID.error = "has mask";
 	return false;
 }
}
///////////////////////////////////////////////////////////////////////////////
// Function: remove
// Description: Removes the layer mask. See layerMask.enabled to turn off mask
// Usage: layerMask.remove(apply/discard As boolean)
// Input: Boolean. True to apply mask before delete
// Return: Boolean. False if error. Read lMID.error for error
///////////////////////////////////////////////////////////////////////////////
layerMask.remove = function(bool){
if(bool !== true){
	bool == false;
	}

  try {
    if(layerMask.selectLayerMask() == false){
    		lMID.error = "no mask";
    		return false;
    	}else{   	
			var desc = new ActionDescriptor();
        	var ref = new ActionReference();
        		if(bool == false){
        			ref.putEnumerated( lMID.channel, lMID.channel, lMID.mask );
    				desc.putReference( lMID.Null, ref );
				}else{ref.putEnumerated( lMID.channel, lMID.indexNumber, lMID.target );
    				desc.putReference( lMID.Null, ref );
    				desc.putBoolean( lMID.apply, true );
				}   	
			executeAction( lMID.Delete, desc, DialogModes.NO );
			}
	} catch (e) {
      return false;
  }
  lMID.eror = "";
  return true;
}
///////////////////////////////////////////////////////////////////////////////
// Function: enabled
// Description: Show/hides the layer mask's effects
// Usage: layerMask.enabled(on/off As Boolean)
// Input: Boolean. True to enabled
// Return: Boolean. False if error. Read lMID.error for error
///////////////////////////////////////////////////////////////////////////////
layerMask.enabled = function(bool){
  try {
    if(layerMask.selectLayerMask() == false){
    	lMID.error = "no mask"
		return false;
    	}else{   
   			 var desc = new ActionDescriptor();
      			  var ref = new ActionReference();
       				 ref.putEnumerated( lMID.layer, lMID.indexNumber, lMID.target );
    		desc.putReference( lMID.Null, ref );
    		    var desc1 = new ActionDescriptor();
       			 desc1.putBoolean( lMID.userMask, bool );
    		desc.putObject( lMID.to, lMID.layer, desc1 );
			executeAction( lMID.set, desc, DialogModes.NO );
				}
	} catch (e) {
      return false;
  }
  returnToLayer();
  lMID.error = "";
  return true;
}
///////////////////////////////////////////////////////////////////////////////
// Function: isEnabled
// Description: Status of the layer mask's effects
// Usage: layerMask.isEnabled()
// Input: 
// Return: Boolean. True to enabled, false if error. Read lMID.error for error
///////////////////////////////////////////////////////////////////////////////
layerMask.isLinked = function(){
    if(layerMask.selectLayerMask() == false){
    	lMID.error = "no mask";  
		return false;
	}else{
		var ref = new ActionReference(); 
		ref.putProperty( lMID.property , lMID.userMask )
		ref.putEnumerated( lMID.layer , lMID.indexNumber , lMID.target );
		var bool = executeActionGet(ref).getBoolean( lMID.userMask ) 
		return bool; 
	}	
}
///////////////////////////////////////////////////////////////////////////////
// Function: editMode
// Description: Allows the mask to be edited
// Usage: layerMask.editMode(boolean)
// Input: Boolean. True to edit
// Return: Boolean. False if error. Read lMID.error for error
///////////////////////////////////////////////////////////////////////////////
layerMask.editMode = function(bool){
  try {
    if(layerMask.selectLayerMask() == false){
    	lMID.error = "no mask";  		
		return false;
    	}else{   
   			 var desc = new ActionDescriptor();
  			      var ref = new ActionReference();
   				     ref.putEnumerated( lMID.channel, lMID.indexNumber, lMID.target );
   			 desc.putReference( lMID.Null, ref );
  			 desc.putBoolean( lMID.visible, bool );
			executeAction( lMID.select, desc, DialogModes.NO );
							}
	} catch (e) {
      return false;
  }
  if(bool == false){
	returnToLayer();
  	}
  lMID.error = "";
  return true;
}
///////////////////////////////////////////////////////////////////////////////
// Function: link
// Description: Toggles layer mask link
// Usage: layerMask.link(boolean)
// Input: Boolean. True to link
// Return: Boolean. False if error. Read lMID.error for error
///////////////////////////////////////////////////////////////////////////////
layerMask.link = function(bool){
  try {
    if(layerMask.selectLayerMask() == false){
    	lMID.error = "no mask";  
		return false;
	}else{
		var desc = new ActionDescriptor();
			var ref = new ActionReference();
				ref.putEnumerated( lMID.layer, lMID.indexNumber, lMID.target );
		desc.putReference( lMID.Null, ref );
			var desc1 = new ActionDescriptor();
				desc1.putBoolean( lMID.userMaskLinked, bool );
				desc.putObject( lMID.to, lMID.layer, desc1 );
		executeAction( lMID.set, desc, DialogModes.NO );
	}
	} catch (e) {
      return false;
  }
  returnToLayer();
  lMID.error = ""
  return true;
}
///////////////////////////////////////////////////////////////////////////////
// Function: isLinked
// Description: Layer mask link status
// Usage: layerMask.link()
// Input: 
// Return: Boolean. True if linked False if error. Read lMID.error for error
///////////////////////////////////////////////////////////////////////////////
layerMask.isLinked = function(){
    if(layerMask.selectLayerMask() == false){
    	lMID.error = "no mask";  
		return false;
	}else{
		var ref = new ActionReference(); 
		ref.putProperty( lMID.property , lMID.userMaskLinked )
		ref.putEnumerated( lMID.layer , lMID.indexNumber , lMID.target ); 
		var bool = executeActionGet(ref).getBoolean( lMID.userMaskLinked )
		return bool; 
	}	
}
///////////////////////////////////////////////////////////////////////////////
// Function: makeSelection
// Description: Makes a selection from the layer mask
// Usage: layerMask.makeSelection()
// Input: None
// Return: Boolean. False if error. Read lMID.error for error
///////////////////////////////////////////////////////////////////////////////
layerMask.makeSelection = function(){
try {
    if(layerMask.selectLayerMask() == false){
    	lMID.error = "no mask";  
		return false;
	}else{	
		var desc = new ActionDescriptor();
			var ref = new ActionReference();
			ref.putProperty( lMID.channel, lMID.selection );
		desc.putReference( lMID.Null, ref );
			var ref1 = new ActionReference();
			ref1.putEnumerated( lMID.channel, lMID.indexNumber, lMID.target );
		desc.putReference( lMID.to, ref1 );
		executeAction( lMID.set, desc, DialogModes.NO );
	}
	}
	 catch (e) {
      return false;
   }

  lMID.error = "";
  returnToLayer();
  return true;
}
///////////////////////////////////////////////////////////////////////////////
// XXX: Modified for non-internal use.
// Function: selectLayerMask
// Usage: layerMask.selectLayerMask
// Input:
// Return:
///////////////////////////////////////////////////////////////////////////////
layerMask.selectLayerMask = function(){
if (lMID.isBackground == true){
	lMID.error = "Background";
	return false;
	}
  try {
    var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated( lMID.channel, lMID.channel, lMID.mask );
    desc.putReference( lMID.Null, ref );
    desc.putBoolean( lMID.visible, false );
	executeAction( lMID.select, desc, DialogModes.NO );
 } catch (e) {
      return false;
  }
  lMID.error = "";
  return true;
}
///////////////////////////////////////////////////////////////////////////////
// Function: hasSelection
// Usage: Internal
// Input:
// Return:
///////////////////////////////////////////////////////////////////////////////
hasSelection = function()
{
	try {
		app.activeDocument.selection.bounds
	} catch (e) { 
		return false;
	}
	return true; 
} 
///////////////////////////////////////////////////////////////////////////////
// Function: returnToLayer
// Usage: Internal
// Input:
// Return:
///////////////////////////////////////////////////////////////////////////////
returnToLayer = function(){
	var savedLayerRef = app.activeDocument.activeLayer;
	app.activeDocument.activeLayer = app.activeDocument.layers[app.activeDocument.layers.length - 1];
	app.activeDocument.activeLayer = savedLayerRef;
}
"layerMaskLib.jsx";
// End layerMaskLib.jsx
