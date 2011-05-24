/*
 * Name: Tych Panel Options
 * Author: Reimund Trost (c) 2011
 * Email: reimund@lumens.se
 * Website: http://lumens.se/tychpanel/
 *
 * Description: Options dialog for the Tych Panel script.
 */


//@include Tych%20Panel%20Options%20Only/tpconstants.jsx
//@include Tych%20Panel%20Options%20Only/tpsettings.jsx
//@include Tych%20Panel%20Options%20Only/PSSettings.jsx

//settings.clearSettings()
//settings.saveSettings();

// Use stored settings if they exist, defaults otherwise.
var tpSettings = tpGetSettings();

createDialog();

function createDialog()
{
	var dialog = new Window('dialog', 'Tych Panel options');
	var smallFont = ScriptUI.newFont(dialog.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);

	dialog.orientation = 'row';
	dialog.alignChildren = 'top';

	dialog.main_group = dialog.add('group', undefined, 'Main');
	dialog.main_group.orientation = 'column';
	dialog.main_group.alignChildren = 'fill';

	// General section.
	dialog.general = dialog.main_group.add('panel', undefined, 'General');
	dialog.general.spacing_group = dialog.general.add('group');
	dialog.general.aspect_group = dialog.general.add('group');
	dialog.general.keepAspect = dialog.general.aspect_group.add('checkbox', undefined, 'Keep aspect ratio on images');

	dialog.general.aspectText = dialog.general.add('statictext', undefined, 'When this is unchecked, images will be cropped to match height.');
	dialog.general.aspectText.graphics.font = smallFont;
	dialog.general.resize_group = dialog.general.add('group');
	dialog.general.resize = dialog.general.resize_group.add('checkbox', undefined, 'Resize generated images');
	dialog.general.resizeWidth = dialog.general.add('group');
	dialog.general.smartobject_group = dialog.general.add('group');
	dialog.general.smartobject = dialog.general.smartobject_group.add('checkbox', undefined, 'Convert to smart objects');
	dialog.general.smartobject.value = tpSettings.convert_to_smartobject;
	dialog.general.layermask_group = dialog.general.add('group');
	dialog.general.layermask = dialog.general.layermask_group.add('checkbox', undefined, 'Mask layers');
	dialog.general.layermask.value = tpSettings.mask_layers;

	with (dialog.general) {
		alignChildren = "right";

		keepAspect.value = tpSettings.keep_aspect;

		resize_group.margins = [0, 20, 0, 0];
		resize.value = tpSettings.resize;

		spacing_group.label = spacing_group.add('statictext', undefined, 'Image spacing');
		spacing_group.input = spacing_group.add('edittext', undefined, tpSettings.spacing);
		spacing_group.input.preferredSize = [40, 20];

		resizeWidth.label = resizeWidth.add('statictext', undefined, 'Target width');
		resizeWidth.input = resizeWidth.add('edittext', undefined, tpSettings.resize_width);
		resizeWidth.input.preferredSize = [50, 20];
		resizeWidth.enabled = resize.value;
	}

	// Just bring it section.
	dialog.jbi = dialog.main_group.add('panel', undefined, 'Just Bring it');
	dialog.jbi.alignChildren = "right";

	reorder_group = dialog.jbi.add('group');
	reorder_group.margins = [0, 10, 0, 0];
	dialog.jbi.reorder = reorder_group.add('checkbox', undefined, 'Enable reorder dialog');
	dialog.jbi.reorder.value = tpSettings.reorder;

	bridge_group = dialog.jbi.add('group');
	dialog.jbi.use_bridge = bridge_group.add('checkbox', undefined, 'Use Adobe Bridge selection');
	dialog.jbi.use_bridge.value = tpSettings.use_bridge_selection;

	// Output section.
	dialog.output = dialog.main_group.add('panel', undefined, 'Output');
	dialog.output.autosave = dialog.output.add('checkbox', undefined, 'Save generated images');

	dialog.output.directory = dialog.output.add('group');
	dialog.output.directory.input = dialog.output.directory.add('edittext', undefined, new Folder(tpSettings.save_directory).fsName);
	dialog.output.directory.browseButton = dialog.output.directory.add('button', undefined, 'Browse...');

	dialog.output.filename = dialog.output.add('group');
	dialog.output.filename.label = dialog.output.filename.add('statictext', undefined, 'File name');
	dialog.output.filename.input = dialog.output.filename.add('edittext', undefined, tpSettings.filename);

	dialog.output.savetypes = dialog.output.add('group');
	dialog.output.jpeg = dialog.output.savetypes.add('checkbox', undefined, 'Jpeg');
	dialog.output.psd = dialog.output.savetypes.add('checkbox', undefined, 'Psd');

	reorder_group.margins = [0, 10, 0, 0];
	dialog.output.quality = dialog.output.add('group');
	dialog.output.quality.label = dialog.output.quality.add('statictext', undefined, 'JPEG Quality');
	dialog.output.quality.slider = dialog.output.quality.add('slider', undefined, tpSettings.jpeg_quality);
	dialog.output.quality.input = dialog.output.quality.add('edittext', undefined, tpSettings.jpeg_quality);

	dialog.output.autoclose = dialog.output.add('checkbox', undefined, 'Close on save');

	with (dialog.output) {
		alignChildren = "right";
		autosave.value = tpSettings.autosave;

		autoclose.value = tpSettings.autoclose;
		autoclose.enabled = autosave.value;

		directory.enabled = autosave.value;
		directory.input.preferredSize = [300, 20];

		filename.enabled = autosave.value;
		filename.input.preferredSize = [200, 20];

		savetypes.margins = [0, 20, 0, 0];
		jpeg.value = tpSettings.output_formats.jpg;
		jpeg.enabled = autosave.value;
		psd.value = tpSettings.output_formats.psd;
		psd.enabled = autosave.value;

		quality.enabled = autosave.value && dialog.output.jpeg.value;
		quality.slider.minvalue = 0;
		quality.slider.maxvalue = 12;
		quality.input.preferredSize = [35, 20];

		directory.browseButton.onClick = function() {
			directory.input.text = Folder.selectDialog('Please select a directory.').fsName;
		};
	}

	dialog.button_group = dialog.add('group', undefined, undefined);
	dialog.button_group.orientation = 'column';
	dialog.okButton = dialog.button_group.add('button', undefined, 'Ok');
	dialog.cancelButton = dialog.button_group.add('button', undefined, 'Cancel');


	dialog.okButton.onClick = function() {
		// Get values from controls and put into the settings object.
		tpSettings.spacing = numOrDefault(dialog.general.spacing_group.input.text, 'spacing');
		tpSettings.keep_aspect = dialog.general.keepAspect.value;
		tpSettings.resize_width = numOrDefault(dialog.general.resizeWidth.input.text, 'resize_width');
		tpSettings.resize = dialog.general.resize.value;
		tpSettings.convert_to_smartobject = dialog.general.smartobject.value;
		tpSettings.mask_layers = dialog.general.layermask.value;
		tpSettings.reorder = dialog.jbi.reorder.value;
		tpSettings.use_bridge_selection = dialog.jbi.use_bridge.value;
		tpSettings.autosave = dialog.output.autosave.value;
		tpSettings.autoclose = dialog.output.autoclose.value;
		tpSettings.output_formats.jpg = dialog.output.jpeg.value;
		tpSettings.output_formats.psd = dialog.output.psd.value;
		tpSettings.jpeg_quality = Math.round(dialog.output.quality.slider.value);
		tpSettings.save_directory = dialog.output.directory.input.text;
		tpSettings.filename = dialog.output.filename.input.text;

		settings.addEntry('tp_settings', tpSettings);
		settings.saveSettings();

		dialog.close(1);
	};

	dialog.cancelButton.onClick = function() {
		dialog.close(2);
	}

	dialog.general.resize.onClick = function() { dialog.general.resizeWidth.enabled = this.value; };

	dialog.output.autosave.onClick = function() {
		dialog.output.autoclose.enabled = this.value;
		dialog.output.directory.enabled = this.value;
		dialog.output.filename.enabled = this.value;
		dialog.output.jpeg.enabled = this.value;
		dialog.output.psd.enabled = this.value;
		dialog.output.quality.enabled = this.value && dialog.output.jpeg.value;
	};

	dialog.output.jpeg.onClick = function() { dialog.output.quality.enabled = this.value; }
	dialog.output.quality.slider.onChange = function() { dialog.output.quality.input.text = Math.round(this.value); }
	dialog.output.quality.slider.onChanging = function() { dialog.output.quality.input.text = Math.round(this.value); }

	dialog.output.quality.input.onChange = function() {
		dialog.output.quality.slider.value = numOrDefault(Math.round(Number(this.text)), 'jpeg_quality');
		this.text = dialog.output.quality.slider.value;
	}

	dialog.show(); 
}


function numOrDefault(str, name)
{
	var value = Number(str);
	return isNaN(value) ? defaults[name] : value;
}
