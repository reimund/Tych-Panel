/*
 * Name: Tych Panel 0.9.84
 * Author: Reimund Trost (c) 2011
 * Email: reimund@lumens.se
 * Website: http://lumens.se/tychpanel/
 *
 * Description: This set of scripts automates the creation of diptychs,
 * triptychs, quaptychs and even n-tychs. 
 *
 * The script makes at least the following
 * assumptions:
 *
 *  - One image per layer.
 *  - Images are placed at (0,0).
 *  - There are as many layers as the corresponding tych variant, ie. two
 *    layers for diptych, three layers for triptych and so on.
 */


//@include Tych%20Panel%20Options%20Only/tpconstants.jsx
//@include Tych%20Panel%20Options%20Only/tpsettings.jsx

// XXX: Supress dialogs...
// XXX: Add ability to sort images with previews before they get stacked.
// XXX: Keep aspect ratio option does not affect all tychs (currently only
// n-tychs). Not really a problem since the icon buttons are a different use
// case, however, it can be a bit non-obvious for some users.
// XXX: Ability to apply post- and pre-processing actions.
// XXX: Fix bugs on windows. For now, the duplicate-workaround will do.
// XXX: Custom background color.
// XXX: More layouts: 3x2, 3x3, 3x4, 4x2, 4x3, 4x4 etc. EDIT: I think I'll skip
// this one, since these can be built with the 'Just bring it' button anyway.


var tpSettings = tpGetSettings();


//tpTych(4);
//tpTych(Number(prompt("Tych variant?", 0, "Enter a number between 0 and 8")));
//tpComposite();

function tpComposite()
{
	// Save current unit preferences.
	var rulerUnits = preferences.rulerUnits;
	// Change unit preferences.
	preferences.rulerUnits = Units.PIXELS;

	var	doc = documents.length > 0 ? activeDocument : null;

	var images = File.openDialog("Choose file(s) to add to composite", undefined, true);
	var stackDoc = tpStack(images);
	tpNTych(stackDoc);

	// If there was no active document when we started we just have to fill the
	// background and then we're done.
	if (doc == null) {
		tpAddBackground(stackDoc, WHITE);

		if (tpSettings.autosave)
			save(stackDoc);

		if (tpSettings.autoclose)
			stackDoc.close(SaveOptions.DONOTSAVECHANGES);

		return;
	}
		
	tpPlaceComp(stackDoc, doc);
	
	if (doc.layers[doc.layers.length - 1].name == 'Background')
		tpFillBackground(doc, WHITE);
	else 
		tpAddBackground(doc, WHITE);
	
	if (tpSettings.autosave)
		save(doc);
	
	if (tpSettings.autoclose)
		doc.close(SaveOptions.DONOTSAVECHANGES);

	// Revert settings.
	preferences.rulerUnits = rulerUnits;
}


/**
 * Places the contents of one document at the bottom of another.
 */
function tpPlaceComp(src, target)
{
	var srcHeight = src.height;
	var targetHeight = target.height;

	// Unlock the background (if locked) so we can put a background fill below.
	activeDocument = target;
	target.layers[target.layers.length - 1].isBackgroundLayer = false;

	activeDocument = src;
	src.selection.selectAll();
	src.selection.copy(true);
	src.close(SaveOptions.DONOTSAVECHANGES);
	activeDocument = target;
	target.activeLayer = target.layers[0];
	
	// Get rid of outside pixels;
	target.crop([0, 0, target.width, target.height]);

	target.paste();
	target.resizeCanvas(target.width, target.height + srcHeight + tpSettings.spacing, AnchorPosition.TOPLEFT);

	// XXX: Why don't I use translate here?
	target.layers[0].applyOffset(0, targetHeight - target.activeLayer.bounds[1] + tpSettings.spacing, OffsetUndefinedAreas.SETTOBACKGROUND);
}


/**
 * Stacks the specified images.
 */
