/*
 * TychTransformations constructor.
 * Prepares the creation of an n-tych by doing some preparatory calculations on
 * the given layers with the specified settings.
 */
var TychTransformations = function(layers, settings)
{
	this.layers = layers;
	this.settings = settings;
	this.doc = layers[0].parent;
	this.n = layers.length;
}


/**
 * Compute the things we need in order to layout the layers.
 */
TychTransformations.prototype.compute = function(tych_variant)
{
	this.tych_variant = tych_variant;

	switch (this.tych_variant) {

		case NTYCH_VERTICAL:
			this.compute_ntych_vertical_matrix();
			break;

		case NTYCH_HORIZONTAL:
			this.compute_ntych_horizontal_matrix();
			break;

		case TRIPTYCH_PORTRAIT_LANDSCAPE_GRID:
		case TRIPTYCH_LANDSCAPE_PORTRAIT_GRID:
			this.compute_triptych_matrices();
			break;

		case QUAPTYCH_GRID:
			this.compute_quaptych_matrix();
			break;

		default:
			return false;
	}
}


/**
 * Arranges the layers according to the transformation matrix.
 */
TychTransformations.prototype.apply = function()
{
	var m = this.matrix;
	var l;

	for(i = 0; i < this.layers.length; i++) {
		if (i >= m.length) break;

		l = this.doc.layers[i];
		this.doc.activeLayer = l;

		
		// Check if the layer should be resized.
		if (m[i][0] != null)
			l.resize(m[i][0][0], m[i][0][1], m[i][0][2]);


		// XXX: Bleh, I thought this would be a working general implementation
		// for all tychs, but in the end, I sometimes got rounding errors
		// making the spacings off.
		//// Nudge away from canvas boundaries so that invert selection works
		//// appropriately.
		//l.translate(1, 1);

		//// Select the layer (contracted 1px).
		//this.doc.selection.select(sel = [
			//[l.bounds[0].value + 1, l.bounds[1].value + 1], // Upper left corner.
			//[l.bounds[0].value + 1, l.bounds[3].value - 1], // Lower left corner.
			//[l.bounds[2].value - 1, l.bounds[3].value - 1], // Lower right corner.
			//[l.bounds[2].value - 1, l.bounds[1].value + 1] // Upper right corner.
		//]);

		//tp_invert_selection();

		//if (this.settings.mask_layers)
			//tp_fill_layer_mask(BLACK);
		//else
			//this.doc.selection.clear();

		//this.doc.selection.deselect();
		//l.translate(-1, -1);
		
		// Check if the layer should be moved.
		if (m[i][1] != null)
			l.translate(m[i][1][0], m[i][1][1]);

	}
		
	this.layers[0].parent.resizeCanvas(this.target_size[0], this.target_size[1], AnchorPosition.TOPLEFT);

	// Remove the fuzzy 1px wide outer edge from each layer.
	this.clear_spacings();


}


TychTransformations.prototype.clear_spacings = function(i)
{
	var m = this.matrix;
	var spacing = this.settings.spacing;
	var width = this.target_size[0];
	var height = this.target_size[1];

	if (this.tych_variant == NTYCH_HORIZONTAL) {
		for (i = 0; i < this.n; i++) {
			this.doc.selection.select(sel = [
				[m[i][1][0] - spacing + 1, 0], // Upper left corner.
				[m[i][1][0] - spacing + 1, height], // Lower left corner.
				[m[i][1][0] + 1, height], // Lower right corner.
				[m[i][1][0] + 1, 0] // Upper right corner.
			]);
			
			if (sel[2][0] > 0)
				this.clear_selected();
		}
	} else if (this.tych_variant == NTYCH_VERTICAL) {

		for (i = 0; i < this.n; i++) {
			this.doc.selection.select(sel = [
				[0, m[i][1] - spacing + 1], // Upper left corner.
				[0, m[i][1] + 1], // Lower left corner.
				[width, m[i][1][1] + 1], // Lower right corner.
				[width, m[i][1][1] - spacing + 1] // Upper right corner.
			]);
			
			if (sel[2][0] > 0)
				this.clear_selected();
		}
	}

	// XXX: Clear the spacings for all predefined templates.
}


