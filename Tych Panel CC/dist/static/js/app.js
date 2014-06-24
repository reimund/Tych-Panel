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

    CSLibrary.addEventListener("com.adobe.csxs.events.ThemeColorChanged", themeChangedEventListener); 
    
	changeThemeColor();
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
 * This function will be called when PP's theme color been changed and it will change
 * extension's background color according to PP's.
 **/
function themeChangedEventListener(event)
{
    changeThemeColor();
}

function changeThemeColor()
{
	var hostEnv = CSLibrary.getHostEnvironment();
    var UIColorObj = new UIColor();
    
    UIColorObj = hostEnv.appSkinInfo.appBarBackgroundColor;
    var red = Math.round(UIColorObj.color.red);
    var green = Math.round(UIColorObj.color.green);
    var blue = Math.round(UIColorObj.color.blue);
    var alpha = Math.round(UIColorObj.color.alpha);
    var colorRGB = "#" + red.toString(16) + green.toString(16) + blue.toString(16);
    
    if ("#535353" != colorRGB) /* "#535353" is the original color */
    {
        document.getElementById("index_body").style.backgroundImage = "none";
    }
    else /* for show background color distinctly */
    {
        document.getElementById("index_body").style.backgroundImage = imageURL;
    }
    document.getElementById("index_body").style.backgroundColor = colorRGB;
    document.getElementById("index_body").style.opacity = alpha / 255;
}