function tpStack(images)
{
	var last = images.length - 1;
	var doc = app.open(images[last]);
	doc.layers[0].isBackgroundLayer = false;

	f = function() {
		var d = doc;
		var maxx = doc.width;
		var maxy = doc.height;
		for (i = last; i >= 0; i--) {

			if (i < last) {
				d = app.open(images[i]);
				d.selection.selectAll();

				if (d.layers.length > 1)
					d.selection.copy(true);
				else
					d.selection.copy();

				maxx = Math.max(maxx, d.width);
				maxy = Math.max(maxy, d.height);
				d.close(SaveOptions.DONOTSAVECHANGES);
				activeDocument = doc;
				doc.paste();
				doc.layers[0].translate(-doc.layers[0].bounds[0].value, -doc.layers[0].bounds[1].value);
			}
		}
		doc.resizeCanvas(maxx, maxy, AnchorPosition.TOPLEFT);
	}
	doc.suspendHistory('Stack images', 'f()');
	return doc;
}


/**
 * Saves the specified document to the directory and filename set in the
 * options dialog. If the file exists a sequential number will be appended.
 */
function save(doc)
{
	var basename = tpSettings.filename;
	var paddedName = basename + '_001';
	var jpgFile = new File(tpSettings.save_directory + '/' + paddedName + '.jpg');
	var padding;
	
	// XXX: Add a timeout perhaps...
	// If the file exist, increase the sequential number by 1.
	while (jpgFile.exists) {
		padding = paddedName.substr(paddedName.lastIndexOf('_') + 1);
		paddedName = basename + '_' + zeropad(Number(padding) + 1, 3);
		jpgFile = new File(tpSettings.save_directory + '/' + paddedName + '.jpg');
	}

	jpgSaveOptions = new JPEGSaveOptions();
	jpgSaveOptions.embedColorProfile = true;
	jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
	jpgSaveOptions.matte = MatteType.NONE;
	jpgSaveOptions.quality = tpSettings.jpeg_quality;

	doc.saveAs(jpgFile, jpgSaveOptions, true, Extension.LOWERCASE);
}


/**
 * Makes a tych of the current active document.
 */
function tpTych(tychVariant)
{
	if (documents.length > 0) {

		// Ugly workaround for Windows bug. If we use the original document
		// weird things start to happen for no apparent reason. So we use a
		// duplicate instead.
		var d = activeDocument;
		var doc = d.duplicate();
		var required = -1;
		d.close(SaveOptions.DONOTSAVECHANGES);

		if (tychVariant < 3) {
			if (doc.layers.length < 2)
				required = 2;
		} else if (tychVariant > 2 && tychVariant < 6) {
			if (doc.layers.length < 3)
				required = 3;
		} else {
			if (doc.layers.length < 4)
				required = 4;
		}
		
		if (required > 0) {
			alert('This action requires ' + required + ' layers. Stack some more layers then try again.');
			return -1;
		}	

		// Save current unit preferences.
		var rulerUnits = preferences.rulerUnits;
		// Change unit preferences.
		preferences.rulerUnits = Units.PIXELS;
		
		doc.suspendHistory(tpTychToHistoryName(tychVariant), 'makeTych(tychVariant, activeDocument)');
		//makeTych(tychVariant, activeDocument);

		if (tpSettings.autosave)
			save(doc);

		if (tpSettings.autoclose)
			doc.close(SaveOptions.DONOTSAVECHANGES);

		// Revert settings.
		preferences.rulerUnits = rulerUnits;
	
	} else {
		alert("You have to open a document to use this script.");
		return -1;
	}
}


/**
 * Makes an horizontal n-tych by spacing out the layers in the specified
 * document.
 */
function tpNTych(doc)
{
	var p = tpPrepareNTych(doc, tpSettings.spacing);
	tpArrange(doc, p['trans'], tpSettings.spacing);
	doc.resizeCanvas(p['realSize'][0], p['realSize'][1], AnchorPosition.TOPLEFT);
	tpAddSeams(doc, p['trans'], p['realSize']);
}


