// XXX: Fix so that things work when compositing is disabled.
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
TychTransformations.prototype.compute = function(alignment)
{
	this.alignment = alignment;

	switch (this.alignment) {

		case COLUMN:
			this.compute_ntych_vertical_matrix();
			break;

		case ROW:
			this.compute_ntych_horizontal_matrix();
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

	// Resize canvas prior to contracting so that all parts of the layers are
	// inside the canvas, otherwise off-screen pixels will remain.
	this.layers[0].parent.resizeCanvas(this.target_size[0] + 2, this.target_size[1] + 2, AnchorPosition.TOPLEFT);

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
			contract(l, 1, this.settings.mask_layers);
		}

		// Check if the layer should be moved.
		if (m[i][1] != null)
			l.translate(m[i][1][0] - 1, m[i][1][1] - 1);

	}

	this.layers[0].parent.resizeCanvas(this.target_size[0], this.target_size[1], AnchorPosition.TOPLEFT);
}


/**
 * Computes the transformation matrix for:
 * - ROW
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
	// fit the fit_size set in the user options.
	if (this.settings.composite && documents.length > 1) {
		// If the result is going to be composited, the target_width must be
		// changed so that the result will be aligned with the target document.
		s1 = (this.tych.comp_doc.height.value
			- this.tych.table.border[0]
			- this.tych.table.border[2]
			- this.settings.spacing * (this.n - 1)) / size[1];
	} else {
		if (this.settings.fit_width)
			s1 = (this.settings.fit_size + 1) / size[0];
		else if (this.settings.fit_height)
			s1 = (this.settings.fit_size) / size[1];
		else
			s1 = (size[0] + 2 * 0) / size[0];
	}
	

	// Computes the size the canvas need to be after arranging all the layers
	// into position.
	this.target_size = [
		Math.round(s1 * size[0])
			- (this.settings.fit_height || this.settings.fit_width ? 1 : 0),
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
 * - ROW
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
		s1 = (this.tych.comp_doc.width.value
			- this.tych.table.border[1]
			- this.tych.table.border[3]
			- this.settings.spacing * (this.n - 1)) / size[0]
	} else {
		// Computes the resize factor, Ie the factor used to to scale the image to
		// fit the fit_size set in the user options.
		if (this.settings.fit_width)
			s1 = (this.settings.fit_size - this.settings.spacing * (this.n - 1)) / size[0];
		else if (this.settings.fit_height)
			s1 = (this.settings.fit_size + 1) / size[1];
		else
			s1 = 1;
	}


	// Computes the size the canvas need to be after arranging all the layers
	// into position.
	this.target_size = [
		Math.round(s1 * size[0] + this.settings.spacing * (this.n - 1)),
		Math.round(s1 * size[1])
			- (this.settings.fit_height
				|| this.settings.fit_width ? 1 : 0) // Crop away one line of
													// pixels since we might
													// get uneven pixels in the
													// y direction.
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


TychTransformations.prototype.readjust = function(tych, doc, old_width, old_height, new_width, new_height)
{
	var s1, rx, ry, new_size, new_coords, prev;

	this.tych = tych;

	// The resize factor to scale everything, including
	// spacings, to fit the width.
	if (tych.settings.maintain_width) 
		s1 = (old_width / doc.width * old_height) / doc.height;
	else if (tych.settings.maintain_height)
		s1 = (old_height / doc.height * old_width) / doc.width;

	// Remainder.
	rx = 0
	ry = 0

	minx = Number.MAX_VALUE;
	miny = Number.MAX_VALUE;

	// Maintain width & height.
	// Here be dragons.
	if ((tych.settings.maintain_width && tych.alignment != ROW)
			|| (tych.settings.maintain_height && tych.alignment != COLUMN)) {
		for (i = doc.layerSets.length - 1; i >= 0; i--) {
			s = doc.layerSets[i];

			// Reset previous layer for each layer set.
			prev = null;

			for (j = s.layers.length - 1; j >= 0; j--) {

				l = s.layers[j];
				doc.activeLayer = l;

				// Make a reference to the previous layer if it exists.
				if ((s.layers.length - 1) > j && s.layers[j + 1])
					prev = s.layers[j + 1];

				if (tych.settings.mask_layers)
					layerMask.remove(false);

				// Get layer metadata.
				lm = this.tych.table.layers[l.name];

				if (new_size != undefined) {
					rx = new_size.rx;
					ry = new_size.ry;
				}

				// Test cases
				// Maintain width: 2b, 2r, 1t, 2l, 3t, 1l
				// Maintain height: 1b, 2r, 2b

				new_size = this.get_new_size(doc, l, lm, s1, rx, ry, i, j);
				new_coords = this.get_new_position(doc, l, lm, i, j);

				l.translate(-l.bounds[0].value + new_coords.x, -l.bounds[1].value + new_coords.y);

				// If the calculated dimensions of the last layer exceeds
				// the desired size, reduce the amount. Do this for the last
				// layer in each ntych, except the first ntych.
				if (i < doc.layerSets.length - 1 && 0 == j) {
					if (ROW == lm.type) {
						new_size.width -= l.bounds[0].value + new_size.width - tp_maxx_below(doc.layerSets, i);
					} else {
						new_size.height -= l.bounds[1].value + new_size.height - tp_maxy_below(doc.layerSets, i);
					}
				}

				// Enlarge 1px in all directions to rid fuzzy edge.
				l.resize(
					(new_size.width + 2) / (l.bounds[2].value - l.bounds[0].value) * 100,
					(new_size.height + 2) / (l.bounds[3].value - l.bounds[1].value) * 100,
					new_coords.a
				);

				// Crop layer to the desired size and take away an extra single
				// pixel border around the layer to make it perfectly crisp
				// without any fuzzy edges.
				crop_layer(l, new_size.width, new_size.height, AnchorPosition.MIDDLECENTER, tych.settings.mask_layers);

				// Smart objects can be different sized even though the
				// original pictures have identical dimensions. This is because
				// they are scaled unevenly to match the pixel grid.
				// Furthermore, they cannot be cropped to matching width/height
				// since they're smart objects. Naturally, they could be
				// cropped before converting, but that defies the purpose of
				// smart objects. Therefore, the best compromise is to realign
				// any misaligned layer mask after the fact.
				if (prev && this.tych.settings.mask_layers) {
					// Compute the difference in width/height from the previous
					// layer, and add that to the current mask.
					if (ROW == lm.type)
						tp_tweak_mask(l, new_size.height - (prev.bounds[3].value - prev.bounds[1].value), lm.side);
					else
						tp_tweak_mask(l, new_size.width - (prev.bounds[2].value - prev.bounds[0].value), lm.side);
				}

				// We need to nudge the layer into the right position after
				// ridding the fuzzy edge. This translation cannot be baked
				// into the other since then the cropping wouldn't work for
				// layers that reside on edges of the canvas.
				switch (new_coords.a) {

					case AnchorPosition.TOPLEFT:
						l.translate(-1, -1);
						break;

					case AnchorPosition.TOPRIGHT:
						l.translate(1, -1);
						break;

					case AnchorPosition.BOTTOMLEFT:
						l.translate(-1, 1);
						break;
				}

				minx = Math.min(minx, l.bounds[0].value);
				miny = Math.min(miny, l.bounds[1].value);
			}
		}

		// Use the bounds of the last layer if it's smallar than the
		// pre-calculated size.
		tw = tych.settings.maintain_width
			? old_width
			: Math.min(doc.layerSets[0].layers[0].bounds[2].value, Math.floor(old_height / new_height * old_width));
		// XXX: How can this work now that rows can be added on top? Wouldn't
		// its bounds[3] value be way to small to fit everything? -No prob when adding columns.
		th = tych.settings.maintain_width
			? Math.min(doc.layerSets[0].layers[0].bounds[3].value, Math.floor(old_width / new_width * old_height))
			: old_height;

		doc.crop([minx, miny, minx + tw, miny + th]);

		// XXX: Did I have a good reason to add this second crop?
		// Remove any pixels that lie outside the canvas.
		//doc.crop([0, 0, doc.width, doc.height]);
	}

}


TychTransformations.prototype.get_new_position = function(doc, l, lm, i, j)
{
	var s, ref, x, y, w0, h0, a;

	w0 = l.bounds[2].value - l.bounds[0].value;
	h0 = l.bounds[3].value - l.bounds[1].value;
	a = AnchorPosition.TOPLEFT;

	s = doc.layerSets;

	// Init translation variables;
	x = 0;
	y = 0;

	// Get reference layer.
	ref = tp_get_layer_by_name(doc, lm.reference);

	if (ROW == lm.type) {

		if (ref != null) {

			// Is this layer on top of its reference layer?
			if (TOP == lm.side) {
				x = ref.parent.layers[ref.parent.layers.length - 1].bounds[0].value;
				y = ref.bounds[1].value - h0 - this.tych.settings.spacing;
				a = AnchorPosition.BOTTOMLEFT;
			} else if (BOTTOM == lm.side) {
			// Is this layer below its reference layer?
				x = ref.parent.layers[ref.parent.layers.length - 1].bounds[0].value;
				y = ref.bounds[3].value + this.tych.settings.spacing;
			}

		} else {

			// Just shove the remaining layers next to the layer that has a
			// reference.
			if (j < (s[i].layers.length - 1)) {
				x = s[i].layers[j + 1].bounds[2].value + this.tych.settings.spacing;
				y = s[i].layers[j + 1].bounds[1].value;
			} else {
				x = l.bounds[0].value;
				y = l.bounds[1].value;
			}
		}

	} else {

		if (ref != null) {

			// Is this layer to the left of its reference layer?
			if (LEFT == lm.side) {
				x = ref.bounds[0].value - w0 - this.tych.settings.spacing;
				y = ref.bounds[1].value;
				a = AnchorPosition.TOPRIGHT;
			} else if (RIGHT == lm.side) {
			// The layer is to the right of its reference layer.
				x = ref.bounds[2].value + this.tych.settings.spacing;
				y = ref.bounds[1].value;
				a = AnchorPosition.TOPLEFT;
			}
		} else {

			// Just shove the remaining layers next to the layer that has a
			// reference.
			if (j < (s[i].layers.length - 1)) {
				y = s[i].layers[j + 1].bounds[3].value + this.tych.settings.spacing;
				x = s[i].layers[j + 1].bounds[0].value;
			} else {
				x = l.bounds[0].value;
				y = l.bounds[1].value;
			}
		}
	}

	return { x: x, y: y, a: a };
}


TychTransformations.prototype.get_new_size = function(doc, l, lm, s1, rx, ry, i, j)
{
	var ld, cx, cy, w0, w1, h0, h1;

	// The absolute width every layer must decrease their width
	// in order to make the space the desired size.
	cx = cy = (this.tych.settings.spacing - this.tych.settings.spacing * s1);

	// The current size of the layer.
	w0 = s1 * (l.bounds[2].value - l.bounds[0].value);
	h0 = s1 * (l.bounds[3].value - l.bounds[1].value);

	// Test cases that fails.
	// 2b, 2t, 2r, 1t, 2l

	if (ROW == lm.type) {

		// Reset ry when beginning a new row.
		if ((s.layers.length - 1) == j)
			ry = 0;

		// The first layer in a row only needs to compensate
		// their width for the space on one side.
		if ((s.layers.length - 1) == j || (0 == j && !tp_column_right(s.layers[j], j)))
			cx = cx / 2;

		// Is it the only layer in the column, with nothing to its side?
		if (1 == s.layers.length && !tp_column_right(s.layers[j], j))
			cx = 0

		w1 = Math.round(w0 - cx - rx);

		// Is it the only row?
		if ((doc.layerSets.length - 1) == i && !tp_row_below(s.layers[j], j))
			cy = 0;
		// Is it the top row or the last row?
		else if ((doc.layerSets.length - 1) == i || !tp_row_below(s.layers[j], j))
			cy = cy / 2;

		h1 = Math.round(h0 - cy - ry);

		rx = cx + rx - (w0 - w1);
	} else {
	// Column layers.

		// Is it the leftmost column?
		if ((doc.layerSets.length - 1) == i) {
			cx = cx / 2;
			w1 = Math.round(w0 - cx - rx);
		// Is it the rightmost column?
		} else if (!tp_column_right(s.layers[j], j)) {
			cx = cx / 2;
			// Round up the last column to avoid having the
			// background shine through.
			w1 = Math.ceil(w0 - cx - rx);
		} else {
			w1 = Math.round(w0 - cx - rx);
		}

		// Is it the only layer in the column?
		if (1 == s.layers.length)
			cy = 0
		// Is it the the first or last layers of the column?
		else if (0 == j || (s.layers.length - 1) == j)
			cy = cy / 2;

		h1 = Math.round(h0 - cy - ry);

		ry = cy + ry - (h0 - h1);
	}

	return { width: w1, height: h1, rx: rx, ry: ry };
}
