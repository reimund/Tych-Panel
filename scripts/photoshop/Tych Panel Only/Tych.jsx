//@include constants.jsx
//@include settings.jsx
//@include reorder.jsx
//@include artlayers.jsx
//@include layersets.jsx
//@include layerMaskLib.9.jsx
//@include helpers.jsx
//@include TychTransformations.jsx


/*
 * Tych constructor.
 */
var Tych = function(settings)
{
	// Save the user's ruler unit and export clipboard preference.
	this.ruler_units = preferences.rulerUnits;
	this.export_clipboard = preferences.exportClipboard;

	// Temporary set preferences while Tych Panel works its magic.
	preferences.rulerUnits = Units.PIXELS;
	preferences.exportClipboard = false;

	this.comp_doc = null;

	// Save a reference to the current open document if there is one.
	// New layouts may be merged and composited into this document later.
	if (settings.composite && documents.length > 0)
		this.comp_doc = activeDocument;

	this.settings = settings;
	this.table = this.get_table();
}

/**
 * Select the images that should be part of this Tych.
 */
Tych.prototype.select = function()
{
	var images, thumbs, docc, dup, selectNormally;

	if ((this.settings.use_bridge_selection || called_from_bridge) && BridgeTalk.isRunning('bridge')) {
		var bridge_selection = tp_get_bridge_selection();
		images = bridge_selection[0];
		thumbs = bridge_selection[1];
	}

	selectNormally = true;

	try
	{
		if (undefined !== selectedFiles)
		{
			for (var i = 0; i < selectedFiles.length; i++)
				selectedFiles[i] = new File(selectedFiles[i]);

			images = selectedFiles;
			selectNormally = false;
		}
	}
	catch(err) {}

	if (selectNormally && (undefined == images || images.length < 1))
		images = File.openDialog("Choose file(s) to add to composite", undefined, true);

	if (undefined != images && 1 < images.length && this.settings.reorder)
		images = tp_reorder(images, thumbs);

	if (undefined == images || images.length < 1) {
		// No images were selected or the reorder window was dismissed. Revert
		// settings and stop the script.
		this.revert();
		return false;
	}

	this.images = images;
	return true;
}

/**
 * Workarounds problem with having multiple documents with the same name.
 */
Tych.prototype.avoid_document_collisions = function()
{
	// Always duplicate target document if we're on Windows, in order to
	// workaround a nasty, unknown bug in Photoshop for Windows.
	if (app.path.fsName.toString().substr(0, 1) != '/') {
		try {
			docc = this.comp_doc;
			dup = docc.duplicate();

			if (this.settings.composite)
				this.comp_doc = dup;
			docc.close(SaveOptions.DONOTSAVECHANGES);
		} catch (err) { }
	} else {
		// On Mac OSX, we only need to duplicate if a collision exists.
		//
		// If the user opens a file that is already open we will have a document
		// collision problem. To solve it we duplicate the open, colliding document
		// to get a copy of it with a new name. We then close the original
		// document.
		for (i in this.images) {
			try {
				docc = documents.getByName(this.images[i].name.replace('%20', ' ', 'g'));
				dup = docc.duplicate();

				if (this.settings.composite)
					this.comp_doc = dup;
				docc.close(SaveOptions.DONOTSAVECHANGES);
			} catch (err) { }
		}
	}
}


/**
 * Reverts to the preferences the user had before execution.
 */
Tych.prototype.revert = function()
{
	preferences.rulerUnits = this.ruler_units;
	preferences.exportClipboard = this.export_clipboard;
}

/**
 * Stack the images of this Tych instance.
 */
Tych.prototype.stack = function()
{
	var thiss, last, doc, i;

	thiss = this;
	last = this.images.length - 1;

	docs = tp_safe_open(thiss.images[0]);
	doc = docs.opened;
	doc.changeMode(ChangeMode.RGB);

	f = function()
	{
		var d = doc;
		var maxx = doc.width;
		var maxy = doc.height;

		tp_flatten(d);

		thiss.apply_actions(d, 'Before layout');
		d.layers[0].isBackgroundLayer = false;

		if (thiss.settings.convert_to_smart_objects)
			tp_make_smart_object();

		for (i = 0; i <= last; i++) {

			if (i > 0) {
				docs = tp_safe_open(thiss.images[i]);
				d = docs.opened;
				if (null != docs.duplicate)
					doc = docs.duplicate;

				tp_flatten(d);
				thiss.apply_actions(d, 'Before layout');
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

				if (thiss.settings.convert_to_smart_objects)
					tp_make_smart_object();
			}

		}
		doc.resizeCanvas(maxx, maxy, AnchorPosition.TOPLEFT);

		// If mask option is enabled, add a layer mask to each layer.
		if (thiss.settings.mask_layers)
			for (i = 0; i < doc.layers.length; i++)
				tp_mask(doc.layers[i]);
	}

	doc.suspendHistory('Stack images', 'f()');

	this.doc = doc;
	this.n = doc.layers.length;
	this.trans = new TychTransformations(this);
}

