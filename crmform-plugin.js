//CRMForm Plugin v0.2.0
if(typeof jQuery === 'undefined'){
	throw new Error('The CRM Form plugin requires jQuery');
}

(function($){
	'use strict';

	//The Plugin
	$.fn.CRMForm = function(options){

		var settings = $.extend({
			//defaults
			style: "placeholders", //vs "labels"
			containerClass: "form-control-container",
			checkboxContainerClass: "",
			inputClass: ""

		}, options);

		//cache the old form
		var oldForm = this.find('form.form').clone();		

		//replace the form at its current location
		try{
			var theClonedForm = tableToInline(oldForm, settings);
		}catch(e){
			console.log(e);
		}
		

	    this.init = function(){
	    	this.find('form.form').append(theClonedForm);
			this.find('form table').remove();
			if(settings.style === 'labels') SetActiveLabels(settings.containerClass);
			return this;
		};

		this.cloneForm = function(newLocation){

			if(typeof newLocation === 'undefined'){
				console.log('You must include a location to clone the form.');
				return this;
			}

			$(newLocation).append('<form class="cloneForm"></form>');
			$(newLocation).find('form.cloneForm').attr('method', oldForm.attr('method'))
		      .attr('onsubmit', oldForm.attr('onsubmit'))
		      .attr('name', oldForm.attr('name'))
		      .attr('action', oldForm.attr('action'))
		      .attr('class', oldForm.attr('class'))
		      .append($('form.form input[type="hidden"]').clone())
		      .append(theClonedForm);

		      if(settings.style === 'labels') SetActiveLabels(settings.containerClass);

		      SetChangeListeners(settings.containerClass);

		      return this;
		};

	    return this.init();
	};

	//returns new form (string)
	//formStyle = props.style
	//containerClass = props.containerClass
	//checkboxContainerClass = props.checkboxContainerClass
	//inputClass = props.inputClass
	function tableToInline(theForm, props){
	    //clone form
	    var newForm = [];

	    var theRow, theLabel, theControls, theCheckbox;
		// Iterate form table rows
		$('form tr').each(function() {
		    theRow = $(this);
		    theLabel = theRow.find('div.fieldLabel');
		    if (theLabel.length) {
		        theControls = $(this).find('input.field, select.fieldSelect, textarea.fieldComments');
		        
		        //handle morelabel header
		        if (theLabel.hasClass('morelabel')) {
		        	newForm.push(moreLabel(theLabel, containerClass));
		        }
		        if (theControls.length) {
		            //handle input type text, email, phone, etc
		            if (theControls.filter('input.field').length) {
		                
		                var theInputfield = theControls.filter('input.field').clone();
		                newForm.push(textInput(theLabel, theInputfield, props));
		        
		            } else if (theControls.filter('textarea.fieldComments').length) {
		                
		                var theTextarea = theControls.filter('textarea.fieldComments').clone();
		                newForm.push(textInput(theLabel, theTextarea, props));
		                
		            } else if (theControls.filter('select.fieldSelect').length) {
		                
		                //handle select dropdown
		                var theSelect = theControls.filter('select.fieldSelect').clone();		        
		                newForm.push(selectField(theLabel, theSelect, props));
		                
		                //if birthday, remove birthday fields
		                if(theSelect.attr('id')){
		                	if(theSelect.attr('id').indexOf > -1){
			                	theControls.filter('#birthday_month').remove();
			                	theControls.filter('#birthday_day').remove();
			                	theControls.filter('#birthday_year').remove();
		                	}
		                }
		            }
		        }
		    } else {
		        theCheckbox = $(this).find('input.fieldCheckbox');
		        theLabel = $(this).find('.checkLabel');
		       
		        //handle checkbox
		        if (theCheckbox.length) {
		        	newForm.push(checkboxField(theLabel, theCheckbox, props));
		        }else {
		          //If there's no fieldLabel and no checkbox, check for a spacer
		          var spacer = theRow.find('td[colspan="2"]');
		          if(spacer.html() === '&nbsp;' || spacer.find('div.fieldSpacer').length){
		            newForm.push('<div class="formSpacer"></div>');
		          }
		        }
		    }
		});
		
		newForm.push(getSubmitButton(props.containerClass));

		return newForm.join();
	}

	function moreLabel(fieldLabel, props){
		var thisLabel = "";

		thisLabel += '<div class="' + props.containerClass + '">';
		thisLabel += fieldLabel[0].outerHTML;
		thisLabel += '</div>';

		return thisLabel;
	}

	function textInput(fieldLabel, inputField, props){
		var thisInput = "";

		if(props.inputClass) inputField.addClass(props.inputClass);

		switch(props.style) {
			case "placeholders":
				//Text placeholder, then add field to form
		        theInputfield.attr('placeholder', fieldLabel.text());
		        thisInput += '<div class="' + props.containerClass + '">';
		        thisInput += inputField[0].outerHTML;
		        thisInput += '</div>';
		        break;
		    case "labels":
		    	// add label and field to form
		        thisInput += '<div class="' + props.containerClass + '">';
		        thisInput += '<label class="inputLabel">' + fieldLabel.text() + '</label>' + inputField[0].outerHTML;
		        thisInput += '</div>';
		        break;
		    default:
		    	//Text placeholder, then add field to form
		        theInputfield.attr('placeholder', fieldLabel.text());
		        thisInput += '<div class="' + props.containerClass + '">';
		        thisInput += inputField[0].outerHTML;
		        thisInput += '</div>';
		        break;	                        	
		}

		return thisInput;
	}

	function textArea(fieldLabel, inputField, props){
		var thisTextarea = "";

		if(props.inputClass) inputField.addClass(props.inputClass);

		switch(props.style) {
			case "placeholders":
		    	//Textarea placeholder, then add textarea to form
		        inputField.attr('placeholder', fieldLabel.text());
		        thisTextarea += '<div class="' + props.containerClass + '">';
		        thisTextarea += inputField[0].outerHTML;
		        thisTextarea += '</div>';
		        break;

		    case "labels":
		        // add label and field to form
		        thisTextarea += '<div class="' + props.containerClass + '">';		                     
		        thisTextarea += '<label class="textareaLabel">' + fieldLabel.text() + '</label>' + inputField[0].outerHTML;
		        thisTextarea += '</div>';
		        break;

		    default:
		    	//Textarea placeholder, then add textarea to form
		        inputField.attr('placeholder', fieldLabel.text());
		        thisTextarea += '<div class="' + props.containerClass + '">';
		        thisTextarea += inputField[0].outerHTML;
		        thisTextarea += '</div>';
		        break;
		}

		return thisTextarea;
	}

	function selectField(fieldLabel, inputField, props){
		var thisSelect = "";

		if(props.inputClass) inputField.addClass(props.inputClass);
		                
		var theSelectId = inputField.attr('id');
		if(theSelectId){
		  
		  //handle birthday dropdowns
		  if(theSelectId.indexOf('birthday') > -1){
		    thisSelect += '<div class="' + props.containerClass + '">';
		    thisSelect += '<label class="selectLabel">' + fieldLabel.text() + '</label>';
		    thisSelect += inputField.filter('#birthday_month').addClass(props.inputClass)[0].outerHTML;
		    thisSelect += '</div>';
		    inputField.filter('#birthday_month').remove();
		    thisSelect += '<div class="' + props.containerClass + '">';
		    thisSelect += inputField.filter('#birthday_day').addClass(props.inputClass)[0].outerHTML;
		    thisSelect += '</div>';
		    inputField.filter('#birthday_day').remove();
		    thisSelect += '<div class="' + props.containerClass + '">';
		    thisSelect += inputField.filter('#birthday_year').addClass(props.inputClass)[0].outerHTML;
		    thisSelect += '</div>';
		    inputField.filter('#birthday_year').remove();
		    thisSelect += '</div>';
		  }else{
		    
		    //Select has an id, but is not a birthday.  unlikely scenario
		    thisSelect += '<div class="' + props.containerClass + '">';
		    thisSelect += '<label class="selectLabel">' + fieldLabel.text() + '</label>';
		    thisSelect += inputField[0].outerHTML;
		    thisSelect += '</div>';
		  }
		}else{

		  //select has no id, not a birthday.
		  thisSelect += '<div class="' + props.containerClass + '">';
		  thisSelect += '<label class="selectLabel">' + fieldLabel.text() + '</label>';
		  thisSelect += inputField[0].outerHTML;
		  thisSelect += '</div>';
		}

		return thisSelect; 
	}

	function checkboxField(fieldLabel, inputField, props) {
		var thisCheckbox = "";

		if (fieldLabel.length) {		              
		  if(props.checkboxContainerClass){
		  	thisCheckbox += '<div class="' + props.checkboxContainerClass + '">';
		  }else{
		  	thisCheckbox += '<div class="' + props.containerClass + '">';
		  }

		  thisCheckbox += inputField[0].outerHTML;
		  thisCheckbox += fieldLabel[0].outerHTML;
		  thisCheckbox += '</div>';
		}else{
		  thisCheckbox += '<div class="' + props.containerClass + '">';
		  thisCheckbox += inputField[0].outerHTML;
		  thisCheckbox += '</div>';
		}
		return thisCheckbox;		
	}

	function getSubmitButton(containerClass){
		var thisSubmit = "";
		thisSubmit += '<div class="' + containerClass + '">';
		thisSubmit += $('.submitButton')[0].outerHTML;
		thisSubmit += '</div>';
		return thisSubmit;		
	}

	/** When a test input is clicked, its label gets the class 'active'.  If the field is filled out, the class
	remains even if the user clicks somewhere else.  This is for styling purposes. **/
	function SetActiveLabels(containerClass){
		//formlabels
	    var textInput = $('input[type="text"]');
	    
	    //for text input animations
	    textInput.on('focus', function(){
	      var inputContainer = $(this).parent('.' + containerClass);
	      var inputLabel = inputContainer.find('label');
	      inputContainer.addClass('active');
	      inputLabel.addClass('active');
	    }).on('focusout', function(){
	      var inputContainer = $(this).parent('.' + containerClass);
	      inputContainer.removeClass('active');
	      if($(this).val() === ""){
	        var inputLabel = inputContainer.find('label');
	        inputLabel.removeClass('active');
	      }
	    });
	}

	/** Change to an input's value will enter the new value into all inputs that share the same name.
	When there are multiple instances of the form on a page, we want to make them all match
	as the user fills one of the forms out. **/
	function SetChangeListeners(containerClass){
		$('input[type="text"]').on('keyup', function(){
			var newValue = $(this).val();
			var textInputName = $(this).attr('name');
			var otherInputs = $('input[type="text"][name="' + textInputName +'"]');
			otherInputs.val(newValue);

			//label highlighting
			var inputContainer = otherInputs.parent('.' + containerClass);
			var inputLabel = inputContainer.find('label');
			if(newValue != ""){
				inputContainer.addClass('active');
				inputLabel.addClass('active');
			}else{
				inputContainer.removeClass('active');
				inputLabel.removeClass('active');
			}
		});

		$('textarea').on('keyup', function(){
			var newValue = $(this).val();
			var textareaName = $(this).attr('name');
			var otherTextareas = $('textarea[name="' + textareaName + '"]');
			otherTextareas.val(newValue);
		});

		$('input[type = "checkbox"]').on('change', function(){
			var newValue = this.checked;
			var checkboxName = $(this).attr('name');
			var otherCheckboxes = $('input[type="checkbox"][name="' + checkboxName + '"]');
			otherCheckboxes.prop('checked', newValue);
		});

		$('select').on('change', function(){
			var newValue = $(this).val();
			var selectName = $(this).attr('name');
			var otherSelects = $('select[name="' + selectName + '"]');
			otherSelects.val(newValue);
		});
	}


	//remove border and spacing issues in editor
	var editorSpan = $('span[id^="clickable"]');
	if(editorSpan.length){
		editorSpan.css('display', 'inline-block')
		.css('width', '100%')
		.css('border', '1px solid transparent')
		.css('margin', '-1px');

		var editorSpanAttr = editorSpan.attr('onmouseout');
		if(editorSpanAttr){
		  editorSpanAttr = editorSpanAttr.replace('style.border = \'none\';', 'style.border="1px solid transparent";');
		  editorSpanAttr = editorSpanAttr.replace('style.margin = \'0\';', 'style.margin="-1px";');
		  editorSpanAttr = editorSpanAttr.replace('style.display=\'inherit\';', 'style.display="inline-block";');

		  $('span[id^="clickable"]').attr('onmouseout', editorSpanAttr);

		  //clicking an item doesn't click the item behind it (clicking button text won't click the button as well)
		  $('a span[id^="clickable"]').click(function(e){
			e.stopPropagation();
		  });
		}
	}
})(jQuery);

//Button has href="javascript:if(validateForm() != false){myForm.submit()};"
//myForm automatically becomes an array with multiple forms.  Create empty object called "myForm",
//with method called "submit" that submits the first form.  Its values should be equal to the other form(s).
var myForm = new Object();
myForm.submit = function(){
	document.getElementsByClassName('form')[0].submit();
};
