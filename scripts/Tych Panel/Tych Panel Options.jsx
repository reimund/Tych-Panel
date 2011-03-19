
//@include Tych%20Panel%20Options%20Only/constants.jsx
//@include Tych%20Panel%20Options%20Only/PSSettings.jsx

// Load current settings.
var tpSettings = {};
var settings = new Settings();
settings.setUID("TychPanelSettingsUniqueId");
settings.setMSG("TychPanelSettings");
settings.setType(SettingsType.SINGLE);
settings.loadSettings();

//settings.clearSettings();
//settings.saveSettings();

// Use stored settings if they exist, defaults otherwise.
if (settings.numEntries() > 0)
	tpSettings = settings.getEntryAt(0);
else 
	for (setting in defaults)
		tpSettings[setting] = defaults[setting];


createDialog();

function createDialog()
{

	var dlg = new Window('dialog', 'Tych Panel options');

	dlg.orientation = 'row';
	dlg.alignChildren = 'top';

	dlg.mainGrp = dlg.add('group', undefined, 'Main');
	dlg.mainGrp.orientation = 'column';
	dlg.mainGrp.alignChildren = 'fill';

	dlg.generalOptions = dlg.mainGrp.add('panel', undefined, 'General');
	dlg.generalOptions.paddingGrp = dlg.generalOptions.add('group');
	dlg.generalOptions.resizeGrp = dlg.generalOptions.add('group');
	dlg.generalOptions.resize = dlg.generalOptions.resizeGrp.add('checkbox', undefined, 'Resize generated images');
	dlg.generalOptions.resizeWidth = dlg.generalOptions.add('group');

	with (dlg.generalOptions) {
		alignChildren = "right";

		resizeGrp.margins = [0, 15, 0, 0];
		resize.value = tpSettings.resize;

		paddingGrp.label = paddingGrp.add('statictext', undefined, 'Image spacing');
		paddingGrp.input = paddingGrp.add('edittext', undefined, tpSettings.padding);
		paddingGrp.input.preferredSize = [40, 20];

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
		tpSettings.padding = numOrDefault(dlg.generalOptions.paddingGrp.input.text, 'padding');
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
	};

	dlg.cancelButton.onClick = function() { dlg.close(2); }

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
