var CSLibrary = null;

if (typeof(CSInterface) !== 'undefined')
	CSLibrary = new CSInterface();

var scripts = {
	left: 'Tych Panel/Panel Helpers/Tych Panel - New column (left).jsx',
	right: 'Tych Panel/Panel Helpers/Tych Panel - New column (right).jsx',
	top:  'Tych Panel/Panel Helpers/Tych Panel - New row (top).jsx',
	bottom: 'Tych Panel/Panel Helpers/Tych Panel - New row (bottom).jsx',
	options: 'Tych Panel/Tych Panel - Options.jsx',
};

jQuery(document).ready(function($) {
	$('.btn.options')
		.on('click', function() { evalScript(scripts.options); });

	$('.btn.add-column-left')
		.on('click', function() { runScript(scripts.left); });

	$('.btn.add-column-right')
		.on('click', function() { runScript(scripts.right); });

	$('.btn.add-row-top')
		.on('click', function() { runScript(scripts.top); });

	$('.btn.add-row-bottom')
		.on('click', function() { runScript(scripts.bottom); });

	$('a.about')
		.on('click', function() { CSLibrary.openURLInDefaultBrowser('http://lumens.se/tychpanel/'); });

	if (CSLibrary) {
		CSLibrary.addEventListener('com.adobe.csxs.events.ThemeColorChanged', changeTheme); 

		changeTheme();
	}
});

function drop(compositeType, event) {
	event.preventDefault();
	
	var files = event.dataTransfer.files
	  , selectedFiles = []
	  , selectedFilesScript = 'var selectedFiles = '
	;
	
	for (var i in files) {
		if (files.hasOwnProperty(i)) {
			var path = files[i].path ? files[i].path : files[i].name;
			
			if (path)
				selectedFiles.push(path);
		}
	};
	
	selectedFilesScript += JSON.stringify(selectedFiles) + ';';
	
	if (CSLibrary) {
		var script = selectedFilesScript + evalFileScript(scripts[compositeType]);
		setTimeout(function() { CSLibrary.evalScript(script) }, 100);
	}
}

function allowDrop(event) {
	event.preventDefault();
}

/**
 * Use showOpenDialog since File.openDialog behaves buggy when called via the
 * panel (at least on OS X).
 */
function runScript(scriptPath)
{
	var dialogResult  = null
	  , selectedFilesScript = 'var selectedFiles = undefined;';
	;

	CSLibrary.evalScript(getUseBridgeSelectionScript(), function(useBridgeSelection) {

		if ('false' === useBridgeSelection) {
			dialogResult = window.cep.fs.showOpenDialog(true, false, 'Choose file(s) to add to composite', null);

			if (dialogResult.err === window.cep.fs.NO_ERROR)
				selectedFilesScript = 'var selectedFiles = ' + JSON.stringify(dialogResult.data) + ';'
		}

		var script = selectedFilesScript + evalFileScript(scriptPath);

		setTimeout(function() { CSLibrary.evalScript(script) }, 100);
	});
}

function getUseBridgeSelectionScript() {
	return script = evalFileScript('Tych Panel/Tych Panel Only/bridge.jsx')
		+ 'useBridgeSelection;';
}

function evalFileScript(path) {
	return 'var scriptFile = new File(app.path + \'/Presets/Scripts/' + path + '\');'
		+ '$.evalFile(scriptFile, 30000);';
}

function evalScript(path) {
	CSLibrary.evalScript(evalFileScript(path));
}

/**
 * This function will be called when PP's theme color been changed.
 */
function changeTheme(event) {
	var hostEnv = CSLibrary.getHostEnvironment();
	var bgColor = toHex(hostEnv.appSkinInfo.panelBackgroundColor);

	$('body').removeClass('darker');
	$('body').removeClass('dark');
	$('body').removeClass('light');
	$('body').removeClass('lighter');

	if ('#343434' == bgColor)
		$('body').addClass('darker');

	else if ('#535353' == bgColor)
		$('body').addClass('dark');

	else if ('#b8b8b8' == bgColor)
		$('body').addClass('light');

	else if ('#d6d6d6' == bgColor)
		$('body').addClass('lighter');
    
}

function toHex(color) {
    var red      = Math.round(color.color.red);
    var green    = Math.round(color.color.green);
    var blue     = Math.round(color.color.blue);
    var alpha    = Math.round(color.color.alpha);

    return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
}