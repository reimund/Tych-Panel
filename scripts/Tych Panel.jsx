if (BridgeTalk.appName == 'bridge') { 
   var menu_row_top = new MenuElement('command', 'New row with Tych Panel (top)', 'at the beginning of Thumbnail-', 'tp_row_top');
   var menu_row_bottom = new MenuElement('command', 'New row with Tych Panel (bottom)', 'after tp_row_top', 'tp_row_bottom');
   var menu_column_left = new MenuElement('command', 'New column with Tych Panel (left)', 'after tp_row_bottom', 'tp_column_left');
   var menu_column_right = new MenuElement('command', 'New column with Tych Panel (right)', 'after tp_column_left', 'tp_column_right');

   menu_row_top.onSelect = function () {
         var bt = new BridgeTalk();
         bt.target = 'photoshop';
         bt.body = 'var ftn = ' + row_top.toSource() + '; ftn();'; 
         bt.send(4);
    }

   menu_row_bottom.onSelect = function () {
         var bt = new BridgeTalk();
         bt.target = 'photoshop';
         bt.body = 'var ftn = ' + row_bottom.toSource() + '; ftn();'; 
         bt.send(4);
    }

   menu_column_left.onSelect = function () {
         var bt = new BridgeTalk();
         bt.target = 'photoshop';
         bt.body = 'var ftn = ' + column_left.toSource() + '; ftn();'; 
         bt.send(4);
    }

   menu_column_right.onSelect = function () {
         var bt = new BridgeTalk();
         bt.target = 'photoshop';
         bt.body = 'var ftn = ' + column_right.toSource() + '; ftn();'; 
         bt.send(4);
    }


    function row_top(){
        var ps_dir, f, s;
        ps_dir = new File(BridgeTalk.getAppPath('photoshop')).parent; 
        ps_dir.changePath('Presets/Scripts/Tych Panel/Panel Helpers/tp_new_row_top.jsx');
        f = new File(ps_dir.fsName);
        $.writeln('Running file from Bridge: ' + ps_dir.fsName);
        app.bringToFront();
            
        if (f.open('r'))
             s = f.read();
        else
            throw('Failed to open script'+f.fsName);
            
        eval(s);
    };

    function row_bottom (){
        var ps_dir, f, s;
        ps_dir = new File(BridgeTalk.getAppPath('photoshop')).parent; 
        ps_dir.changePath('Presets/Scripts/Tych Panel/Panel Helpers/tp_new_row_bottom.jsx');
        f = new File(ps_dir.fsName);
        $.writeln('Running file from Bridge: ' + ps_dir.fsName);
        app.bringToFront();
            
        if (f.open('r'))
             s = f.read();
        else
            throw('Failed to open script'+f.fsName);
            
        eval(s);
    };

    function column_left(){
        var ps_dir, f, s;
        ps_dir = new File(BridgeTalk.getAppPath('photoshop')).parent; 
        ps_dir.changePath('Presets/Scripts/Tych Panel/Panel Helpers/tp_new_column_left.jsx');
        f = new File(ps_dir.fsName);
        $.writeln('Running file from Bridge: ' + ps_dir.fsName);
        app.bringToFront();
            
        if (f.open('r'))
             s = f.read();
        else
            throw('Failed to open script'+f.fsName);
            
        eval(s);
    };

    function column_right(){
        var ps_dir, f, s;
        ps_dir = new File(BridgeTalk.getAppPath('photoshop')).parent; 
        ps_dir.changePath('Presets/Scripts/Tych Panel/Panel Helpers/tp_new_column_right.jsx');
        f = new File(ps_dir.fsName);
        $.writeln('Running file from Bridge: ' + ps_dir.fsName);
        app.bringToFront();
            
        if (f.open('r'))
             s = f.read();
        else
            throw('Failed to open script'+f.fsName);
            
        eval(s);
    };

}
