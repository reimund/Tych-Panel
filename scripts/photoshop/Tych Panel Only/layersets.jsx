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


/**
 * Moves the specified layers into the given set.
 */
function move_into_set(set, layers)
{
	var d, ad;

	d = parent_document(layers[0]);

	// Save the current active layer.
	ad = activeDocument;
	// Temporary set active layer.
	activeDocument = d;
	
	for (var i = 0; i < layers.length; i++)
		layers[i].move(set, ElementPlacement.INSIDE);

	// Restore active document.
	activeDocument = ad;

}


