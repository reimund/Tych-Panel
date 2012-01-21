//@include constants.jsx
//@include settings.jsx
//@include reorder.jsx
//@include artlayers.jsx
//@include helpers.jsx
//@include TychTransformations.jsx
//@include layerMaskLib.9.jsx


/*
 * Tych constructor.
 */
var Tych = function(settings)
{
	//this.tych_variant = NTYCH_HORIZONTAL;
	// Save current unit preferences.
	this.rulerUnits = preferences.rulerUnits;
	// Change unit preferences.
	preferences.rulerUnits = Units.PIXELS;

	// Save a reference to the current open document if there is one.
	// New layouts may be merged and composited into this document later.
	this.comp_target_doc = documents.length > 0 ? activeDocument : null;

	this.settings = settings;
	this.table = this.get_table();
}


/**
 * Select the images that should be part of this Tych.
 */
Tych.prototype.select = function()
{
	var images, thumbs;

	// Use bridge selection if there is one.
	if (this.settings.use_bridge_selection && BridgeTalk.isRunning('bridge')) {
		var bridge_selection = tp_get_bridge_selection();
		images = bridge_selection[0];
		thumbs = bridge_selection[1];
	}

	if (images == undefined || images.length < 1)
		images = File.openDialog("Choose file(s) to add to composite", undefined, true);

	if (images != undefined && images.length > 1 && this.settings.reorder)
		images = tp_reorder(images, thumbs);

	if (images == undefined || images.length < 1) {
		// No images were selected or the reorder window was dismissed. Revert
		// settings and stop the script.
		this.revert();
		return false;
	}


	// If the user opens a file that is already open we will have a document
	// collision problem. To solve it we duplicate the open, colliding document
	// to get a copy of it with a new name. We then close the original
	// document.
	for (i in images) {
		try {
			var docc = documents.getByName(images[i].name);
			this.comp_target_doc = docc.duplicate();
			docc.close(SaveOptions.DONOTSAVECHANGES);
		} catch (err) { }
	}

	this.images = images;
	return true;
}


Tych.prototype.revert = function()
{
	preferences.rulerUnits = this.rulerUnits;
}


/**
 * Stack the images of this Tych instance.
 */
Tych.prototype.stack = function()
{
	var tych, last, doc;

	tych = this;
	last = this.images.length - 1;
	doc = app.open(this.images[0]);

	f = function()
	{
		var d = doc;
		var maxx = doc.width;
		var maxy = doc.height;

		d.flatten();
		d.layers[0].isBackgroundLayer = false;

		if (tych.settings.convert_to_smart_objects)
			tp_make_smart_object();

		for (i = 0; i <= last; i++) {

			if (i > 0) {
				d = app.open(tych.images[i]);
				d.flatten();
				d.selection.selectAll();

				if (d.layers.length > 1)
					d.selection.copy(true);
				else
					d.selection.copy();

				maxx = Math.max(maxx, d.width);
				maxy = Math.max(maxy, d.height);
				d.close(SaveOptions.DONOTSAVECHANGES);
				activeDocument = doc;
				doc.paste();
				doc.layers[0].translate(-doc.layers[0].bounds[0].value, -doc.layers[0].bounds[1].value);

				if (tych.settings.convert_to_smart_objects)
					tp_make_smart_object();
			}

		}
		doc.resizeCanvas(maxx, maxy, AnchorPosition.TOPLEFT);

		// If mask option is enabled, add a layer mask to each layer.
		if (tych.settings.mask_layers)
			for (i = 0; i < doc.layers.length; i++)
				tp_mask(doc.layers[i]);
	}

	doc.suspendHistory('Stack images', 'f()');

	this.doc = doc;
	this.n = doc.layers.length;
	this.trans = new TychTransformations(this);
}


// XXX: I should remove this method and instead use the same method for both
// templates and ntychs. If the active document already has layers laid out,
// the templates should add them just like New row and New column (if enabled
// in the gui).
Tych.prototype.create = function(tych_variant)
{
	this.tych_variant = tych_variant;

	if (documents.length < 1) {
		this.select();
		var required = this.validate_input(tych_variant, this.images.length);

		if (required > this.images.length) {
			alert('This action requires that you select ' + required + ' images. Please try again.');
			this.revert();
			return -1;
		}

		// Stack it up.
		this.stack();
	} else {
		var d = activeDocument;
		var required = -1;
		var required = this.validate_input(tych_variant, d.layers.length);

		// Check if this is a tych that's already been laid out once.
		if (d.layers.length == required + 1) {
			this.finish();
			return;
		}

		// Ugly workaround for Windows bug. If we use the original document
		// weird things start to happen for no apparent reason. So we use a
		// duplicate instead.
		this.doc = d.duplicate();
		this.comp_target_doc = null;
		d.close(SaveOptions.DONOTSAVECHANGES);

		if (required > this.doc.layers.length) {
			alert('This action requires ' + required + ' layers. Stack some more layers then try again.');
			this.revert();
			return -1;
		}
	}

	// Compute transformations (prepare for layout).
	this.trans.compute(tych_variant);


	// Layout the selected images.
	this.layout();

	// Save, close etc.
	this.finish();
}


