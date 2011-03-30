/*
 * Name: Tych Panel Options
 * Author: Reimund Trost (c) 2011
 * Email: reimund@lumens.se
 * Website: http://lumens.se/tychpanel/
 *
 * Description: Options dialog for the tych panel script.
 */


//@include Tych%20Panel%20Options%20Only/tpconstants.jsx
//@include Tych%20Panel%20Options%20Only/tpsettings.jsx
//@include Tych%20Panel%20Options%20Only/PSSettings.jsx

//settings.clearSettings();
//settings.saveSettings();

// Use stored settings if they exist, defaults otherwise.
var tpSettings = tpGetSettings();


createDialog();

function createDialog()
{
	var dlg = new Window('dialog', 'Tych Panel options');
	var smallFont = ScriptUI.newFont(dlg.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);

	dlg.orientation = 'row';
	dlg.alignChildren = 'top';

	dlg.mainGrp = dlg.add('group', undefined, 'Main');
	dlg.mainGrp.orientation = 'column';
	dlg.mainGrp.alignChildren = 'fill';
	dlg.generalOptions = dlg.mainGrp.add('panel', undefined, 'General');
	dlg.generalOptions.spacingGrp = dlg.generalOptions.add('group');
	dlg.generalOptions.aspectGrp = dlg.generalOptions.add('group');
	dlg.generalOptions.keepAspect = dlg.generalOptions.aspectGrp.add('checkbox', undefined, 'Keep aspect ratio on images');

	dlg.generalOptions.aspectText = dlg.generalOptions.add('statictext', undefined, 'When this is unchecked, images will be cropped to match height.');
	dlg.generalOptions.aspectText.graphics.font = smallFont;
	dlg.generalOptions.resizeGrp = dlg.generalOptions.add('group');
	dlg.generalOptions.resize = dlg.generalOptions.resizeGrp.add('checkbox', undefined, 'Resize generated images');
	dlg.generalOptions.resizeWidth = dlg.generalOptions.add('group');

	with (dlg.generalOptions) {
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

	dlg.output = dlg.mainGrp.add('panel', undefined, 'Output');
	dlg.output.autosave = dlg.output.add('checkbox', undefined, 'Save generated images');

	dlg.output.directory = dlg.output.add('group');
	dlg.output.directory.input = dlg.output.directory.add('edittext', undefined, new Folder(tpSettings.save_directory).fsName);
	dlg.output.directory.browseButton = dlg.output.directory.add('button', undefined, 'Browse...');

	dlg.output.filename = dlg.output.add('group');
	dlg.output.filename.label = dlg.output.filename.add('statictext', undefined, 'File name');
	dlg.output.filename.input = dlg.output.filename.add('edittext', undefined, tpSettings.filename);

	dlg.output.quality = dlg.output.add('group');
	dlg.output.quality.label = dlg.output.quality.add('statictext', undefined, 'JPEG Quality');
	dlg.output.quality.slider = dlg.output.quality.add('slider', undefined, tpSettings.jpeg_quality);
	dlg.output.quality.input = dlg.output.quality.add('edittext', undefined, tpSettings.jpeg_quality);

	dlg.output.autoclose = dlg.output.add('checkbox', undefined, 'Close on save');

	with (dlg.output) {
		alignChildren = "right";
		autosave.value = tpSettings.autosave;

		autoclose.value = tpSettings.autoclose;
		autoclose.enabled = autosave.value;

		directory.enabled = autosave.value;
		directory.input.preferredSize = [300, 20];

		filename.enabled = autosave.value;
		filename.input.preferredSize = [200, 20];

		quality.enabled = autosave.value;
		quality.slider.minvalue = 0;
		quality.slider.maxvalue = 12;
		quality.input.preferredSize = [35, 20];

		directory.browseButton.onClick = function() {
			directory.input.text = Folder.selectDialog('Please select a directory.').fsName;
		};
	}

	dlg.buttonGrp = dlg.add('group', undefined, undefined);
	dlg.buttonGrp.orientation = 'column';
	dlg.okButton = dlg.buttonGrp.add('button', undefined, 'Ok');
	dlg.cancelButton = dlg.buttonGrp.add('button', undefined, 'Cancel');


	dlg.okButton.onClick = function() {
		// Get values from controls and put into the settings object.
		tpSettings.spacing = numOrDefault(dlg.generalOptions.spacingGrp.input.text, 'spacing');
		tpSettings.keep_aspect = dlg.generalOptions.keepAspect.value;
		tpSettings.resize_width = numOrDefault(dlg.generalOptions.resizeWidth.input.text, 'resize_width');
		tpSettings.resize = dlg.generalOptions.resize.value;
		tpSettings.autosave =dlg.output.autosave.value;
		tpSettings.autoclose =dlg.output.autoclose.value;
		tpSettings.jpeg_quality = Math.round(dlg.output.quality.slider.value);
		tpSettings.save_directory = dlg.output.directory.input.text;
		tpSettings.filename = dlg.output.filename.input.text;

		settings.addEntry('tp_settings', tpSettings);
		settings.saveSettings();

		dlg.close(1);

		// Hack to return keyboard focus from Flash to Photoshop.
		Folder.appPackage.execute();
	};

	dlg.cancelButton.onClick = function() {
		dlg.close(2);

		// Hack to return keyboard focus from Flash to Photoshop.
		Folder.appPackage.execute();
	}

	dlg.generalOptions.resize.onClick = function() { dlg.generalOptions.resizeWidth.enabled = this.value; };

	dlg.output.autosave.onClick = function() {
		dlg.output.autoclose.enabled = this.value;
		dlg.output.directory.enabled = this.value;
		dlg.output.filename.enabled = this.value;
		dlg.output.quality.enabled = this.value;
	};

	dlg.output.quality.slider.onChange = function() { dlg.output.quality.input.text = Math.round(this.value); }
	dlg.output.quality.slider.onChanging = function() { dlg.output.quality.input.text = Math.round(this.value); }

	dlg.output.quality.input.onChange = function() {
		dlg.output.quality.slider.value = numOrDefault(Math.round(Number(this.text)), 'jpeg_quality');
		this.text = dlg.output.quality.slider.value;
	}

	dlg.show(); 
}


function numOrDefault(str, name)
{
	var value = Number(str);
	return isNaN(value) ? defaults[name] : value;
}
