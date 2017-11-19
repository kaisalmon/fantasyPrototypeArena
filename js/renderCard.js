/*global $*/
/*global localStorage*/

function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

$.fn.hasOverflow = function() {
    var $this = $(this);
    var $children = $this.find('*');
    var len = $children.length;

    if (len) {
        var maxWidth = 0;
        var maxHeight = 0
        $children.map(function(){
            maxWidth = Math.max(maxWidth, $(this).outerWidth(true));
            maxHeight = Math.max(maxHeight, $(this).outerHeight(true));
        });

        return maxWidth > $this.width() || maxHeight > $this.height();
    }

    return false;
};

function getJSON(url) {
    if(url.indexOf("?")  > -1){
        url+="&r="+Math.random();
    }else{
        url+="?r="+Math.random();
    }
    return get(url).then(JSON.parse);
}

function renderCard($prev, card, icons){
     var $card = $('<div/>').addClass('card').addClass(card.type);
     try{
         var titleText = card.type+' - '+card.name;
         var $titleBar = $('<div/>').addClass('titlebar').appendTo($card);
         var $title = $('<span/>').text(titleText).appendTo($titleBar);
         var $desc = ($('<div/>').addClass('descr').appendTo($card));
         var lines = card.descr.split('\n');
         for(var i = 0; i < lines.length;i++)
            $('<p/>').html(processLine(lines[i])).appendTo($desc);
            
         var $sidebar = $('<div/>').addClass('sideBar').appendTo($card);
 
        
        if(hasCost(card.type)){
             $('<div/>').addClass('cost').text(card.cost).appendTo($card);
        }
        
        if(hasStats(card.type)){
             var $strength = $('<div/>').addClass('strength').text(card.strength).appendTo($sidebar);
             if(parseInt(card.strength)==0 && card.type=='Race')
                $strength.css('visibility', 'hidden');
             
             var $health = $('<div/>').addClass('health').text(card.health).appendTo($sidebar);
             if(parseInt(card.health)==0 && card.type=='Race')
                $health.css('visibility', 'hidden');
                
            var $arcana = $('<div/>').addClass('arcana').text(card.arcana).appendTo($sidebar);
             if(parseInt(card.arcana)==0 && card.type=='Race')
                $arcana.css('visibility', 'hidden');
        }
        
        var $i;
        if(card.icon.lastIndexOf("http", 0) === 0)
            $i = $('<img/>').addClass('icon').appendTo($card).attr('src',card.icon);
        else
            $i = $('<img/>').addClass('icon').appendTo($card).attr('src',"/cardgame/include/loadImage.php?icon="+card.icon);
                    
        if(card.type == "Class" || card.type == "Hero"){
            $('<div/>').addClass('role').text(card.role).appendTo($card);
        }
        
        $i.attr("draggable", false);
     }catch(e){
         
     }
     if($prev)
        $card.appendTo($prev);
    
    //POST DRAWING CHANGES
    if($titleBar.hasOverflow()){
        $title.addClass('small');
        for(i = 0; i < 30; i++){
            var size = (100-i)+"%";
            $title.css("font-size",size);
            if(!$titleBar.hasOverflow())
                break;
        }
    }
        
    if($desc.outerHeight() < $desc[0].scrollHeight){
        $desc.addClass('small');
        for(i = 0; i < 60; i++){
            var size = (100-i/2)+"%";
            if(100-i/2 < 85){
                $desc.addClass('tiny')
            }
            $desc.css("font-size",size);
            if($desc.outerHeight() > $desc[0].scrollHeight )
                break;
        }
    }
    else if($desc.text().length==0){
        $desc.hide();
        $card.find('.icon').addClass('focus');
    }
    return $card;
}

function hasCost(type){
    return type == "Class" || type == "Race" || type == "Hero" || type == "Relic";
}
function hasStats(type){
    return type == "Class" || type == "Race" || type == "Hero";
}

function processLine(line){
    line = line.replace(/\</g,"&lt;");
    line = line.replace(/\>/g,"&gt;");
    
    line = line.replace(/Action:/gi,"<b>Action:<\/b>");
    line = line.replace(/Re<b>Action:<\/b>(.*?;)/gi,"<b>Reaction:<\/b><i>$1<\/i>");
    line = line.replace(/Choose\sOne\:/gi,"<b>Choose One:<\/b>");
    
    line = line.replace(/\*(.*?)\*/gi,"<b>$1<\/b>");
    line = line.replace(/\((.*?)\)/gi,"<i>($1)<\/i>");
    line = line.replace(/\"(.*?)\"/gi,"<span class='quote'>$1<\/span>");
    
    line = line.replace(/\s(arcana)/gi," <span class='small arcana'\/> <b>arcana</b>");
    line = line.replace(/\s(strength)/gi," <span class='small strength'\/> <b>strength</b>");
    line = line.replace(/\s(health)/gi," <span class='small health'\/> <b>health</b>");
    
    line = line.replace(/&lt;A&gt;/gi,"<span class='arcana'\/>");
    line = line.replace(/&lt;S&gt;/gi,"<span class='strength'\/>");
    line = line.replace(/&lt;H&gt;/gi,"<span class='health'\/>");
    return line;
}