Tych.prototype.validate_input = function(tych_variant, number)
{
	var required = -1;

	if (tych_variant < 3)
		required = 2;
	else if (tych_variant > 2 && tych_variant < 6)
		required = 3;
	else
		required = 4;

	return required;
}


Tych.prototype.finish = function()
{
	// Make a reference to the document that should be saved.
	this.save_doc = this.comp_target_doc == null ? this.doc : this.comp_target_doc;

	// Unlink all layer masks.
	this.link(false);
	
	if (this.save_doc.layers[this.save_doc.layers.length - 1].name == 'Background')
		tp_fill_background(this.save_doc, WHITE);
	else 
		tp_add_background(this.save_doc, WHITE);

	if (this.settings.autosave)
		this.save(this.save_doc);
	
	if (this.settings.autoclose)
		this.save_doc.close(SaveOptions.DONOTSAVECHANGES);

	// Revert settings.
	this.revert();
}


Tych.prototype.link = function(link)
{
	var doc, f;

	doc = this.comp_target_doc == null ? this.doc : this.comp_target_doc;
	activeDocument = doc;

	f = function()
	{
		if (doc.layerSets.length > 0) {
			for (var i = 0; i < doc.layerSets.length; i++) {
				for (var j = 0; j < doc.layerSets[i].layers.length; j++) {
					doc.activeLayer = doc.layerSets[i].layers[j];
					layerMask.link(link);
				}
			}
		} else {
			for (var i = 0; i < doc.layers.length; i++) {
				doc.activeLayer = doc.layers[i];
				layerMask.link(link);
			}
		}
	}

	link ? doc.suspendHistory('Link layer masks', 'f()') :  doc.suspendHistory('Unlink layer masks', 'f()');
}


Tych.prototype.layout_and_composite = function(tych_variant)
{
	var thiss, g;

	this.tych_variant = tych_variant;

	// Select the images to layout.
	if (!this.select()) {
		// Abort if no images are selected.
		this.revert();
		return;
	}
	
	// Stack it up.
	this.stack();

	thiss = this;
	g = function()
	{
		// Compute transformations (prepare for layout).
		thiss.trans.compute(tych_variant);
		
		// Layout the selected images according to the transformations just
		// computed.
		thiss.layout();
		// If this is the first Tych do the bookkeeping now.
		if (thiss.comp_target_doc == null && thiss.table.total == 0)
			thiss.bookkeep();


		thiss.link(true);

		// Composite the result.
		if (thiss.settings.composite && thiss.comp_target_doc != null)
			if (tych_variant == NTYCH_VERTICAL)
				thiss.composite(thiss.doc, thiss.comp_target_doc, { side: RIGHT });
			else
				thiss.composite(thiss.doc, thiss.comp_target_doc, { side: BOTTOM });

		//// Save, close etc.
		thiss.finish();
	}

	this.doc.suspendHistory('Make ntych', 'g()');
}


/**
 * Places the contents of one document at the bottom of another.
 */
