(function (factory) {
	if(typeof define === 'function' && define.amd) define(['jquery'], factory);
	else if (typeof module === 'object' && module.exports) module.exports = factory(require('jquery'));
	else factory(jQuery);
}(function ($) {
	function styleObject(el){
	    var dom = el.get(0);
	    var style;
	    var returns = {};
	    if(window.getComputedStyle){
	        var camelize = function(a,b){
	            return b.toUpperCase();
	        };
	        style = window.getComputedStyle(dom, null);
	        for(var i = 0, l = style.length; i < l; i++){
	            var prop = style[i];
	            var camel = prop.replace(/\-([a-z])/g, camelize);
	            var val = style.getPropertyValue(prop);
	            returns[camel] = val;
	        };
	        return returns;
	    };
	    if(style = dom.currentStyle){
	        for(var prop in style){
	            returns[prop] = style[prop];
	        };
	        return returns;
	    };
	    return el.css();
	}

	function copyCSS(source, target){
		var styles = styleObject(source);
		target.css(styles);
		var sc = source.children();
		target.children().each(function(i){
			copyCSS(sc.eq(i), $(this))
		})
	}

	function diff(a, b){
		var o = {
			x : a.clientX - b.clientX,
			y : a.clientY - b.clientY
		}
		o.dist = Math.sqrt(Math.pow(o.x, 2)+Math.pow(o.y, 2));
		return o;
	}

	$.fn.dragable = function(getDragEl){
		var el = this;
		var dragging = false;
		el.on('mousedown.dragist', function(e){
			var toclone = el;
			if(getDragEl){
				toclone = getDragEl();
				el.append(toclone);
			}	
			var clone = toclone.clone()
				.width(toclone.width())
				.height(toclone.height());
			copyCSS(toclone, clone);

			if(getDragEl) toclone.remove();

			clone.css({
				position : 'absolute',
				margin : 0,
				pointerEvents : 'none',
				opacity : 0,
				zIndex : '199999999299',
				transition : '0.5s opacity'
			})
			clone.find('*').css({pointerEvents : 'none'});
			$('body').append(clone).css({
				'-webkit-touch-callout': 'none', 
				'-webkit-user-select': 'none',   
				'-khtml-user-select': 'none',  
				'-moz-user-select': 'none',   
				'-ms-user-select': 'none',   
				'user-select': 'none',
				'cursor' : 'none'
			});

			var hOffset = clone.height()/2;
			var wOffset = clone.height()/2;
			
			$('body').on('mousemove.dragist', function(me){
				var d = diff(e, me);
				n = d.dist > 10;
				if(!dragging && n){
					el.triggerHandler('dragstart');
					el.css({pointerEvents : 'none'});
				}else if(dragging && !n){
					el.triggerHandler('dragcancel');
					el.css({pointerEvents : 'all'});
				}
				dragging = n;
				if(dragging){
					clone.css({
						top : getDragEl?me.clientY-hOffset:me.clientY-e.offsetY,
						left : getDragEl?me.clientX-wOffset:me.clientX-e.offsetX,
						opacity : 0.7
					});
				}else clone.css({opacity : 0});
			});

			$('body').on('mouseover.dragist', function(mouseover){
				$(mouseover.target).triggerHandler('dragover');
			});

			$('body').on('mouseup.dragist', function(endev){
				endev.preventDefault();
				endev.stopPropagation();
				el.css({pointerEvents : 'all'});
				$('body').off('mousemove.dragist mouseup.dragist mouseover.dragist').css({
					'-webkit-touch-callout': '', 
					'-webkit-user-select': '',   
					'-khtml-user-select': '',  
					'-moz-user-select': '',   
					'-ms-user-select': '',   
					'user-select': '',
					'cursor' : ''
				});
				if(dragging){
					var res;
					$(endev.target).trigger('drop', function(arg){
						if(!res){ //only take the first responder
							el.trigger('dropped', arguments);
							res = true;
						}
					});
					setTimeout(function(){
						dragging = false;
						if(!res) el.triggerHandler('dragcancel');
					}, 100)
				}
				clone.remove();
				return false;
			});
		})
	}
}));