/**
 * Prepares the creation of an n-tych by doing some preparatory calculations.
 */
function tpPrepareNTych(doc, spacing)
{
	//var spacing = tpSettings.spacing;
	var size = tpGetSize(doc.layers, spacing);
	// Resize factor, Ie the factor used to to scale the image to fit the
	// resize_width set in the user options.
	var s = (tpSettings.resize_width - spacing * (doc.layers.length - 1) + 2 * doc.layers.length) / size[0];
	var realSize = Array(Math.round(s * size[0] + spacing * (doc.layers.length - 1) - 2 * doc.layers.length), Math.round(s * size[1] - 2));
	var trans = tpGetTrans(doc.layers, spacing, s);

	return { 'trans': trans, 'realSize': realSize};
}


/**
 * Makes the seams / borders of the specified document crisp by deleting the
 * pixels that overlap them.
 */
function tpAddSeams(doc, trans, size, tychVariant)
{
	var l = doc.layers;
	var spacing = tpSettings.spacing;

	if (tychVariant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID
			|| tychVariant == TRIPTYCH_LANDSCAPE_PORTRAIT_GRID) {
		// Index of portrait layer.
		var p = l[0].bounds[3].value > l[1].bounds[3].value ? 0 : 2;
		p = l[1].bounds[3] .value> l[2].bounds[3].value ? 1 : p;

		// Indicies of landscape layers.
		var la;
		if (p == 0) la = Array(1, 2);
		else if (p == 1) la = Array(0, 2);
		else la = Array(0, 1);

		var v = tychVariant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID ? la[0] : p;

		doc.selection.select(sel = Array(
			Array(trans[v][1][0] - spacing + 1, 0),
			Array(trans[v][1][0] - spacing + 1, size[1]),
			Array(trans[v][1][0] + 1, size[1]),
			Array(trans[v][1][0] + 1, 0),
		));
		clearSelected(doc);

		doc.selection.select(sel = Array(
			Array(0, trans[la[1]][1][1] - spacing + 1),
			Array(size[0], trans[la[1]][1][1] - spacing + 1),
			Array(size[0], trans[la[1]][1][1] + 1),
			Array(0, trans[la[1]][1][1] + 1),
		));
		doc.activeLayer = doc.layers[la[0]];
		doc.selection.clear();
		doc.activeLayer = doc.layers[la[1]];
		doc.selection.clear();
		doc.selection.deselect();
	} else {
		for (i = 1; i < doc.layers.length; i++) {
			doc.selection.select(sel = Array(
				Array(trans[i][1][0] - spacing + 1, 0),
				Array(trans[i][1][0] - spacing + 1, size[1]),
				Array(trans[i][1][0] + 1, size[1]),
				Array(trans[i][1][0] + 1, 0),
			));
			
			if (sel[2][0] > 0)
				clearSelected(doc);
		}
		if (tychVariant == QUAPTYCH_GRID) {
			doc.selection.select(sel = Array(
				Array(0, trans[2][1][1] - spacing + 1),
				Array(size[0], trans[2][1][1] - spacing + 1),
				Array(size[0], trans[2][1][1] + 1),
				Array(0, trans[2][1][1] + 1),
			));
			clearSelected(doc);
		}
	}

}


/** 
 * Clears the selected area on all layers.
 */
function clearSelected(doc)
{
	for (j = 0; j < doc.layers.length; j++) {
		doc.activeLayer = doc.layers[j];
		doc.selection.clear();
	}
	doc.selection.deselect();
}


/**
 * Computes the dimensions of a horizontally arranged n-tych for the given
 * layers.
 */
function tpGetSize(layers, spacing)
{
	var minh = tpMinHeight(layers);
	if (tpSettings.keep_aspect)
		return Array(tpSumWidthAtHeight(layers, layers.length, minh), minh);
	else
		return Array(tpSumWidth(layers), minh);
}


