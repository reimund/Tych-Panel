/*
 * Name: Tych Panel Options
 * Author: Reimund Trost (c) 2011-2012
 * Email: reimund@lumens.se
 * Website: http://lumens.se/tychpanel/
 *
 * Description: Options dialog for the Tych Panel script.
 */


//@include Tych%20Panel%20Only/constants.jsx
//@include Tych%20Panel%20Only/settings.jsx
//@include Tych%20Panel%20Only/PSSettings.jsx
//@include Tych%20Panel%20Only/colorpicker.jsx

//settings.clearSettings()
//settings.saveSettings();

// Use stored settings if they exist, defaults otherwise.

var TychOptions = function(tp_settings)
{
	var window_res, w;

	this.tp_settings = tp_settings;


	window_res = "dialog { \
		orientation: 'row', \
		alignChildren: 'top', \
		main_group: Group { \
			orientation: 'column', \
			alignChildren: 'fill', \
			tab_buttons: Group { \
				alignChildren: 'row', \
				appearance_button: IconButton { \
					title: 'Appearance', \
					titleLayout: { \
						alignment: ['left', 'center'], \
						margins: [2, 2, 2, 2] \
					}, \
					bounds: [0, 0, 124, 23] \
				}, \
				output_button: IconButton { \
					title: 'Output', \
					titleLayout: { \
						alignment: ['left', 'center'], \
						margins: [2, 2, 2, 2] \
					}, \
					bounds: [0, 0, 94, 23] \
				}, \
				misc_button: IconButton { \
					title: 'Misc', \
					titleLayout: { \
						alignment: ['left', 'center'], \
						margins: [2, 2, 2, 2] \
					}, \
					bounds: [0, 0, 94, 23] \
				}, \
			}, \
			tab: Group { \
				orientation: 'column', \
				alignChildren: 'fill', \
				minimumSize: [450, 10] \
			}, \
		}, \
		button_group: Group { \
			orientation: 'column', \
			ok_button: Button { text: 'Ok' }, \
			cancel_button: Button { text: 'Cancel' } \
		}, \
	}";

	this.w =  new Window(window_res, 'Tych Panel Options');
	
	this.toggle_tab('appearance');
	this.w.show();

}


