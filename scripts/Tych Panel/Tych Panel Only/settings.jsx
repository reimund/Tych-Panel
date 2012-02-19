//@include PSSettings.jsx

// Set defaults.
var defaults, settings;

defaults = {
	'spacing': 8,
	'fit_width': false,
	'fit_height': false,
	'resize_width': 800,
	'resize_height': 800,
	'maintain_width': false,
	'maintain_height': false,
	'reorder': true,
	'composite': true,
	'mask_layers': false,
	'convert_to_smart_objects': false,
	'use_bridge_selection': false,
	'resample_method': 'bicubic',
	'autosave': false,
	'autoclose': false,
	'output_formats': { 'jpg': true, 'psd': false },
	'save_directory': '~',
	'filename': 'image',
	'jpeg_quality': 12,
	'background_color': '#ffffff',
	'border': [0, 0, 0, 0],
	'border_color': '#ffffff',
	'corner_radius': [0, 0, 0, 0],
	'round_all_layers': false,
};

settings = new Settings();
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