/**
 * Computes the transformation matrix for placing the given layers
 * horizontally.
 */
function tpGetTrans(layers, spacing, resizeFactor)
{
	var trans = Array();
	var minh = tpMinHeight(layers);
	var l = layers;
	var s;

	for (var i = 0; i < layers.length; i++) {
		if (tpSettings.keep_aspect) {
			s = minh / (l[i].bounds[3].value - l[i].bounds[1].value);
			trans.push(
				Array(
					Array(resizeFactor * s * 100, resizeFactor * s * 100, AnchorPosition.TOPLEFT),
					Array(Math.round(tpSumWidthAtHeight(l, i, minh) * resizeFactor) + spacing * i - (i * 2) - 1, -1)
				)
			);
		} else {
			trans.push(Array(null, Array(tpSumWidth(l, i) + spacing * i, -(l[i].bounds[3] - minh) / 2)));
		}
	}

	return trans;
}


/**
 * Arranges the layers in the specified documents according to the specified
 * transformations t.
 */
function tpArrange(doc, t)
{
	for(i = 0; i < doc.layers.length; i++) {
		if (i >= t.length) break;
		
		// Check if the layer should be resized.
		if (t[i][0] != null)
			doc.layers[i].resize(t[i][0][0], t[i][0][1], t[i][0][2]);

		// Check if the layer should be moved.
		if (t[i][1] != null) {
			doc.layers[i].translate(t[i][1][0], t[i][1][1]);
		}
	}
}


/**
 * Makes a tych of the specified variant for a given document.
 */
