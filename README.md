# crmform-plugin
jQuery plugin for AllClients landing pages

##GENERAL

The plugin does three basic things:

1. Decouples the landing page form from its table-based layout
2. Lets you clone multiple instances of the form
3. Corrects some of the odd behavior of the landing page editor

The out-of-the-box AllClients form is contained in a table, which is restrictive design-wise.  The CRMForm plugin pulls the form out of the table and wraps the inputs in divs, then removes the table from the document.

##USAGE

The crmform plugin requires jquery.  The best way to use the plugin is to copy and paste the code directly into the template inside a script tag, just below jQuery.


Include the form in a landing page:

```html
<div class="form-container">
	<!-- form -->
</div>
```

Invoke the plugin on the container:

```javascript
$('.form-container').CRMForm();
```

##SETTINGS

Option | Type | Default | Description
------ | ---- | ------- | -----------
style | String | "placeholders" | Determines where you display the input name.  The other option is "labels", anything else will default to "placeholders".  Select fields will have labels either way
containerClass | String | "form-control-container" | The class of the div that wraps each form control
checkboxContainerClass | String | none | The class of the div that wraps checkboxes.  If not specified, it will use the containerClass
inputClass | String | none | The class for inputs, selects, and textareas.  Will not apply to checkboxes

###BOOTSTRAP EXAMPLE

This will set up the form with Twitter Bootstrap classes

```javascript          
$('.form-container').CRMForm({
	style: "placeholders",
	containerClass: "form-group",
	inputClass: "form-control",
	checkboxContainerClass: "checkbox"
});
```

##CLONING THE FORM

You may wish to include multiple instances of the same form on a single landing page.  For example, you may have the form at the top and bottom of the page, or you may have the form in the masthead and a popup.  Call cloneForm and pass the location of the second form:

```javascript
$('.form-container').CRMForm({
	style: "labels"
}).cloneForm('.second-form-container');
```

Cloned forms will be synced so that when a user fills out one, all other instances of the form will be filled out simultaneously with the same information.  They will take on all the settings of the original form. 


##NOTES

Form spacers have to be given an explicit height

```html
.formSpacer {
  height: 32px;
}
```
