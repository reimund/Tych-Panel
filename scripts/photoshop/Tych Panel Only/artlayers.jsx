//@include helpers.jsx

/**
 * Contracts the layer with the specified number pixels. If use_mask is true,
 * the contraction is made with a layer mask instead.
 */
function contract(layer, size, use_mask)
{
	var x0, y0, w, h, p;

	x0 = layer.bounds[0].value;
	x1 = layer.bounds[2].value;
	y0 = layer.bounds[1].value;
	y1 = layer.bounds[3].value;

	p = parent_document(layer);

	p.selection.select([
		[x0 + size, y0 + size],
		[x0 + size, y1 - size],
		[x1 - size, y1 - size],
		[x1 - size, y0 + size]
	]);

	p.selection.invert();

	if (use_mask)
		fill_mask(layer, BLACK);
	else
		p.selection.clear();

	p.selection.deselect();
}


/**
 * Gets the parent document.
 */
function parent_document(layer)
{
	var el = layer;
	while (undefined == el.info)
		el = el.parent;
	return el;
}


/**
 * Fills the layer's layer mask with the specified color.
 */
function fill_mask(layer, color)
{
	var fill_color = new SolidColor();
	var active = activeDocument.activeLayer;

	activeDocument.activeLayer = layer;

	fill_color.rgb.red = color[0];
	fill_color.rgb.green = color[1];
	fill_color.rgb.blue = color[2];
	
	layerMask.editMode(true);
	parent_document(layer).selection.fill(fill_color);
	layerMask.editMode(false);
	activeDocument.activeLayer = active;
}

/**
 * Link the layer and layer mask.
 */
function link_mask(layer)
{
	var p = parent_document(layer);
	var doc = activeDocument;
	var active = activeDocument.activeLayer;

	activeDocument = p;
	p.activeLayer = layer;
	layerMask.link(true);

	doc.activeLayer = active;
}


/**
 * Unlink the layer and layer mask.
 */
function unlink_mask(layer)
{
	var p = parent_document(layer);
	var doc = activeDocument;
	var active = activeDocument.activeLayer;

	activeDocument = p;
	p.activeLayer = layer;
	layerMask.link(false);
	doc.activeLayer = active;
}


/**
 * Crops the layer to the specified dimensions.
 */
function crop_layer(layer, width, height, anchor_position, use_mask)
{
	var x0, y0, x_start, y_start, p;

	x0 = layer.bounds[0].value;
	x1 = layer.bounds[2].value;
	y0 = layer.bounds[1].value;
	y1 = layer.bounds[3].value;
	p = parent_document(layer);

	switch (anchor_position) {
		case AnchorPosition.BOTTOMCENTER:
			x_start = x0 + (x1 - x0) / 2 - width / 2;
			y_start = y1 - height;
			break;
		case AnchorPosition.BOTTOMLEFT:
			x_start = x0;
			y_start = y1 - height;
			break;
		case AnchorPosition.BOTTOMRIGHT:
			x_start = x1 - width;
			y_start = y1 - height;
			break;
		case AnchorPosition.MIDDLECENTER:
			x_start = x0 + (x1 - x0) / 2 - width / 2;
			y_start = y0 + (y1 - y0) / 2 - height / 2;
			break;
		case AnchorPosition.MIDDLELEFT:
			x_start = x0;
			y_start = y0 + (y1 - y0) / 2 - height / 2;
			break;
		case AnchorPosition.MIDDLERIGHT:
			x_start = x1 - width;
			y_start = y0 + (y1 - y0) / 2 - height / 2;
			break;
		case AnchorPosition.TOPCENTER:
			x_start = x0 + (x1 - x0) / 2 - width / 2;
			y_start = y0;
			break;
		case AnchorPosition.TOPLEFT:
			x_start = x0;
			y_start = y0;
			break;
		case AnchorPosition.TOPRIGHT:
			x_start = x1 - width;
			y_start = y0;
			break;
	}

	p.selection.select([
		[x_start, y_start],
		[x_start, y_start + height],
		[x_start + width, y_start + height],
		[x_start + width, y_start]
	]);

	if (use_mask) {
		layerMask.makeFromSelection(true);
	} else {
		p.selection.invert();
		p.selection.clear();
	}

	p.selection.deselect();
}


/**
 * Gets the bounds of the layer, taking the layer's mask into account if there
 * is one.
 */
// XXX: Don't think I use this function anymore. Maybe it should be removed.
function mbounds(layer)
{
	var d, s, b, ad, al;

	// Save a reference to the parent document.
	d = parent_document(layer);
	ad = activeDocument;
	al = ad.activeLayer;

	// Store away any present selection.
	s = d.selection;

	activeDocument = d;
	d.activeLayer = layer;

	
	// A mask exists.
	if (layerMask.makeSelection()) {
		b = d.selection.bounds;
		d.selection = s;
		return b;
	} else {
	// No mask exists.
		b = layer.bounds;
	}

	activeDocument = ad;
	ad.activeLayer = al;
	
	return b;
}


/**
 * Rounds the corners of the specified layer with the given radi. The corners
 * are rounded via a layer mask so an already present mask will be lost.
 */
