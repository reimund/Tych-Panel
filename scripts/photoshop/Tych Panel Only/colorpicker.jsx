/////////////////////////////////////////////////////////////////
// Function: colorPicker
// Description: Creates a temp solidcolor adjustment layer to
//                let the user set the forground color
// By: Mike Hale, thanks to Christoph Pfaffenbichler, Paul Riggott, and Tina
// Saunders 
//                  
// Usage: colorpicker()
// Input: None
// Return: None
// Dependencies: None
// Notes:             
//////////////////////////////////////////////////////////////////
function colorPicker(){
	// set starting color
	var historyState = activeDocument.activeHistoryState;
	var startColor = app.foregroundColor;
	var originalUnits = app.preferences.rulerUnits;

	app.preferences.rulerUnits = Units.PIXELS;
	app.activeDocument.selection.select([[0,0],[1,0],[1,1],[0,1]]);
	app.preferences.rulerUnits = originalUnits;

	// create colour layer
	CreateSolidLayer();
	// call the color picker
	var desc = new ActionDescriptor();
	var ref = new ActionReference();
	ref.putEnumerated(stringIDToTypeID("contentLayer"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
	desc.putReference(charIDToTypeID("null"), ref);
	var modeDesc = new ActionDescriptor();
	var colorDesc = new ActionDescriptor();
	colorDesc.putDouble(charIDToTypeID("Rd  "), startColor.rgb.red);
	colorDesc.putDouble(charIDToTypeID("Grn "), startColor.rgb.green);
	colorDesc.putDouble(charIDToTypeID("Bl  "), startColor.rgb.blue);
	modeDesc.putObject(charIDToTypeID("Clr "), charIDToTypeID("RGBC"), colorDesc);
	desc.putObject(charIDToTypeID("T   "), stringIDToTypeID("solidColorLayer"), modeDesc);

	try {
		executeAction(charIDToTypeID("setd"), desc, DialogModes.ALL)
	} catch (e) {}
	// get user's color and set to forground color
	var ref = new ActionReference();
	ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
	var desc = executeActionGet(ref)
	var adjList = desc.getList(stringIDToTypeID('adjustment'));
	var adjDesc = adjList.getObjectValue(0);
	var colorDesc = adjDesc.getObjectValue(stringIDToTypeID('color'));

	var color = new SolidColor();
	color.rgb.red = colorDesc.getDouble(charIDToTypeID('Rd  '));
	color.rgb.green = colorDesc.getDouble(charIDToTypeID('Grn '));
	color.rgb.blue = colorDesc.getDouble(charIDToTypeID('Bl  '));
	// Restore
	activeDocument.activeHistoryState = historyState;
	return color;
}


function CreateSolidLayer() {
	var startColor = app.foregroundColor;
	var desc = new ActionDescriptor();
	var ref = new ActionReference();
	var desc1 = new ActionDescriptor();
	var desc2 = new ActionDescriptor();
	var desc3 = new ActionDescriptor();

	ref.putClass(stringIDToTypeID('contentLayer'));
	desc.putReference(charIDToTypeID('null'), ref);

	desc3.putDouble(charIDToTypeID('Rd  '), startColor.rgb.red);
	desc3.putDouble(charIDToTypeID('Grn '), startColor.rgb.green);
	desc3.putDouble(charIDToTypeID('Bl  '), startColor.rgb.blue);
	desc2.putObject(charIDToTypeID('Clr '), charIDToTypeID('RGBC'), desc3);
	desc1.putObject(charIDToTypeID('Type'), stringIDToTypeID('solidColorLayer'), desc2);
	desc.putObject(charIDToTypeID('Usng'), stringIDToTypeID('contentLayer'), desc1);
	executeAction(charIDToTypeID('Mk  '), desc, DialogModes.NO);
};


