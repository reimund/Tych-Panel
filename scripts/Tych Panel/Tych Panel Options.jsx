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

//settings.clearSettings()
//settings.saveSettings();

// Use stored settings if they exist, defaults otherwise.

var TychOptions = function(tp_settings)
{
	var smallfont;

	var window_res = "dialog { \
		orientation: 'row', \
		alignChildren: 'top', \
		main_group: Group { \
			orientation: 'column', \
			alignChildren: 'fill', \
			general: Panel { \
				text: 'General', \
				alignChildren: 'right', \
				spacing_group: Group { \
					label: StaticText { text: 'Image spacing' } \
					input: EditText { \
						text: '" + tp_settings.spacing + "', \
						preferredSize: [40, 20] \
					} \
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
			}, \
			compositing: Panel { \
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
			}, \
			output: Panel { \
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
			}, \
		}, \
		button_group: Group { \
			orientation: 'column', \
			ok_button: Button { text: 'Ok' }, \
			cancel_button: Button { text: 'Cancel' } \
		}, \
	}";

	var w =  new Window(window_res, 'Tych Panel options');

	w.main_group.output.quality.enabled = w.main_group.output.autosave.value
		&& w.main_group.output.save_types.jpeg.value;

	w.main_group.general.resize_width_group.input.enabled = w.main_group.general.resize_to_fit.width_button.value;
	w.main_group.general.resize_height_group.input.enabled = w.main_group.general.resize_to_fit.height_button.value;

	//smallFont = ScriptUI.newFont(w.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);
	//w.main_group.compositing.composite_text.graphics.font = smallFont;

	this.w = w;
	this.tp_settings = tp_settings;
	this.setup_events();
}

TychOptions.prototype.setup_events = function()
{
	var w = this.w;
	var output = this.w.main_group.output;
	var general = this.w.main_group.general;
	var compositing = this.w.main_group.compositing;
	var fit, maintain;

	general.resize_to_fit.width_button.onClick = function() 
	{
		w.main_group.general.resize_width_group.input.enabled = w.main_group.general.resize_to_fit.width_button.value;
		w.main_group.general.resize_height_group.input.enabled = false;
	};

	general.resize_to_fit.height_button.onClick = function() 
	{
		w.main_group.general.resize_height_group.input.enabled = w.main_group.general.resize_to_fit.height_button.value;
		w.main_group.general.resize_width_group.input.enabled = false;
	};

	general.resize_to_fit.none_button.onClick = function() 
	{
		w.main_group.general.resize_width_group.input.enabled = false;
		w.main_group.general.resize_height_group.input.enabled = false;
	};

	// Masks must be enabled with smart objects since it's the most convenient
	// way to add seams. It doesn't really make sense to have smart objects
	// without masks either.
	general.smart_object_group.smart_object.onClick = function()
	{
		if (general.smart_object_group.smart_object.value)
			general.layer_mask_group.layer_mask.value = general.smart_object_group.smart_object.value;
		
	};

	// If smart objects is enabaled when turning masks off, smart objects will
	// be disabled as well.
	general.layer_mask_group.layer_mask.onClick = function()
	{
		if (!general.layer_mask_group.layer_mask.value)
			general.smart_object_group.smart_object.value = general.layer_mask_group.layer_mask.value;
	};

	compositing.composite_group.composite.onClick = function()
	{
		compositing.maintain_group.enabled = this.value;
	};

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

	w.button_group.ok_button.onClick = function()
	{
		// Get values from controls and store them in the settings object.
		tp_settings.spacing = num_or_default(general.spacing_group.input.text, 'spacing');
		tp_settings.fit_width = general.resize_to_fit.width_button.value
		tp_settings.fit_height = general.resize_to_fit.height_button.value
		tp_settings.resize_width = num_or_default(general.resize_width_group.input.text, 'resize_width');
		tp_settings.resize_height = num_or_default(general.resize_height_group.input.text, 'resize_height');
		tp_settings.convert_to_smart_objects = general.smart_object_group.smart_object.value;
		tp_settings.mask_layers = general.layer_mask_group.layer_mask.value;
		tp_settings.reorder = general.reorder_group.reorder.value;
		tp_settings.use_bridge_selection = general.bridge_group.use_bridge.value;
		tp_settings.composite = compositing.composite_group.composite.value;
		tp_settings.maintain_width = compositing.maintain_group.maintain_width.value;
		tp_settings.maintain_height = compositing.maintain_group.maintain_height.value;
		tp_settings.autosave = output.autosave.value;
		tp_settings.autoclose = output.autoclose.value;
		tp_settings.output_formats.jpg = output.save_types.jpeg.value;
		tp_settings.output_formats.psd = output.save_types.psd.value;
		tp_settings.jpeg_quality = Math.round(output.quality.slider.value);
		tp_settings.save_directory = output.directory.input.text;
		tp_settings.filename = output.filename.input.text;

		settings.addEntry('tp_settings', tp_settings);
		settings.saveSettings();

		w.close(1);
	};

	w.button_group.cancel_button.onClick = function() { w.close(2); };
	//general.resize_group.resize.onClick = function() { general.resize_width_group.input.enabled = this.value; };
	output.save_types.jpeg.onClick = function() { output.quality.enabled = this.value; };
	output.quality.slider.onChange = function() { output.quality.input.text = Math.round(this.value); };
	output.quality.slider.onChanging = function() { output.quality.input.text = Math.round(this.value); };

	output.quality.input.onChange = function()
	{
		output.quality.slider.value = num_or_default(Math.round(Number(this.text)), 'jpeg_quality');
		this.text = output.quality.slider.value;
	};

	this.w.show();
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


var tp_settings = tp_get_settings();
var dialog = new TychOptions(tp_settings);