function makeTych(tychVariant, doc)
{
	var l = doc.layers;
	var width = Number(doc.width);
	var height = Number(doc.height);
	var spacing = tpSettings.spacing;
	var newSize;
	var realSize;
	var trans;

	// Unlock the background layer, if it exists. We do this because since
	// we need to move a layer underneath it later.
	l[doc.layers.length - 1].isBackgroundLayer = false;

	switch (tychVariant) {

		case DIPTYCH_HORIZONTAL:
		case TRIPTYCH_HORIZONTAL:
		case QUAPTYCH_HORIZONTAL:

			var p = tpPrepareNTych(doc, tpSettings.spacing);
			realSize = p['realSize'];
			trans = p['trans'];
			break;

		case DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL:
		case DIPTYCH_PORTRAIT_LANDSCAPE_HORIZONTAL:
			// Index of portrait layer.
			var p = l[0].bounds[2].value > l[1].bounds[2].value ? 1 : 0;
			// Index of landscape layer.
			var la = 1 - p;

			var size = Array(tpSumWidthAtHeight(l, doc.layers.length, l[la].bounds[3].value), l[la].bounds[3].value);
			var r = (tpSettings.resize_width - spacing * (doc.layers.length - 1) + 2 * doc.layers.length) / size[0];
			var realSize = Array(Math.round(r * size[0] + spacing * (doc.layers.length - 1) - 2 * doc.layers.length), Math.round(r * size[1] - 2));
			var s = l[la].bounds[3].value / l[p].bounds[3].value;

			trans = Array(
				Array(null, null),
				Array(null, null)
			);

			trans[p][0] = Array(r * s * 100, r * s * 100, AnchorPosition.TOPLEFT);
			trans[p][1] = Array(tychVariant == DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL ? Math.round(r * l[la].bounds[2].value) + spacing - 3 : 0, 0);
			trans[la][0] = Array(r * 100, r * 100, AnchorPosition.TOPLEFT);
			trans[la][1] = Array(tychVariant == DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL ? 0 : Math.round(r * s * l[p].bounds[2].value) + spacing - 3, 0);
			break;

		case TRIPTYCH_PORTRAIT_LANDSCAPE_GRID:
		case TRIPTYCH_LANDSCAPE_PORTRAIT_GRID:

			// Index of portrait layer.
			var p = l[0].bounds[3].value > l[1].bounds[3].value ? 0 : 2;
			p = l[1].bounds[3] .value> l[2].bounds[3].value ? 1 : p;

			// Indicies of landscape layers.
			var la;
			if (p == 0) la = Array(1, 2);
			else if (p == 1) la = Array(0, 2);
			else la = Array(0, 1);

			trans = Array(
				Array(null, Array(0, 0)),
				Array(null, Array(0, 0)),
				Array(null, Array(0, 0))
			)

			// Transformations for the landscape images.
			var s1 = l[p].bounds[2].value / l[la[0]].bounds[2].value;
			var s2 = l[p].bounds[2].value / l[la[1]].bounds[2].value;

			var size = Array(
				l[p].bounds[2].value * 2, Math.min(l[p].bounds[3].value,
				s1 * l[la[0]].bounds[3].value + s2 * l[la[1]].bounds[3].value)
			);
			var r = (tpSettings.resize_width - spacing + 4) / size[0];
			var realSize = Array(Math.round(r * size[0] + spacing - 4), Math.round(r * size[1] - 2));

			trans[la[0]][0] = Array(r * s1 * 100, r * s1 * 100, AnchorPosition.TOPLEFT);
			trans[la[0]][1][0] = tychVariant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID
				? Math.round(r * l[p].bounds[2].value) + spacing - 3 : -1;
			trans[la[0]][1][1] = Math.round(realSize[1] / 2 - l[la[0]].bounds[3].value * s1 * r - spacing / 2) + 1;

			trans[la[1]][0] = Array(r * s2 * 100, r * s2 * 100, AnchorPosition.TOPLEFT);
			trans[la[1]][1][0] = tychVariant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID
				? Math.round(r * l[p].bounds[2].value) + spacing - 3 : 0;
			trans[la[1]][1][1] = Math.round(realSize[1] / 2) + spacing / 2 - 1;

			trans[p][0] = Array(r * 100, r * 100, AnchorPosition.TOPLEFT);
			trans[p][1][0] = tychVariant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID ? -1 : Math.round(r * l[p].bounds[2].value) + spacing - 3;
			trans[p][1][1] = -Math.round((r * l[p].bounds[3].value - realSize[1]) / 2) - 1;
			break;

		case QUAPTYCH_GRID:
			var col1_width = Math.max(l[0].bounds[2].value, l[2].bounds[2].value);
			var col2_width = Math.max(l[1].bounds[2].value, l[3].bounds[2].value);
			var row1_height = Math.max(l[0].bounds[3].value, l[1].bounds[3].value);
			var row2_height = Math.max(l[2].bounds[3].value, l[3].bounds[3].value);

			var size = Array(col1_width + col2_width, row1_height + row2_height);
			var r = (tpSettings.resize_width - spacing + 4) / size[0];
			var realSize = Array(Math.round(r * size[0] + spacing - 4), Math.round(r * size[1] + spacing - 4));

			trans = Array(
				Array(Array(r * 100, r * 100, AnchorPosition.TOPLEFT), Array(-1, -1)),
				Array(Array(r * 100, r * 100, AnchorPosition.TOPLEFT), Array(Math.round(r * col1_width) + spacing - 3, -1)),
				Array(Array(r * 100, r * 100, AnchorPosition.TOPLEFT), Array(-1, Math.round(r * row1_height) + spacing - 3)),
				Array(Array(r * 100, r * 100, AnchorPosition.TOPLEFT), Array(r * Math.round(col1_width) + spacing - 3, r * Math.round(row1_height) + spacing - 3))
			);
			break;

		default:
			return -1;
	}

	// Transform each layer according to the transformations specified in
	// the trans variable.
	tpArrange(doc, trans, spacing);

	doc.resizeCanvas(realSize[0], realSize[1], AnchorPosition.TOPLEFT);
	tpAddSeams(doc, trans, realSize, tychVariant);

	// Create a layer, put it last and it white.
	var fillLayer = doc.artLayers.add();
	fillLayer.move(l[doc.layers.length - 1], ElementPlacement.PLACEAFTER);
	tpFillBackground(doc, WHITE);
}


