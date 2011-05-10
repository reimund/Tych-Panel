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

	dialog.main_grp = dialog.add('group', undefined, 'Main');
	dialog.main_grp.orientation = 'column';
	dialog.main_grp.alignChildren = 'fill';
	dialog.general = dialog.main_grp.add('panel', undefined, 'General');
	dialog.general.spacingGrp = dialog.general.add('group');
	dialog.general.aspectGrp = dialog.general.add('group');
	dialog.general.keepAspect = dialog.general.aspectGrp.add('checkbox', undefined, 'Keep aspect ratio on images');

	dialog.general.aspectText = dialog.general.add('statictext', undefined, 'When this is unchecked, images will be cropped to match height.');
	dialog.general.aspectText.graphics.font = smallFont;
	dialog.general.resizeGrp = dialog.general.add('group');
	dialog.general.resize = dialog.general.resizeGrp.add('checkbox', undefined, 'Resize generated images');
	dialog.general.resizeWidth = dialog.general.add('group');

	reorder_grp = dialog.general.add('group');
	reorder_grp.margins = [0, 10, 0, 0];
	dialog.general.reorder = reorder_grp.add('checkbox', undefined, 'Open reorder dialog on ‘Just Bring it’');
	dialog.general.reorder.value = tpSettings.reorder;

	with (dialog.general) {
		alignChildren = "right";

		keepAspect.value = tpSettings.keep_aspect;

		resizeGrp.margins = [0, 20, 0, 0];
		resize.value = tpSettings.resize;

		spacingGrp.label = spacingGrp.add('statictext', undefined, 'Image spacing');
		spacingGrp.input = spacingGrp.add('edittext', undefined, tpSettings.spacing);
		spacingGrp.input.preferredSize = [40, 20];

		resizeWidth.label = resizeWidth.add('statictext', undefined, 'Target width');
		resizeWidth.input = resizeWidth.add('edittext', undefined, tpSettings.resize_width);
		resizeWidth.input.preferredSize = [50, 20];
		resizeWidth.enabled = resize.value;
	}

	dialog.output = dialog.main_grp.add('panel', undefined, 'Output');
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

	reorder_grp.margins = [0, 10, 0, 0];
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

	dialog.buttonGrp = dialog.add('group', undefined, undefined);
	dialog.buttonGrp.orientation = 'column';
	dialog.okButton = dialog.buttonGrp.add('button', undefined, 'Ok');
	dialog.cancelButton = dialog.buttonGrp.add('button', undefined, 'Cancel');


	dialog.okButton.onClick = function() {
		// Get values from controls and put into the settings object.
		tpSettings.spacing = numOrDefault(dialog.general.spacingGrp.input.text, 'spacing');
		tpSettings.keep_aspect = dialog.general.keepAspect.value;
		tpSettings.resize_width = numOrDefault(dialog.general.resizeWidth.input.text, 'resize_width');
		tpSettings.resize = dialog.general.resize.value;
		tpSettings.reorder = dialog.general.reorder.value;
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
