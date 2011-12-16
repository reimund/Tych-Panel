/*
 * Name: Tych Panel 1.1
 * Author: Reimund Trost (c) 2011
 * Email: reimund@lumens.se
 * Website: http://lumens.se/tychpanel/
 *
 * Description: This set of scripts automates the creation of diptychs,
 * triptychs, quaptychs and even n-tychs. 
 *
 * The script makes at least the following
 * assumptions:
 *
 *  - One image per layer.
 *  - Images are placed at (0,0).
 *  - There are as many layers as the corresponding tych variant, ie. two
 *    layers for diptych, three layers for triptych and so on.
 */


//@include Tych%20Panel%20Only/Tych.jsx

// XXX: Keep aspect ratio option does not affect all tychs (currently only
// n-tychs). Not really a problem since the icon buttons are a different use
// case, however, it can be a bit non-obvious for some users.
// XXX: Ability to apply post- and pre-processing actions.
// XXX: Fix bugs on windows. For now, the duplicate-workaround will do.
// XXX: Custom background color.
// XXX: Toggle button/check box that decides if new tychs should be composited
// into an already open document.
// XXX: More layouts: 3x2, 3x3, 3x4, 4x2, 4x3, 4x4 etc. EDIT: I think I'll skip
// this one, since these can be built with the 'Just bring it' button anyway.


var t = new Tych(tp_get_settings());
//t.layout_and_composite();
//t.layout();
