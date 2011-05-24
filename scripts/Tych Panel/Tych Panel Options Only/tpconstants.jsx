// Set defaults.
var defaults = {
	'spacing': 8,
	'keep_aspect': true,
	'resize': false,
	'resize_width': 800,
	'reorder': true,
	'use_layer_masks': false,
	'convert_to_smartobject': false,
	'use_bridge_selection': false,
	'resample_method': 'bicubic',
	'autosave': false,
	'autoclose': false,
	'output_formats': { 'jpg': true, 'psd': false },
	'save_directory': '~',
	'filename': 'image',
	'jpeg_quality': 12
};

var DIPTYCH_HORIZONTAL = 0;
var DIPTYCH_PORTRAIT_LANDSCAPE_HORIZONTAL = 1;
var DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL = 2;
var TRIPTYCH_HORIZONTAL = 3;
var TRIPTYCH_PORTRAIT_LANDSCAPE_GRID = 4;
var TRIPTYCH_LANDSCAPE_PORTRAIT_GRID = 5;
var QUAPTYCH_GRID = 6;
var QUAPTYCH_HORIZONTAL = 7;

var WHITE = Array(255, 255, 255);
var BLACK = Array(0, 0, 0);