function round_corners(layer, radius)
{
	var d, ad, al, b, x0, x1, y0, y1, c, mins, maxr, r, extend;
	
	d = parent_document(layer);
	ad = activeDocument;
	al = ad.activeLayer;

	b = mbounds(layer);
	x0 = b[0].value;
	x1 = b[2].value;
	y0 = b[1].value;
	y1 = b[3].value;

	mins = Math.min(x1 - x0, y1 - y0);
	maxr = mins;
	r = [0, 0, 0, 0];

	extend = false;

	// Create a temporary alpha channel.
	c = d.channels.add();

	// Select top left corner.
	if (radius[0] > 0) {
		r[0] = Math.min(radius[0], maxr);
		if (r[0] > 0) {
			tp_select_rounded_corner(d, x0, y0, x0 + r[0], y0 + r[0], TOP_LEFT);
			d.selection.store(c);
			d.selection.deselect();
			maxr = Math.min(mins, mins - r[0]);
		}
	}

	// Select top right corner.
	if (radius[1] > 0) {
		r[1] = Math.min(radius[1], maxr);
		if (r[1] > 0) {
			tp_select_rounded_corner(d, x1 - r[1], y0, x1, y0 + r[1], TOP_RIGHT);
			d.selection.store(c, SelectionType.EXTEND);
			d.selection.deselect();
			maxr = Math.min(mins, mins - r[1]);
		}
	}

	// Select bottom right corner.
	if (radius[2] > 0) {
		r[2] = Math.min(radius[2], maxr);
		if (r[2] > 0) {
			tp_select_rounded_corner(d, x1 - r[2], y1 - r[2], x1, y1, BOTTOM_RIGHT);
			d.selection.store(c, SelectionType.EXTEND);
			d.selection.deselect();
			maxr = Math.min(mins, mins - r[2]);
		}
	}
	
	// Select bottom left corner.
	if (radius[3] > 0) {
		r[3] = Math.min(radius[3], maxr);
		if (r[3] > 0) {
			tp_select_rounded_corner(d, x0, y1 - r[3], x0 + r[3], y1, BOTTOM_LEFT);
			d.selection.store(c, SelectionType.EXTEND);
			d.selection.deselect();
		}
	}

	// Select all but corners.
	d.selection.select([
		[x0 + r[0], y0],
		[x0 + r[0], y0 + r[0]],
		[x0, y0 + r[0]],
		[x0, y1 - r[3]],
		[x0 + r[3], y1 - r[3]],
		[x0 + r[3], y1],
		[x1 - r[2], y1],
		[x1 - r[2], y1 - r[2]],
		[x1, y1 - r[2]],
		[x1, y0 + r[1]],
		[x1 - r[1], y0 + r[1]],
		[x1 - r[1], y0]
	]);

	d.selection.load(c, SelectionType.EXTEND);

	// Remove any current mask if it exists. Otherwise makeFromSelection won't
	// work.
	activeDocument = d;
	d.activeLayer = layer;
	layerMask.remove(false);
	layerMask.makeFromSelection(true);
	layerMask.link(false);

	// Deselect, remove alpha channel and revert active document and layer.
	d.selection.deselect();
	d.channels.removeAll();
	activeDocument = ad;
	ad.activeLayer = al;
}


/**
 * Creates a new rectangular mask using the bounds of the specified layer's
 * mask.
 */
function mask_from_mask_bounds(layer) 
{
	var d, ad, al;

	d = parent_document(layer);

	// Save the current active layer.
	ad = activeDocument;
	al = ad.activeLayer;

	// Temporary set active layer.
	activeDocument = d;
	d.activeLayer = layer;
	
	// Create the mask if a mask exists.
	if (layerMask.selectLayerMask()) {
		tp_select_bounds(d, mbounds(layer));

		layerMask.remove(false);
		layerMask.makeFromSelection(true);
		layerMask.link(false);
		d.selection.deselect();
	}

	// Restore active document & active layer.
	activeDocument = ad;
	ad.activeLayer = al;
}


/**
 * Saves the layer to the specified location, using the given options.
 */
function save_layer(layer, path, options)
{
	var d, b, f, d;

	d = parent_document(layer);
	b = mbounds(layer)
	f = new File(path);

	// Select & copy the layer.
	tp_select_bounds(d, b);
	tp_copy_merged();
	d.selection.deselect();

	// Create a temporary document & paste the layer into it.
	t = documents.add(b[2].value - b[0].value, b[3].value - b[1].value, 72, f.displayName, NewDocumentMode.RGB);
	t.paste();
	activeDocument = t;

	// Save & close the document.
	t.saveAs(new File(path), options, true, Extension.LOWERCASE);
	t.close(SaveOptions.DONOTSAVECHANGES);
}


/**
 * Copies the specified layer to the bottom of the layer stack of the given
 * document.
 */
copy_layer_to_document = function(layer, target_document)
{
	var d, ad, al, target_index;

	d = parent_document(layer);

	// Save the current active layer.
	ad = activeDocument;
	al = ad.activeLayer;

	// Temporary set active layer.
	activeDocument = d;
	d.activeLayer = layer;

	for (i = 0; i < documents.length; i++) {
		if (documents[i] == target_document)
			target_index = i;

		if (documents[i] == activeDocument)
			active_index = i;
	}

	// We must iterate through the document stack in order to copy the layer to
	// a specific document. It works by copying it one document at a time until
	// it's in the right document.
	for (i = active_index; i >= target_index; i--) {

		tp_copy_layer_to_previous_document();

		if (i != active_index)
			// Remove when not the in target
			documents[i].activeLayer.remove();

		if (i - 1 == target_index) break;

		activeDocument = documents[i - 1];

	}

	// Restore active document & active layer.
	activeDocument = ad;
	ad.activeLayer = al;
}
