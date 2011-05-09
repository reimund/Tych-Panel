//@include tpconstants.jsx
var iconLeft = new File(app.path + '/Plug-ins/Panels/Tych Panel/content/Tych Panel.assets/media/img/left-arrow.png');
var iconRight = new File(app.path + '/Plug-ins/Panels/Tych Panel/content/Tych Panel.assets/media/img/right-arrow.png');
var current_item = null;
//var images = Array();



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

	var image_list = new ImageList([
		File('/Users/reimund/Sites/20110305_087.jpg'),
		File('/Users/reimund/Sites/20110305_087_90.jpg'),
		File('/Users/reimund/Sites/20110305_206.jpg'),
		File('/Users/reimund/Sites/20110305_371.jpg'),
		File('/Users/reimund/Sites/20110424_282_.jpg')
	]);

	image_list.build(list_container);

	moveButtons = dialog.main_grp.add('group');
	/*
	buildImageList(imgGrp);

	moveLeftButton = moveButtons.add('iconbutton', [0, 0, 44, 32], iconLeft);
	moveLeftButton.graphics.font = largeFont;
	moveLeftButton.onClick = moveLeft;

	moveRightButton = moveButtons.add('iconbutton', [0, 0, 44, 32], iconRight);
	moveRightButton.graphics.font = largeFont;
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

	*/
	dialog.show(); 

}


var ImageList = function(files)
{
	this.files = files;
	this.items = Array();
}

ImageList.prototype.build = function(container) {

	for (i in this.files) {
		
		// The item root node will act as a border.

		//clearItem(imgItem);

		//if (current_item == null) {
			//current_item = imgItem;
			//selectItem(current_item);
		//}
		//images[i] = imgItem;
		this.items[i] = new ImageListItem(container, this.files[i]);
	}

}


var ImageListItem = function(container, file)
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

	this.deselect();
}


ImageListItem.prototype.select = function()
{
	setBackgroundColor(this.item_container, [0.69, 0.84, 1]);
	//setBackgroundColor(this.label_container, [0.69, 0.84, 1]);
	setBackgroundColor(this.border, [0.65, 0.65, 0.65]);
	this.selected = true;
}


ImageListItem.prototype.deselect = function()
{
	setBackgroundColor(this.item_container, [1, 1, 1]);
	//setBackgroundColor(this.label_container, [1, 1, 1]);
	setBackgroundColor(this.border, [0.8, 0.8, 0.8]);
	this.selected = false;
}

ImageListItem.prototype.toggleSelection = function()
{
	if (!this.selected)
		this.select();
	else
		this.deselect();
}

//function initImageItem(item, image_file)
//{
	//item.image = item.add('Image', [0, 0, 200, 200], image_file); 
	//item.image.onDraw = drawImage;

	//return item;
//}

// XXX: Find way to move a single item.
function moveLeft()
{
	//var files = this.window.imgGrp.image_files;
	//current_item.remove(current_item.image);
	//current_item.image = current_item.add('Image', [0, 0, 200, 200], files[1]); 
	//current_item.image.onDraw = drawImage;
	
	if (current_item == null || current_item.index == 0)
		return;

	swapImages(this.window.imgGrp, current_item.index, current_item.index - 1);
}


function moveRight()
{
}


function swapImages(container, index_one, index_two)
{
	var files = container.image_files;
	
	removeChildren(images[index_one]);
	removeChildren(images[index_two]);

	initImageItem(images[index_one], container.image_files[index_two]);
	initImageItem(images[index_two], container.image_files[index_one]);

	//image_one = images[index_one].add('Image', [0, 0, 200, 200], files[index_two]); 
	//image_two = images[index_two].add('Image', [0, 0, 200, 200], files[index_one]); 

	//images[index_one].image = image_two;
	//images[index_two].image = image_one;

	//$.writeln(index_one);
	//$.writeln(images[index_one].image);
	//$.writeln(index_two);
	//$.writeln(images[index_two].image);

	//image_one.onDraw = drawImage;
	//image_two.onDraw = drawImage;

	current_item = images[index_two];
	clearItem(images[index_one]);
	selectItem(images[index_two]);
	
}


//function removeChildren(element)
//{
	//for (var i = element.children.length - 1; i >= 0; i--)
		//if (element.children[i].type != 'group')
			//element.remove(i);
//}


function clickItem()
{
	var item = this.item;

	if (item == null)
		item = this.parent.item

	item.toggleSelection();

	if (current_item != item && current_item != undefined)
		current_item.deselect();
	
	if (item.selected)
		current_item = item;
}

function toggleItem(item)
{
	if (!item.selected)
		selectItem(item);
	else
		clearItem(item);
}


function selectItem(item)
{
	setBackgroundColor(item, [0.69, 0.84, 1]);
	setBackgroundColor(item.labelGrp, [0.69, 0.84, 1]);
	setBackgroundColor(item.border, [0.65, 0.65, 0.65]);
	item.selected = true;
}

function clearItem(item)
{
	setBackgroundColor(item, [1, 1, 1]);
	setBackgroundColor(item.labelGrp, [1, 1, 1]);
	setBackgroundColor(item.border, [0.8, 0.8, 0.8]);
	item.selected = false;
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