Tych.prototype.composite = function(src, target, options)
{
	var i,
		placement,
		src_width,
		src_height,
		target_width,
		target_height,
		layer_set,
		layers_to_move,
		inserted_set;

	// Store away the width & height of the source document before we close it.
	src_width = src.width;
	src_height = src.height;

	// Store away the width & height of the target document before we resize the canvas.
	target_width = target.width.value;
	target_height = target.height.value;

	activeDocument = target;

	var thiss = this;
	var f = function()
	{

		if (target.layerSets.length == 0) {
			layers_to_move = [];
			for (i = target.layers.length - 2; i >= 0; i--)
				layers_to_move.push(target.layers[i]);

			layer_set = target.layerSets.add();
			// XXX: What to do if only one layer?
			if (layers_to_move.length == 1 || layers_to_move[0].bounds[1].value == layers_to_move[1].bounds[1].value)
				layer_set.name = 'Row 1';
			else if (thiss.tych_variant == NTYCH_VERTICAL)
				layer_set.name = 'Column 1';
			else
				layer_set.name = 'Comp 1';

			thiss.move_into_set(layers_to_move, layer_set);
		}


		inserted_set = target.layerSets.add();

		if (thiss.tych_variant == NTYCH_HORIZONTAL)
			inserted_set.name = 'Row ' + target.layerSets.length;
		else if (thiss.tych_variant == NTYCH_VERTICAL)
			inserted_set.name = 'Column ' + target.layerSets.length;
		else
			inserted_set.name = 'Comp ' + target.layerSets.length;

		target.activeLayer = inserted_set;

		// Unlock the background (if locked) so we can put a background fill below.
		target.layers[target.layers.length - 1].isBackgroundLayer = false;

		for (i = src.layers.length - 1; i >= 0; i--)
			thiss.copy_layer_to_document(src.layers[i], target);

		//return;

		layers_to_move = [];
		for (i = src.layers.length - 1; i >= 0; i--)
			layers_to_move.push(target.layers[i]);

		thiss.move_into_set(layers_to_move, inserted_set);

		thiss.bookkeep();

		src.close(SaveOptions.DONOTSAVECHANGES);
		activeDocument = target;

		if (options.side == BOTTOM) {
			offset_x = 0;
			offset_y = target.height + thiss.settings.spacing;
			new_width = target.width.value;
			new_height = target.height.value + src_height + thiss.settings.spacing;
		} else if (options.side == RIGHT) {
			offset_x = target.width.value - target.activeLayer.bounds[0].value + thiss.settings.spacing;
			offset_y = 0;
			new_width = target.width.value + src_width + thiss.settings.spacing;
			new_height = target.height.value;
		}

		inserted_set.translate(offset_x, offset_y);

		// Make the document bigger so the inserted layers can be seen.
		target.resizeCanvas(new_width, new_height, AnchorPosition.TOPLEFT);

		thiss.readjust_for_size(target, target_width, target_height);
	}

	target.suspendHistory('Composite ntych', 'f()');
}


/**
 * Readjusts layer positions and sizes to accomodate for when width or height
 * is maintained.
 */
