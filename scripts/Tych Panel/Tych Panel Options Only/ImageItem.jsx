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


/*
 * Draws image within its bounding box.
 */
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


/*
 * Sets the background color of the specified element.
 */
function setBackgroundColor(element, color)
{
	var gfx = element.graphics;
	gfx.backgroundColor = gfx.newBrush(gfx.BrushType.SOLID_COLOR, color);
}

/*
 * Click handler for image items.
 */
function clickItem()
{
	var item = this.item;

	if (item == null)
		item = this.parent.item

	image_list.toggleSelect(item.index);
}


