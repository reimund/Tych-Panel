//@include layerMaskLib.9.jsx
//@include constants.jsx


/**
 * Make a background layer and fill it with the specified color.
 */
function tp_fill_background(doc, color)
{
	var active_layer = doc.activeLayer;
	
	doc.activeLayer = doc.layers[doc.layers.length - 1];
	doc.selection.fill(color)
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
		if (null != max && i == max) break;
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
		if (null != max && i == max) break;
		total_height += layers[i].bounds[3].value - layers[i].bounds[1].value;
	}

	return total_height;
}


/**
 * Computes the total width of the specified layers as if they were scaled
 * (keeping aspect ratio) to fit the specified height.
 */
function tp_sum_width_at_height(layers, max, height) {
	if (null == height) return tp_sum_width(layers, max);

	var total_width = 0;
	var s;
	for (var i = 0; i < layers.length; i++) {
		if (null != max && i == max) break;
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
	if (null == width) return tp_sum_height(layers, max);

	var total_height = 0;
	var s;
	for (var i = 0; i < layers.length; i++) {
		if (null != max && i == max) break;
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
			if ('file' == selected[i].type) {
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
	var s = parent_document(l).layerSets;

	if ('Row' == l.parent.name.substring(0, 3))
		if (index != 0)
			return false;

	for (var i = 0; i < s.length; i++)
	{
		if (s[i].name == l.parent.name)
			break;

		if ('Col' == s[i].name.substring(0, 3))
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
	var s = parent_document(l).layerSets;

	if ('Col' == l.parent.name.substring(0, 3))
		if (index != 0)
			return false;

	for (var i = 0; i < s.length; i++)
	{
		if (s[i].name == l.parent.name)
			break;

		if ('Row' == s[i].name.substring(0, 3))
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

	if (null == name)
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


/**
 * Selects an area of the specified bounds that are rounded in the given
 * corner.
 */
function tp_select_rounded_corner(doc, x0, y0, x1, y1, corner)
{
	var w, h;

	w = x1 - x0;
	h = y1 - y0;

	doc.selection.select([
		[x0, y0],
		[x0, y1],
		[x1, y1],
		[x1, y0]
	]);

	switch (corner) {
		case TOP_LEFT:
			tp_intersect_circle(x0, y0, x1 + w, y1 + h);
			break;

		case TOP_RIGHT:
			tp_intersect_circle(x0 - w, y0, x1, y1 + h);
			break;

		case BOTTOM_RIGHT:
			tp_intersect_circle(x0 - w, y0 - h, x1, y1);
			break;

		case BOTTOM_LEFT:
			tp_intersect_circle(x0, y0 - h, x1 + w, y1);
			break;
	}
}


/**
 * Intersects the current selection with a circle selection.
 */
function tp_intersect_circle(left, top, right, bottom) { 
	var desc1, ref1, desc2;

	desc1 = new ActionDescriptor(); 
	ref1 = new ActionReference(); 
	ref1.putProperty(charIDToTypeID('Chnl'), charIDToTypeID('fsel')); 
	desc1.putReference(charIDToTypeID('null'), ref1); 

	desc2 = new ActionDescriptor(); 
	desc2.putUnitDouble(charIDToTypeID('Top '), charIDToTypeID('#Pxl'), top); 
	desc2.putUnitDouble(charIDToTypeID('Left'), charIDToTypeID('#Pxl'), left); 
	desc2.putUnitDouble(charIDToTypeID('Btom'), charIDToTypeID('#Pxl'), bottom); 
	desc2.putUnitDouble(charIDToTypeID('Rght'), charIDToTypeID('#Pxl'), right); 
	desc1.putObject(charIDToTypeID('T   '), charIDToTypeID('Elps'), desc2); 
	desc1.putBoolean(charIDToTypeID('AntA'), true); 
	executeAction(charIDToTypeID('IntW'), desc1, DialogModes.NO);
}; 


/**
 * Gets the next available file name by increasing a trailing sequential
 * number.
 */
function tp_next_filename(directory, basename, formats, always_pad)
{
	var padding, collision, file;

	if (always_pad) {
		padding = '001';
		separator = '_'
	} else
		padding = separator = ''

	while(true) {
		collision = false;

		for (extension in formats) {
			file = new File(directory + '/' + basename + separator + padding + '.' + extension);
			if (file.exists) {
				collision = true;
				
				if (!always_pad && '' == padding) {
					padding = '000';
					separator = '_';
				}
				break;
			}
		}

		// Increase the sequential number by 1 if there is a filename
		// collision.
		if (collision)
			padding = tp_zero_pad(Number(padding) + 1, 3);
		else
			break;
	}

	return directory + '/' + basename + separator + padding;
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
 * Selects a rectangular area from the given bounds.
 */
function tp_select_bounds(doc, bounds)
{
	doc.selection.select([
		[bounds[0].value, bounds[1].value],
		[bounds[0].value, bounds[3].value],
		[bounds[2].value, bounds[3].value],
		[bounds[2].value, bounds[1].value]
	]);
}

function tp_copy_merged()
{
	executeAction(charIDToTypeID("CpyM"), undefined, DialogModes.NO);
}


/**
 * Copies the active layer of the active document to the document beneath it
 * in the document stack.
 */
function tp_copy_layer_to_previous_document()
{
	var desc = new ActionDescriptor();
	var ref = new ActionReference();

	ref.putEnumerated(
		charIDToTypeID('Lyr '),
		charIDToTypeID('Ordn'),
		charIDToTypeID('Trgt')
	);

	desc.putReference(charIDToTypeID('null'), ref);
	var docRef = new ActionReference();
	docRef.putOffset(charIDToTypeID('Dcmn'), -1);
	desc.putReference(charIDToTypeID('T   '), docRef);
	desc.putInteger(charIDToTypeID('Vrsn'), 5);
	executeAction(charIDToTypeID('Dplc'), desc, DialogModes.NO);
}


/**
 * Gives a string representation of the Tych Panel constants.
 */
function tp_const_string(constant)
{
	switch (constant) {
		case ROW:
			return 'row';

		case COLUMN:
			return 'column';

		case TOP:
			return 'top';

		case RIGHT:
			return 'right';

		case BOTTOM:
			return 'bottom';

		case LEFT:
			return 'left';

		case TOP_LEFT:
			return 'top left';

		case TOP_RIGHT:
			return 'top right';

		case BOTTOM_RIGHT:
			return 'bottom right';

		case BOTTOM_LEFT:
			return 'bottom left';
	}
}


/**
 * Strips the extension of filename string.
 */
function tp_get_basename(name)
{
	return name.replace(/\.[^\..]+$/, '');
}


/**
 * Gets an object containing a common suffix and sequence numbers for the given
 * file names. If a common prefix cannot be found, false is returned.
 *
 * Examples:
 *    [20120221_001.jpg, 20120221_002.jpg] -> 20120221_001_002.
 *    [20120221_001.jpg, 20120510_122.jpg] -> 20120221_001_20120510_122.
 *    [foo.jpg, bar.jpg] -> foo_bar.jpg.
 */
function tp_combine_filenames(names)
{
	var sequence_numbers, combined, name, prefix, tmp, regex, i, j;

	sequence_numbers = [];
	combined = [];
	regex = /_\d+$/;

	outer:
	for (i in names)
		for (j in names[i]) {

			name = tp_get_basename(names[i][j]);
			tmp = name.replace(regex, '');

			sequence_numbers.push(name.match(regex));

			if (0 == i && 0 == j)
				prefix = tmp;

			if (tmp != prefix)
				break outer;
		}

	// Succeeded in finding a prefix that all pics have in common.
	if (tmp == prefix)
		return prefix + sequence_numbers.join('');
	
	// No common prefix found, concatenate names instead.
	for (i in names)
		for (j in names[i])
			combined.push(tp_get_basename(names[i][j]));
	
	return combined.join('_');
}

/**
 * Safe open document, duplicate and close any already open document which
 * collides with the specified file.
 */
function tp_safe_open(file)
{
	var orig, copy;

	copy = null;

	try {
		orig = documents.getByName(file.name.replace('%20', ' ', 'g'));

		if (null != orig) {
			copy = orig.duplicate();
			orig.close(SaveOptions.DONOTSAVECHANGES);
		}
	} catch (e) {
	} 

	return {
		opened:    tp_bounds_workaround(app.open(file), file),
		duplicate: copy
	}
}

/**
 * Only flattens when possible and keeps transparency.
 */
function tp_flatten(doc)
{
	if (1 < doc.layers.length)
		doc.mergeVisibleLayers();
}

/**
 * Fills top left and bottom right corner pixels with almost invisible color.
 * 
 * This can be used as a workaround to get the bounds of a picture with
 * transparancy to correspond to the pictures actual dimensions.
 */
function tp_dot_corner(doc)
{
	// Select top left corner pixel.
	doc.selection.select([[0, 0], [0, 1], [1, 1], [1, 0]])

	// Select bottom right corner pixel.
	doc.selection.select([
		[doc.width - 1, doc.height - 1],
		[doc.width - 1, doc.height],
		[doc.width, doc.height],
		[doc.width, doc.height - 1]
	], SelectionType.EXTEND)

	// Fill the selected pixels.
	color = new SolidColor();
	color.rgb.hexValue = '808080';
	doc.selection.fill(color, ColorBlendMode.NORMAL, 1);
}

/**
 * Applies the bounds workaround to the specified document, if it's filename
 * has a png or psd extension.
 */
function tp_bounds_workaround(doc)
{
	var tmp, ext;

	tmp = doc.name.split('.');
	ext = tmp[tmp.length - 1];

	// Only apply workaround on files with png or psd extension.
	if ('png' != ext && 'psd' != ext)
		return doc;
	
	tp_dot_corner(doc);
	return doc;
}

