var ArtLayer = function () {} 


/**
 * Contracts the layer with the specified number pixels. If use_mask is true,
 * the contraction is made with a layer mask instead.
 */
ArtLayer.prototype.contract = function(size, use_mask)
{
	var x0, y0, w, h, p;

	x0 = this.bounds[0].value;
	x1 = this.bounds[2].value;
	y0 = this.bounds[1].value;
	y1 = this.bounds[3].value;

	p = this.parentDocument();

	p.selection.select([
		[x0 + size, y0 + size],
		[x0 + size, y1 - size],
		[x1 - size, y1 - size],
		[x1 - size, y0 + size]
	]);

	p.selection.invert();

	if (use_mask)
		this.fillMask(BLACK);
	else
		p.selection.clear();

	p.selection.deselect();
}

/**
 * Gets the parent document.
 */
ArtLayer.prototype.parentDocument = function()
{
	var el = this;
	while (el.info == undefined)
		el = el.parent;
	return el;
}

/**
 * Fills the layer's layer mask with the specified color.
 */
ArtLayer.prototype.fillMask = function(color)
{
	var fill_color = new SolidColor();
	var active = activeDocument.activeLayer;

	activeDocument.activeLayer = this;

	fill_color.rgb.red = color[0];
	fill_color.rgb.green = color[1];
	fill_color.rgb.blue = color[2];
	
	layerMask.editMode(true);
	this.parentDocument().selection.fill(fill_color);
	layerMask.editMode(false);
	activeDocument.activeLayer = active;
}

/**
 * Link the layer and layer mask.
 */
ArtLayer.prototype.link_mask = function()
{
	var p = this.parentDocument();
	var doc = activeDocument;
	var active = activeDocument.activeLayer;

	activeDocument = p;
	p.activeLayer = l;
	layerMask.link(true);

	doc.activeLayer = active;
}


/**
 * Unlink the layer and layer mask.
 */
ArtLayer.prototype.unlink_mask = function()
{
	var p = this.parentDocument();
	var doc = activeDocument;
	var active = activeDocument.activeLayer;

	activeDocument = p;
	p.activeLayer = l;
	layerMask.link(false);
	doc.activeLayer = active;
}


/**
 * Crops the layer to the specified dimensions.
 */
ArtLayer.prototype.crop = function(width, height, anchor_position, use_mask)
{
	var x0, y0, x_start, y_start, p;

	x0 = this.bounds[0].value;
	x1 = this.bounds[2].value;
	y0 = this.bounds[1].value;
	y1 = this.bounds[3].value;
	p = this.parentDocument();

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
ArtLayer.prototype.mbounds = function()
{
	var d, s0, s1;

	// Save a reference to the parent document.
	d = this.parentDocument();

	// Store away a possible selection.
	s0 = d.selection;
	
	if (layerMask.makeSelection()) {
		s1 = d.selection;
		d.selection = s0;
		d.selection.deslect();
		return s1.bounds;
	}

	return this.bounds;
}
