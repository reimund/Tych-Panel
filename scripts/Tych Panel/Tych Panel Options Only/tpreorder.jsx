//@include tpconstants.jsx
var iconLeft = new File(app.path + '/Plug-ins/Panels/Tych Panel/content/Tych Panel.assets/media/img/left-arrow.png');
var iconRight = new File(app.path + '/Plug-ins/Panels/Tych Panel/content/Tych Panel.assets/media/img/right-arrow.png');
var image_list;


function reorderDialog()
{
	var dialog = new Window('dialog', 'Reorder images');
	var large_font = ScriptUI.newFont(dialog.graphics.font.name, ScriptUI.FontStyle.REGULAR, 20);

	dialog.orientation = 'row';
	dialog.alignChildren = 'top';

	dialog.main_grp = dialog.add('group');
	dialog.main_grp.orientation = 'column';

	var list_container = dialog.main_grp.add('group');
	list_container.orientation = 'row';
	list_container.margins = 0;

	image_list = new ImageList([
		File('/Users/reimund/Sites/20110305_087.jpg'),
		File('/Users/reimund/Sites/20110305_087_90.jpg'),
		File('/Users/reimund/Sites/20110305_206.jpg'),
		File('/Users/reimund/Sites/20110305_371.jpg'),
		File('/Users/reimund/Sites/20110424_282_.jpg')
	], list_container);

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
		dialog.close(1);
	};

	buttonGrp.cancelButton.onClick = function() {
		dialog.close(2);
	}

	dialog.show(); 

}

/*
 * Image list constructor. Creates an image item for each specified image file.
 */
var ImageList = function(files, container)
{
	this.files = files;
	this.items = Array();
	this.current_item = -1;
	this.length = files.length

	for (i in this.files)
		this.items[i] = new ImageItem(container, this.files[i], Number(i));
}


/*
 * Selects the item at the specified index.
 */
ImageList.prototype.select = function(index)
{
	if (this.current_item != -1)
		this.items[this.current_item].deselect();

	this.items[index].select();
	this.current_item = index;
}


/*
 * Deselects the item at the specified index.
 */
ImageList.prototype.deselect = function(index)
{
	this.items[index].deselect();
	this.current_item = -1;
}


/*
 * Toggles the selection of the item at the specified index.
 */
ImageList.prototype.toggleSelect = function(index)
{
	if (this.current_item == index)
		this.deselect(index);
	else
		this.select(index);
}

/*
 * Sets the image for the specified image item.
 */
ImageList.prototype.setImage = function(index, file) { this.items[index].setImage(file); }


/*
 * Sets the label for the specified image item.
 */
ImageList.prototype.setLabel = function(index, text) { this.items[index].setLabel(text); }


/*
 * Sets both the image and the label for the specified image item. The label
 * text is the filename part of the specified file.
 */
ImageList.prototype.setItem = function(index, file)
{
	this.items[index].setImage(file);
	this.items[index].setLabel(file.name);
}


/*
 * Swaps the contents of the specified image items.
 */
ImageList.prototype.swap = function(i1, i2)
{
	var image = this.items[i1].image.image;
	var text = this.items[i1].label.text;

	this.items[i1].image.image = this.items[i2].image.image;
	this.items[i1].label.text = this.items[i2].label.text;
	this.items[i2].image.image = image;
	this.items[i2].label.text = text;
}


/*
 * Image list item constructor. Creates the objects needed to present an image
 * with a label and border.
 */
var ImageItem = function(container, file, index)
{
	var border = container.add('group');
	border.margins = 1;
	setBackgroundColor(border, [0.8, 0.8, 0.8]);

	var item_container = border.add('group');
	item_container.orientation = 'column';
	item_container.onClick = clickItem;
	item_container.item = this;

	var image = item_container.add('Image', [0, 0, 200, 200], file); 
	image.onDraw = drawImage;
	image.onClick = clickItem;

	var label_container = item_container.add('group');
	label_container.margins = [0, 8, 0, 0];
	label_container.orientation = 'column';
	label_container.size = [200, 30];

	this.file = file;
	this.container = container;
	this.border = border;
	this.image = image;
	this.item_container = item_container;
	this.label = label_container.add('statictext', undefined, file.name);
	this.label_container = label_container;
	this.index = index;

	this.deselect();
}


/*
 * Sets the image of the image item.
 */
ImageItem.prototype.setImage = function(file) { this.image.image = file; }


/*
 * Sets the label text of the image item.
 */
ImageItem.prototype.setLabel = function(text) { this.label.text = text; }


/*
 * Selects the image item, making it light blue.
 */
ImageItem.prototype.select = function()
{
	setBackgroundColor(this.item_container, [0.69, 0.84, 1]);
	setBackgroundColor(this.border, [0.65, 0.65, 0.65]);
	this.selected = true;
}


/*
 * Deselects the image item, making it white.
 */
ImageItem.prototype.deselect = function()
{
	setBackgroundColor(this.item_container, [1, 1, 1]);
	setBackgroundColor(this.border, [0.8, 0.8, 0.8]);
	this.selected = false;
}


/*
 * Toggles the selection of the image item.
 */
ImageItem.prototype.toggleSelection = function()
{
	if (!this.selected)
		this.select();
	else
		this.deselect();
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

	var majs = (image_list.current_item) + 1;
	image_list.swap(image_list.current_item, (image_list.current_item + 1));
	image_list.select(image_list.current_item + 1);
}


function clickItem()
{
	var item = this.item;

	if (item == null)
		item = this.parent.item
	image_list.toggleSelect(item.index);
}


function drawImage(drawState)
{

    try {
        // Fit image to bounds.
        if (this.image) {
			var s = this.image.size.width > this.image.size.height
				? this.size.width / this.image.size.width
				: this.size.height / this.image.size.height

			var image_width = s * this.image.size.width;
			var image_height = s * this.image.size.height;

            this.graphics.drawImage(this.image, 0, 0, image_width, image_height);
        }
    } catch (err) {
        // Disable 'onDraw' handling if an error occurs.
        this.onDraw = undefined;
    }
}


function setBackgroundColor(element, color)
{
	var gfx = element.graphics;
	gfx.backgroundColor = gfx.newBrush(gfx.BrushType.SOLID_COLOR, color);
}

reorderDialog();
