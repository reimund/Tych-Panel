var placeholder = new File(app.path + '/Presets/Scripts/Tych Panel/Images/thumbnail-unavailable.png');

/*
 * Image list item constructor. Creates the objects needed to present an image
 * with a label and border.
 */
var ImageItem = function(container, file, index, thumbnail)
{
	var border     = container.add('group');
	border.margins = 1;
	setBackgroundColor(border, [0.8, 0.8, 0.8]);

	var item_container         = border.add('group');
	item_container.orientation = 'column';
	item_container.onClick     = clickItem;
	item_container.item        = this;

	var image;

	try
	{
		if (thumbnail != undefined)
			image = item_container.add('Image', [0, 0, 256, 256], thumbnail);
		else
			image = item_container.add('Image', [0, 0, 256, 256], file);
	}
	catch (err)
	{
		image = item_container.add('Image', [0, 0, 256, 256], placeholder);
	}

	image.onClick = clickItem;

	var label_container         = item_container.add('group');
	label_container.margins     = [0, 8, 0, 0];
	label_container.orientation = 'column';
	label_container.size        = [200, 30];
	label_container.onClick     = clickItem;

	this.file            = file;
	this.container       = container;
	this.border          = border;
	this.image           = image;
	this.item_container  = item_container;
	this.label           = label_container.add('statictext', undefined, file.name);
	this.label_container = label_container;
	this.label.onClick   = clickItem;
	this.index           = index;
	this.thumbnail       = thumbnail;

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
 * Written by Marc Autret.
 */
Image.prototype.onDraw = function()
{ 
	if (!this.image) return;

	var WH = this.size,
		wh = this.image.size,
		k = Math.min(WH[0] / wh[0], WH[1] / wh[1]),
		xy;

	// Resize proportionally.
	wh = [k * wh[0], k * wh[1]];
	// Center.
	xy = [(WH[0] - wh[0]) / 2, (WH[1] - wh[1]) / 2 ];
	this.graphics.drawImage(this.image, xy[0], xy[1], wh[0], wh[1]);
	WH = wh = xy = null;
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

	if (null == item) item = this.parent.item
	if (null == item) item = this.parent.parent.item;

	image_list.toggleSelect(item.index);
}


