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
	//this.tych_variant = NTYCH_HORIZONTAL;
	// Save current unit preferences.
	this.rulerUnits = preferences.rulerUnits;
	// Change unit preferences.
	preferences.rulerUnits = Units.PIXELS;
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
			var dup = docc.duplicate();
			if (this.settings.composite)
				this.comp_doc = dup;
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
		this.comp_doc = null;
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
	var bg_color = new SolidColor();
	bg_color.rgb.hexValue = this.settings.background_color.substr(1);

	// Make a reference to the document that should be saved.
	this.save_doc = this.comp_doc == null ? this.doc : this.comp_doc;

	// Unlink all layer masks.
	this.link(false);
	if (this.save_doc.layers[this.save_doc.layers.length - 1].name == 'Background')
		tp_fill_background(this.save_doc, bg_color);
	else 
		tp_add_background(this.save_doc, bg_color);

	this.add_rounded_corners();
	this.add_border();

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

	doc = this.comp_doc == null ? this.doc : this.comp_doc;
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


Tych.prototype.layout_and_composite = function(tych_variant, side)
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
		if (thiss.comp_doc == null && thiss.table.total == 0)
			thiss.bookkeep(side);

		thiss.link(true);

		// Composite the result.
		if (thiss.settings.composite && thiss.comp_doc != null) {
			// Remove border.
			if (thiss.comp_doc.layers[0].name == 'Border') {
				thiss.comp_doc.layers[0].remove();

				thiss.comp_doc.crop([
					thiss.table.border[3],
					thiss.table.border[0],
					thiss.comp_doc.width.value - thiss.table.border[1],
					thiss.comp_doc.height.value - thiss.table.border[2]
				]);
			}

			if (tych_variant == NTYCH_VERTICAL)
				thiss.composite(thiss.doc, thiss.comp_doc, side);
			else
				thiss.composite(thiss.doc, thiss.comp_doc, side);
		}

		//// Save, close etc.
		thiss.finish();
	}

	this.doc.suspendHistory('Make ntych', 'g()');
}


/**
 * Places the contents of one document at the bottom of another.
 */