Tych.prototype.finish = function()
{
	var bg_color;

	bg_color = new SolidColor();
	bg_color.rgb.hexValue = this.settings.background_color.substr(1);

	// Make a reference to the document that should be saved.
	this.save_doc = null == this.comp_doc ? this.doc : this.comp_doc;

	// Unlink all layer masks.
	this.link(false);

	if ('Background' == this.save_doc.layers[this.save_doc.layers.length - 1].name)
		tp_fill_background(this.save_doc, bg_color);
	else 
		tp_add_background(this.save_doc, bg_color);

	// Apply actions.
	this.apply_actions(this.save_doc, 'After layout');

	this.add_rounded_corners();
	this.add_border();

	if (this.settings.autosave)
		this.save(this.save_doc);
	
	if (this.settings.autoclose && this.settings.autosave)
		this.save_doc.close(SaveOptions.DONOTSAVECHANGES);

	// Revert settings.
	this.revert();
}

Tych.prototype.link = function(link)
{
	var doc, f;

	doc = null == this.comp_doc ? this.doc : this.comp_doc;
	activeDocument = doc;

	f = function()
	{
		for (var i = 0; i < doc.layerSets.length; i++) {
			for (var j = 0; j < doc.layerSets[i].layers.length; j++) {
				doc.activeLayer = doc.layerSets[i].layers[j];
				layerMask.link(link);
			}
		}
	}

	link ? doc.suspendHistory('Link layer masks', 'f()') :  doc.suspendHistory('Unlink layer masks', 'f()');
}

/**
 * Lays out and composites the specified images. If no images are specified, it
 * will open a file dialog and let the user pick images.
 */
Tych.prototype.layout_and_composite = function(alignment, side, images)
{
	var thiss, doc, f;

	this.alignment = alignment;

	if (null == images || 0 == images.length) {
		// No images were specified, let the user pick images from the gui instead.
		if (!this.select())
			return;
	} else {
		if (this.settings.reorder && 1 < images.length) {
			images = tp_reorder(images, null);

			if (undefined == images || images.length < 1) {
				// The reorder window was dismissed. Revert settings and stop
				// the script.
				this.revert();
				return;
			}
		}

		this.images = images;
	}

	this.avoid_document_collisions();
	
	// Stack it up.
	this.stack();

	thiss = this;
	f = function()
	{
		// Compute transformations (prepare for layout).
		thiss.trans.compute(alignment);
		
		// Layout the selected images according to the transformations just
		// computed.
		thiss.layout();
		// If this is the first Tych do the bookkeeping now.
		if (null == thiss.comp_doc && 0 == thiss.table.total)
			thiss.bookkeep(side);

		thiss.link(true);

		// Composite the result.
		if (thiss.settings.composite && thiss.comp_doc != null) {
			// Remove border.
			if ('Border' == thiss.comp_doc.layers[0].name) {
				thiss.comp_doc.layers[0].remove();

				thiss.comp_doc.crop([
					thiss.table.border[3],
					thiss.table.border[0],
					thiss.comp_doc.width.value - thiss.table.border[1],
					thiss.comp_doc.height.value - thiss.table.border[2]
				]);
			}

			// Remove possible left over masks.
			thiss.clear_rounded_corner_masks();
			thiss.composite(thiss.doc, thiss.comp_doc, side);
		}

		// Save, close etc.
		thiss.finish();
	}

	if (null != this.settings.composite && this.comp_doc)
		doc = this.comp_doc;
	else
		doc = this.doc;

	doc.suspendHistory('New ' + tp_const_string(this.alignment) + ' (' + tp_const_string(side) + ')' , 'f()');
}

/**
 * Places the contents of one document at the bottom of another.
 */
