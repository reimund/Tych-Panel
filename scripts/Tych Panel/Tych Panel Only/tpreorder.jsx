//@include tpconstants.jsx
//@include ImageList.jsx
//@include ImageItem.jsx

var iconLeft = new File(app.path + '/Plug-ins/Panels/Tych Panel/content/Tych Panel.assets/media/img/left-arrow.png');
var iconRight = new File(app.path + '/Plug-ins/Panels/Tych Panel/content/Tych Panel.assets/media/img/right-arrow.png');
var image_list;

/**
 * Opens a window with thumbnails that lets you reorder the specified images.
 * If thumbs are specified, these files will be used for thumbnails.
 */
function tpReorder(files, thumbs)
{
	var dialog = new Window('dialog', 'Reorder images');
	var large_font = ScriptUI.newFont(dialog.graphics.font.name, ScriptUI.FontStyle.REGULAR, 20);
	var reordered_files;

	dialog.orientation = 'row';
	dialog.alignChildren = 'top';

	dialog.main_grp = dialog.add('group');
	dialog.main_grp.orientation = 'column';

	var list_container = dialog.main_grp.add('group');
	list_container.orientation = 'row';
	list_container.margins = 0;

	image_list = new ImageList(files, list_container, thumbs);
	image_list.select(0);

	moveButtons = dialog.main_grp.add('group');

	moveLeftButton = moveButtons.add('iconbutton', [0, 0, 44, 32], iconLeft);
	moveLeftButton.graphics.font = large_font;
	moveLeftButton.onClick = moveLeft;

	moveRightButton = moveButtons.add('iconbutton', [0, 0, 44, 32], iconRight);
	moveRightButton.graphics.font = large_font;
	moveRightButton.onClick = moveRight;

	buttonGrp = dialog.add('group');
	buttonGrp.orientation = 'column';

	buttonGrp.okButton = buttonGrp.add('button', undefined, 'Ok');
	buttonGrp.cancelButton = buttonGrp.add('button', undefined, 'Cancel');

	buttonGrp.okButton.onClick = function() {
		reordered_files = image_list.reordered();
		dialog.close(1);
	};

	buttonGrp.cancelButton.onClick = function() {
		dialog.close(2);
	}

	dialog.show(); 
	return reordered_files;
}


function moveLeft()
{
	if (image_list.current_item == -1 || image_list.current_item == 0)
		return;

	image_list.swap(image_list.current_item, image_list.current_item - 1);
	image_list.select(image_list.current_item - 1);
}


function moveRight()
{
	if (image_list.current_item == -1 || image_list.current_item == image_list.length - 1)
		return;

	image_list.swap(image_list.current_item, (image_list.current_item + 1));
	image_list.select(image_list.current_item + 1);
}
