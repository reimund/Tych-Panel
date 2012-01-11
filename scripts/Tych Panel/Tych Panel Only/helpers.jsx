/**
 * Make a background layer and fill it with the specified color.
 */
function tp_fill_background(doc, color)
{
	var active_layer = doc.activeLayer;
	var fill_color = new SolidColor();

	fill_color.rgb.red = color[0];
	fill_color.rgb.green = color[1];
	fill_color.rgb.blue = color[2];
	
	doc.activeLayer = doc.layers[doc.layers.length - 1];
	doc.selection.fill(fill_color)
	doc.activeLayer = active_layer;
}


/**
 * Converts the current activeDocument.activeLayer to a smart object.
 */
function tp_make_smart_object()
{
	executeAction(stringIDToTypeID("newPlacedLayer"), undefined, DialogModes.NO);
}


/**
 * Inverts the current selection.
 */
function tp_invert_selection()
{
	executeAction(charIDToTypeID("Invs"), undefined, DialogModes.NO);
}


/**
 * Pads the given number n with l zeroes.
 */
function tp_zero_pad(n, l)
{
	n = n.toString();
	l = Number(l);
	var pad = '0';
	while (n.length < l) {n = pad + n;}
	return n;
}


/**
 * Make a mask on the specified layer, making only the layer's bounding box
 * visible.
 */
function tp_mask(layer)
{
	layer.parent.activeLayer = layer;
	layer.parent.selection.select(sel = Array(
		Array(layer.bounds[0].value, layer.bounds[1].value),
		Array(layer.bounds[0].value, layer.bounds[3].value),
		Array(layer.bounds[2].value, layer.bounds[3].value),
		Array(layer.bounds[2].value, layer.bounds[1].value)
	));
	layerMask.makeFromSelection(true);
}


/**
 * Fills the selection of the active layer's layer mask with the specified
 * color. Works on the active document.
 */
function tp_fill_layer_mask(color)
{
	var fill_color = new SolidColor();

	fill_color.rgb.red = color[0];
	fill_color.rgb.green = color[1];
	fill_color.rgb.blue = color[2];
	
	layerMask.editMode(true);
	activeDocument.selection.fill(fill_color);
	layerMask.editMode(false);
}


/**
 * Add a background layer and fill it with the specified color.
 */
function tp_add_background(doc, color)
{
	doc.layers[doc.layers.length - 1].isBackgroundLayer = false;
	doc.activeLayer = doc.layers[doc.layers.length - 1];
	var fill_layer = doc.artLayers.add();
	fill_layer.name = 'Background';
	fill_layer.move(doc.layers[doc.layers.length - 1], ElementPlacement.PLACEAFTER);
	tp_fill_background(doc, color);
}


/**
 * Checks if the specified layer overlaps with the currentSelection.
 */
function tp_overlaps_selection(layer)
{
	var s;
	var l = layer.bounds;
	var overlaps = true;

	try {
		s = layer.parent.selection.bounds;
	} catch (e) {
		// Bounds does not exist, which means there is no selection, thus it
		// cannot overlap.
		return false;
	}

	if (s[2].value < l[0].value
			|| s[0].value > l[2].value
			|| s[3].value < l[1].value
			|| s[1].value > l[3].value) 
		overlaps = false;
	return overlaps;
}


/**
 * Computes the total width of the specified layers.
 */
function tp_sum_width(layers, max)
{
	var total_width = 0;
	for (var i = 0; i < layers.length; i++) {
		if (max != null && i == max) break;
		total_width += layers[i].bounds[2].value - layers[i].bounds[0].value;
	}

	return total_width;
}


/**
 * Computes the total width of the specified layers.
 */
function tp_sum_height(layers, max)
{
	var total_height = 0;
	for (var i = 0; i < layers.length; i++) {
		if (max != null && i == max) break;
		total_height += layers[i].bounds[3].value - layers[i].bounds[1].value;
	}

	return total_height;
}


/**
 * Computes the total width of the specified layers as if they were scaled
 * (keeping aspect ratio) to fit the specified height.
 */