Tych.prototype.composite = function(src, target, side)
{
	var i, placement, src_width, src_height, old_width, old_height, new_width,
		new_height, anchor_position;
	
	// Store away the width & height of the source document before we close it.
	src_width = src.width;
	src_height = src.height;

	// Store away the width & height of the target document before we resize the canvas.
	old_width = target.width.value;
	old_height = target.height.value;

	activeDocument = target;
	anchor_position = AnchorPosition.TOPLEFT

	// Unlock the background (if locked) so we can put a background fill below.
	target.layers[target.layers.length - 1].isBackgroundLayer = false;

	// Set the top layer as active so that the set gets inserted at the top.
	target.activeLayer = target.layers[0];

	// Copy the set into the target document.
	copy_layer_to_document(src.layers[0], target);

	src.close(SaveOptions.DONOTSAVECHANGES);
	activeDocument = target;

	// Rename the inserted set so the sequence number makes sense in the
	// composited document.
	target.layers[0].name = ROW == this.alignment
		? 'Row ' + target.layerSets.length
		: 'Column ' + target.layerSets.length;

	this.bookkeep(side);

	if (BOTTOM == side || TOP == side) {
		offset_x = 0;
		offset_y = target.height + this.settings.spacing;

		if (TOP == side) {
			offset_y = -src_height - this.settings.spacing;
			anchor_position = AnchorPosition.BOTTOMLEFT;
		}

		new_width = target.width.value;
		new_height = target.height.value + src_height + this.settings.spacing;
	} else if (RIGHT == side || LEFT == side) {
		offset_x = target.width.value - target.layers[0].bounds[0].value + this.settings.spacing;
		offset_y = 0;

		if (LEFT == side) {
			offset_x = -src_width - this.settings.spacing;
			anchor_position = AnchorPosition.TOPRIGHT;
		}

		new_width = target.width.value + src_width + this.settings.spacing;
		new_height = target.height.value;
	}
	target.layers[0].translate(offset_x, offset_y);

	// Make the document bigger so the inserted layers can be seen.
	target.resizeCanvas(new_width, new_height, anchor_position);

	if (this.settings.maintain_width || this.settings.maintain_height)
		this.trans.readjust(this, target, old_width, old_height, new_width, new_height);
}

/**
 * Do some bookkeeping for the latest added ntych.
 */