TychOptions.prototype.setup_ui = function()
{
	var thiss, w, tab_buttons;

	thiss = this;
	w = this.w;
	tab_buttons = w.main_group.tab_buttons;

	tab_buttons.appearance_button.onClick = function() { thiss.toggle_tab('appearance'); }
	tab_buttons.output_button.onClick = function() { thiss.toggle_tab('output'); }
	tab_buttons.misc_button.onClick = function() { thiss.toggle_tab('misc'); }

	if (this.current_tab == 'appearance') {
		w.main.fit_size_group.input.enabled = w.main.resize_to_fit.width_button.value || w.main.resize_to_fit.height_button.value;

		w.main.bg_color_group.hex.onChange = function() { hex_change(this); }
		w.main.border_color_group.hex.onChange = function() { hex_change(this); }
		w.main.bg_color_group.color_button.onClick = function() { color_click(this); }
		w.main.border_color_group.color_button.onClick = function() { color_click(this); }
		w.main.bg_color_group.hex.notify('onChange');
		w.main.border_color_group.hex.notify('onChange');

		w.main.resize_to_fit.width_button.onClick
			= w.main.resize_to_fit.height_button.onClick
			= function() 
		{
			w.main.fit_size_group.input.enabled = true;
			w.main.fit_size_group.label.text = 'Target ' + (w.main.resize_to_fit.width_button.value ? 'width' : 'height');
		};

		w.main.resize_to_fit.none_button.onClick = function() 
		{
			w.main.fit_size_group.input.enabled = false;
		};

		w.compositing.composite_group.composite.onClick = function()
		{
			w.compositing.maintain_group.enabled = this.value;
		};

	} else if (this.current_tab == 'output') {

		w.output.directory.button.onClick = function()
		{
			w.output.directory.input.text = Folder.selectDialog('Please select a directory.').fsName;
		}

		w.output.autosave_group.autosave.onClick = function()
		{
			w.output.autoclose.enabled = this.value;
			w.output.directory.enabled = this.value;
			w.output.filename.enabled = this.value;
			w.output.save_each_layer_group.enabled = this.value;;
			w.output.save_types.jpeg.enabled = this.value;
			w.output.save_types.psd.enabled = this.value;
			w.output.quality.enabled = this.value && w.output.save_types.jpeg.value;
		};

		w.output.save_types.jpeg.onClick = function() { w.output.quality.enabled = this.value; };
		w.output.quality.slider.onChange = function() { w.output.quality.input.text = Math.round(this.value); };
		w.output.quality.slider.onChanging = function() { w.output.quality.input.text = Math.round(this.value); };

		w.output.quality.input.onChange = function()
		{
			w.output.quality.slider.value = num_or_default(Math.round(Number(this.text)), 'jpeg_quality');
			this.text = w.output.quality.slider.value;
		};

	} else if (this.current_tab == 'misc') {

		// Masks must be enabled with smart objects since it's the most
		// convenient way to add seams. It doesn't really make sense to have
		// smart objects without masks either.
		w.misc.smart_object_group.smart_object.onClick = function()
		{
			if (w.misc.smart_object_group.smart_object.value)
				w.misc.layer_mask_group.layer_mask.value = w.misc.smart_object_group.smart_object.value;
			
		};

		// If smart objects is enabled when turning masks off, smart objects
		// will be disabled as well.
		w.misc.layer_mask_group.layer_mask.onClick = function()
		{
			if (!w.misc.layer_mask_group.layer_mask.value)
				w.misc.smart_object_group.smart_object.value = w.misc.layer_mask_group.layer_mask.value;
		};
	}

	w.button_group.ok_button.onClick = function()
	{
		thiss.set_settings(thiss.current_tab);
		settings.addEntry('tp_settings', tp_settings);
		settings.saveSettings();

		w.close(1);
	};

	w.button_group.cancel_button.onClick = function() { w.close(2); };

}


function num_or_default(str, name)
{
	var value = Number(str);
	return isNaN(value) ? defaults[name] : value;
}


function escape(str)
{
	return str.replace(/\\/g, '\\\\');
}


function change_color(color, el)
{
	var color_array = [
		color.rgb.red / 255,
		color.rgb.green / 255,
		color.rgb.blue / 255,
		1
	];

	try
	{
		// Get ScriptUIGraphics object associated with the element.
		var g = el.graphics;
		g.foregroundColor = g.newPen(g.PenType.SOLID_COLOR, color_array, 1);
		g.backgroundColor = g.newBrush (g.BrushType.SOLID_COLOR, color_array, 1);
	}
	catch(error){ alert(error); }
}


