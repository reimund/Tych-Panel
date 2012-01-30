/*
 * Name: Tych Panel Options
 * Author: Reimund Trost (c) 2011
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
	var window_res, w, smallfont;

	this.tp_settings = tp_settings;

	window_res = "dialog { \
		orientation: 'row', \
		alignChildren: 'top', \
		main_group: Group { \
			orientation: 'column', \
			alignChildren: 'fill', \
			tab_buttons: Group { \
				alignChildren: 'row', \
				general_button: Button { text: 'General' }, \
				output_button: Button { text: 'Ouput' }, \
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

	//smallFont = ScriptUI.newFont(w.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);
	//w.main_group.compositing.composite_text.graphics.font = smallFont;

	this.toggle_tab('general');
	this.w.show();

}


TychOptions.prototype.setup_ui = function()
{
	var w, output, main, compositing, tab_buttons, fit, maintain, bg_color, thiss;

	thiss = this;
	w = this.w;
	output = w.main_group.output;
	main = w.main;
	output = w.output;
	compositing = w.compositing;
	tab_buttons = w.main_group.tab_buttons;
	fit, maintain;
	bg_color;

	tab_buttons.general_button.onClick = function() { thiss.toggle_tab('general'); }
	tab_buttons.output_button.onClick = function() { thiss.toggle_tab('output'); }

	if (this.current_tab == 'general') {
		main.resize_width_group.input.enabled = this.w.main.resize_to_fit.width_button.value;
		main.resize_height_group.input.enabled = this.w.main.resize_to_fit.height_button.value;

		main.bg_color_group.hex.notify('onChange');
		main.bg_color_group.hex.onChange = function()
		{
			bg_color = new SolidColor();
			try {
				bg_color.rgb.hexValue = this.text.substr(1);
				change_color(bg_color, main.bg_color_group.bg_color_button);
			} catch (e) {}

		}

		main.bg_color_group.bg_color_button.onClick = function()
		{
			var dummy_doc, picked_color;

			if (app.documents.length == 0) {
				dummy_doc = app.documents.add(1, 1, 72, 'Dummy document');
			}

			bg_color = colorPicker();
			main.bg_color_group.hex.text = '#' + bg_color.rgb.hexValue;

			change_color(bg_color, this);

			if (dummy_doc)
				dummy_doc.close(SaveOptions.DONOTSAVECHANGES);
		}


		main.resize_to_fit.width_button.onClick = function() 
		{
			main.resize_width_group.input.enabled = main.resize_to_fit.width_button.value;
			main.resize_height_group.input.enabled = false;
		};

		main.resize_to_fit.height_button.onClick = function() 
		{
			main.resize_height_group.input.enabled = main.resize_to_fit.height_button.value;
			main.resize_width_group.input.enabled = false;
		};

		main.resize_to_fit.none_button.onClick = function() 
		{
			main.resize_width_group.input.enabled = false;
			main.resize_height_group.input.enabled = false;
		};

		// Masks must be enabled with smart objects since it's the most
		// convenient way to add seams. It doesn't really make sense to have
		// smart objects without masks either.
		main.smart_object_group.smart_object.onClick = function()
		{
			if (main.smart_object_group.smart_object.value)
				main.layer_mask_group.layer_mask.value = main.smart_object_group.smart_object.value;
			
		};

		// If smart objects is enabled when turning masks off, smart objects
		// will be disabled as well.
		main.layer_mask_group.layer_mask.onClick = function()
		{
			if (!main.layer_mask_group.layer_mask.value)
				main.smart_object_group.smart_object.value = main.layer_mask_group.layer_mask.value;
		};

		compositing.composite_group.composite.onClick = function()
		{
			compositing.maintain_group.enabled = this.value;
		};

	} else if (this.current_tab == 'output') {

		output.directory.button.onClick = function()
		{
			output.directory.input.text = Folder.selectDialog('Please select a directory.').fsName;
		}

		output.autosave.onClick = function()
		{
			output.autoclose.enabled = this.value;
			output.directory.enabled = this.value;
			output.filename.enabled = this.value;
			output.save_types.jpeg.enabled = this.value;
			output.save_types.psd.enabled = this.value;
			output.quality.enabled = this.value && output.save_types.jpeg.value;
		};

		output.save_types.jpeg.onClick = function() { output.quality.enabled = this.value; };
		output.quality.slider.onChange = function() { output.quality.input.text = Math.round(this.value); };
		output.quality.slider.onChanging = function() { output.quality.input.text = Math.round(this.value); };

		output.quality.input.onChange = function()
		{
			output.quality.slider.value = num_or_default(Math.round(Number(this.text)), 'jpeg_quality');
			this.text = output.quality.slider.value;
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
	//main.resize_group.resize.onClick = function() { main.resize_width_group.input.enabled = this.value; };

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
		text: 'Main options', \
		alignChildren: 'right', \
		spacing_group: Group { \
			label: StaticText { text: 'Image spacing' } \
			input: EditText { \
				text: '" + tp_settings.spacing + "', \
				preferredSize: [40, 20] \
			} \
		}, \
		bg_color_group: Group { \
			label: StaticText { text: 'Background color' } \
			bg_color_button: EditText { \
				text: '', \
				preferredSize: [25, 23], \
			}, \
			hex: EditText { \
				text: '" + tp_settings.background_color + "', \
				preferredSize: [70, 23], \
			}, \
			helpTip: 'The color that will show in the space between pictures.' \
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
		resize_width_group: Group { \
			label: StaticText { text: 'Target width' } \
			input: EditText { \
				text: '" + tp_settings.resize_width + "', \
				preferredSize: [50, 20] \
			}, \
		}, \
		resize_height_group: Group { \
			label: StaticText { text: 'Target height' } \
			input: EditText { \
				text: '" + tp_settings.resize_height + "', \
				preferredSize: [50, 20] \
			}, \
		}, \
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

TychOptions.prototype.get_compositing_res = function()
{
	return "panel { \
		text: 'Compositing', \
		alignChildren: 'right', \
		composite_group: Group { \
			composite: Checkbox { \
				text: 'Composite with active document', \
				value: " + tp_settings.composite + " \
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


TychOptions.prototype.get_output_res = function()
{
	return "panel { \
		text: 'Output', \
		autosave: Checkbox { \
			text: 'Save generated images', \
			value: " + tp_settings.autosave + " \
		}, \
		directory: Group { \
			input: EditText { \
				text: '" + escape(new Folder(tp_settings.save_directory).fsName) + "', \
				preferredSize: [300, 20] \
			}, \
			button: Button { text: 'Browse...' }, \
			enabled: " + tp_settings.autosave + " \
		}, \
		filename: Group { \
			label: StaticText { \
				text: 'File name' \
			}, \
			input: EditText { \
				text: '" + tp_settings.filename + "', \
				preferredSize: [200, 20] \
			}, \
			enabled: " + tp_settings.autosave + " \
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
		alignChildren: 'right' \
	}";
}


TychOptions.prototype.set_settings = function(tab)
{
	// Get values from controls and store them in the settings object.
	switch (tab) {

		case 'general':
			tp_settings.spacing = num_or_default(this.w.main.spacing_group.input.text, 'spacing');
			tp_settings.fit_width = this.w.main.resize_to_fit.width_button.value
			tp_settings.fit_height = this.w.main.resize_to_fit.height_button.value
			tp_settings.resize_width = num_or_default(this.w.main.resize_width_group.input.text, 'resize_width');
			tp_settings.resize_height = num_or_default(this.w.main.resize_height_group.input.text, 'resize_height');
			tp_settings.convert_to_smart_objects = this.w.main.smart_object_group.smart_object.value;
			tp_settings.mask_layers = this.w.main.layer_mask_group.layer_mask.value;
			tp_settings.reorder = this.w.main.reorder_group.reorder.value;
			tp_settings.use_bridge_selection = this.w.main.bridge_group.use_bridge.value;
			tp_settings.composite = this.w.compositing.composite_group.composite.value;
			tp_settings.maintain_width = this.w.compositing.maintain_group.maintain_width.value;
			tp_settings.maintain_height = this.w.compositing.maintain_group.maintain_height.value;
			tp_settings.background_color = this.w.main.bg_color_group.hex.text;
			break;

		case 'output':
			tp_settings.autosave = this.w.output.autosave.value;
			tp_settings.autoclose = this.w.output.autoclose.value;
			tp_settings.output_formats.jpg = this.w.output.save_types.jpeg.value;
			tp_settings.output_formats.psd = this.w.output.save_types.psd.value;
			tp_settings.jpeg_quality = Math.round(this.w.output.quality.slider.value);
			tp_settings.save_directory = this.w.output.directory.input.text;
			tp_settings.filename = this.w.output.filename.input.text;
			break;
	}
}


TychOptions.prototype.toggle_tab = function(tab)
{
	var panels = [];

	this.set_settings(this.current_tab);
	this.current_tab = tab;

	for (var i = 0; i < this.w.main_group.tab.children.length; i++)
		panels.push(this.w.main_group.tab.children[i]);

	for (j in panels)
		this.w.main_group.tab.remove(panels[j]);

	switch (tab) {

		case 'general':
			this.w.main = this.w.main_group.tab.add(this.get_main_res());
			this.w.compositing = this.w.main_group.tab.add(this.get_compositing_res());
			break;

		case 'output':
			this.w.output = this.w.main_group.tab.add(this.get_output_res());
			break;
	}

	this.w.layout.layout(true);
	this.setup_ui();
}


var tp_settings = tp_get_settings();
var dialog = new TychOptions(tp_settings);