/** 
 * Clears the selected area on all layers.
 *
 * If masks are enabled, layers are cleared by masking out the selected parts.
 */
TychTransformations.prototype.clear_selected = function()
{
	for (j = 0; j < this.n; j++) {
		this.doc.activeLayer = this.doc.layers[j];

		if (tp_overlaps_selection(this.doc.activeLayer))
			if (this.settings.mask_layers)
				tp_fill_layer_mask(BLACK);
			else
				this.doc.selection.clear();
	}
	this.doc.selection.deselect();
}


/**
 * Computes the transformation matrix for:
 * - NTYCH_HORIZONTAL
 */
TychTransformations.prototype.compute_ntych_vertical_matrix = function()
{
	// Get the width of the smallest layer, width-wise (before applying
	// transformations).
	var minw, size, s1, s2, m, l;

	l = this.layers;
	minw = tp_min_width(l);
	m = [];

	// Computes the size of this tych's layers side by side, before applying
	// transformations.
	if (this.settings.keep_aspect)
		size = [minw, tp_sum_height_at_width(this.layers, this.n, minw)];
	else
		size = [minw, tp_sum_height(this.layers)];
	
	// Computes the resize factor, Ie the factor used to to scale the image to
	// fit the resize_width set in the user options.
	s1 = this.settings.resize
		//? (this.settings.resize_width - this.settings.spacing * (this.n - 1) + 2 * this.n + 2) / size[0]
		? this.settings.resize_width / size[0]
		: 1;

	// Computes the size the canvas need to be after arranging all the layers
	// into position.
	this.target_size = [
		Math.round(s1 * size[0]) - 2,
		Math.round(s1 * size[1] + this.settings.spacing * (this.n - 1) - 2 * this.n)
	];

	// Finally compute the matrix...
	for (var i = 0; i < this.n; i++) {
		if (this.settings.keep_aspect) {
			s2 = minw / (l[i].bounds[2].value - l[i].bounds[0].value);
			m.push(
				[
					[s1 * s2 * 100, s1 * s2 * 100, AnchorPosition.TOPLEFT],
					[-1, Math.round(tp_sum_height_at_width(l, i, minw) * s1) + this.settings.spacing * i - (i * 2) - 1]
				]
			);
		} else {
			m.push([null, -Math.round((l[i].bounds[2] - minw) / 2), [tp_sum_height(l, i) + this.settings.spacing * i]]);
		}
	}

	this.matrix = m;
}


/**
 * Computes the transformation matrix for:
 * - NTYCH_HORIZONTAL
 */
TychTransformations.prototype.compute_ntych_horizontal_matrix = function()
{
	// Get the height of the smallest layer, height-wise (before applying
	// transformations).
	var minh, size, s1, s2, m, l;
	
	l = this.layers;
	minh = tp_min_height(this.layers);
	m = [];

	// Computes the size of this tych's layers side by side, before applying
	// transformations.
	if (this.settings.keep_aspect)
		size = [tp_sum_width_at_height(this.layers, this.n, minh), minh];
	else
		size = [tp_sum_width(this.layers), minh];
	
	// Computes the resize factor, Ie the factor used to to scale the image to
	// fit the resize_width set in the user options.
	s1 = this.settings.resize
		? (this.settings.resize_width - this.settings.spacing * (this.n - 1) + 2 * this.n) / size[0]
		: 1;


	// Computes the size the canvas need to be after arranging all the layers
	// into position.
	this.target_size = [
		Math.round(s1 * size[0] + this.settings.spacing * (this.n - 1) - 2 * this.n),
		Math.round(s1 * size[1] - 2)
	];

	// Finally compute the matrix...
	for (var i = 0; i < this.n; i++) {
		if (this.settings.keep_aspect) {
			s2 = minh / (l[i].bounds[3].value - l[i].bounds[1].value);
			m.push(
				[
					[s1 * s2 * 100, s1 * s2 * 100, AnchorPosition.TOPLEFT],
					[Math.round(tp_sum_width_at_height(l, i, minh) * s1) + this.settings.spacing * i - (i * 2) - 1, -1]
				]
			);
		} else {
			m.push([null, [tp_sum_width(l, i) + this.settings.spacing * i, -Math.round((l[i].bounds[3] - minh) / 2)]]);
		}
	}

	this.matrix = m;
}