TychOptions.prototype.get_main_res = function()
{
	return "panel { \
		visible: true, \
		text: 'General', \
		alignChildren: 'left', \
		spacing_group: Group { \
			label: StaticText { \
				text: 'Image spacing', \
				helpTip: 'The distance between pictures (in pixels).' \
			}, \
			input: EditText { \
				text: '" + tp_settings.spacing + "', \
				preferredSize: [40, 20], \
				helpTip: 'The distance between pictures (in pixels).' \
			} \
		}, \
		bg_color_group: Group { \
			label: StaticText { \
				text: 'Background color', \
				helpTip: 'The background layer will be filled with this color.' \
 			}, \
			color_button: EditText { \
				text: '', \
				preferredSize: [25, 23], \
				helpTip: 'The background layer will be filled with this color.' \
			}, \
			hex: EditText { \
				text: '" + tp_settings.background_color + "', \
				preferredSize: [70, 23], \
				helpTip: 'The background layer will be filled with this color.' \
			}, \
		}, \
		resize_label: Group { \
			text: StaticText { text: 'Resize to fit' }, \
			margins: [0, 20, 0, 0] \
		}, \
		resize_to_fit: Group { \
			width_button: RadioButton { \
				text: 'Width', \
				value: " + tp_settings.fit_width + " \
			}, \
			height_button: RadioButton { \
				text: 'Height', \
				value: " + tp_settings.fit_height + " \
			}, \
			none_button: RadioButton { \
				text: 'Don\\'t resize', \
				value: " + (!tp_settings.fit_width && !tp_settings.fit_height) + " \
			}, \
		}, \
		fit_size_group: Group { \
			label: StaticText { \
				text: 'Target " + (tp_settings.fit_width ? 'width' : 'height') + "', \
				helpTip: 'The target size, not counting the width of the outer border.', \
				preferredSize: [85, 20], \
			} \
			input: EditText { \
				text: '" + tp_settings.fit_size + "', \
				preferredSize: [50, 20], \
				helpTip: 'The target size, not counting the width of the outer border.' \
			}, \
		}, \
		border_group: Group { \
			margins: [0, 20, 0, 0] \
			label: StaticText { \
				text: 'Border size', \
				preferredSize: [80, 0], \
				helpTip: 'The width of the outer border (in pixels).', \
			}, \
			top: Group { \
				orientation: 'column', \
				alignChildren: 'left', \
				label: StaticText { \
					text: 'Top', \
					preferredSize: [30, 4], \
					helpTip: 'Top border width (in pixels).' \
				} \
				input: EditText { \
					text: " + tp_settings.border[0] + ", \
					preferredSize: [60, 20], \
					helpTip: 'Top border width (in pixels).' \
				}, \
			}, \
			right: Group { \
				orientation: 'column', \
				alignChildren: 'left', \
				label: StaticText { \
					text: 'Right', \
					preferredSize: [30, 4], \
					helpTip: 'Right border width (in pixels).' \
				}, \
				input: EditText { \
					text: " + tp_settings.border[1] + ", \
					preferredSize: [60, 20], \
					helpTip: 'Right border width (in pixels).' \
				}, \
			}, \
			bottom: Group { \
				orientation: 'column', \
				alignChildren: 'left', \
				label: StaticText { \
					text: 'Bottom', \
					preferredSize: [40, 4], \
					helpTip: 'Bottom border width (in pixels).' \
				}, \
				input: EditText { \
					text: " + tp_settings.border[2] + ", \
					preferredSize: [60, 20], \
					helpTip: 'Bottom border width (in pixels).' \
				}, \
			}, \
			left: Group { \
				orientation: 'column', \
				alignChildren: 'left', \
				label: StaticText { \
					text: 'Left', \
					preferredSize: [30, 4], \
					helpTip: 'Left border width (in pixels).' \
				}, \
				input: EditText { \
					text: " + tp_settings.border[3] + ", \
					preferredSize: [60, 20], \
					helpTip: 'Left border width (in pixels).' \
				}, \
			}, \
		}, \
		border_color_group: Group { \
			label: StaticText { \
				text: 'Border color', \
				preferredSize: [80, 15], \
				helpTip: 'The color of the outer border.', \
			}, \
			color_button: EditText { \
				text: '', \
				preferredSize: [25, 23], \
				helpTip: 'The color of the outer border.', \
			}, \
			hex: EditText { \
				text: '" + tp_settings.border_color + "', \
				preferredSize: [70, 23], \
				helpTip: 'The color of the outer border.', \
			}, \
		}, \
		corner_radius_group: Group { \
			margins: [0, 20, 0, 0] \
			label: StaticText { \
				text: 'Corner radius', \
				preferredSize: [90, 0], \
				helpTip: 'Adds rounded corners with the specified radius (in pixels).', \
			}, \
			top_left: Group { \
				orientation: 'column', \
				alignChildren: 'left', \
				label: StaticText { \
					text: 'Top left', \
					preferredSize: [60, 4], \
					helpTip: 'Top left corner radius (in pixels).' \
				} \
				input: EditText { \
					text: " + tp_settings.corner_radius[0] + ", \
					preferredSize: [60, 20], \
					helpTip: 'Top left corner radius (in pixels).' \
				}, \
			}, \
			top_right: Group { \
				orientation: 'column', \
				alignChildren: 'left', \
				label: StaticText { \
					text: 'Top right', \
					preferredSize: [60, 4], \
					helpTip: 'Top right corner radius (in pixels).' \
				}, \
				input: EditText { \
					text: " + tp_settings.corner_radius[1] + ", \
					preferredSize: [60, 20], \
					helpTip: 'Top right corner radius (in pixels).' \
				}, \
			}, \
			bottom_right: Group { \
				orientation: 'column', \
				alignChildren: 'left', \
				label: StaticText { \
					text: 'Bottom right', \
					preferredSize: [60, 4], \
					helpTip: 'Bottom right corner radius (in pixels).' \
				}, \
				input: EditText { \
					text: " + tp_settings.corner_radius[2] + ", \
					preferredSize: [60, 20], \
					helpTip: 'Bottom right corner radius (in pixels).' \
				}, \
			}, \
			bottom_left: Group { \
				orientation: 'column', \
				alignChildren: 'left', \
				label: StaticText { \
					text: 'Bottom left', \
					preferredSize: [60, 4], \
					helpTip: 'Bottom left corner radius (in pixels).' \
				}, \
				input: EditText { \
					text: " + tp_settings.corner_radius[3] + ", \
					preferredSize: [60, 20], \
					helpTip: 'Bottom left corner radius (in pixels).' \
				}, \
			}, \
		}, \
		outer_radius_group: Group { \
			input: Checkbox { \
				text: 'Only apply to outer frame', \
				value: " + !tp_settings.round_all_layers + ", \
				helpTip: 'Only rounds corners on top left, top right, bottom left and bottom right pictures.' \
			}, \
		}, \
	}";
}


