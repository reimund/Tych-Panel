/**
 * Moves this LayerSet to the back of the layer stack. The offset parameter
 * specifies how many layers from the back it should be placed.
 */
function move_to_back(set, offset)
{
	var back_index = set.parent.layers.length - 1;

	if (!offset)
		offset = 0;

	if (set.parent.layers[back_index].isBackgroundLayer)
		back_index--;

	move(set.parent.layers[back_index - Math.max(0, offset)], ElementPlacement.PLACEAFTER);
}

