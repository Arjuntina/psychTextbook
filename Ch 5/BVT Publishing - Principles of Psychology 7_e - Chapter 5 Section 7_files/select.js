
    window['_sel_'] = {};
    
    var windowSelInterval = setInterval(function() {
        
        function textIsSelected()
        {
            if(console){
                // console.log('select.jstextIsSelected() has executed.');
            }
            selectedText = false;
            if(window.getSelection){
                selectedText = window.getSelection();
            } else if(document.getSelection){
                selectedText = document.getSelection();
            } else {
                selectedText = document.selection.createRange().text;
            }
            if(!selectedText || selectedText==""){
                if(document.activeElement.selectionStart){
                    selectedText = document.activeElement.value.substring(
                        document.activeElement.selectionStart
                        . document.activeElement.selectionEnd);
                }
            }
            return selectedText;
        }
        
        try {
            // var sel = textIsSelected();
            var sel = window.getSelection ? window.getSelection() : document.getSelection();
            window['_sel_'].text          = sel.getRangeAt(0);
            window['_sel_'].anchorNode    = sel.anchorNode.parentNode;
            window['_sel_'].focusNode     = sel.focusNode.parentNode;
            window['_sel_'].isCollapsed   = sel.isCollapsed;
        } catch (err) {
            if(console){
                // console.log('Text Select `select.js` is having an issue.');
            }
        }
        /*
            The iteration speed was originally set to 50 milliseconds which seemed to 
            create inconsistent behavior for the text select toolbar. So I changed it
            to 1500 milliseconds. 2018-10-30 E. Lineback
        */
    }, 1500);