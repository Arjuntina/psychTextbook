(function ( $ ) {
 
    $.fn.msg = function(msg) {
        if(swal)
            swal(msg);
        else
            alert(msg);
    };
 
    $.fn.console = function(msg) {
        if(console)
            console(msg);
    };

}( jQuery ));