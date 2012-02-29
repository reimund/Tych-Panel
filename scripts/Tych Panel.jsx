if (BridgeTalk.appName == 'bridge') { 
	var menu_elements, i, script, paths;
	
	menu_elements = [
		new MenuElement('command', 'New row with Tych Panel (top)', 'at the beginning of Thumbnail-', 'tp_row_top'),
		new MenuElement('command', 'New row with Tych Panel (bottom)', 'after tp_row_top', 'tp_row_bottom'),
		new MenuElement('command', 'New column with Tych Panel (left)', 'after tp_row_bottom', 'tp_column_left'),
		new MenuElement('command', 'New column with Tych Panel (right)', 'after tp_column_left', 'tp_column_right')
	];

	paths = [
        'Presets/Scripts/Tych Panel/Panel Helpers/New row (top).jsx',
        'Presets/Scripts/Tych Panel/Panel Helpers/New row (bottom).jsx',
        'Presets/Scripts/Tych Panel/Panel Helpers/New column (left).jsx',
        'Presets/Scripts/Tych Panel/Panel Helpers/New column (right).jsx'
	];
	
	for (i in menu_elements) {
		menu_elements[i].path = paths[i];
		menu_elements[i].onSelect = function () {
			var bt = new BridgeTalk();
			bt.target = 'photoshop';
			bt.body = 'var ftn = ' + script.toSource().replace('__PATH__', this.path) + '; ftn();'; 
			bt.send(4);
		}
	}

    script = function() {
        var ps_dir, f, s;
        ps_dir = new File(BridgeTalk.getAppPath('photoshop')).parent; 
        ps_dir.changePath('__PATH__');
        f = new File(ps_dir.fsName);
        app.bringToFront();
            
        if (f.open('r'))
             s = f.read();
        else
            throw('Failed to open script'+f.fsName);

        eval(s.replace('called_from_bridge = false', 'called_from_bridge = true'));
    };


}