function tp_sum_width_at_height(layers, max, height) {
	if (height == null) return tp_sum_width(layers, max);

	var total_width = 0;
	var s;
	for (var i = 0; i < layers.length; i++) {
		if (max != null && i == max) break;
		s = height / (layers[i].bounds[3].value - layers[i].bounds[1].value);
		total_width += s * (layers[i].bounds[2].value - layers[i].bounds[0].value);
	}

	return total_width;
}


/**
 * Computes the total height of the specified layers as if they were scaled
 * (keeping aspect ratio) to fit the specified width.
 */
function tp_sum_height_at_width(layers, max, width) {
	if (width == null) return tp_sum_height(layers, max);

	var total_height = 0;
	var s;
	for (var i = 0; i < layers.length; i++) {
		if (max != null && i == max) break;
		s = width / (layers[i].bounds[2].value - layers[i].bounds[0].value);
		total_height += s * (layers[i].bounds[3].value - layers[i].bounds[1].value);
	}

	return total_height;
}


/**
 * Computes the height of a layer in the current unit.
 */
function tp_lheight(layer)
{
	return layer.bounds[3].value - layer.bounds[1].value;
}


/**
 * Gets the height of the shortest of the specified layers.
 */
function tp_min_height(layers)
{
	var min_height = Number.MAX_VALUE;
	for (var i = 0; i < layers.length; i++)
		min_height = Math.min(min_height, layers[i].bounds[3].value - layers[i].bounds[1].value);

	return min_height;
}


/**
 * Gets the width of the thinnest of the specified layers.
 */
function tp_min_width(layers)
{
	var min_width = Number.MAX_VALUE;
	for (var i = 0; i < layers.length; i++)
		min_width = Math.min(min_width, layers[i].bounds[2].value - layers[i].bounds[0].value);

	return min_width;
}


/**
 * Contracts the active layer the specified number pixels.
 */
function tp_contract_layer(size, use_mask)
{
	var x0, y0, w, h;

	x0 = activeDocument.activeLayer.bounds[0].value;
	x1 = activeDocument.activeLayer.bounds[2].value;
	y0 = activeDocument.activeLayer.bounds[1].value;
	y1 = activeDocument.activeLayer.bounds[3].value;

	activeDocument.selection.select([
		[x0 + size, y0 + size],
		[x0 + size, y1 - size],
		[x1 - size, y1 - size],
		[x1 - size, y0 + size]
	]);

	activeDocument.selection.invert();

	if (use_mask)
		tp_fill_layer_mask(BLACK);
	else
		activeDocument.selection.clear();

	activeDocument.selection.deselect();
}


/**
 * Gets a list of the files currently selected in Adobe Bridge and their
 * thumbnails. Modified version of snippet by Paul Riggot.
 */
function tp_get_bridge_selection()
{
	function script()
	{
		var selected = app.document.selections;
		var images = [];
		var thumbnails = [];

		for (var i in selected) {
			if (selected[i].type =='file') {
				image_file = new File(encodeURI(selected[i].spec.fsName));
				thumb_file = File(Folder.temp + '/scriptUI.' + i + '.jpg');

				thumb = new Thumbnail(image_file);
				bitmap_data = thumb.core.thumbnail.thumbnail;
				bitmap_data.exportTo(thumb_file, 100);

				images.push(image_file);
				thumbnails.push(thumb_file);
			}
		}

		var image_files = [images.toSource(), thumbnails.toSource()];
		return image_files.toSource();
	}

	var selected;
	var bt = new BridgeTalk();

	bt.target = "bridge";
	bt.body = "var ftn = " + script.toSource() + "; ftn();";
	bt.onResult = function(in_bt) { selected = eval(in_bt.body); }
	bt.onError = function(in_bt) { selected = new Array(); }
	bt.send(8);
	bt.pump();

	for (i in selected)
		selected[i] = eval(selected[i]);
	
	if (undefined == selected)
		selected = new Array();

	return selected; 
}
