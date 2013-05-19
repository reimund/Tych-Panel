//@include PSSettings.jsx

// Set defaults.
var defaults, settings;

defaults = {
	'spacing'                  : 8,
	'fit_width'                : false,
	'fit_height'               : false,
	'fit_size'                 : 800,
	'maintain_width'           : false,
	'maintain_height'          : false,
	'reorder'                  : true,
	'composite'                : true,
	'mask_layers'              : false,
	'convert_to_smart_objects' : false,
	'use_bridge_selection'     : false,
	'resample_method'          : 'bicubic',
	'autosave'                 : false,
	'autoclose'                : false,
	'output_formats'           : { 'jpg': true, 'psd': false, 'png': false },
	'save_directory'           : '~',
	'save_each_layer'          : false,
	'filename'                 : 'image',
	'derive_filename'          : false,
	'jpeg_quality'             : 12,
	'background_color'         : '#ffffff',
	'border'                   : [0, 0, 0, 0],
	'border_color'             : '#ffffff',
	'corner_radius'            : [0, 0, 0, 0],
	'round_all_layers'         : false,
	'actions'                  : [],
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
	var tp_settings;

	if (0 < settings.numEntries())
		tp_settings = settings.getEntryAt(0);
	
	if (tp_settings == undefined)
		tp_settings = {};

	for (setting in defaults)
		if (undefined == tp_settings[setting])
			tp_settings[setting] = defaults[setting];

	return tp_settings;
}
