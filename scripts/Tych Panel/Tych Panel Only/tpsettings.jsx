//@include PSSettings.jsx

var settings = new Settings();
settings.setUID("TychPanelSettingsUniqueId");
settings.setMSG("TychPanelSettings");
settings.setType(SettingsType.SINGLE);
settings.loadSettings();

/**
 * Loads settings.
 */
function tp_get_settings()
{
	var tp_settings = {};

	if (settings.numEntries() > 0)
		tp_settings = settings.getEntryAt(0);

	for (setting in defaults)
		if (tp_settings[setting] == undefined)
			tp_settings[setting] = defaults[setting];

	return tp_settings;
}