/**
 * Resizes the specified document according to the user settings.
 */
function tpApplyResize(doc)
{
	if (tpSettings.resize) {
		var resampleMethod = tpSettings.resample_method == 'bicubic' ? ResampleMethod.BICUBIC : ResampleMethod.BICUBICSHARPER;
		doc.resizeImage(tpSettings.resize_width, tpSettings.resize_width * doc.height / doc.width, 1, resampleMethod);
	}
}


/**
 * Make a background layer and fill it with the specified color.
 */
function tpFillBackground(doc, color)
{
	var al = doc.activeLayer;
	var fillColor = new SolidColor();

	fillColor.rgb.red = color[0];
	fillColor.rgb.green = color[1];
	fillColor.rgb.blue = color[2];
	
	doc.activeLayer = doc.layers[doc.layers.length - 1];
	doc.selection.fill(fillColor)
	doc.activeLayer = al;
}


/**
 * Add a background layer and fill it with the specified color.
 */
function tpAddBackground(doc, color)
{
	doc.layers[doc.layers.length - 1].isBackgroundLayer = false;
	doc.activeLayer = doc.layers[doc.layers.length - 1];
	var fillLayer = doc.artLayers.add();
	fillLayer.name = 'Background';
	fillLayer.move(doc.layers[doc.layers.length - 1], ElementPlacement.PLACEAFTER);
	tpFillBackground(doc, color);
}


/**
 * Computes the total width of the specified layers.
 */
function tpSumWidth(layers, max)
{
	var totalWidth = 0;
	for (var i = 0; i < layers.length; i++) {
		if (max != null && i == max) break;
		totalWidth += layers[i].bounds[2].value - layers[i].bounds[0].value;
	}

	return totalWidth;
}


/**
 * Computes the total width of the specified layers as if they were scaled
 * (keeping aspect ratio) to fit the specified height.
 */
function tpSumWidthAtHeight(layers, max, height) {
	if (height == null) return tpSumWidth(layers, max);

	var totalWidth = 0;
	var s;
	for (var i = 0; i < layers.length; i++) {
		if (max != null && i == max) break;
		s = height / (layers[i].bounds[3].value - layers[i].bounds[1].value);
		totalWidth += s * (layers[i].bounds[2].value - layers[i].bounds[0].value);
	}

	return totalWidth;
}

/**
 * Gets the height of the shortest of the specified layers.
 */
function tpMinHeight(layers)
{
	var minWidth = Number.MAX_VALUE;
	for (var i = 0; i < layers.length; i++)
		minWidth = Math.min(minWidth, layers[i].bounds[3].value - layers[i].bounds[1].value);

	return minWidth;
}



/**
 * Translates the specified tych variant constant into a human friendly string
 * for the history palette.
 */
function tpTychToHistoryName(tychVariant)
{
	switch (tychVariant) {
		case DIPTYCH_HORIZONTAL:
		case DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL:
		case DIPTYCH_PORTRAIT_LANDSCAPE_HORIZONTAL:
			return 'Create diptych';
		case TRIPTYCH_HORIZONTAL:
		case TRIPTYCH_PORTRAIT_LANDSCAPE_GRID:
		case TRIPTYCH_LANDSCAPE_PORTRAIT_GRID:
			return 'Create triptych';
		case QUAPTYCH_HORIZONTAL:
		case QUAPTYCH_GRID:
			return 'Create quaptych';
	}
}



/**
 * Pads the given number n with l zeroes.
 */
function zeropad(n, l) {
	n = n.toString();
	l = Number(l);
	var pad = '0';
	while (n.length < l) {n = pad + n;}
	return n;
}