TychOptions.prototype.get_compositing_res = function()
{
	return "panel { \
		text: 'Compositing', \
		alignChildren: 'left', \
		composite_group: Group { \
			margins: [0, 10, 0, 0], \
			composite: Checkbox { \
				text: 'Composite with active document', \
				value: " + tp_settings.composite + ", \
			}, \
		}, \
		maintain_label: Group { \
			text: StaticText { text: 'When adding rows and columns, maintain' }, \
			margins: [0, 20, 0, 0] \
		}, \
		maintain_group: Group { \
			maintain_width: RadioButton { \
				text: 'Width', \
				value: " + tp_settings.maintain_width + ", \
			}, \
			maintain_height: RadioButton { \
				text: 'Height', \
				value: " + tp_settings.maintain_height + ", \
			}, \
			maintain_nothing: RadioButton { \
				text: 'Nothing', \
				value: " + (!tp_settings.maintain_width && !tp_settings.maintain_height) + ", \
			}, \
			enabled: " + tp_settings.composite + " \
		}, \
	}";
}


TychOptions.prototype.get_misc_res = function()
{
	return "panel { \
		text: 'Miscelleneous', \
		alignChildren: 'left', \
		reorder_group: Group { \
			margins: [0, 20, 0, 0] \
			reorder: Checkbox { \
				text: 'Enable reorder dialog', \
				value: " + tp_settings.reorder + " \
			} \
		}, \
		bridge_group: Group { \
			use_bridge: Checkbox { \
				text: 'Use selected images in Adobe Bridge', \
				value: " + tp_settings.use_bridge_selection + " \
			} \
		} \
		smart_object_group: Group { \
			smart_object: Checkbox { \
				text: 'Convert to smart objects.', \
				value: " + tp_settings.convert_to_smart_objects + " \
			} \
			margins: [0, 20, 0, 0] \
		} \
		layer_mask_group: Group { \
			layer_mask: Checkbox { \
				text: 'Mask layers', \
				value: " + tp_settings.mask_layers + " \
			}, \
		}, \
	}";
}