Tych.prototype.readjust_for_size = function(doc, target_width, target_height)
{
	var s1, cx, cy, rx, ry, w0, w1, h0, h1, x, y, ins;

	// The resize factor to scale everything, including
	// spacings, to fit the width.
	if (this.settings.maintain_width) 
		s1 = (target_width / doc.width * target_height) / doc.height;
	else if (this.settings.maintain_height)
		s1 = (target_height / doc.height * target_width) / doc.width;

	// Remainder.
	rx = 0
	ry = 0

	// Maintain width & height.
	// Here be dragons.
	if ((this.settings.maintain_width && this.tych_variant != NTYCH_HORIZONTAL)
			|| (this.settings.maintain_height && this.tych_variant != NTYCH_VERTICAL)) {
		for (i = doc.layerSets.length - 1; i >= 0; i--) {
			s = doc.layerSets[i];

			for (j = s.layers.length - 1; j >= 0; j--) {
				l = s.layers[j];

				doc.activeLayer = l;
				w0 = s1 * (l.bounds[2].value - l.bounds[0].value);
				h0 = s1 * (l.bounds[3].value - l.bounds[1].value);

				if (this.settings.mask_layers)
					layerMask.remove(false);

				// The absolute width every layer must decrease their width
				// in order to make the space the desired size.
				cx = cy = (this.settings.spacing - this.settings.spacing * s1);

				if (l.parent.name.substring(0, 3) == 'Row') {

					// Reset ry when beginning a new row.
					if (j == (s.layers.length - 1))
						ry = 0;

					// The first layer in a row only needs to compensate
					// their width for the space on one side.
					if (j == (s.layers.length - 1) || (j == 0 && !tp_column_right(s.layers[j], j)))
						cx = cx / 2;

					// Is it the only layer in the column, with nothing to its side?
					if (s.layers.length == 1 && !tp_column_right(s.layers[j], j))
						cx = 0

					w1 = Math.round(w0 - cx - rx);


					// Is it the only row?
					if (i == (doc.layerSets.length - 1) && !tp_row_below(s.layers[j], j))
						cy = 0;
					// Is it the top row or the last row?
					else if (i == (doc.layerSets.length - 1) || !tp_row_below(s.layers[j], j))
						cy = cy / 2;

					h1 = Math.round(h0 - cy - ry);

					rx = cx + rx - (w0 - w1);
				} else {
				// Column layers.

					// Is it the leftmost column?
					if (i == (doc.layerSets.length - 1)) {
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
					if (s.layers.length == 1)
						cy = 0
					// Is it the the first or last layers of the column?
					else if (j == 0 || j == (s.layers.length - 1))
						cy = cy / 2;

					h1 = Math.round(h0 - cy - ry);

					ry = cy + ry - (h0 - h1);
				}

				x = 0;	
				y = 0;	

				// Compute positions.
				if (this.table.layers[l.name].type == 'row') {
					if (j < (s.layers.length - 1))
						x = s.layers[j + 1].bounds[2].value + this.settings.spacing;


					if (i < (doc.layerSets.length - 1)) {
						ins = doc.layerSets[i + 1].artLayers.getByName(this.table.layers[l.name].inserted_at);
						y = ins.bounds[3].value + this.settings.spacing;
					}
				} else {
					if (i < (doc.layerSets.length - 1)) {
						ins = doc.layerSets[i + 1].artLayers.getByName(this.table.layers[l.name].inserted_at);
						x = ins.bounds[2].value + this.settings.spacing;
					}

					if (j < (s.layers.length - 1))
						y = s.layers[j + 1].bounds[3].value + this.settings.spacing;
				}

				l.translate(-l.bounds[0].value + x, -l.bounds[1].value + y);

				// If the calculated dimensions of the last layer exceeds
				// the desired size, reduce the amount.
				if (ins && j == 0) {
					if (this.table.layers[l.name].type == 'row')
						w1 -= l.bounds[0].value + w1 - ins.bounds[2].value;
					else
						h1 -= l.bounds[1].value + h1 - ins.bounds[3].value;
				}

				// Enlarge 1px in all directions to rid fuzzy edge.
				l.resize(
					(w1 + 2) / (l.bounds[2].value - l.bounds[0].value) * 100,
					(h1 + 2)/ (l.bounds[3].value - l.bounds[1].value) * 100,
					AnchorPosition.TOPLEFT
				);

				// Crop layer to the desired size and take away an extra single
				// pixel border around the layer to make it perfectly crisp
				// without any fuzzy edges.
				l.crop(w1, h1, AnchorPosition.MIDDLECENTER, this.settings.mask_layers);
				// We need to nudge the layer into the right position after
				// ridding the fuzzy edge. This translation cannot be baked
				// into the other since then the cropping wouldn't work for
				// layers that reside on edges of the canvas.
				l.translate(-1, -1);
			}
		}

		// Use the bounds of the last layer if it's smallar than the
		// pre-calculated size.
		tw = this.settings.maintain_width
			? target_width
			: Math.min(doc.layerSets[0].layers[0].bounds[2].value, target_height / new_height * target_width);
		th = this.settings.maintain_width
			? Math.min(doc.layerSets[0].layers[0].bounds[3].value, target_width / new_width * target_height)
			: target_height;

		doc.resizeCanvas(tw, th, AnchorPosition.TOPLEFT);

		// Remove any pixels that lie outside the canvas.
		doc.crop([0, 0, doc.width, doc.height]);
	}

}


// Do some bookkeeping.
// XXX: I can prolly throw this out entirely.
Tych.prototype.bookkeep = function()
{
	var s, l, layers, insertion_point;

	s = activeDocument.layerSets;
	insertion_point = null;

	// If layer sets exist, the current layers being bookkept have just been
	// composited. Otherwise, it's the first ntych inserted.
	if (s.length > 0)
		layers = s[0].layers;
	else
		layers = activeDocument.layers;

	for (var i = 0; i < layers.length; i++) {
		l = layers[i];
		
		// An insertion point only exists if the layers are composited.
		if (s.length > 0)
			insertion_point = s[1].layers[0].name;

		this.table.layers[l.name] = {
			type: this.tych_variant == NTYCH_HORIZONTAL ? 'row' : 'column',
			inserted_at: insertion_point
		};
		this.table.total += 1;

	}

	this.save_table();
}


/**
 * Saves the specified document according to the output options set in the
 * options dialog. If any of the files already exist the sequence number will
 * be incremented.
 *
 * For example: Assume that the options are set to output both jpg and psd
 * files with the file name set to "image". If the file image_001.jpg already
 * exists, then the files will be saved to image_002.jpg and image_002.psd so
 * that nothing is overwritten.
 */
Tych.prototype.save = function()
{
	var basename = this.settings.filename + '_';
	var padding = '001';
	var collision;
	var file;

	while(true) {
		collision = false;
		for (format in this.settings.output_formats) {
			file = new File(this.settings.save_directory + '/' + basename + padding + '.' + format);
			if (file.exists) {
				collision = true;
				break;
			}
		}
		// Increase the sequential number by 1 if there is a file name collision.
		if (collision)
			padding = tp_zero_pad(Number(padding) + 1, 3);
		else
			break;
	}

	var options = {
		'jpg': this.get_jpeg_save_options(),
		'psd': this.get_psd_save_options()
	};

	for (format in this.settings.output_formats)
		if (this.settings.output_formats[format])
			this.save_doc.saveAs(
				new File(this.settings.save_directory + '/' + basename + padding),
				options[format], true, Extension.LOWERCASE);
}



/**
 * Makes an horizontal n-tych by spacing out the layers in the specified
 * document.
 */
Tych.prototype.layout = function()
{
	this.trans.apply();

	// Get rid of outside pixels;
	//this.save_doc = this.comp_target_doc == null ? this.doc : this.comp_target_doc;
	this.doc.crop([0, 0, this.doc.width, this.doc.height]);
}


Tych.prototype.get_jpeg_save_options = function()
{
	options = new JPEGSaveOptions();
	options.embedColorProfile = true;
	options.formatOptions = FormatOptions.STANDARDBASELINE;
	options.matte = MatteType.NONE;
	options.quality = this.settings.jpeg_quality;
	return options;
}


Tych.prototype.get_psd_save_options = function()
{
	options = new PhotoshopSaveOptions();
	options.layers = true;
	options.embedColorProfile = true;
	options.annotations = true;
	options.alphaChannels = true;
	options.spotColors = true;
	return options;
}


Tych.prototype.move_into_set = function(layers, set)
{
	activeDocument = layers[0].parent;
	for (i = 0; i < layers.length; i++)
		layers[i].move(set, ElementPlacement.INSIDE);
}


/**
 * Copies the specified layer to the bottom of the layer stack of the given
 * document.
 */
Tych.prototype.copy_layer_to_document = function(layer, target)
{
	activeDocument = layer.parent;
	var temp = layer.parent.activeLayer;
	layer.parent.activeLayer = layer;

	for (i = 0; i < documents.length; i++) {
		if (documents[i] == target)
			target_index = i;

		if (documents[i] == activeDocument)
			active_index = i;
	}

	// We must iterate through the document stack in order to copy the layer to
	// a specific document. It works by copying it one document at a time until
	// it's in the right document.
	for (i = active_index; i >= target_index; i--) {

		this.copy_layer_to_previous_document();

		if (i != active_index)
			// Remove when not the in target
			documents[i].activeLayer.remove();

		if (i - 1 == target_index) break;

		activeDocument = documents[i - 1];

	}
	activeDocument = layer.parent;
	layer.parent.activeLayer = temp;
}


/**
 * Copies the active layer of the active document to the document beneath it
 * in the document stack.
 */
Tych.prototype.copy_layer_to_previous_document = function()
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
 * Get the lookup table for past transformations. Needed when we need to
 * reposition previously laid out images.
 */
Tych.prototype.get_table = function()
{
	var table, store;

	store = new Settings();
	store.setUID("TychPanelTransformationTable");
	store.setMSG("TychPanelTable");
	store.setType(SettingsType.SINGLE);
	store.loadSettings();

	this.table_store = store;

	table = {
		layers: {},
		total: 0
	}

	// Only use the saved table if we're going to composite!
	if (store.numEntries() > 0
			&& this.settings.composite
			&& this.comp_target_doc != null)
		table = store.getEntryAt(0);

	return table;
}


Tych.prototype.save_table = function()
{
	this.table_store.addEntry('transformation_table', this.table);
	this.table_store.saveSettings();
}


var t = new Tych(tp_get_settings());
//t.create(QUAPTYCH_GRID);
//t.create(TRIPTYCH_PORTRAIT_LANDSCAPE_GRID);
//t.create(TRIPTYCH_LANDSCAPE_PORTRAIT_GRID);
//t.create(QUAPTYCH_GRID);
//t.layout_and_composite(NTYCH_HORIZONTAL);
//t.layout_and_composite(NTYCH_VERTICAL);
//t.test_copy();

