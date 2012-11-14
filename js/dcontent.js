/* DContent v1.0 | fred@atissoftware.com */

if(jQuery){
	var DContent =  function(){
		var self = this;
	
		self.target = null;
		self.element = null;
		
		function setTarget(target,user_config){
			if(target instanceof jQuery){
				if(target.size() > 1){
					var result = [];
					target.each(function(idx,target_item){
						result.push(new DContent(target_item,user_config));
					});
					return result;
				}
				else{
					self.target = jQuery(target);
					if(user_config)
						configuration.set(user_config);
				}
			}
			return null;
		}
		
		var configuration = {
			values : {},
			set : function(user_config,user_value){
				var config = jQuery.isEmptyObject(configuration.values)?configuration.defaults:configuration.values;
				
				if(user_config instanceof Object){
					for(var i in user_config){
						if(config[i])
							config[i] = user_config[i];
					}
				}
				else if((user_config instanceof String) && user_value){
					if(config[user_config])
						config[user_config] = user_value;
				}
				configuration.values = config;
			},
			get : function(index){
				var config = jQuery.isEmptyObject(configuration.values)?configuration.defaults:configuration.values;;
				return index?(config[index]!=undefined?config[index]:null):config;
			},
			defaults : {
				'controls':['text','list','table','image','video'],
				'tinymce_path':'./js/tinymce/tiny_mce.js'
			}
		};
		self.getConfig = configuration.get;
		self.setConfig = configuration.set;
		
		var actions = {
			text : {
				_tinymce_settings : {
					script_url : configuration.get('tinymce_path'),
					width : '100%',
					theme : "advanced",
					theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,link",
					theme_advanced_buttons2 : "",
					theme_advanced_buttons3 : "",
					theme_advanced_buttons4 : "",
					theme_advanced_toolbar_align : 'bottom',
					theme_advanced_toolbar_location : 'bottom',
					theme_advanced_statusbar_location  : 'none',
					plugins : "paste",
					paste_text_sticky : true,
					setup : function(ed) {
						ed.onInit.add(function(ed) {
							ed.pasteAsPlainText = true;
						});
					},
					handle_event_callback : function(e,tinymce){
						if(e.type == 'keyup'){
							tinymce.save();
							var $this = jQuery('#'+tinymce.editorId),
								dc = $this.parents('.dcontent-element').data('dcontent');
							
							dc.update($this);
						}
					}
				},
				add : function(e){
					var textcontainer = actions.text._create();
					var target = jQuery(e[0].currentTarget);
					target.parent().siblings('.dcontent-container').append(textcontainer);
					
					textcontainer.find('input[type=hidden]').tinymce(actions.text._tinymce_settings);
					
					actions.text._apply();
				},
				remove : function(e){
					if(confirm('Delete text?')){
						var target = jQuery(e.currentTarget);
							target.parent().parent().remove();
                        saveToTarget();
					}
				},
				_create : function(id,text){
					id = (id?id:('dc-txt' + (new Date().getTime()))) + '-element';
					
					var textcontainer = jQuery('<div>').addClass('element-container textcontainer').attr('id',id);
					
					var controls = jQuery('<div>').addClass('text-controls');
						jQuery("<a>").attr('href','#').addClass('text-control remove-text').html('Remove Text').appendTo(controls);
					
					textcontainer.append(controls);
					if(text){
						jQuery('<input type="hidden" />').attr('value',text).appendTo(textcontainer);
					}
					else
						jQuery('<input type="hidden" />').appendTo(textcontainer);
					
					return textcontainer;
				},
				_apply : function(){
					jQuery('.text-control').unbind('click').bind('click',function(event){
						var $ctrl = jQuery(this),
							cls = this.className.split(' ');
						var dc = jQuery($ctrl.parents('.dcontent-element')).data('dcontent');
						
						var action = camelize(cls[1]);
						dc[action](event);
						
						return false;
					});
					jQuery('.textcontainer input[type=text]').unbind('change').bind('change',function(){
						var $this = jQuery(this),
							dc = $this.parents('.dcontent-element').data('dcontent');
						
						dc.update($this);
					});
				},
				_get : function(element){
					var elementContainer = jQuery(element),
						elementId = (elementContainer.attr('id')).replace(/\-element$/,'');
					var textvalue = '<div id="'+elementId+'">';
					var textelement = elementContainer.find('> input[type=hidden]');
					
					textvalue+= textelement.val();
					
					textvalue+= '</div>';
					return textvalue;	
				},
				_set : function(text){
					var data = actions.text._create(text.attr('id'),text.html());
					
                    data.find('input[type=hidden]').tinymce(actions.text._tinymce_settings);
					
					self.element.find('.dcontent-container').append(data);			
					actions.text._apply();
				}
			},
			list : {
				_tinymce_settings : {
					content_css : 'css/dcontent.tinymce.css',
					script_url : configuration.get('tinymce_path'),
					width : 200,
					height : 32,
					theme_advanced_resizing_min_height : 32,
					theme : "advanced",
					theme_advanced_buttons1 : "bold,italic,|,link",
					theme_advanced_buttons2 : "",
					theme_advanced_buttons3 : "",
					theme_advanced_buttons4 : "",
					theme_advanced_toolbar_align : 'bottom',
					theme_advanced_toolbar_location : 'external',
					theme_advanced_statusbar_location  : 'none',
					theme_advanced_source_editor_wrap : false,
					valid_elements : 'a[href|target=_blank],strong/b,em/i,u',
					plugins : "paste",
					force_br_newlines : false,
					force_p_newlines  : false,
					force_root_block  : false,
					paste_text_sticky : true,
					setup : function(ed) {
						ed.onInit.add(function(ed) {
							ed.pasteAsPlainText = true;
						});
						
						ed.onKeyDown.addToTop(function(ed, e) {
							if ((e.charCode == 13 || e.keyCode == 13)) {
							  var element = jQuery(ed.getElement());
							  
							  var elementContainer = element.parents('.element-container');
							  	  elementContainer.find('.list-controls .list-control.add-item-list').trigger('click');
								  
  							 ed.save();
							  
							  return tinymce.dom.Event.cancel(e);
							}
						});/*
						
						ed.onChange.add(function(ed){
							ed.save();
							setTimeout(function(){
								var $this = jQuery(ed.getElement()),
									dc = $this.parents('.dcontent-element').data('dcontent');
									
								dc.update($this);
							});
						});
						
						ed.onSaveContent.add(function(ed,o){
							o.content = o.content.replace(/<p[^>]*>/,'');
							o.content = o.content.replace(/<\/p>/,'');
						});*/
					},
					init_instance_callback : function( ed ){
					  // Work around for TinyMCE's hardcoded min-height
						$('#'+ed.editorContainer).find('td.mceIframeContainer iframe, table.mceLayout').height(32);
					}
				},
				//_item : '<li><input type="text" /><a href="#" class="list-control remove-item-list" title="Remove List">Remove List</a><!--<a href="#" class="list-control add-sub-item-list" title="Add Sub List">Add Sub List</a>--></li>',
				_item : '<li><input type="text" /><a href="#" class="list-control remove-item-list" title="Remove List">Remove List</a></li>',
				add : function(e){
					var listcontainer = actions.list._create();
					var target = jQuery(e[0].currentTarget);
					target.parent().siblings('.dcontent-container').append(listcontainer);
					
					//listcontainer.find('input[type=hidden]').tinymce(actions.list._tinymce_settings);
					
					actions.list._apply();
				},
				remove : function(e){
					if(confirm('Delete list?')){
						var target = jQuery(e.currentTarget);
							target.parent().parent().remove();
                        saveToTarget();
					}
				},
				type: {
					select : function(e){
						 var a = e.currentTarget;
						 var cls = a.className.split(' ');
						 if(cls[2]){
							 if(cls[2] == 'to-num-list'){
								 jQuery(a).removeClass('to-num-list').addClass('to-bul-list');
								 var ul = jQuery(a).parent().prev(),
									 html = ul.children().clone(true,true);
                                 
                                 var ol = jQuery('<ol>');
                                     ol.append(html);
									 ol.find('.mceEditor').remove();
									 ol.find('input[type=text]').removeAttr('id').removeAttr('aria-hidden').removeAttr('style');

                                 ul.replaceWith(ol);
							 }
							 if(cls[2] == 'to-bul-list'){
								 jQuery(a).removeClass('to-bul-list').addClass('to-num-list');
								 var ol = jQuery(a).parent().prev(),
									 html = ol.children().clone(true,true);
                                 
                                 var ul = jQuery('<ul>');
                                     ul.append(html)
									 ul.find('.mceEditor').remove();
									 ul.find('input[type=text]').removeAttr('id').removeAttr('aria-hidden').removeAttr('style');
								 
								 ol.replaceWith(ul);
							 }
							 actions.list._apply();
						 }
					}
				},
				item : {
					add : function(e){
						var target = jQuery(e.currentTarget),
							item = jQuery(actions.list._item);
						target.parent().siblings('ul,ol').append(item);	
											
						actions.list._apply();
					},
					remove : function(e){
						if(confirm('Delete item?')){
							var target = jQuery(e.currentTarget);
							target.parent().remove();
						}
					}
				},/*
				'sub-item' : {
					add : function(e){
						var target = jQuery(e.currentTarget);
						if(target.siblings('.listcontainer').size()){
							actions.list['sub-item'].remove(target.siblings('.listcontainer'));
							target.html('Add Sub-Item').attr('title','Add Sub-Item');
							target.removeClass('remove');
						}
						else{						
							var listcontainer = actions.list._create();							
								listcontainer.appendTo(target.parent());
							target.html('Remove Sub-Item').attr('title','Remove Sub-Item');
							target.addClass('remove');
						}
						actions.list._apply();
					},
					remove : function(element){
						element = element ? element : this;
						if(confirm('Delete sub-item?')){
							jQuery(element).remove();
						}
					}
				},*/
				_create : function(id,list){
					id = (id?id:('dc-lst' + (new Date().getTime()))) + '-element';
	
					var listcontainer = jQuery('<div>').addClass('element-container listcontainer').attr('id',id);
					

					var controls = jQuery('<div>').addClass('list-controls');
						jQuery("<a>").attr('href','#').addClass('list-control add-item-list').html('Add Item').appendTo(controls);
						jQuery("<a>").attr('href','#').addClass('list-control select-type-list to-num-list').html('Change List Type').appendTo(controls);
						jQuery("<a>").attr('href','#').addClass('list-control remove-list').html('Remove List').appendTo(controls);
					
					listcontainer.append(controls);
					
					if(list){
						list.find('> li').each(function(liIdx,LI){
							var text = htmlEncode(jQuery(LI).html());
								text = addSlashes(text);
								
                            var listitem = actions.list._item;
                                listitem = listitem.replace(/input/,('input value="'+text+'"'));
							var newLI = jQuery(listitem);
								newLI.find('> input[type=text]');
							
							if(text)
								jQuery(LI.firstChild).replaceWith(newLI.html());
							else
								jQuery(LI).append(newLI.html());/*
							var sublist = jQuery(LI).find('> div').filter(function() {
								return this.id.match(/^dc\-lst/);
							});
							if(sublist.size()){
								var newsublist = actions.list._set(sublist,true);								
								sublist.replaceWith(newsublist);
								actions.list._apply();
							}*/
						});
						
						jQuery(list).prependTo(listcontainer);
					}
					else
						jQuery('<ul>'+ actions.list._item +'</ul>').prependTo(listcontainer);
					
					return listcontainer;
				},
				_apply : function(){
					jQuery('.list-control').unbind('click').bind('click',function(event){
						var $ctrl = jQuery(this),
							cls = this.className.split(' ');
						var dc = jQuery($ctrl.parents('.dcontent-element')).data('dcontent');
						
						var action = camelize(cls[1]);
						dc[action](event);
						return false;
					});/*
					jQuery('.listcontainer input[type=text]')
						.unbind('change')
						.bind('change',function(){
							var $this = jQuery(this),
								dc = $this.parents('.dcontent-element').data('dcontent');
								
							dc.update($this);
						});*/
					jQuery('.listcontainer input[type=text]').each(function(idx,elem){
						var $this = jQuery(elem);
						
						if(!/^mce_/.test($this.attr('id'))){
							$this.tinymce(actions.list._tinymce_settings);
							//$this.next().css('display','inline');
							/*							
							setTimeout(function(){ 
								if(tinymce) tinymce.execCommand('mceFocus',false,$this.attr('id'));
							},100);*/
						}
					});

				},
				_get : function(element){
					var source = jQuery(element),
						result = jQuery('<div>').attr('id',source.attr('id').replace(/\-element$/,''));
						
					var listcont = source.children().prop('tagName').toLowerCase();
						listcont = jQuery('<'+ listcont +'>');
					
					source.find('li > input[type=text]').each(function(d,element){
						var $element = jQuery(element); console.log($element.val());
						jQuery('<li>').html($element.val()).appendTo(listcont);
					});
					listcont.appendTo(result);
					
					var res = jQuery('<div>').append(result);
					return res.html();
					
					//var elementContainer = jQuery(element).clone(true,true);
					
					// remove tinymce editor
					//elementContainer.find('.mceEditor').remove();
					
					// replace textbox with normal text + remove list item controls
					elementContainer.find('ul > li > input[type=text], ol > li > input[type=text]').each(function(idx,element){
						var text = jQuery(element).val();
						jQuery(element).parent().prepend(text);
						jQuery(element).siblings('.list-control, .mceEditor').remove();
						jQuery(element).remove();
					});
					// remove list controls
					elementContainer.find('.list-controls').remove();
					// fix ids of sub list containers
					elementContainer.find('.listcontainer').each(function(idx,listcontainer){
						var lc = jQuery(listcontainer),
							id = lc.attr('id');
						
						var newID = id.replace(/\-element$/,'');
						
						lc.attr({'id':newID,'class':null});
					});
					// fix id of elementContainer
					var ecID = elementContainer.attr('id'),
						newID = ecID.replace(/\-element$/,'');
					
					elementContainer.attr({'id':newID,'class':null});
					
					var data = jQuery('<div>').append(elementContainer);

					return data.html();
				},
				_set : function(list,do_return){
					do_return = do_return?do_return:false;
					var data = actions.list._create(list.attr('id'),list.children());
					
					//data.find('input[type=text]').tinymce(actions.list._tinymce_settings);
					
					if(do_return)
						return data;
					else
						self.element.find('.dcontent-container').append(data);			
					actions.list._apply();
				}
			},
			table : {
				_columncontrols : '<a href="#" class="table-control remove-column-table" title="Remove Current Column">Remove Column</a><a href="#" class="table-control add-column-table" title="Add Column to the Right">Add Column</a>',
				_rowcontrols : '<a href="#" class="table-control remove-row-table" title="Delete Current Row">Delete Row</a><a href="#" class="table-control add-row-table" title="Add Row Below">Add Row</a>',
				_field : '<td><input type="text" /></td>',
				_tinymce_settings : {
					content_css : 'css/dcontent.tinymce.css',
					script_url : configuration.get('tinymce_path'),
					width : 65,
					height : 30,
					theme_advanced_resizing_min_height : 32,
					theme : "advanced",
					theme_advanced_buttons1 : "bold,italic,|,link",
					theme_advanced_buttons2 : "",
					theme_advanced_buttons3 : "",
					theme_advanced_buttons4 : "",
					theme_advanced_toolbar_align : 'bottom',
					theme_advanced_toolbar_location : 'external',
					theme_advanced_statusbar_location  : 'none',
					theme_advanced_source_editor_wrap : false,
					valid_elements : 'a[href|target=_blank],strong/b,em/i,u',
					plugins : "paste,autosave",
					force_br_newlines : false,
					force_p_newlines  : false,
					force_root_block  : false,
					paste_text_sticky : true,
					setup : function(ed) {
						ed.onInit.add(function(ed) {
							ed.pasteAsPlainText = true;
							jQuery(ed.getContainer())
								.mouseleave(function(){
									jQuery(ed.getContainer()).find('.mceExternalToolbar').css('display','none');
								})
								.mouseenter(function(){
									jQuery(ed.getContainer()).find('.mceExternalToolbar').css('display','block');
								});
						});
						
						ed.onKeyDown.addToTop(function(ed, e) {
							if ((e.charCode == 13 || e.keyCode == 13)) {
							  var element = jQuery(ed.getElement());
							  
							  var elementContainer = element.parents('.element-container');
							  	  elementContainer.find('.list-controls .list-control.add-item-list').trigger('click');
								  
  							 ed.save();
							  
							  return tinymce.dom.Event.cancel(e);
							}
						});/*
						
						ed.onChange.add(function(ed){
							ed.save();
							setTimeout(function(){
								var $this = jQuery(ed.getElement()),
									dc = $this.parents('.dcontent-element').data('dcontent');
									
								dc.update($this);
							});
						});
						
						ed.onSaveContent.add(function(ed,o){
							o.content = o.content.replace(/<p[^>]*>/,'');
							o.content = o.content.replace(/<\/p>/,'');
						});*/
					},
					init_instance_callback : function( ed ){
					  // Work around for TinyMCE's hardcoded min-height
						$('#'+ed.editorContainer).find('td.mceIframeContainer iframe, table.mceLayout').height(32);
					}
				},
				add : function(e){
					var tablecontainer = actions.table._create();
					var target = jQuery(e[0].currentTarget);
					target.parent().siblings('.dcontent-container').append(tablecontainer);
					
					actions.table._apply();
				},
				remove : function(e){
					if(confirm('Delete table?')){
						var target = jQuery(e.currentTarget);
							target.parent().parent().remove();
                        saveToTarget();
					}
				},
				row : {
					add : function(e){
						var a = jQuery(e.currentTarget);
						var tr = a.parents('tr');
						
						var newTR = jQuery('<tr></tr>');
						for(var i=0; i<tr.children('td').size()-1; i++){
							jQuery(actions.table._field).appendTo(newTR);
						}
						jQuery('<td>'+actions.table._rowcontrols+'</td>').appendTo(newTR);
						
						newTR.insertAfter(tr);
						
						actions.table._apply();
					},
					remove : function(e){
						if(confirm('Delete Row?')){
							var a = jQuery(e.currentTarget);
							var tr = a.parents('tr');
							
							tr.remove();
						}
					}
				},
				column : {
					add : function(e){
						var a = jQuery(e.currentTarget);
						var td = a.parent(), tr = td.parent();
						var tdIdx = td.prevAll().size();
						var indexedTD = tr.siblings().find('> td:eq('+tdIdx+')');
						
						jQuery(actions.table._field).insertAfter(indexedTD);
						
						// insert controls column
						jQuery('<td>'+ actions.table._columncontrols +'</td>').insertAfter(td);
						
						actions.table._apply();
						/*
						var i=0;
						while(tinymce.editors[i]){
							var ed = tinymce.editors[i];
							i++;
						}
						*/
					},
					remove : function(e){
						if(confirm('Delete Column?')){
							var a = jQuery(e.currentTarget);
							var td = a.parent(), tr = td.parent();
							var tdIdx = td.prevAll().size();
							
							tr.find('td:eq('+tdIdx+')').remove();
							tr.siblings().find('td:eq('+tdIdx+')').remove();
						}
					}
				},
				_create : function(id,table){
					id = (id?id:('dc-tbl' + (new Date().getTime()))) + '-element';
	
					var tablecontainer = jQuery('<div>').addClass('element-container tablecontainer').attr('id',id);
					
					var controls = jQuery('<div>').addClass('table-controls');
						jQuery("<a>").attr('href','#').addClass('table-control remove-table').html('Remove Table').appendTo(controls);
					
					tablecontainer.append(controls);
					if(table){
						table.find('td').each(function(tdIdx,TD){
							TD = jQuery(TD);
							var value = TD.html();
							
							TD.html('');
							TD.append(jQuery('<input/>').attr({'type':'text','value':value}));
						});
						var TDs = table.find('tr:first-child td').size();
						
						// add row controls
						table.find('tr').each(function(trIdx,TR){
							jQuery(TR).append('<td>'+ actions.table._rowcontrols +'</td>');
						});
						
						// add column controls
						var TR = jQuery('<tr>');
						for(var i=0; i<TDs; i++){
							jQuery('<td>'+ actions.table._columncontrols +'</td>').appendTo(TR);
						}
						jQuery('<td>&nbsp;</td>').appendTo(TR);

						var TDs = table.find('tr:first > td').size() - 1;
						var i=0, colCtrlsTR = jQuery('<tr>');
						while(i++<TDs){
							jQuery('<td>').html(actions.table._columncontrols).appendTo(colCtrlsTR);
						}
						colCtrlsTR.appendTo(table);
						
						jQuery('<div>').append(table).prependTo(tablecontainer);
					}
					else
						jQuery('<div><table><tr><td><input type="text" /></td><td><input type="text" /></td><td><input type="text" /></td><td>'+ actions.table._rowcontrols +'</td></tr><tr><td><input type="text" /></td><td><input type="text" /></td><td><input type="text" /></td><td>'+ actions.table._rowcontrols +'</td></tr><tr><td>'+ actions.table._columncontrols +'</td><td>'+ actions.table._columncontrols +'</td><td>'+ actions.table._columncontrols +'</td></tr></table></div>').prependTo(tablecontainer);
					
					return tablecontainer;
				},
				_apply : function(){
					jQuery('.table-control').unbind('click').bind('click',function(event){
						var $ctrl = jQuery(this),
							cls = this.className.split(' ');
						var dc = jQuery($ctrl.parents('.dcontent-element')).data('dcontent');
						
						var action = camelize(cls[1]);
						dc[action](event);
						
						return false;
					});/*
					jQuery('.tablecontainer input[type=text]').unbind('change').bind('change',function(){
						var $this = jQuery(this),
							dc = $this.parents('.dcontent-element').data('dcontent');
						
						dc.update($this);
					});*/
					jQuery('.tablecontainer input[type=text]').tinymce(actions.table._tinymce_settings);
				},
				_get : function(element){
					var elementContainer = jQuery(element),
						elementId = (elementContainer.attr('id')).replace(/\-element$/,'');
					
					var tablevalue = '<div id="'+elementId+'"><table>';
					var tableelement = elementContainer.find('> div > table').clone(true);
	
					var TRs = tableelement.children().children();
					for(var i=0; i<TRs.size()-1; i++){
						var TR = jQuery(TRs[i]);
						tablevalue+= '<tr>';
						var TDs = TR.children();
						for(var j=0; j<TDs.size()-1; j++){
							var TD = jQuery(TDs[j]);
							tablevalue+= '<td>' + (TD.find('input[type=text]').val()) + '</td>';
						}
						tablevalue+= '</tr>';
					}
					tablevalue+= '</table></div>';
					
					return tablevalue;
				},
				_set : function(table){
					var data = actions.table._create(table.attr('id'),table.find('> table'));
					
					self.element.find('.dcontent-container').append(data);			
					actions.table._apply();
				}
			},
			image : {
				add : function(){
					
				},
				remove : function(){
					
				}
			},
			video : {
				add : function(){
					
				},
				remove : function(){
					
				}
			}
		};
		// create outside access for add actions		
		for(var i in actions){
			var type = i;
			for(var j in actions[i]){
				var act = j, functionTitle;
				if(!/^\_/.test(act)){
					if(actions[i][j] instanceof Function){
						functionTitle = camelize(act + '-' + type);
						self[functionTitle] = actions[i][j];
					}
					else{
						var subaction = act;
						for(var k in actions[i][j]){
							act = k;
							functionTitle = camelize(act + '-' + subaction + '-' + type);
							self[functionTitle] = actions[i][j][k];
						}
					}
				}
			}
		}
		
		function addSlashes(value){
			value = value.replace(/[\']+/img,"\\'");
			value = value.replace(/[\"]+/img,'&quot;');
			return value;
		}
		
		function htmlEncode(value){
			return (value)?jQuery('<div />').text(value).html():'';
		}
		
		function htmlDecode(value) {
			return (value)?$('<div />').html(value).text():'';
		}

		
		function targetDataToFragment(target){
			target = target?target:self.target;
			
			var val = jQuery(target).val();
			
			return jQuery('<div>'+val+'</div>');
		}
		
		function parseFromTarget(target){
			target = target?jQuery(target):self.target;	
			
			var currentData = targetDataToFragment(target);

			if(currentData.html()){
                if(!/dc\-(txt|lst|tbl)/i.test(currentData.html())){
                    var div = document.createElement('div');
                        div.id = 'dc-txt' + (new Date().getTime());
                        div.innerHTML = '<div>' + currentData.html() + '</div>';
                    actions.text._set(jQuery(div),true);
                }else{
                    currentData.children().each(function(idx,element){
                        var elem = $(element);
                        var data,
                            id = elem.attr('id'),
                            type = id.substr(3,3);
                        switch(type){
                            case 'txt':
                                actions.text._set(elem);
                                break;
                            case 'lst':
                                actions.list._set(elem);
                                break;
                            case 'tbl':
                                actions.table._set(elem);
                                break;
                        }					
                    });
                }
			}
		}
		
		function updateTarget(field,target){
			target = target?jQuery(target):self.target;	
			var fieldContainer = field.parents('.element-container:eq(0)'),
				fieldId = fieldContainer.attr('id').replace(/\-element$/,''),
				fieldClass = fieldContainer.attr('class').split(' '),
				fieldType = fieldClass[1].replace(/container$/,'');
			
			var currentData = targetDataToFragment(target);
			if(currentData.find('#' + fieldId).size()){
				var fieldData = actions[fieldType]['_get'](fieldContainer);
				var updatedData = currentData;
					updatedData.find('#' + fieldId).replaceWith(fieldData);
				target.val(updatedData.html());
			}
			else{
				saveToTarget(target);
			}
		}
		this.update = updateTarget;
		
		function saveToTarget(target){
			var data = '';
			target = target?target:self.target;
			
			var element = jQuery(self.element),
				items = element.find('> .dcontent-container').children();
			items.each(function(idx,elem){
				var elementContainer = jQuery(elem),
					cnames = elementContainer.attr('class');
				cnames = cnames.split(' ');
				
				var type = cnames[1].replace(/container/,'');
				
				data+= actions[type]['_get'](elementContainer);
			});
			target.val(data);
		}
		this.save = saveToTarget;
		
		var create = {
			element : function(){
				var index = jQuery('.dcontent-element').size() + 1;
				
				self.element = jQuery("<div>")
					.attr('id', 'dcontent-el'+index)
					.addClass('dcontent-element')
					.css({
						'width': self.target.width()
					})
					.insertAfter(self.target);
				self.target.css('display','none');
			},
			container : function(){
				var container = jQuery("<div>").addClass('dcontent-container')
				
				container.appendTo(self.element);
			},
			controls : function(){
				var controls = jQuery("<div>").addClass('dcontent-controls')
				
				var user_controls = configuration.get()['controls'];
				for(var i=0; i<user_controls.length; i++){
					switch(user_controls[i]){
						case 'text':
							jQuery('<a>').attr({'href':'#','title':'Add Text'}).addClass('text').html('Add Text').appendTo(controls);
							break;
						case 'list':
							jQuery('<a>').attr({'href':'#','title':'Add List'}).addClass('list').html('Add List').appendTo(controls);
							break;
						case 'table':
							jQuery('<a>').attr({'href':'#','title':'Add Table'}).addClass('table').html('Add Table').appendTo(controls);
							break;
						case 'image':
							jQuery('<a>').attr({'href':'#','title':'Add Image'}).addClass('image').html('Add Image').appendTo(controls);
							break;
						case 'video':
							jQuery('<a>').attr({'href':'#','title':'Add Video'}).addClass('video').html('Add Video').appendTo(controls);
							break;
					}
				}
				
				controls.children().unbind('click');
				controls.children().bind('click',function(){
					var action = 'add' + this.className.substr(0,1).toUpperCase() + this.className.substr(1).toLowerCase();
					var $this = jQuery(this);
					
					var dc = jQuery($this.parentsUntil('.dcontent-element').parent()).data('dcontent');
	
					dc[action](arguments);
					
					return false;
				});
				
				controls.appendTo(self.element);
			}
		};
		
		function init(){
			create.element();
			create.container();
			create.controls();
			
			self.element.data('dcontent',self);
			
			parseFromTarget();
		}
		
		// initialize
		var args = arguments;
		if(args.length == 0) return null;
	
		if(args[0]){
			var result = setTarget(jQuery(args[0]),args[1]);
			if(result) return result;
			init();
		}
		
		function moveCaretToEnd(el) {
			if (typeof el.selectionStart == "number") {
				el.selectionStart = el.selectionEnd = el.value.length;
			} else if (typeof el.createTextRange != "undefined") {
				el.focus();
				var range = el.createTextRange();
				range.collapse(false);
				range.select();
			}
		}
	
		function camelize(str){
			var parts = str.split(/[\-\_]/);
			var result = parts[0];
			if(parts.length > 1){
				for(var i=1; i<parts.length; i++){
					result += (parts[i].substr(0,1).toUpperCase() + parts[i].substr(1).toLowerCase());
				}
			}
			return result;
		}
	};
} else {
	alert("Cannot load DContent Javascript Class, jQuery is required.");
}