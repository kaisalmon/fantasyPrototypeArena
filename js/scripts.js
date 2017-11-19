/* global $ */
/* global localStorage */
/* global renderCard */
/* global getJSON*/
/* global get, hasStats, hasCost*/

var types=["Race","Class","Spell","Manoeuvre","Trick","Invocation","Hero","Relic"];
var roles=[ "Warrior","Mage","Priest","Rogue",
            "Warrior/Mage","Warrior/Priest","Warrior/Rogue",
            "Mage/Priest", "Mage/Rogue",
            "Priest/Rogue"];
            

$( document ).ready(function() {
    getJSON("/cardgame/json/icons.json").then(function(icons){
       
        var $cardRows = $('<div id="card_rows"/>');

        var $dataset = $('<datalist id="icons"/>').appendTo($('#editor'));
        for(var icon in icons){
            $('<option/>').val(icon).appendTo($dataset);
        }
        

        if(localStorage.cards === undefined)
            localStorage.cards = "[]";
        addToolBar(icons).prependTo($('#editor'));
        $cardRows.appendTo($('#editor'));
        renderAllCardInput($cardRows, icons);
        addToolBar(icons).appendTo($('#editor'));
        
        
    }, function(error) {
      console.log("Failed!", error);
    });
});

function renderAllCardInput($editor, icons){
    if(localStorage.cards === undefined)
            localStorage.cards = "[]";
     var cards = localStorage.cards;
     $editor.empty();
    cards = JSON.parse(cards);
    for(var i = 0; i < cards.length; i++){
        renderCardInput($editor, cards[i], icons);
    }
}

function addToolBar(icons){
    var $editor = $('#card_rows');
    var $toolbar = $('<div/>').addClass('toolbar');
     $('<button/>').text('+Card').appendTo($toolbar).click(function(){
        var $row = renderCardInput($editor,undefined,icons);  
        $('html, body').animate({
            scrollTop: ($row.offset().top - 300)
        }, 300);       
    }); 
    $('<button/>').text('Save Card Set').appendTo($toolbar).click(function(){
        var setName = window.prompt("What is your Card Set name?",localStorage.lastName);
        localStorage.lastName = setName;
        var request = {
            "name":setName,
            "cards":localStorage.cards
        };
        $.post( "/cardgame/include/saveCardSet.php",request).done(function( data ) {
          window.alert(data);
        });
    }); 
    getJSON("/cardgame/include/listCardSets.php").then(function(card_sets){
        var $dropdown = $('<div/>').addClass('dropdown').appendTo($toolbar);
        $('<button/>').text('Load Card Set').appendTo($dropdown);
        var $dropContent = $('<div/>').addClass('dropdown-content').appendTo($dropdown);
        for(var i = 0; i < card_sets.length; i++){
            $('<button/>').val(card_sets[i]).text(card_sets[i]).appendTo($dropContent).click(function(){
                var name = $(this).val();
                if(window.confirm("Load "+name+"?")){
                    localStorage.lastName = name;
                    get("/cardgame/include/loadCardSet.php?name="+name).then(function(str){
                       try{
                           JSON.parse(str);
                           localStorage.cards = str;
                           renderAllCardInput($('#card_rows'), icons);
                           serializeAll(icons);
                       }catch(e){
                           window.alert("Could not load file");
                           console.log(e);
                       }
                    });
                }
            });
        }
    });
    return $toolbar;
}

function renderCardInput($editor, card, icons) {
    var $row = $('<div/>').addClass('card_row');
    $('<label/>').text('Name:').appendTo($row);
    $('<input/>').addClass('name').appendTo($row).val(card ? card.name : "");
    
    $('<label/>').text('Type:').appendTo($row);
    var $type = $('<select/>').addClass('type').appendTo($row);
    for(var i = 0; i < types.length; i++)
        $('<option/>').text(types[i]).val(types[i]).appendTo($type);
    $type.change(function(){
        if($(this).val()!="Class" && $(this).val()!="Hero" ){
            $(this).closest('.card_row').find('.role').hide();
            $(this).closest('.card_row').find('.role_label').hide();
        }else{
            $(this).closest('.card_row').find('.role').show();
            $(this).closest('.card_row').find('.role_label').show();
        }
        if(hasStats($(this).val())){
            $(this).closest('.card_row').find('.character').show();
        }else{
            $(this).closest('.card_row').find('.character').hide();
        }
        if(hasCost($(this).val())){
            $(this).closest('.card_row').find('.cost').show();
            $(this).closest('.card_row').find('.cost_label').show();
        }else{
            $(this).closest('.card_row').find('.cost').hide();
            $(this).closest('.card_row').find('.cost_label').hide();
        }
    });
    $type.val(card ? card.type : "Spell");  
       
    $('<label/>').text('Icon:').appendTo($row);
    $('<input list="icons"/>').addClass('icon').appendTo($row).val(card ? card.icon : "");
    
    $('<label/>').text('Description:').appendTo($row);
    var $desc = $('<textarea data-autoresize/>').addClass('descr').appendTo($row).val(card ? card.descr : "");

 
    var resizeTextarea = function(el) {
        $(el).css('height', 'auto').css('height', el.scrollHeight);
    };
    $desc.on('keyup input blur focus', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
     
  
    var $character = $('<div/>').addClass('character').appendTo($row);
    
    $('<label/>').addClass('role_label').text('Role:').appendTo($character);
    var $role = $('<select/>').addClass('role').appendTo($character);
    for(i = 0; i < roles.length; i++)
        $('<option/>').text(roles[i]).val(roles[i]).appendTo($role);  
    $role.val(card ? card.role : "");   
    
    $('<label/>').addClass('cost_label').text('Cost:').appendTo($row);
    $('<input/>').addClass('cost').appendTo($row).val(card ? card.cost : "0");  
    
    $('<label/>').text('Strength:').appendTo($character);
    $('<input/>').addClass('strength').appendTo($character).val(card ? card.strength : "0");
    $('<label/>').text('Arcana:').appendTo($character);
    $('<input/>').addClass('arcana').appendTo($character).val(card ? card.arcana : "0");
    $('<label/>').text('Health:').appendTo($character);
    $('<input/>').addClass('health').appendTo($character).val(card ? card.health : "0");
    $editor.append($row);
    $row.find('input, textarea, select').blur(function(){
        serializeAll(icons);
    });    
    $desc.blur();
    $type.change();
    
    var $controls = $('<div/>').appendTo($row);
    
    $controls.append($('<button/>').text("Remove Card").click(function(){
       $row.remove();
       serializeAll(icons);
    }));
    
    return $row;
}

function serializeCard($card){

    var card = {};   
    try{
        $card.find('input, textarea, select').each(function(i, field){
            card[$(this).attr('class')] = $(this).val();
        });    
    }catch(e){
        
    }
    return card;

}

function serializeAll(icons){
    var $editor = $('#editor');
    var cards = [];
    $editor.find('.card_row').each(function(i, card){
        cards.push(serializeCard($(card)));
    });
    localStorage.setItem("cards", JSON.stringify(cards));
    renderAll(icons);
}

function renderAll(icons){
    $('#preview').empty();
    var cards = localStorage.cards;
    if(cards !== undefined){
        cards = JSON.parse(cards);
        for(var i = 0; i < cards.length; i++){
            renderCard($('#preview'), cards[i], icons);
        }
    }
}

