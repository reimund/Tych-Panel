
//@include Tych%20Panel%20Options%20Only/PSSettings.jsx
createDialog();

function createDialog()
{
	// Load current settings.
	var settings = new Settings();
	settings.setUID("TychPanelSettings");
	settings.setMSG("TychPanelSettings");
	settings.setType(SettingsType.SINGLE);
	settings.loadSettings();

	var padding = settings.getEntryByName('padding');
	var defaultPadding = 8;


	var dlg = new Window('dialog', 'Tych Panel options');

	dlg.orientation = 'row';
	dlg.alignChildren = 'top';

	dlg.mainGrp = dlg.add('group', undefined, 'Main');
	dlg.mainGrp.orientation = 'column';
	dlg.mainGrp.alignChildren = 'left';

	dlg.generalOptions = dlg.mainGrp.add('panel', undefined, 'General');
	dlg.generalOptions.alignChildren = "right";
	dlg.generalOptions.paddingGrp = dlg.generalOptions.add('group');

	dlg.generalOptions.resizeGrp = dlg.generalOptions.add('group');
	dlg.generalOptions.resizeGrp.margins = [0, 15, 0, 0];
	//dlg.generalOptions.resize = dlg.generalOptions.resizeGrp.add('checkbox', undefined, 'Resize generated images');
	//dlg.generalOptions.tychWidth = dlg.generalOptions.add('group');

	with (dlg.generalOptions) {
		paddingGrp.label = paddingGrp.add('statictext', undefined, 'Image spacing');
		paddingGrp.input = paddingGrp.add('edittext', undefined, padding == null ? defaultPadding : padding);
		paddingGrp.input.preferredSize = [40, 20];

		//tychWidth.label = tychWidth.add('statictext', undefined, 'Target width');
		//tychWidth.input = tychWidth.add('edittext', undefined, '800');
		//tychWidth.input.preferredSize = [50, 20];
	}

	//dlg.outputOptions = dlg.mainGrp.add('panel', undefined, 'Output');
	//dlg.outputOptions.alignChildren = "right";

	//dlg.autosave = dlg.outputOptions.add('checkbox', undefined, 'Autosave generated images');
	//dlg.autoclose = dlg.outputOptions.add('checkbox', undefined, 'Close on save');
	//dlg.autosave.value = false;
	//dlg.autoclose.value = false;

	dlg.buttonGrp = dlg.add('group', undefined, undefined);
	dlg.buttonGrp.orientation = 'column';
	dlg.okButton = dlg.buttonGrp.add('button', undefined, 'Ok');
	dlg.cancelButton = dlg.buttonGrp.add('button', undefined, 'Cancel');

	dlg.okButton.onClick = function() {
		padding = Number(dlg.generalOptions.paddingGrp.input.text);
		padding = isNaN(padding) ? defaultPadding : padding;
		settings.addEntry('padding', padding);
		settings.saveSettings();
		dlg.close(1);
	}

	dlg.cancelButton.onClick = function() { dlg.close(2); }

	dlg.show(); 
}

