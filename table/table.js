/* global $ */
/* global renderCard */
/* global getJSON*/

var icons = [];
var grabbed = undefined;
var next_id = 0;
var next_deck_id = 0;

var deck_elems = {}

var seed = 0;
var $contextTarget = undefined;

function emit(payload, target){
    var id = getUrlParameter("id");
     var data = {
        "id":id,
        "action":JSON.stringify(payload),
        "target":target ? target : "both",
    };
    $.post("addRecord.php",data);
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    for(i = 0; i < a.length; i++){
        if(a[i].type=="Class"){
            a.move(i,a.length-1);
            break;
        }
    }
     for(i = 0; i < a.length; i++){
        if(a[i].type=="Race"){
            a.move(i,a.length-1);
            break;
        }
    }
}

function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function spawnCard(card,x,y){
    console.log(card)
    var $c = renderCard('#table',card,icons).addClass("draggable").addClass("card_"+(next_id));
    $c.attr("card_id",next_id);
    next_id++;
    $c.css("top",y).css("left",x);
    $c.on({'mousedown touchstart':function(e){
        if(e.button == 0 || e.type=="touchstart"){
            grabbed = $(this);
            grabbed.addClass("grabbed");
            grabbed.removeClass("mini");
        }
    }});
    
    $c.hover(
       function(){ $(this).removeClass('mini'); $(this).addClass('hover')},
       function(){ $(this).addClass('mini'); $(this).removeClass('hover') }
    )
    
    $c.on("contextmenu",function(e){
         if( e.button == 2 ) {
             e.preventDefault();
             $contextTarget = $c;
             $('#contextmenu').find('.card_option').show();
             $('#contextmenu').find('.deck_option').hide();
             $('#contextmenu').show();
             $('#contextmenu').css("top",e.pageY-4);
             $('#contextmenu').css("left",e.pageX-4);
         }
        return true;
    });
    
    $c.append($('<div/>').addClass("damage").text("0").hide());
    
    return $c;
}

function spawnDeck(deck,player_id, displayName){
    var deck_id = next_deck_id++;

    var $deck = $('<div/>').addClass('deck deck'+deck_id).text(displayName).appendTo($('#table')).click(
        function(e){
            emit({
                "type":"draw",
                "deck_id":""+deck_id,
            });
        }    
    );
    deck_elems[deck_id] = $deck; 
    $deck.attr("player_id",player_id);
    $deck.data("deck",deck);
    
    $deck.on("contextmenu",function(e){
         if( e.button == 2 ) {
             e.preventDefault();
             $contextTarget = $deck;
             $('#contextmenu').find('.card_option').hide();
             $('#contextmenu').find('.deck_option').show();
             $('#contextmenu').show();
             $('#contextmenu').css("top",e.pageY-4);
             $('#contextmenu').css("left",e.pageX-4);
         }
        return true;
    });
}

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};


function create_contextmenu(){
    $('<div id="contextmenu" />').appendTo($('#table')).hide();
    
    var values = [5,3,1,-1,-3];
    
    for(var i = 0; i < values.length; i++){
        var val = -values[i];
        var text = "+"+val+" Gold";
        if(val<0){
            text = "Spend "+(-val )+" Gold";
        }
        $('#contextmenu').append($('<button/>').addClass("deck_option").val(val).text(text).click(function(){
            var d = $(this).val();
            emit({
               type:"gold",
               gold: parseInt(d),
               player_id: $contextTarget.attr("player_id")
            }); 
            $('#contextmenu').hide();
        }));
    }
    
    $('#contextmenu').append($('<button/>').addClass("card_option").text("Delete").click(function(){
        $contextTarget.hide();
        $('#contextmenu').hide();
    }));
    
    $('#contextmenu').append($('<button/>').addClass("card_option").text("Show").click(function(){
        emit({
           type:"reveal",
           card_id:$contextTarget.attr("card_id")
        }); 
        $('#contextmenu').hide();
    }));
    
     $('#contextmenu').append($('<button/>').addClass("card_option").text("Toggle Stealth").click(function(){
        emit({
           type:"stealth",
           card_id:$contextTarget.attr("card_id")
        }); 
        $('#contextmenu').hide();
    }));
    
    for(var i = 0; i < values.length; i++){
        var text = "+"+values[i]+" Damage";
        if(values[i]<0){
            text = "Heal "+(-values[i])+" Damage";
        }
        $('#contextmenu').append($('<button/>').addClass("card_option").val(values[i]).text(text).click(function(){
            var d = $(this).val();
            emit({
               type:"damage",
               damage: parseInt(d),
               card_id:$contextTarget.attr("card_id")
            }); 
            $('#contextmenu').hide();
        }));
    }
    
    $(document).click(function(event){
        if(!$(event.target).closest('#contextmenu').length &&
           !$(event.target).is('#contextmenu')) {
            if($('#contextmenu').is(":visible")) {
                $('#contextmenu').hide();
            }
            $contextTarget = undefined;
        }  
    });
}