Tych.prototype.bookkeep = function(side)
{
	var s, l, i, layers, type, ref, images;

	s = activeDocument.layerSets;
	layers = s[0].layers;
	images = [];

	type = this.alignment;

	for (i = 0; i < layers.length; i++) {
		l = layers[i];

		ref = null;
		
		if ((layers.length - 1) == i) {
			switch (side) {
				case TOP:
					ref = this.table.references.top_left;
					break;

				case BOTTOM:
					ref = this.table.references.bottom_left;
					break;

				case LEFT:
					ref = this.table.references.top_left;
					break;

				case RIGHT:
					ref = this.table.references.top_right;
			}
		}

		this.table.layers[l.name] = {
			type: type,
			side: side,
			count: layers.length,
			reference: ref
		};
		this.table.total += 1;
	}

	for (i in this.images)
		images.push(this.images[i].displayName);
	this.table.images.push(images); 

	// Store the the names of the layers that are interesting references for
	// coming ntychs.
	switch (side) {
		case TOP:
			this.table.references.top_left = layers[layers.length - 1].name;
			this.table.references.top_right = layers[0].name;

			// The first tych will cover all reference points.
			if (1 == s.length) {
				this.table.references.bottom_left = layers[layers.length - 1].name;
				this.table.references.bottom_right = layers[0].name;
			}
			break;

		case BOTTOM:
			this.table.references.bottom_left = layers[layers.length - 1].name;
			this.table.references.bottom_right = layers[0].name;

			// The first tych will cover all reference points.
			if (1 == s.length) {
				this.table.references.top_left = layers[layers.length - 1].name;
				this.table.references.top_right = layers[0].name;
			}
			break;

		case LEFT:
			this.table.references.top_left = layers[layers.length - 1].name;
			this.table.references.bottom_left = layers[0].name;

			// The first tych will cover all reference points.
			if (1 == s.length) {
				this.table.references.top_right = layers[layers.length - 1].name;
				this.table.references.bottom_right = layers[0].name;
			}
			break;

		case RIGHT:
			this.table.references.top_right = layers[layers.length - 1].name;
			this.table.references.bottom_right = layers[0].name;

			// The first tych will cover all reference points.
			if (1 == s.length) {
				this.table.references.top_left = layers[layers.length - 1].name;
				this.table.references.bottom_left = layers[0].name;
			}
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
	var options, basename, save_path, layers, tmp;

	options = {
		'jpg': this.get_jpeg_save_options(),
		'psd': this.get_psd_save_options(),
		'png': this.get_png_save_options()
	};

	if (!new File(this.settings.save_directory).exists) {
		alert('Document could not be saved.\n\nThe specified output directory does not exist. Please choose another directory.');
		return false;
	}

	if (this.settings.save_each_layer) {

		for (var i = 0; i < this.save_doc.layerSets.length; i++) {
			layers = this.save_doc.layerSets[i].layers;

			for (var j = layers.length - 1; j >= 0; j--) {

				if (this.settings.derive_filename)
					// Get the basename of the file that corresponds to the current layer.
					basename = tp_get_basename(this.table.images[this.save_doc.layerSets.length - i - 1][layers.length - j - 1]);
				else
					basename = this.settings.filename;

				save_path = tp_next_filename(
					this.settings.save_directory,
					basename.substr(0, 254), // Only allow file names of at max 255 characters.
					this.settings.output_formats,
					!this.settings.derive_filename
				);
				for (format in this.settings.output_formats)
					if (this.settings.output_formats[format])
						save_layer(layers[j], save_path, options[format]);
			}

		}

	} else {
		
		if (this.settings.derive_filename)
			basename = tp_combine_filenames(this.table.images);
		else
			basename = this.settings.filename;

		save_path = tp_next_filename(
			this.settings.save_directory,
			basename.substr(0, 254), // Only allow file names of at max 255 characters.
			this.settings.output_formats,
			!this.settings.derive_filename
		);

		for (format in this.settings.output_formats)
			if (this.settings.output_formats[format])
				this.save_doc.saveAs(new File(save_path), options[format], true, Extension.LOWERCASE);
	}
}

/**
 * Makes an n-tych by spacing out the layers in the specified document.
 */
Tych.prototype.layout = function()
{
	var layers, set, thiss, f;

	thiss = this;

	f = function()
	{
		thiss.trans.apply();

		// Get rid of outside pixels;
		thiss.doc.crop([0, 0, thiss.doc.width, thiss.doc.height]);
		
		layers = [];
		set = thiss.doc.layerSets.add();

		// Put the tych into a set.
		for (var i = thiss.doc.layers.length - 1; i > 0; i--)
			thiss.doc.layers[i].move(set, ElementPlacement.INSIDE);

		if (ROW == thiss.alignment || 1 == layers.length)
			set.name = 'Row 1';
		else 
			set.name = 'Column 1';
	}

	this.doc.suspendHistory('Layout images', 'f()');
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

Tych.prototype.get_png_save_options = function()
{
	options = new PNGSaveOptions();
	options.interlaced = false;
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

Tych.prototype.add_rounded_corners = function()
{
	var doc, f, thiss;

	doc = null == this.comp_doc ? this.doc : this.comp_doc;
	thiss = this;

	if (this.settings.corner_radius[0] <= 0
			&& this.settings.corner_radius[1] <= 0
			&& this.settings.corner_radius[2] <= 0
			&& this.settings.corner_radius[3] <= 0)
		return;

	f = function()
	{
		if (thiss.settings.round_all_layers) {
			for (var i = 0; i < doc.layerSets.length; i++)
				for (var j = 0; j < doc.layerSets[i].layers.length; j++)
					round_corners(doc.layerSets[i].layers[j], thiss.settings.corner_radius);
		} else {
			
			c = {};
			tl = thiss.table.references.top_left;
			tr = thiss.table.references.top_right;
			br = thiss.table.references.bottom_right;
			bl = thiss.table.references.bottom_left;

			c[tl] = [thiss.settings.corner_radius[0], 0, 0, 0];

			if (undefined == c[tr])
				c[tr] = [0, thiss.settings.corner_radius[1], 0, 0];
			else
				c[tr][1] = thiss.settings.corner_radius[1];

			if (undefined == c[br])
				c[br] = [0, 0, thiss.settings.corner_radius[2], 0];
			else
				c[br][2] = thiss.settings.corner_radius[2];
				
			if (undefined == c[bl])
				c[bl] = [0, 0, 0, thiss.settings.corner_radius[3]];
			else
				c[bl][3] = thiss.settings.corner_radius[3];

			// Top left corner.
			if (thiss.settings.corner_radius[0] > 0)
				round_corners(
					tp_get_layer_by_name(doc, tl),
					c[tl]
				);

			// Top right corner.
			if (thiss.settings.corner_radius[1] > 0)
				round_corners(
					tp_get_layer_by_name(doc, tr),
					c[tr]
				);

			// Bottom right corner.
			if (thiss.settings.corner_radius[2] > 0)
				round_corners(
					tp_get_layer_by_name(doc, br),
					c[br]
				);

			// Bottom left corner.
			if (thiss.settings.corner_radius[3] > 0)
				round_corners(
					tp_get_layer_by_name(doc, bl),
					c[bl]
				);

		}
	}

	doc.suspendHistory('Round corners', 'f()');
}

Tych.prototype.add_border = function()
{
	var doc_size, border, border_layer, color, f, thiss;

	doc_size = [this.save_doc.width.value, this.save_doc.height.value];
	border = this.settings.border;
	thiss = this;

	f = function()
	{
		if (border[0] <= 0
				&& border[1] <= 0
				&& border[2] <= 0
				&& border[3] <= 0)
			return;
		
		// Make room for top border.
		if (border[0] > 0)
			thiss.save_doc.resizeCanvas(
				doc_size[0], doc_size[1] + border[0],
				AnchorPosition.BOTTOMLEFT
			);

		// Make room for right border.
		if (border[1] > 0)
			thiss.save_doc.resizeCanvas(
				doc_size[0] + border[1], doc_size[1] + border[0],
				AnchorPosition.BOTTOMLEFT
			);

		// Make room for bottom border.
		if (border[2] > 0)
			thiss.save_doc.resizeCanvas(
				doc_size[0] + border[1],
				doc_size[1] + border[0] + border[2],
				AnchorPosition.TOPLEFT
			);

		// Make room for left border.
		if (border[3] > 0)
			thiss.save_doc.resizeCanvas(
				doc_size[0] + border[1] + border[3],
				doc_size[1] + border[0] + border[2],
				AnchorPosition.TOPRIGHT
			);

		// Select outer border.
		thiss.save_doc.selection.selectAll();
		thiss.save_doc.selection.select([
			[border[3], border[0]],
			[border[3], border[0] + doc_size[1]],
			[border[3] + doc_size[0], border[0] + doc_size[1]],
			[border[3] + doc_size[0], border[0]]],
			SelectionType.DIMINISH
		);

		// Fill border.
		color = new SolidColor();
		color.rgb.hexValue = thiss.settings.border_color.substr(1);

		border_layer = thiss.save_doc.artLayers.add();
		border_layer.name = 'Border';
		thiss.save_doc.selection.fill(color)
		thiss.save_doc.selection.deselect();

		// Bookkeep so we can undo border when compositing.
		thiss.table.border = border;
		thiss.save_table();
	}

	this.save_doc.suspendHistory('Add border', 'f()');
}

/**
 * Removes any masks left over from a previous round of adding rounded corners.
 */
Tych.prototype.clear_rounded_corner_masks = function()
{
	var doc, mask_layers, remove_mask;

	doc = this.comp_doc;
	mask_layers = this.settings.mask_layers;

	remove_mask = function(layer)
	{
		doc.activeLayer = layer;

		if (mask_layers)
			mask_from_mask_bounds(doc.activeLayer);
		else if (layerMask.selectLayerMask())
			layerMask.remove(false);
	};

	for (var i = 0; i < doc.layerSets.length; i++)
		for (var j = 0; j < doc.layerSets[i].layers.length; j++)
			remove_mask(doc.layerSets[i].layers[j]);
}

/**
 * Apply actions to the specified document.
 */
Tych.prototype.apply_actions = function(doc, when)
{
	for (var i in this.settings.actions)
		if (when == this.settings.actions[i].apply)
			app.doAction(this.settings.actions[i].action, this.settings.actions[i].set);

	if ('Before layout' == when)
		tp_flatten(doc);
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
		references: {
			top_left: null,
			top_right: null,
			bottom_left: null,
			bottom_right: null
		},
		images: [],
		total: 0,
		border: [0, 0, 0, 0]
	};

	// Only use the saved table if we're going to composite!
	if (store.numEntries() > 0
			&& this.settings.composite
			&& this.comp_doc != null)
		table = store.getEntryAt(0);

	return table;
}

Tych.prototype.save_table = function()
{
	this.table_store.addEntry('transformation_table', this.table);
	this.table_store.saveSettings();
}

var t = new Tych(tp_get_settings());
//var called_from_bridge = false;
//t.layout_and_composite(ROW, TOP);
