builder=(function(){
  var state={
    editing:false,
    $node:false,
    data:{
      x:0,
      y:0,
      rotate:0,
      scale:0
    }
  },
  selection = [],
  config={
  	rotation:0,
    rotateStep:1,
    scaleStep:0.02,
    visualScaling:10,
    redrawFunction:false,
    setTransformationCallback:false
  },
  defaults={
    x:0,
    y:0,
    rotate:0,
    scale:1
  },
  mouse={
    prevX:false,
    prevY:false,
    activeFunction:false
  },
  handlers={},
  redrawTimeout,
  //nodes
  $menu,$controls,$controls2,$impress,$overview;
  
  selection.hasstate = function(s) {
  	console.log('Checking '+s.$node.attr('id'));
  	for(var i = 0; i<this.length; i++) {
  		if(this[i].$node.attr('id') === s.$node.attr('id'))
  			return true;
  	}
  	return false;
  }
  selection.pushstate = function(s){
  	//make a deep enough copy
  	this.push({$node:s.$node,data:{x:s.data.x,y:s.data.y,rotate:s.data.rotate,scale:s.data.scale}});
  	s.$node[0].classList.add('selected');
  }
  selection.move = function(x,y) {
  	for(var i = 0; i<this.length; i++) {
  		this[i].data.x = (this[i].data.x)? (this[i].data.x)+x : x;
  		this[i].data.y = (this[i].data.y)? (this[i].data.y)+y : y;
  	}
  }
  selection.scale = function(x) {
  	for(var i = 0; i<this.length; i++) {
  		this[i].data.scale -= -x * config.scaleStep*config.visualScaling/10;
  	}
  }
  selection.setScale = function(s) {
  	for(var i = 0; i<this.length; i++) {
  		this[i].data.scale = s;
  	}
  }
  selection.rotate = function(x) {
  	for(var i = 0; i<this.length; i++) {
  		this[i].data.rotate -= -x*config.rotateStep % 360;
  	}
  }
  selection.setRotate = function(r) {
  	for(var i = 0; i<this.length; i++) {
  		this[i].data.rotate = r;
  	}
  }
  selection.setX = function(x) {
  	for(var i = 0; i<this.length; i++) {
  		this[i].data.x = x;
  	}
  }
  selection.setY = function(y) {
  	for(var i = 0; i<this.length; i++) {
  		this[i].data.y = y;
  	}
  }
  selection.clear = function() {
  	for(var i = 0; i<this.length; i++) {
  		this[i].$node[0].classList.remove('selected');
  	}
  	this.length = 0;
  }

  handlers.move=function(x,y){
    
    var v=fixVector(x,y);
    
    if (selection.length > 1) {
    	selection.move(v.x,v.y);
    } 
    state.data.x = (state.data.x)? (state.data.x)+v.x : v.x;
   	state.data.y = (state.data.y)? (state.data.y)+v.y : v.y;
    
  };
  handlers.scale=function(x){
  	if (selection.length > 1) {
    	selection.scale(x);
    } 
    state.data.scale-=  -x * config.scaleStep*config.visualScaling/10;
  };
  handlers.rotate=function(x){
    if (selection.length > 1) {
    	selection.rotate(x);
    } 
    state.data.rotate-= -x*config.rotateStep % 360;
  };
  

  function init(conf){
    config=$.extend(config,conf);
    
    if(config.setTransformationCallback){
      config.setTransformationCallback(function(x){
        // guess what, it indicates slide change too :)
        $controls.hide();
        
        //setting pu movement scale
        config.visualScaling=x.scale;
        //console.log(x.scale);
      //TODO: implement rotation handling for move
        config.rotation=~~(x.rotate.z);
        //console.log('rotate',x.rotate.z);
      //I don't see why I should need translation right now, but who knows...
      })
    }
    
    $('body').addClass('edit');
    
    $impress=$('#impress');
    $overview=$('#overview');
    
    $menu=$('<div></div>').addClass('builder-main');
    $('<div></div>').addClass('builder-bt bt-add').appendTo($menu).text('Add new').on('click',addSlide);
    $('<div></div>').addClass('builder-bt bt-overview').appendTo($menu).text('Overview').on('click',function(){
      config['goto']('overview');
    });
    $('<div></div>').addClass('builder-bt bt-download').appendTo($menu).text('Get file').on('click',downloadResults);
   // $('<div></div>').addClass('builder-bt bt-download').appendTo($menu).text('style.css').on('click',downloadStyle);
    
    
    var $c = $('<div></div>').addClass('bt-text').appendTo($menu);
    
        
    $('<span>X:</span>').appendTo($c)
    $('<input type="text" placeholder="X">').attr('id', 'mx').addClass('bt-text').text('Edit').appendTo($c).on("keyup", function(event){
  	  if(event.keyCode==13){ 
  	  	//state.$node=$(".active"); loadData(); 
  	  	state.data.x = parseInt($("#mx").val()); selection.setX(state.data.x); redraw(); }
    });
    $('<span>Y:</span>').appendTo($c)
    $('<input type="text" placeholder="Y">').attr('id', 'my').addClass('bt-text').text('Edit').appendTo($c).on("keyup", function(event){
  	  if(event.keyCode==13){ 
  	  	//state.$node=$(".active"); loadData(); 
  	  	state.data.y = parseInt($("#my").val()); selection.setY(state.data.y); redraw(); }
    });
    $('<span>S:</span>').appendTo($c)
    $('<input type="text" placeholder="Y">').attr('id', 'ms').addClass('bt-text').text('Edit').appendTo($c).on("keyup", function(event){
  	  if(event.keyCode==13){ 
  	  	//state.$node=$(".active"); loadData(); 
  	  	state.data.scale = parseFloat($("#ms").val()); selection.setScale(state.data.scale); redraw(); }
    });
    $('<span>R:</span>').appendTo($c)
    $('<input type="text" placeholder="Y">').attr('id', 'mr').addClass('bt-text').text('Edit').appendTo($c).on("keyup", function(event){
  	  if(event.keyCode==13){ 
  	  	//state.$node=$(".active"); loadData(); 
  	  	state.data.rotate = parseFloat($("#mr").val()); selection.setRotate(state.data.rotate); redraw(); }
    });

   
    
    $menu.appendTo('body');
    
    
    $controls=$('<div></div>').addClass('builder-controls').hide();
    
    $('<div></div>').addClass('bt-move').attr('title','Move').data('func','move').appendTo($controls);
    $('<div></div>').addClass('bt-rotate').attr('title','Rotate').data('func','rotate').appendTo($controls);
    $('<div></div>').addClass('bt-scale').attr('title','Scale').data('func','scale').appendTo($controls);
    
    $('<span></span>').addClass('builder-bt').text('Edit').appendTo($controls).click(editContents);
    //$('<span></span>').addClass('builder-bt').text('Wrap').appendTo($controls).click(wrapContents);
    

    
    
	//$("#my").attr("value",$(".active").attr("data-y") || 0);
	//$("#mz").attr("value",$(".active").attr("data-z") || 0);
    
    var showTimer;
    
    $controls.appendTo('body').on('mousedown','div',function(e){
      e.preventDefault();
      mouse.activeFunction=handlers[$(this).data('func')];
      loadData();
      mouse.prevX=e.pageX;
      mouse.prevY=e.pageY;
      $(document).on('mousemove.handler1',handleMouseMove);
      return false;
    }).on('mouseenter',function(){
      clearTimeout(showTimer);
    });
    $(document).on('mouseup',function(){
      mouse.activeFunction=false;
      $(document).off('mousemove.handler1');
    });
    
    $('body').on('mouseenter','.step',function(e){
      var shift = (e.shiftKey==1);
      var $t=$(this);
      showTimer=setTimeout(function(){
        if(!mouse.activeFunction){
          //show controls
          state.$node=$t;
          loadData();
          showControls(state.$node);
          if (shift) {
             if (!selection.hasstate(state)) {
         	 	selection.pushstate(state);
         	 }
          } else {
          	selection.clear();
          }
        }
      },500);
      $t.data('showTimer',showTimer);
    }).on('mouseleave','.step',function(){
      //not showing when not staying
      clearTimeout($(this).data('showTimer'));
    });
    
    $(window).on('beforeunload',function(){ return 'All changes will be lost'; });
    
    config['goto']('start');
    
    
  }
  
  var sequence = (function(){
    var s=2;
    return function(){
      return s++;
    }
  })()
  
  function addSlide(){
    //query slide id
    var id,$step;
    id='builderAutoSlide'+sequence();
    $step=$('<div></div>').addClass('step builder-justcreated').html('<h1>This is a new step. </h1> How about some contents?');
    $step[0].id=id;
    $step[0].dataset.scale=3;
    $step.insertAfter($('.step:last')); //not too performant, but future proof
    config.creationFunction($step[0]);
    // jump to the overview slide to make some room to look around
    config['goto']('overview');
  }
  
  
  function downloadStyle(){
    var uriContent,content,$doc;
    
    var BlobBuilder = (function(w) {
      return w.BlobBuilder || w.WebKitBlobBuilder || w.MozBlobBuilder;
    })(window);
    $.get('style.css', function (content) {
      var bb = new BlobBuilder;
      bb.append(content);
      saveAs(bb.getBlob("text/css;charset=utf-8"), "style.css");
    });
   
  }
  
  function downloadResults(){
    var uriContent,content,$doc;
    
    var BlobBuilder = (function(w) {
      return w.BlobBuilder || w.WebKitBlobBuilder || w.MozBlobBuilder;
    })(window);
    $doc=$(document.documentElement).clone();
    //remove all scripting
    //$doc.find('script').remove();
    //remove all current transforms
    $doc.find('.step, body, #impress, #impress>div').removeAttr('style');
    $doc.find('body').removeAttr('class');
    //remove gui
    $doc.find('.builder-controls, .builder-main, .counter').remove();
    
    $doc.find('.previous').each(function(index,element){element.classList.remove('previous');});
    $doc.find('.active').each(function(index,element){element.classList.remove('active');});
    $doc.find('.present').each(function(index,element){element.classList.remove('present');});
    $doc.find('.past').each(function(index,element){element.classList.remove('past');});
    $doc.find('.future').each(function(index,element){element.classList.remove('future');});
    //put overview at the end
    //$doc.find('#overview').appendTo($doc.find('#impress'));
    //add impress.js simple init
    //$doc.find('body').attr('class','impress-not-supported')[0].innerHTML+='<script src="https://raw.github.com/bartaz/impress.js/master/js/impress.js"></script><script>impress().init()</script>';
    content=$doc[0].outerHTML;
    //remove stuff
    //var bb = new BlobBuilder;
    //bb.append(content);
    //saveAs(bb.getBlob("text/html;charset=utf-8"), "presentation.html");
    
    var $t = $(this);
    var $txt=$('<textarea>').on('keydown keyup',function(e){
    	if (e.keyCode == 27) {
    		$txt.remove();
    	}
        e.stopPropagation();
      });
    $t.after($txt.val(content));  
    
  }
  
  function editContents() {
    var $t = $(this);
    if(state.editing===true){
      state.editing=false;
      state.$node.html($t.parent().find('textarea').val());
      state.$node.removeClass('builder-justcreated');
      $t.parent().find('textarea').remove();
      $t.text('Edit');
    }else{
      var $txt=$('<textarea>').on('keydown keyup',function(e){
        e.stopPropagation();
      });
      $t.text('OK');
      state.editing=true;
      $t.after($txt.val(state.$node.html()));
    }
  }
  
  function wrapContents() {
    state.$node.toggleClass('slide');
  }
  
  function showControls($where){
    var top,left,pos=$where.offset();
    //not going out the edges (at least one way)
    top=(pos.top>0)? pos.top+(100/config.visualScaling) : 0;
    left=(pos.left>0)? pos.left+(100/config.visualScaling) : 0;
    
    $controls.show().offset({
      top:top,
      left:left
    });
    
    $("#mx").attr("value",state.data.x || 0);
    $("#my").attr("value",state.data.y || 0);
    $("#mr").attr("value",state.data.rotate || 0);
    $("#ms").attr("value",state.data.scale || 0);
  }
  
  
  function loadData(){
    //state.data=state.$node[0].dataset;
    //add defaults
    
    
    state.data.x=parseFloat(state.$node[0].dataset.x) || defaults.x;   
    state.data.y=parseFloat(state.$node[0].dataset.y) || defaults.y;   
    state.data.scale=parseFloat(state.$node[0].dataset.scale) || defaults.scale;   
    state.data.rotate=parseFloat(state.$node[0].dataset.rotate) || defaults.rotate;   
    
  }
  
  function redraw(){
    clearTimeout(redrawTimeout);
    redrawTimeout=setTimeout(function(){
      //state.$node[0].dataset=state.data;
      
      if (selection.length > 1) {
      	for (var i = 0; i < selection.length; i++) {
      		selection[i].$node[0].dataset.x = selection[i].data.x;
      		selection[i].$node[0].dataset.y = selection[i].data.y;
      		selection[i].$node[0].dataset.rotate = selection[i].data.rotate;
      		selection[i].$node[0].dataset.scale = selection[i].data.scale;
      		
      		config.redrawFunction(selection[i].$node[0]);
      	}
      }
        
      state.$node[0].dataset.scale=state.data.scale;
      state.$node[0].dataset.rotate=state.data.rotate;
      state.$node[0].dataset.x=state.data.x;
      state.$node[0].dataset.y=state.data.y;
      /**/
      //console.log(state.data,state.$node[0].dataset,state.$node[0].dataset===state.data);
        
      config.redrawFunction(state.$node[0]);
      showControls(state.$node);
    //console.log(['redrawn',state.$node[0].dataset]);
    },20);
  }
  
  function fixVector(x,y){
    var result={x:0,y:0},
      angle=(config.rotation/180)*Math.PI,
      cs=Math.cos(angle),
      sn=Math.sin(angle);

    result.x = (x*cs - y*sn) * config.visualScaling;
    result.y = (x*sn + y*cs) * config.visualScaling;
    return result;
  }
  
  function handleMouseMove(e){
    e.preventDefault();
    e.stopPropagation();
      
      
    var x=e.pageX-mouse.prevX,
    y=e.pageY-mouse.prevY;
        
    mouse.prevX=e.pageX;
    mouse.prevY=e.pageY;
    if(mouse.activeFunction){
      mouse.activeFunction(x,y);
      redraw();
    }
    
    return false;
  }
  
  return {
    init:init
  };

})();
