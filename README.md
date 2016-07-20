Tych Panel 
==========

Version 2.4.0 - Wed 20 Jul 2016

by Reimund Trost <reimund@code7.se>  
Website <http://lumens.se/tychpanel/>


Description
-----------
Tych Panel is an extension for Adobe Photoshop that automates diptychs and
triptychs creation. It supports an arbitrary number of layouts using a powerful
row/column compositing paradigm. Together with a super easy panel interface,
Tych Panel is the ultimate diptych, tripych & ntych automation tool.

Tych Panel is released as open source and licensed under the MIT license.


Installation (CC 2014, CC 2015) - Html5 panel
---------------------------------------------

1. Run __package-html__ to build the panel.

2. Install using installer script. In Photoshop, goto File > Scripts > Browse...

2. Select the installer.jsx that corresponds to your Photoshop version.

3. Restart Photoshop.

4. Enable the panel via __Window/Extensions/Tych Panel__ in Photoshop.


Installation (CS5, CS6, CC) - Flash panel
-----------------------------------------

1. Copy the contents of scripts/photoshop to /Presets/Scripts/Tych Panel
   (create the "Tych Panel" directory if needed).
2. Open flash-panel/Tych Panel.gpc in Adobe Configurator and export it to /Plug-ins/Panels.
3. Enable the panel via Window/Extensions/Tych Panel in Photoshop.


Changelog
=========

2.4.0
-----
*   Added drag & drop support. Just drag pictures to the buttons in the panels.

2.3.6
-----
*   Photoshop CC 2015.5 compatibility fixes.

2.3.5
-----
*   Fixed incorrect paths in Bridge script.

2.3.4
-----
*   Added installer script for installing without Adobe Extension Manager.

2.3.3
-----
*   Photoshop CC 2015 compatibility fixes.

2.3.2
-----
*   Included missing thumbnail placeholder image.

2.3.1
-----
*   Fixed broken 'Use selected images in Adobe Bridge'.
*   Fixed issue with Bridge startup script adding menu elements multiple times.
*   Fixed issue with large images.

2.3
-----
*   Ported panel to html5 panel (Flash panels were discontinued in Photoshop CC 2014).
*   Added color theme support.
*   Adapted for retina displays.

2.2.2
-----
*   Fixed flatten bug.

2.2.1
-----
*   Fixed revert units bug.
*   Fixed bug which caused documents being closed when autosave=false.

2.2.0
-----
*   Tych Panel ProTools support.

2.1.8
-----
*	Keep transparency when flattening documents.

2.1.7
-----
*	Fixed bug when specifying the same image twice or more from the command
	line.

2.1.5
-----
*	Prevent reorder window from appearing when with only one image from command
	line.

2.1.4
-----
*	Fixed issue with reorder window not appearing when called from command
	line.

2.1.3
-----
*	Fixed bug with long filenames. Names with more than 255 characters will be
	truncated.

2.1.2
-----
*	Alert the user when trying to save to an invalid directory.

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