TychOptions.prototype.get_output_res = function()
{
	return "panel { \
		text: 'Output', \
		alignChildren: 'left', \
		autosave_group: Group { \
			margins: [0, 20, 0, 0] \
			autosave: Checkbox { \
				text: 'Save generated images', \
				value: " + tp_settings.autosave + " \
			}, \
		}, \
		directory: Group { \
			label: StaticText { text: 'Directory' }, \
			input: EditText { \
				text: '" + escape(new Folder(tp_settings.save_directory).fsName) + "', \
				preferredSize: [300, 20] \
			}, \
			button: Button { text: 'Browse...' }, \
			enabled: " + tp_settings.autosave + " \
		}, \
		filename: Group { \
			label: StaticText { text: 'File name' }, \
			input: EditText { \
				text: '" + tp_settings.filename + "', \
				preferredSize: [200, 20] \
			}, \
			enabled: " + tp_settings.autosave + ", \
		}, \
		save_each_layer_group: Group { \
			save_each_layer: Checkbox { \
				text: 'Save each individual layer', \
				value: " + tp_settings.save_each_layer + ", \
			}, \
			enabled: " + tp_settings.autosave + ", \
		}, \
		save_types: Group { \
			jpeg: Checkbox { \
				text: 'Jpeg', \
				value: " + tp_settings.output_formats.jpg + ", \
				enabled: " + tp_settings.autosave + ", \
			}, \
			psd: Checkbox { \
				text: 'Psd', \
				value: " + tp_settings.output_formats.psd + ", \
				enabled: " + tp_settings.autosave + ", \
			}, \
			margins: [0, 20, 0, 0], \
		}, \
		quality: Group { \
			label: StaticText { \ text: 'JPEG Quality' \ }, \
			slider: Slider { \
				value: '" + tp_settings.jpeg_quality + "', \
				minvalue: 0, \
				maxvalue: 12, \
			}, \
			input: EditText { \
				text: '" + tp_settings.jpeg_quality + "', \
				preferredSize: [35, 20], \
			}, \
		}, \
		autoclose: Checkbox { \
			text: 'Close on save', \
			value: " + tp_settings.autoclose + ", \
			enabled: " + tp_settings.autosave + " \
		} \
	}";
}


TychOptions.prototype.set_settings = function(tab)
{
	// Get values from controls and store them in the settings object.
	switch (tab) {

		case 'appearance':
			tp_settings.spacing = num_or_default(this.w.main.spacing_group.input.text, 'spacing');
			tp_settings.fit_width = this.w.main.resize_to_fit.width_button.value
			tp_settings.fit_height = this.w.main.resize_to_fit.height_button.value
			tp_settings.fit_size = num_or_default(this.w.main.fit_size_group.input.text, 'fit_size');
			tp_settings.composite = this.w.compositing.composite_group.composite.value;
			tp_settings.maintain_width = this.w.compositing.maintain_group.maintain_width.value;
			tp_settings.maintain_height = this.w.compositing.maintain_group.maintain_height.value;
			tp_settings.background_color = this.w.main.bg_color_group.hex.text;
			tp_settings.border_color = this.w.main.border_color_group.hex.text;
			tp_settings.border = [
				Number(this.w.main.border_group.top.input.text),
				Number(this.w.main.border_group.right.input.text),
				Number(this.w.main.border_group.bottom.input.text),
				Number(this.w.main.border_group.left.input.text)
			];
			tp_settings.corner_radius = [
				Number(this.w.main.corner_radius_group.top_left.input.text),
				Number(this.w.main.corner_radius_group.top_right.input.text),
				Number(this.w.main.corner_radius_group.bottom_right.input.text),
				Number(this.w.main.corner_radius_group.bottom_left.input.text)
			];
			tp_settings.round_all_layers = !this.w.main.outer_radius_group.input.value;
			break;

		case 'output':
			tp_settings.autosave = this.w.output.autosave_group.autosave.value;
			tp_settings.save_each_layer = this.w.output.save_each_layer_group.save_each_layer.value;
			tp_settings.autoclose = this.w.output.autoclose.value;
			tp_settings.output_formats.jpg = this.w.output.save_types.jpeg.value;
			tp_settings.output_formats.psd = this.w.output.save_types.psd.value;
			tp_settings.jpeg_quality = Math.round(this.w.output.quality.slider.value);
			tp_settings.save_directory = this.w.output.directory.input.text;
			tp_settings.filename = this.w.output.filename.input.text;
			break;

		case 'misc':
			tp_settings.convert_to_smart_objects = this.w.misc.smart_object_group.smart_object.value;
			tp_settings.mask_layers = this.w.misc.layer_mask_group.layer_mask.value;
			tp_settings.reorder = this.w.misc.reorder_group.reorder.value;
			tp_settings.use_bridge_selection = this.w.misc.bridge_group.use_bridge.value;
			break;
	}
}


