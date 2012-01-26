var LayerSet = function () {} 


/**
 * Moves this LayerSet to the back of the layer stack. The offset parameter
 * specifies how many layers from the back it should be placed.
 */
LayerSet.prototype.move_to_back = function(offset)
{
	var back_index = this.parent.layers.length - 1;

	if (!offset)
		offset = 0;

	if (this.parent.layers[back_index].isBackgroundLayer)
		back_index--;

	this.move(this.parent.layers[back_index - Math.max(0, offset)], ElementPlacement.PLACEAFTER);
}