$( document ).ready(function() {
    var jsonPromises = [
        getJSON("../json/icons.json"),
        getJSON("../include/loadDeck.php?name=KAIWILLLOSE&full=true"),
        getJSON("../include/loadDeck.php?name=Benslatest&full=true")
    ];
    Promise.all(jsonPromises).then(function(result){ 
        create_contextmenu();
        icons=result[0];
        one_deck =result[1];
        two_deck =result[2];
        
        
        seed = parseInt(getUrlParameter("id"));
        seed = Math.floor(random()*100000);
        shuffle(one_deck);
        shuffle(two_deck);
        
        spawnDeck(one_deck.filter((c)=>c.type == 'Class' || c.type == 'Race'),1,"Deck One Characters");
        spawnDeck(one_deck.filter((c)=>c.type != 'Class' && c.type != 'Race'),1,"Deck One Actions");
        spawnDeck(two_deck.filter((c)=>c.type == 'Class' || c.type == 'Race'),2,"Deck Two Characters");
        spawnDeck(two_deck.filter((c)=>c.type != 'Class' && c.type != 'Race'),2,"Deck Two Actions");

        $(document).on({'mousemove touchmove':function(e){
            if(grabbed){            
                e.pageX = e.pageX ? e.pageX : e.originalEvent.touches[0].pageX;
                e.pageY = e.pageY ? e.pageY : e.originalEvent.touches[0].pageY;
                grabbed.css("left", e.pageX-grabbed.innerWidth()/2);
                grabbed.css("top", e.pageY-grabbed.innerHeight()/2);
            }
        }});
        
        $(document).on({'mouseup touchend':function(e){
             if(grabbed){
                var y = parseInt(grabbed.css("top"));
          
                emit({
                    "type":"move_card",
                    "card_id":grabbed.attr('class').match(/card_(\d+)/)[1], 
                    "x":grabbed.css("left"),
                    "y":grabbed.css("top")
                });
                
                grabbed.removeClass("grabbed");
                grabbed = undefined;
             }
        }});
        setInterval(function(){
            $.post("readRecord.php",{player:getUrlParameter("player"),id:getUrlParameter("id")},function(result){
                try{
                    var instr = JSON.parse(result);
                    for(var i =0; i < instr.length; i++){
                        processInstr(instr[i]);
                    }
                }catch(e){
                    console.error(result, e);
                }
            });
        },100);
    });
});

function processInstr(instr){
    console.log(instr);
    if(instr.type == "move_card"){
        var cy = parseInt(instr.y);
        var cx = parseInt(instr.x);
        $(".card_"+instr.card_id).css("left",cx);
        $(".card_"+instr.card_id).css("top",cy);
        if(!$(".card_"+instr.card_id).hasClass("hover"))
            $(".card_"+instr.card_id).addClass("mini");

        
    }else if(instr.type == "draw"){
        var $d = deck_elems[instr.deck_id]
        var p = $d.offset();
        console.log($d, $d.data(), $d.data('deck'))
        var $c = spawnCard($d.data('deck').pop(),p.left,p.top);
        if($d.attr('player_id') != getUrlParameter("player")){
            $c.addClass("facedown");
        }else{
            $c.addClass("hand");
        }
    }else if(instr.type=="reveal"){
        $(".card_"+instr.card_id).removeClass("hand").removeClass("facedown");
    }else if(instr.type=="search"){
        var deck=one_deck;
        if(instr.deck_id=="2"){
            deck=two_deck;
        }
        spawnCard(deck[instr.i],0,0);
        deck.splice(instr.i,1);
    }else if(instr.type=="damage"){
        var $d = $(".card_"+instr.card_id).find('.damage');
        $d.show();
        $d.text(parseInt($d.text()) + instr.damage);
        if(parseInt($d.text()) <= 0){
            $d.text("0").hide();
        }
    }else if(instr.type=="gold"){
        var $d = $(".deck"+instr.player_id).find('.gold');
        $d.show();
        $d.text(parseInt($d.text()) + instr.gold);
        if(parseInt($d.text()) <= 0){
            $d.text("0").hide();
        }
    }else if(instr.type=="stealth"){
        $(".card_"+instr.card_id).toggleClass("stealth");
    }
}
