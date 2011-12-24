// Set defaults.
var defaults = {
	'spacing': 8,
	'fit_width': false,
	'fit_height': false,
	'resize_width': 800,
	'resize_height': 800,
	'maintain_width': false,
	'maintain_height': false,
	'reorder': true,
	'composite': true,
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

var NTYCH_VERTICAL = -2;
var NTYCH_HORIZONTAL = -1;
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

var TOP = 0;
var RIGHT = 1;
var BOTTOM = 2;
var LEFT = 3;
