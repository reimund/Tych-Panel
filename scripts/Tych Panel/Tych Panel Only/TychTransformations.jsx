/*
 * TychTransformations constructor.
 * Prepares the creation of an n-tych by doing some preparatory calculations on
 * the given layers with the specified settings.
 */
var TychTransformations = function(tych)
{
	this.tych = tych;
	this.layers = tych.doc.layers;
	this.settings = tych.settings;
	this.doc = tych.doc;
	this.n = this.layers.length;
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
	var m, l, w, h;

	m = this.matrix;

	for(i = 0; i < this.layers.length; i++) {
		if (i >= m.length) break;

		l = this.doc.layers[i];
		w = l.bounds[2].value - l.bounds[0].value;
		h = l.bounds[3].value - l.bounds[1].value;
		this.doc.activeLayer = l;
		
		// Check if the layer should be resized.
		if (m[i][0] != null) {
			// Resize layer 1 px larger than the target size.
			l.resize((((m[i][0][0]) * w + 2) / w) * 100, (((m[i][0][1]) * h + 2) / h) * 100, m[i][0][2]);
			// Remove 1px from each side of the layer.
			tp_contract_layer(1, this.mask_layers);
		}

		// Check if the layer should be moved.
		if (m[i][1] != null)
			l.translate(m[i][1][0] - 1, m[i][1][1] - 1);

	}
	this.layers[0].parent.resizeCanvas(this.target_size[0], this.target_size[1], AnchorPosition.TOPLEFT);
}


/**
 * Computes the transformation matrix for:
 * - NTYCH_HORIZONTAL
 */
TychTransformations.prototype.compute_ntych_vertical_matrix = function()
{
	// Get the width of the smallest layer, width-wise (before applying
	// transformations).
	var minw, target_width, size, s1, s2, s3, m, l, h0, h1, r;

	l = this.layers;
	minw = tp_min_width(l);
	m = [];
	r = 0;

	// Computes the size of this tych's layers side by side, before applying
	// transformations.
	size = [minw, tp_sum_height_at_width(this.layers, this.n, minw)];
	
	// Computes the resize factor, Ie the factor used to to scale the image to
	// fit the resize_width set in the user options.
	if (this.settings.composite && documents.length > 1) {
		// If the result is going to be composited, the target_width must be
		// changed so that the result will be aligned with the target document.
		s1 = this.tych.comp_target_doc.height.value / size[1];
		//s1 = (this.tych.comp_target_doc.height.value - this.settings.spacing * (this.n - 1)) / size[1];
	} else {
		if (this.settings.fit_width)
			s1 = (this.settings.resize_width + 1) / size[0];
		else if (this.settings.fit_height)
			s1 = (this.settings.resize_height) / size[1];
		else
			s1 = (size[0] + 2 * 0) / size[0];
	}
	

	// Computes the size the canvas need to be after arranging all the layers
	// into position.
	this.target_size = [
		Math.round(s1 * size[0]) - 1, // Crop away pixels that don't match the pixel grid.
		Math.round(s1 * size[1])// + this.settings.spacing * (this.n - 1) - 4)
	];
	

	// Finally compute the matrix...
	for (var i = 0; i < this.n; i++) {
		// Multiply the resize factor with this second resize factor since
		// each image also need to be resized individually in order to
		// align with other images.
		s2 = minw / (l[i].bounds[2].value - l[i].bounds[0].value);

		h0 = l[i].bounds[3].value - l[1].bounds[1].value;
		h1 = Math.round(s1 * s2 * h0 - r);

		// Use a third resize factor to adjust the resizing so it scales to even pixels.
		s3 = h1 / (s1 * s2 * h0);

		// Store the remainder so we can add or subtract it to the next layer.
		r = h1 - s1 * s2 * h0;

		m.push(
			[
				[s1 * s2 * s3, s1 * s2 * s3, AnchorPosition.TOPLEFT],
				[0, Math.round(tp_sum_height_at_width(l, i, minw) * s1) + this.settings.spacing * i]
			]
		);
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
	var minh, size, s1, s2, s3, m, l, w0, w1, r;
	
	l = this.layers;
	minh = tp_min_height(this.layers);
	m = [];
	r = 0;

	// Computes the size of this tych's layers side by side, before applying
	// transformations.
	size = [tp_sum_width_at_height(this.layers, this.n, minh), minh];
	
	if (this.settings.composite && documents.length > 1) {
		// If the result is going to be composited, the target_width must be
		// changed so that the result will be aligned with the target document.
		s1 = (this.tych.comp_target_doc.width.value - this.settings.spacing * (this.n - 1)) / size[0]
	} else {
		// Computes the resize factor, Ie the factor used to to scale the image to
		// fit the resize_width set in the user options.
		if (this.settings.fit_width)
			s1 = (this.settings.resize_width - this.settings.spacing * (this.n - 1)) / size[0];
		else if (this.settings.fit_height)
			s1 = (this.settings.resize_height + 1) / size[1];
		else
			s1 = 1;
	}


	// Computes the size the canvas need to be after arranging all the layers
	// into position.
	this.target_size = [
		Math.round(s1 * size[0] + this.settings.spacing * (this.n - 1)),
		Math.round(s1 * size[1] - 1) // Crop away one line of pixels since we
		                             // might get uneven pixels in the y direction.
	];

	// Finally compute the matrix...
	for (var i = 0; i < this.n; i++) {
		// Multiply the resize factor with this second resize factor since
		// each image also need to be resized individually in order to
		// align with other images.
		s2 = minh / (l[i].bounds[3].value - l[i].bounds[1].value);

		w0 = l[i].bounds[2].value - l[0].bounds[1].value;
		w1 = Math.round(s1 * s2 * w0 - r);

		// Use a third resize factor to adjust the resizing so it scales to even pixels.
		s3 = w1 / (s1 * s2 * w0);

		// Store the remainder so we can add or subtract it to the next layer.
		r = w1 - s1 * s2 * w0;

		m.push(
			[
				[s1 * s2 * s3, s1 * s2 * s3, AnchorPosition.TOPLEFT],
				[Math.round(tp_sum_width_at_height(l, i, minh) * s1) + this.settings.spacing * i, 0]
			]
		);
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
