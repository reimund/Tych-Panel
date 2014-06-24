var CSLibrary = new CSInterface();

jQuery(document).ready(function($) {

	$('.btn.options')
		.on('click', function() { evalScript('Tych Panel/Tych Panel Options.jsx'); });

	$('.btn.add-column-left')
		.on('click', function() { selectAndRun('Tych Panel/Panel Helpers/New column (left).jsx'); });

	$('.btn.add-column-right')
		.on('click', function() { selectAndRun('Tych Panel/Panel Helpers/New column (right).jsx'); });

	$('.btn.add-row-top')
		.on('click', function() { selectAndRun('Tych Panel/Panel Helpers/New row (top).jsx'); });

	$('.btn.add-row-bottom')
		.on('click', function() { selectAndRun('Tych Panel/Panel Helpers/New row (bottom).jsx'); });

	$('a.about')
		.on('click', function() { CSLibrary.openURLInDefaultBrowser('http://lumens.se/tychpanel/'); });

    CSLibrary.addEventListener("com.adobe.csxs.events.ThemeColorChanged", changeTheme); 
    
	changeTheme();
});

/**
 * Use showOpenDialog since File.openDialog behaves buggy when called via the
 * panel.
 */
function selectAndRun(scriptPath)
{
	var files = null;
	var selectResult = window.cep.fs.showOpenDialog(true, false, 'Choose file(s) to add to composite', null);

	if (selectResult.err === window.cep.fs.NO_ERROR) {
		files = selectResult.data;
	}

	var script = 'var selectedFiles = ' + JSON.stringify(files) + ';'
		+ 'var scriptFile = new File(app.path + \'/Presets/Scripts/' + scriptPath + '\');'
		+ '$.evalFile(scriptFile, 30000);';

	setTimeout(function() { CSLibrary.evalScript(script) }, 100);
}

function evalScript(scriptPath)
{
	var script = 'var scriptFile = new File(app.path + \'/Presets/Scripts/' + scriptPath + '\');'
		+ '$.evalFile(scriptFile, 30000);';
	CSLibrary.evalScript(script);
}

/**
 * This function will be called when PP's theme color been changed.
 */
function changeTheme(event)
{
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

function toHex(color)
{
    var red      = Math.round(color.color.red);
    var green    = Math.round(color.color.green);
    var blue     = Math.round(color.color.blue);
    var alpha    = Math.round(color.color.alpha);

    return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
}

