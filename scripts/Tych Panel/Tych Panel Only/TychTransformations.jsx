// XXX: Fix so that everything works when compositing is turned off.

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

		l = this.doc.layers[this.layers.length - i - 1];
		w = l.bounds[2].value - l.bounds[0].value;
		h = l.bounds[3].value - l.bounds[1].value;
		this.doc.activeLayer = l;

		// Check if the layer should be resized.
		if (m[i][0] != null) {
			// Resize layer 1 px larger than the target size.
			l.resize((((m[i][0][0]) * w + 2) / w) * 100, (((m[i][0][1]) * h + 2) / h) * 100, m[i][0][2]);
			// Remove 1px from each side of the layer.
			l.contract(1, this.settings.mask_layers);
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
	var minw, target_width, size, s1, s2, s3, m, l, h0, h1, h2, r;

	l = this.layers;
	minw = tp_min_width(l);
	m = [];
	r = 0;
	h2 = 0;

	// Computes the size of this tych's layers side by side, before applying
	// transformations.
	size = [minw, tp_sum_height_at_width(this.layers, this.n, minw)];

	// Computes the resize factor, Ie the factor used to to scale the image to
	// fit the resize_width set in the user options.
	if (this.settings.composite && documents.length > 1) {
		// If the result is going to be composited, the target_width must be
		// changed so that the result will be aligned with the target document.
		s1 = (this.tych.comp_target_doc.height.value - this.settings.spacing * (this.n - 1)) / size[1];
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
		Math.round(s1 * size[1] + this.settings.spacing * (this.n - 1))
	];
	

	// Finally compute the matrix...
	for (var i = this.n - 1; i >= 0; i--) {
		// Multiply the resize factor with this second resize factor since
		// each image also need to be resized individually in order to
		// align with other images. If all images would have the same
		// dimensions this step wouldn't be needed, but now that's not the
		// case...
		s2 = minw / (l[i].bounds[2].value - l[i].bounds[0].value);

		h0 = l[i].bounds[3].value - l[i].bounds[1].value;
		h1 = Math.round(s1 * s2 * h0 - r);

		// Use a third resize factor to adjust the resizing so it scales to even pixels.
		s3 = h1 / (s1 * s2 * h0);

		// Store the remainder so we can add or subtract it to the next layer.
		r = h1 - s1 * s2 * h0 + r;

		m.push(
			[
				[s1 * s2 * s3, s1 * s2 * s3, AnchorPosition.TOPLEFT],
				[0, h2]
			]
		);

 		// Keep track on how high we have gone.
		h2 += s1 * s2 * s3 * h0 + this.settings.spacing;
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
	var minh, size, s1, s2, s3, m, l, w0, w1, w2, r;
	
	l = this.layers;
	minh = tp_min_height(this.layers);
	m = [];
	r = 0;
	w2 = 0;

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
	for (var i = this.n - 1; i >= 0; i--) {
		// Multiply the resize factor with this second resize factor since
		// each image also need to be resized individually in order to
		// align with other images.
		s2 = minh / (l[i].bounds[3].value - l[i].bounds[1].value);

		w0 = l[i].bounds[2].value - l[0].bounds[1].value;
		w1 = Math.round(s1 * s2 * w0 - r);

		// Use a third resize factor to adjust the resizing so it scales to even pixels.
		s3 = w1 / (s1 * s2 * w0);

		// Store the remainder so we can add or subtract it to the next layer.
		r = w1 - s1 * s2 * w0 + r;

		m.push(
			[
				[s1 * s2 * s3, s1 * s2 * s3, AnchorPosition.TOPLEFT],
				[w2, 0]
			]
		);

 		// Keep track on how wide we have gone.
		w2 += s1 * s2 * s3 * w0 + this.settings.spacing;
	}

	this.matrix = m;
}

