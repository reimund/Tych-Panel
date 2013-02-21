Tych Panel 
==========

Version 2.1.3 - Sat 16 Jan 2013

by Reimund Trost <reimund@code7.se> 
Website <http://lumens.se/tychpanel/>

Description
-----------
Tych Panel is an extension for Adobe Photoshop that automates diptychs and
triptychs creation. It supports an arbitrary number of layouts using a powerful
row/column compositing paradigm. Together with a super easy panel interface,
Tych Panel is the ultimate diptych, tripych & ntych automation tool.

Tych Panel is released as open source and licensed under the MIT license.

Installation
------------
1.	Copy __scripts/Tych Panel__ to __<your photoshop directory>/Presets/Scripts__.
2.	Open __Tych Panel.gpc__ in Adobe Configurator and export it to __<your photoshop
directory>/Plug-ins/Panels__.
3.	Enable the panel via __Window/Extensions/Tych Panel__ in Photoshop.


Changelog
=========

2.1.3
-----
*	Fixed bug with long filenames. Names with more than 255 characters will be
	truncated.

2.1.2
-----
*	Alert the user when trying to save to invalid directory.

2.1.1
-----
*	Use the correct icon on new row button.

2.1.0
-----
*	Changed theming of CS6 panel to match the default (dark) theme of PS CS6.
*	Added icon.

2.0.2
-----
*	Minor fix for PS CS6.

2.0.1
-----
*	Fixes a bug that breaks Tych Panel in non-English Photoshop installs.

2.0.0
------
*	Reorder images with thumbnails.
*	New impoved row/column paradigm that allows virtually unlimited number of layouts.
*	Rows & columns can be attached on either side of your document.
*	Resize to both target width & height.
*	Maintain width or height when adding new rows & columns.
*	Convert images to smart objects.
*	Ability to use layer masks instead of cropping images.
*	Run Tych Panel on selected images in Adobe Bridge.
*	Added option to use selected images in Adobe Bridge as input
*	Save as PSD.
*	Background color option.
*	Support for images with layers (via Flatten Image)
*	Outer border width and color options.
*	Rounded corners on each image.
*	Rounded corners on outermost images.
*	Added option to save each individual layer.
*	Smarter file naming so that allows the resulting file name to derive from input files.
*	Save as PNG.
*	Apply an arbitrary number of actions.
*	Decide when to apply actions - before laying out pictures, or after.

0.9.96
------
*	Removed workaround for panel background color. If the color doesn't match in PS, you should update your Photoshop.

0.9.95
------
*	Fixed triptych bug that made seams the wrong size and the background to not be filled.

0.9.94
------
*	Fixed nasty bug which made the script ignore that the resizing option was disabled.

0.9.93
------
*	Preload button images; hopefully fixing problem with button state images not showing all the time.

0.9.92
------
*	Fixed rounding error issue on some of the layouts (diptych 1 and 2 and quaptych grid) giving seams that were slightly off. 

0.9.91
------
*	Fixed compositing bug with already opened document.

0.9.9
-----
*	Fixed unit bug where current unit in Photoshop was used rather than pixels, leading to images being resized using the wrong unit.

0.9.84
------
*	Use own stack script instead of Adobe's "Load Files into Stack" which acted a bit buggy when called from a html link.

0.9.83
------
*	Fixed 'Close on save' bug.
*	Changed to button layout to be centered and added a little top margin.

