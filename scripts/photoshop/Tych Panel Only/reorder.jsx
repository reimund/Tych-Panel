//@include constants.jsx
//@include ImageList.jsx
//@include ImageItem.jsx

var imageRoot = app.path + '/Presets/Scripts/Tych Panel/Images/';
var iconLeft  = new File(imageRoot + 'left-arrow.png');
var iconRight = new File(imageRoot + 'right-arrow.png');
var image_list;

/**
 * Opens a window with thumbnails that lets you reorder the specified images.
 * If thumbs are specified, these files will be used for thumbnails.
 */
function tp_reorder(files, thumbs)
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

	move_buttons = dialog.main_grp.add('group');

	move_left_button = move_buttons.add('iconbutton', [0, 0, 44, 32], iconLeft);
	move_left_button.graphics.font = large_font;
	move_left_button.onClick = move_left;

	move_right_button = move_buttons.add('iconbutton', [0, 0, 44, 32], iconRight);
	move_right_button.graphics.font = large_font;
	move_right_button.onClick = move_right;

	button_group = dialog.add('group');
	button_group.orientation = 'column';

	button_group.ok_button = button_group.add('button', undefined, 'Ok');
	button_group.cancel_button = button_group.add('button', undefined, 'Cancel');

	button_group.ok_button.onClick = function()
	{
		reordered_files = image_list.reordered();
		dialog.close(1);
	};

	button_group.cancel_button.onClick = function()
	{
		dialog.close(2);
	}

	dialog.show(); 
	return reordered_files;
}


function move_left()
{
	if (-1 == image_list.current_item || 0 == image_list.current_item)
		return;

	image_list.swap(image_list.current_item, image_list.current_item - 1);
	image_list.select(image_list.current_item - 1);
}


function move_right()
{
	if (-1 == image_list.current_item || image_list.length - 1 == image_list.current_item)
		return;

	image_list.swap(image_list.current_item, (image_list.current_item + 1));
	image_list.select(image_list.current_item + 1);
}
