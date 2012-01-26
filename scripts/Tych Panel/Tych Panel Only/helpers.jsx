//@include layerMaskLib.9.jsx


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

/**
 * Returns true if the specified layer have a column somewhere to it's right.
 *
 * @param index the index of the layer in the collection it resides.
 */

function tp_column_right(l, index)
{
	var s = l.parentDocument().layerSets;

	if (l.parent.name.substring(0, 3) == 'Row')
		if (index != 0)
			return false;

	for (var i = 0; i < s.length; i++)
	{
		if (s[i].name == l.parent.name)
			break;

		if (s[i].name.substring(0, 3) == 'Col')
			return true;
	}
	return false;
}


/**
 * Returns true if the specified layer have a row below it.
 *
 * @param index the index of the layer in the collection it resides.
 */

function tp_row_below(l, index)
{
	var s = l.parentDocument().layerSets;

	if (l.parent.name.substring(0, 3) == 'Col')
		if (index != 0)
			return false;

	for (var i = 0; i < s.length; i++)
	{
		if (s[i].name == l.parent.name)
			break;

		if (s[i].name.substring(0, 3) == 'Row')
			return true;
	}

	return false;
}


/**
 * Recursive function that searches through layers and layersets for the
 * layer with the specified name.
 */
function tp_get_layer_by_name(set, name) {
	var layers, res, i;

	if (name == null)
		return null;
	
	try {
		return set.layers.getByName(name);
	} catch (e) { }

	for (i = 0; i < set.layerSets.length; i++) {
		res = tp_get_layer_by_name(set.layerSets[i], name);
		if (res != undefined) break;
	}

	return res;
}


/**
 * Gets the maximum x bound below layer set sets[j] in the specified collection
 * of sets.
 */
function tp_maxx_below(sets, j)
{
	return tp_max_bound_below(sets, j, 2);
}


/**
 * Gets the maximum y bound below layer set sets[j] in the specified collection
 * of sets.
 */
function tp_maxy_below(sets, j)
{
	return tp_max_bound_below(sets, j, 3);
}


function tp_max_bound_below(sets, j, dir)
{
	var i, max;
	max = 0;

	for (i = sets.length - 1; i > j; i--)
		max = Math.max(max, sets[i].bounds[dir].value);

	return max;
}


/**
 * Tweakes the mask of specified layer to be d pixels wider or higher,
 * depending on the which side it's on.
 */
function tp_tweak_mask(l, d, side)
{
	//layerMask.makeSelection();
	var x0, x1, y0, y1;

	x0 = l.bounds[0].value;
	y0 = l.bounds[1].value;
	x1 = l.bounds[2].value;
	y1 = l.bounds[3].value;

	layerMask.remove(false);
	switch (side) {
		case TOP:
			activeDocument.selection.select([[x0, y0 - d], [x0, y1], [x1, y1], [x1, y0 - d]]);
			break;

		case BOTTOM:
			activeDocument.selection.select([[x0, y0], [x0, y1 - d], [x1, y1 - d], [x1, y0]]);
			break;

		case LEFT:
			activeDocument.selection.select([[x0, y0], [x0, y1], [x1 - d, y1], [x1 - d, y0]]);
			break;

		case RIGHT:
			activeDocument.selection.select([[x0, y0], [x0, y1], [x1 - d, y1], [x1 - d, y0]]);
	}
	layerMask.makeFromSelection(true);
}
