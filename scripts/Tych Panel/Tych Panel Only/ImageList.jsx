/*
 * Image list constructor. Creates an image item for each specified image file.
 */
var ImageList = function(files, container, thumbnails)
{
	this.files = files;
	this.items = Array();
	this.current_item = -1;
	this.length = files.length;
	this.thumbnails = thumbnails;

	for (i in this.files)
		if (undefined != this.thumbnails && this.thumbnails.length == this.files.length)
			this.items[i] = new ImageItem(container, this.files[i], Number(i), this.thumbnails[i]);
		else
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
	var file = this.items[i1].file;

	this.items[i1].image.image = this.items[i2].image.image;
	this.items[i1].label.text = this.items[i2].label.text;
	this.items[i1].file = this.items[i2].file;
	this.items[i2].image.image = image;
	this.items[i2].label.text = text;
	this.items[i2].file = file;
}


/*
 * Gets the image files in the current order.
 */
ImageList.prototype.reordered = function()
{
	var files = Array();
	for (i in this.items)
		files[i] = this.items[i].file;

	return files;
}

