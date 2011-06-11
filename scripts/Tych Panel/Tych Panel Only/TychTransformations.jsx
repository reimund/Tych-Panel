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

		case NTYCH_HORIZONTAL:
		case DIPTYCH_HORIZONTAL:
		case TRIPTYCH_HORIZONTAL:
		case QUAPTYCH_HORIZONTAL:
			this.compute_ntych_matrix();
			break;

		case DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL:
		case DIPTYCH_PORTRAIT_LANDSCAPE_HORIZONTAL:
			this.compute_diptych_matrices();
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

	for(i = 0; i < this.layers.length; i++) {
		if (i >= m.length) break;
		
		// Check if the layer should be resized.
		if (m[i][0] != null)
			this.doc.layers[i].resize(m[i][0][0], m[i][0][1], m[i][0][2]);

		// Check if the layer should be moved.
		if (m[i][1] != null) {
			this.doc.layers[i].translate(m[i][1][0], m[i][1][1]);
		}
	}

	this.layers[0].parent.resizeCanvas(this.target_size[0], this.target_size[1], AnchorPosition.TOPLEFT);
}


/**
 * Computes the transformation matrix for:
 * - NTYCH_HORIZONTAL
 */
TychTransformations.prototype.compute_ntych_matrix = function()
{
	// Computes the size of this tych's layers side by side, before applying
	// transformations.
	var minh = tp_min_height(this.layers);
	var size;

	if (this.settings.keep_aspect)
		size = Array(tp_sum_width_at_height(this.layers, this.n, minh), minh);
	else
		size = Array(tp_sum_width(this.layers), minh);
	
	// Computes the resize factor, Ie the factor used to to scale the image to
	// fit the resize_width set in the user options.
	var s = this.settings.resize
		? (this.settings.resize_width - this.settings.spacing * (this.n - 1) + 2 * this.n) / size[0]
		: 1;

	// Computes the size the canvas need to be after arranging all the layers
	// into position.
	this.target_size = Array(
		Math.round(s * size[0] + this.settings.spacing * (this.n - 1) - 2 * this.n),
		Math.round(s * size[1] - 2)
	);

	// Finally compute the matrix...
	var s2;
	var l = this.layers;
	var m = [];
	var minh = tp_min_height(l);

	for (var i = 0; i < this.n; i++) {
		if (this.settings.keep_aspect) {
			s2 = minh / (l[i].bounds[3].value - l[i].bounds[1].value);
			m.push(
				Array(
					Array(s * s2 * 100, s * s2 * 100, AnchorPosition.TOPLEFT),
					Array(Math.round(tp_sum_width_at_height(l, i, minh) * s) + this.settings.spacing * i - (i * 2) - 1, -1)
				)
			);
		} else {
			m.push(Array(null, Array(tp_sum_width(l, i) + this.settings.spacing * i, -Math.round((l[i].bounds[3] - minh) / 2))));
		}
	}

	this.matrix = m;
}


/**
 * Computes the transformation matrix for:
 * - DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL
 * - DIPTYCH_PORTRAIT_LANDSCAPE_HORIZONTAL.
 */
TychTransformations.prototype.compute_diptych_matrices = function()
{
	var l = this.layers;
	var spacing = this.settings.spacing;
	var m = [[null, null], [null, null]];

	var b0 = l[0].bounds[2];
	var b1 = l[1].bounds[2];
	// Index of portrait layer.
	var p = l[0].bounds[2].value > l[1].bounds[2].value ? 1 : 0;
	// Index of landscape layer.
	var la = 1 - p;

	var size = Array(tp_sum_width_at_height(l, this.n, l[la].bounds[3].value), l[la].bounds[3].value);
	
	// Resize factor.
	var r = this.settings.resize ? (this.settings.resize_width - spacing * (this.n - 1) + 2 * this.n) / size[0] : 1;

	// Target canvas size.
	this.target_size = Array(Math.round(r * size[0] + spacing * (this.n - 1) - 2 * this.n), Math.round(r * size[1] - 2));
	
	// Resize factor 2...
	var s = l[la].bounds[3].value / l[p].bounds[3].value;


	m[p][0] = Array(r * s * 100, r * s * 100, AnchorPosition.TOPLEFT);
	m[p][1] = Array(this.tych_variant == DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL ? Math.round(r * l[la].bounds[2].value) + spacing - 3 : -1, 0);
	m[la][0] = Array(r * 100, r * 100, AnchorPosition.TOPLEFT);
	m[la][1] = Array(this.tych_variant == DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL ? -1 : Math.round(r * s * l[p].bounds[2].value) + spacing - 3, 0);

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
	if (p == 0) la = Array(1, 2);
	else if (p == 1) la = Array(0, 2);
	else la = Array(0, 1);

	// Transformations for the landscape images.
	var s1 = l[p].bounds[2].value / l[la[0]].bounds[2].value;
	var s2 = l[p].bounds[2].value / l[la[1]].bounds[2].value;

	var size = Array(
		l[p].bounds[2].value * 2, Math.min(l[p].bounds[3].value,
		s1 * l[la[0]].bounds[3].value + s2 * l[la[1]].bounds[3].value)
	);
	var r = this.settings.resize ? (this.settings.resize_width - x + 4) / size[0] : 1;
	this.target_size = Array(Math.round(r * size[0] + x - 4), Math.round(r * size[1] - 2));

	m[la[0]][0] = Array(r * s1 * 100, r * s1 * 100, AnchorPosition.TOPLEFT);
	m[la[0]][1][0] = this.tych_variant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID
		? Math.round(r * l[p].bounds[2].value) + x - 3 : -1;
	m[la[0]][1][1] = Math.round(this.target_size[1] / 2 - l[la[0]].bounds[3].value * s1 * r - x / 2) + 1;

	m[la[1]][0] = Array(r * s2 * 100, r * s2 * 100, AnchorPosition.TOPLEFT);
	m[la[1]][1][0] = this.tych_variant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID
		? Math.round(r * l[p].bounds[2].value) + x - 3 : 0;
	m[la[1]][1][1] = Math.round(this.target_size[1] / 2 + x / 2) - 1;

	m[p][0] = Array(r * 100, r * 100, AnchorPosition.TOPLEFT);
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

	var size = Array(col1_width + col2_width, row1_height + row2_height);
	var r = this.settings.resize ? (this.settings.resize_width - x + 4) / size[0] : 1;
	this.target_size = Array(Math.round(r * size[0] + x - 4), Math.round(r * size[1] + x - 4));

	this.matrix = Array(
		Array(Array(r * 100, r * 100, AnchorPosition.TOPLEFT), Array(-1, -1)),
		Array(Array(r * 100, r * 100, AnchorPosition.TOPLEFT), Array(Math.round(r * col1_width) + x - 3, -1)),
		Array(Array(r * 100, r * 100, AnchorPosition.TOPLEFT), Array(-1, Math.round(r * row1_height) + x - 3)),
		Array(Array(r * 100, r * 100, AnchorPosition.TOPLEFT), Array(Math.round(r * col1_width) + x - 3, Math.round(r * row1_height) + x - 3))
	);
}
