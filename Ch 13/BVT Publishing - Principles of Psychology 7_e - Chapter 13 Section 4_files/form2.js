
/** form.js **/
(function($){
	
    function load()
    {		
		formdata.booklet_id = $("#booklet-container").data("bookletId");
		formdata.book_id = $("#booklet-container").data("bookId");
		formdata.user_id = $("#booklet-container").data("userId");
        
        $('div.rendered-form input').change(function(e) {
            formdata.process_element(this);
        });
        $('div.rendered-form select').change(function(e) {
// console.log('div.rendered-form select change');
            formdata.process_element(this);
        });
        $('div.rendered-form textarea').change(function(e) {
            formdata.process_element(this);
        });
        
        $('div.rendered-form').each(function(e) {
            formdata.setup_form($(this));
        });	
	}
    
    var formdata = {
        booklet_id: '',
        book_id: '',
        user_id: '',
        frozen_element_form: '',
        frozen_element_name: '',
        
        process_element: function(z_element) {
            // console.log('formdata.process_element', z_element);
            var form_element = $(z_element);
            var form_id = this.get_form_id(form_element);
            // console.log('form_id = '+ form_id);
            if(form_id != '') {
                var element_name = form_element.attr('name');
                if( form_id != this.frozen_element_form
                && element_name != this.frozen_element_name) {
                    var element_value= this.determine_element_value(form_id, form_element, element_name);
// console.log('element_name', element_value);
                    this.save_element_value(form_id, element_name, element_value);
                }
            }
        },
        
        determine_element_value: function(form_id, form_element, element_name) {
            // console.log('determine_element_value', form_element);
            if(form_element[0].type != 'checkbox') {
                return form_element.val();
            } else {
                val = '';
                $('div.'+form_id+' input[name="'+element_name+'"]:checked').each(function(e) {
                    if(val != '') val = val + '|';
                    val = val + $(this).val();
                });
                return val;
            }
        },
        
        // save_element_value: function(form_id, form_element) {
        save_element_value: function(form_id, element_name, element_value) {
            // console.log('formdata.save_element_value '+element_name, element_value);
            $.ajax({
                url: 'formdata/save-form-element-value',
                type: 'post',
                data: {
                    booklet_id: this.booklet_id,
                    form_id: form_id,
                    user_id: this.user_id,
                    element_name: element_name,
                    element_value: element_value
                },
                success(result, status, xhr) {
                    // console.log('ajax success: '+status, result);
                },
                error(xhr, status, error) {
                    // console.log('ajax error: '+status, error);
                }
            });
        },
        
        setup_form: function(form_div) {
            // console.log('formdata.setup_form', form_div);
            var form_id = '';
            var class_list = form_div.attr('class').split(/\s+/);
            // console.log('form_div classes', class_list);
            class_list.forEach(function(class_name, idx) {
                // console.log('get_form_key class: '+class_name);
                if(class_name != 'rendered-form') {
                    form_id = class_name;
                } 
            });
            if(form_id != '') {
                this.get_form_data(form_id);
            } else {
                console.log('these is not the droids you are looking for, move along');
            }
        },
        
        get_form_data: function(form_id) {
            // console.log('formdata.get_form_data', form_id);
            $.ajax({
                url: 'formdata/get-form-json',
                type: 'post',
                data: {
                    booklet_id: this.booklet_id,
                    form_id: form_id,
                    user_id: this.user_id
                },
                success(result, status, xhr) {
                    var res = JSON.parse(result);
                    // console.log('ajax success: '+status, res);
                    formdata.set_form_elements(form_id, res.json);
                },
                error(xhr, status, error) {
                    console.log('ajax error: '+status, error);
                }
            });
        },
        
        set_form_elements: function(form_id, elements_data) {
            // console.log('formdata.set_form_elements', elements_data); 
            for (var key in elements_data) {
                if (elements_data.hasOwnProperty(key)) {
                    // console.log(key+' = ', elements_data[key]);
                    this.set_element_value(form_id, key, elements_data[key]);
                }
            }
        },
        
        set_element_value: function(form_id, el_name, el_value) {
            // console.log('formdata.set_element_value '+el_name, el_value);
            var z_element = $('div.'+form_id+' input[name="'+el_name+'"]');
            this.frozen_element_form = form_id;
            this.frozen_element_name = el_name;
            if(z_element.length > 0) {
                if(z_element[0].type == 'text') {
                    // handle text inputs
                    $(z_element[0]).val(el_value);
                } else if(z_element[0].type == 'checkbox') {
                    // handle checkbox inputs
                    var val_array = el_value.split('|');
                    z_element.each(function(e) {
                        if(($.inArray( $(this).val(), val_array)) > -1) {
                            $(this).prop('checked', true);
                        } else {
                            $(this).prop('checked', false);
                        }
                    });
                } else if(z_element[0].type == 'radio') {
                    // handle radio inputs
                    for (var i = 0; i < z_element.length; i++) {
                        if($(z_element[i]).val() == el_value) {
                            // $(z_element[i]).prop('checked', true);
                            $(z_element[i]).click();
                            break;
                        }
                    }
                }
            } else {
                // handle select
                z_element = $('div.'+form_id+' select[name='+el_name+']');
                if(z_element.length > 0) {
                    $(z_element[0]).val(el_value);
                } else {
                // handle textarea
                    z_element = $('div.'+form_id+' textarea[name='+el_name+']');
                    if(z_element.length > 0) {
                        $(z_element[0]).val(el_value);
                    }
                }
            }
            this.frozen_element_form = '';
            this.frozen_element_name = '';
            // console.log(el_name, z_element);
        },
        
        get_form_id: function(form_element) {
            // console.log('formdata.get_form_id', form_element);
            var form_id = '';
            var form_div = form_element.parents('div.rendered-form').first();
            if(form_div.length > 0) {
                var class_list = form_div.attr('class').split(/\s+/);
                class_list.forEach(function(class_name, idx) {
                    if(class_name != 'rendered-form') {
                        form_id = class_name;
                    } 
                });
            }
            return form_id;
        }
        
    } // end formdata
    
    load();
    
})(jQuery);