TychOptions.prototype.toggle_tab = function(tab)
{
	var panels, small_font;
	
	this.set_settings(this.current_tab);
	this.current_tab = tab;

	panels = [];
	small_font = ScriptUI.newFont(this.w.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);

	for (var i = 0; i < this.w.main_group.tab_buttons.children.length; i++)
		if (this.w.main_group.tab_buttons.children[i].pressed)
			this.w.main_group.tab_buttons.children[i].toggle();

	for (i = 0; i < this.w.main_group.tab.children.length; i++)
		panels.push(this.w.main_group.tab.children[i]);

	for (j in panels)
		this.w.main_group.tab.remove(panels[j]);

	switch (tab) {

		case 'appearance':
			this.w.main = this.w.main_group.tab.add(this.get_main_res());
			this.w.compositing = this.w.main_group.tab.add(this.get_compositing_res());
			this.w.main_group.tab_buttons.appearance_button.toggle();

			// Set small font for top labels.
			this.w.main.border_group.top.label.graphics.font
				= this.w.main.border_group.right.label.graphics.font
				= this.w.main.border_group.bottom.label.graphics.font
				= this.w.main.border_group.left.label.graphics.font
				= this.w.main.corner_radius_group.top_left.label.graphics.font
				= this.w.main.corner_radius_group.bottom_right.label.graphics.font
				= this.w.main.corner_radius_group.bottom_left.label.graphics.font
				= this.w.main.corner_radius_group.top_right.label.graphics.font
				= this.w.main.corner_radius_group.top_left.label.graphics.font
				= this.w.main.corner_radius_group.bottom_right.label.graphics.font
				= this.w.main.corner_radius_group.bottom_left.label.graphics.font
				= small_font;
			break;

		case 'output':
			this.w.output = this.w.main_group.tab.add(this.get_output_res());
			this.w.main_group.tab_buttons.output_button.toggle();
			break;

		case 'misc':
			this.w.misc = this.w.main_group.tab.add(this.get_misc_res());
			this.w.main_group.tab_buttons.misc_button.toggle();
			break;
	}

	this.w.layout.layout(true);
	this.setup_ui();
}


function hex_change(el)
{
	var bg_color = new SolidColor();

	try {
		bg_color.rgb.hexValue = el.text.substr(1);
		change_color(bg_color, el.parent.color_button);
	} catch (e) {}
}


function color_click(el)
{
	var dummy_doc, picked_color, bg_color;

	if (app.documents.length == 0)
		dummy_doc = app.documents.add(1, 1, 72, 'Dummy document');

	bg_color = colorPicker();
	el.parent.hex.text = '#' + bg_color.rgb.hexValue.toLowerCase();

	change_color(bg_color, el);

	if (dummy_doc)
		dummy_doc.close(SaveOptions.DONOTSAVECHANGES);
}


/**
 * Make custom toggle button.
 *
 * Calling this function redraws the button in the opposite state, ie a pressed
 * button gets unpressed and an unpressed button gets pressed.
 */
IconButton.prototype.toggle = function()
{
	if (this.pressed)
		this.image = toggle;
	else
		this.image = toggle_down;

	this.margins = [0, 0, 0, 0];
	this.bounds = [0, 0, 94, 23];
	this.titleLayout = { alignment: ['center', 'center'], margins: [2, 2, 2, 2] }

	this.pressed = this.pressed == undefined ? true : !this.pressed;
}
var toggle =  ScriptUI.newImage(new File(app.path + '/Plug-ins/Panels/Tych Panel/content/Tych Panel.assets/media/img/toggle-button.png'));
var toggle_down = ScriptUI.newImage(new File(app.path + '/Plug-ins/Panels/Tych Panel/content/Tych Panel.assets/media/img/toggle-button-down.png'));


var tp_settings = tp_get_settings();
var dialog = new TychOptions(tp_settings);


