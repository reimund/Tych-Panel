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
	'mask_layers': false,
	'convert_to_smart_objects': false,
	'use_bridge_selection': false,
	'resample_method': 'bicubic',
	'autosave': false,
	'autoclose': false,
	'output_formats': { 'jpg': true, 'psd': false },
	'save_directory': '~',
	'filename': 'image',
	'jpeg_quality': 12
};

var NTYCH_HORIZONTAL = 0;
var NTYCH_VERTICAL = 1;

var WHITE = Array(255, 255, 255);
var BLACK = Array(0, 0, 0);

var TOP = 0;
var RIGHT = 1;
var BOTTOM = 2;
var LEFT = 3;

var ROW = 0;
var COLUMN = 1;

var NEIGHBOR_NONE = 0;
var NEIGHBOR_TOP = 1;
var NEIGHBOR_BOTTOM = 2;
var NEIGHBOR_LEFT = 4;
var NEIGHBOR_RIGHT = 8;