/**
 * Computes the transformation matrix for:
 * - TRIPTYCH_PORTRAIT_LANDSCAPE_GRID
 * - TRIPTYCH_LANDSCAPE_PORTRAIT_GRID
 */
TychTransformations.prototype.compute_triptych_matrices = function()
{
	var l = this.layers;
	var x = this.settings.spacing;
	var m = [
		[null, [0, 0]],
		[null, [0, 0]],
		[null, [0, 0]]
	];

	// Index of portrait layer.
	var p = l[0].bounds[3].value > l[1].bounds[3].value ? 0 : 2;
	p = l[1].bounds[3] .value> l[2].bounds[3].value ? 1 : p;

	// Indicies of landscape layers.
	var la;
	if (p == 0) la = [1, 2];
	else if (p == 1) la = [0, 2];
	else la = [0, 1];

	// Transformations for the landscape images.
	var s1 = l[p].bounds[2].value / l[la[0]].bounds[2].value;
	var s2 = l[p].bounds[2].value / l[la[1]].bounds[2].value;

	var size = [
		l[p].bounds[2].value * 2, Math.min(l[p].bounds[3].value,
		s1 * l[la[0]].bounds[3].value + s2 * l[la[1]].bounds[3].value)
	];
	var r = this.settings.resize ? (this.settings.resize_width - x + 4) / size[0] : 1;
	this.target_size = [Math.round(r * size[0] + x - 4), Math.round(r * size[1] - 2)];

	m[la[0]][0] = [r * s1 * 100, r * s1 * 100, AnchorPosition.TOPLEFT];
	m[la[0]][1][0] = this.tych_variant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID
		? Math.round(r * l[p].bounds[2].value) + x - 3 : -1;
	m[la[0]][1][1] = Math.round(this.target_size[1] / 2 - l[la[0]].bounds[3].value * s1 * r - x / 2) + 1;

	m[la[1]][0] = [r * s2 * 100, r * s2 * 100, AnchorPosition.TOPLEFT];
	m[la[1]][1][0] = this.tych_variant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID
		? Math.round(r * l[p].bounds[2].value) + x - 3 : 0;
	m[la[1]][1][1] = Math.round(this.target_size[1] / 2 + x / 2) - 1;

	m[p][0] = [r * 100, r * 100, AnchorPosition.TOPLEFT];
	m[p][1][0] = this.tych_variant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID ? -1 : Math.round(r * l[p].bounds[2].value) + x - 3;
	m[p][1][1] = -Math.round((r * l[p].bounds[3].value - this.target_size[1]) / 2) - 1;

	this.matrix = m;
}


/**
 * Computes the transformation matrix for:
 * - QUAPTYCH_GRID
 */
TychTransformations.prototype.compute_quaptych_matrix = function()
{
	var l = this.layers;
	var x = this.settings.spacing;

	var col1_width = Math.max(l[0].bounds[2].value, l[2].bounds[2].value);
	var col2_width = Math.max(l[1].bounds[2].value, l[3].bounds[2].value);
	var row1_height = Math.max(l[0].bounds[3].value, l[1].bounds[3].value);
	var row2_height = Math.max(l[2].bounds[3].value, l[3].bounds[3].value);

	var size = [col1_width + col2_width, row1_height + row2_height];
	var r = this.settings.resize ? (this.settings.resize_width - x + 4) / size[0] : 1;
	this.target_size = [Math.round(r * size[0] + x - 4), Math.round(r * size[1] + x - 4)];

	this.matrix = [
		[[r * 100, r * 100, AnchorPosition.TOPLEFT], [-1, -1]],
		[[r * 100, r * 100, AnchorPosition.TOPLEFT], [Math.round(r * col1_width) + x - 3, -1]],
		[[r * 100, r * 100, AnchorPosition.TOPLEFT], [-1, Math.round(r * row1_height) + x - 3]],
		[[r * 100, r * 100, AnchorPosition.TOPLEFT], [Math.round(r * col1_width) + x - 3, Math.round(r * row1_height) + x - 3]]
	];
}
