(function ( $ ) {
 
    $.fn.datar = function(settings, doneCallback, failCallback) {
        var xhr = $.ajax(settings);
        if(doneCallback)
            xhr.done(doneCallback);
        if(failCallback)
            xhr.fail(failCallback);
        return this;
    };

}( jQuery ));