Tych.prototype.composite = function(src, target, side)
{
	var i, placement, src_width, src_height, old_width, old_height, new_width,
		new_height, layer_set, layers_to_move, inserted_set, anchor_position;

	// Store away the width & height of the source document before we close it.
	src_width = src.width;
	src_height = src.height;

	// Store away the width & height of the target document before we resize the canvas.
	old_width = target.width.value;
	old_height = target.height.value;

	activeDocument = target;
	anchor_position = AnchorPosition.TOPLEFT

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
			inserted_set.name = 'Row ' + target.layerSets.length
		else if (thiss.tych_variant == NTYCH_VERTICAL)
			inserted_set.name = 'Column ' + target.layerSets.length;
		else
			inserted_set.name = 'Comp ' + target.layerSets.length;

		target.activeLayer = inserted_set;

			// Unlock the background (if locked) so we can put a background fill below.
			target.layers[target.layers.length - 1].isBackgroundLayer = false;

			for (i = src.layers.length - 1; i >= 0; i--)
				thiss.copy_layer_to_document(src.layers[i], target);

			layers_to_move = [];
			for (i = src.layers.length - 1; i >= 0; i--)
				layers_to_move.push(target.layers[i]);

			thiss.move_into_set(layers_to_move, inserted_set);

			thiss.bookkeep(side);

			src.close(SaveOptions.DONOTSAVECHANGES);
			activeDocument = target;

			if (side == BOTTOM || side == TOP) {
				offset_x = 0;
				offset_y = target.height + thiss.settings.spacing;

				if (side == TOP) {
					offset_y = -src_height - thiss.settings.spacing;
					anchor_position = AnchorPosition.BOTTOMLEFT;
				}

				new_width = target.width.value;
				new_height = target.height.value + src_height + thiss.settings.spacing;
			} else if (side == RIGHT || side == LEFT) {
				offset_x = target.width.value - target.activeLayer.bounds[0].value + thiss.settings.spacing;
				offset_y = 0;

				if (side == LEFT) {
					offset_x = -src_width - thiss.settings.spacing;
					anchor_position = AnchorPosition.TOPRIGHT;
				}

				new_width = target.width.value + src_width + thiss.settings.spacing;
				new_height = target.height.value;
			}

			inserted_set.translate(offset_x, offset_y);

			// Make the document bigger so the inserted layers can be seen.
			target.resizeCanvas(new_width, new_height, anchor_position);

			if (thiss.settings.maintain_width || thiss.settings.maintain_height)
				thiss.trans.readjust(thiss, target, old_width, old_height, new_width, new_height);
		}

		f();
		//target.suspendHistory('Composite ntych', 'f()');
	}


	// Do some bookkeeping for the latest added ntych.
	Tych.prototype.bookkeep = function(side)
	{
		var s, l, i, layers, type, ref;

		s = activeDocument.layerSets;

		// If layer sets exist, the current layers being bookkept have just been
		// composited. Otherwise, it's the first ntych inserted.
		if (s.length > 0)
			layers = s[0].layers;
		else
			layers = activeDocument.layers;


		type = this.tych_variant == NTYCH_HORIZONTAL ? ROW : COLUMN;

		for (i = 0; i < layers.length; i++) {
			l = layers[i];

			ref = null;
			
			if (i == (layers.length - 1)) {
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

		// Store the the names of the layers that are interesting references for
		// coming ntychs.
		switch (side) {
			case TOP:
				this.table.references.top_left = layers[layers.length - 1].name;
				this.table.references.top_right = layers[0].name;

				// The first tych will cover all reference points.
				if (s.length == 0) {
					this.table.references.bottom_left = layers[layers.length - 1].name;
					this.table.references.bottom_right = layers[0].name;
				}
				break;

			case BOTTOM:
				this.table.references.bottom_left = layers[layers.length - 1].name;
				this.table.references.bottom_right = layers[0].name;

				// The first tych will cover all reference points.
				if (s.length == 0) {
					this.table.references.top_left = layers[layers.length - 1].name;
					this.table.references.top_right = layers[0].name;
				}
				break;

			case LEFT:
				this.table.references.top_left = layers[layers.length - 1].name;
				this.table.references.bottom_left = layers[0].name;

				// The first tych will cover all reference points.
				if (s.length == 0) {
					this.table.references.top_right = layers[layers.length - 1].name;
					this.table.references.bottom_right = layers[layers.length - 1].name;
				}
				break;

			case RIGHT:
				this.table.references.top_right = layers[layers.length - 1].name;
				this.table.references.bottom_right = layers[0].name;

				// The first tych will cover all reference points.
				if (s.length == 0) {
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
		//this.save_doc = this.comp_doc == null ? this.doc : this.comp_doc;
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


Tych.prototype.add_rounded_corners = function()
{
	var doc, f, thiss;

	doc = this.comp_doc == null ? this.doc : this.comp_doc;
	thiss = this;

	if (this.settings.corner_radius[0] <= 0
			&& this.settings.corner_radius[1] <= 0
			&& this.settings.corner_radius[2] <= 0
			&& this.settings.corner_radius[3] <= 0)
		return;

	f = function()
	{
		for (var i = 0; i < doc.layerSets.length; i++)
			for (var j = 0; j < doc.layerSets[i].layers.length; j++) {
				doc.activeLayer = doc.layerSets[i].layers[j];
				if (thiss.settings.mask_layers)
					mask_from_mask_bounds(doc.activeLayer);
				else if (layerMask.selectLayerMask())
					layerMask.remove(false);
			}

		if (thiss.settings.round_all_layers) {
			if (doc.layerSets.length > 0)
				for (var i = 0; i < doc.layerSets.length; i++)
					for (var j = 0; j < doc.layerSets[i].layers.length; j++)
						round_corners(doc.layerSets[i].layers[j], thiss.settings.corner_radius);
			else
				for (var i = 0; i < doc.layers.length - 1; i++)
					round_corners(doc.layers[i], thiss.settings.corner_radius);
		} else {
			
			c = {};
			tl = thiss.table.references.top_left;
			tr = thiss.table.references.top_right;
			br = thiss.table.references.bottom_right;
			bl = thiss.table.references.bottom_left;

			c[tl] = [thiss.settings.corner_radius[0], 0, 0, 0];

			if (c[tr] == undefined)
				c[tr] = [0, thiss.settings.corner_radius[1], 0, 0];
			else
				c[tr][1] = thiss.settings.corner_radius[1];

			if (c[br] == undefined)
				c[br] = [0, 0, thiss.settings.corner_radius[2], 0];
			else
				c[br][2] = thiss.settings.corner_radius[2];
				
			if (c[bl] == undefined)
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

	//f();
	doc.suspendHistory('Round corners', 'f()');
}


Tych.prototype.add_border = function()
{
	var doc_size, border, border_layer, color;
	doc_size = [this.save_doc.width.value, this.save_doc.height.value];
	border = this.settings.border;

	if (border[0] <= 0
			&& border[1] <= 0
			&& border[2] <= 0
			&& border[3] <= 0)
		return;
	
	// Make room for top border.
	if (border[0] > 0)
		this.save_doc.resizeCanvas(
			doc_size[0], doc_size[1] + border[0],
			AnchorPosition.BOTTOMLEFT
		);

	// Make room for right border.
	if (border[1] > 0)
		this.save_doc.resizeCanvas(
			doc_size[0] + border[1], doc_size[1] + border[0],
			AnchorPosition.BOTTOMLEFT
		);

	// Make room for bottom border.
	if (border[2] > 0)
		this.save_doc.resizeCanvas(
			doc_size[0] + border[1],
			doc_size[1] + border[0] + border[2],
			AnchorPosition.TOPLEFT
		);

	// Make room for left border.
	if (border[3] > 0)
		this.save_doc.resizeCanvas(
			doc_size[0] + border[1] + border[3],
			doc_size[1] + border[0] + border[2],
			AnchorPosition.TOPRIGHT
		);

	// Select outer border.
	this.save_doc.selection.selectAll();
	this.save_doc.selection.select([
		[border[3], border[0]],
		[border[3], border[0] + doc_size[1]],
		[border[3] + doc_size[0], border[0] + doc_size[1]],
		[border[3] + doc_size[0], border[0]]],
		SelectionType.DIMINISH
	);

	// Fill border.
	color = new SolidColor();
	color.rgb.hexValue = this.settings.border_color.substr(1);

	border_layer = this.save_doc.artLayers.add();
	border_layer.name = 'Border';
	this.save_doc.selection.fill(color)
	this.save_doc.selection.deselect();

	// Bookkeep so we can undo border when compositing.
	this.table.border = border;
	this.save_table();
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

