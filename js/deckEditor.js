/* global $ */
/* global localStorage */
/* global renderCard */
/* global getJSON*/

var current_set = [];
var deck = [];

$( document ).ready(function() {
    $('#editor').text("Loading..");
    getJSON("json/icons.json").then(function(icons){ 
        getJSON("include/listDecks.php").then(function(card_sets){
            if(localStorage.deck === undefined)
                localStorage.deck = "[]";
            $('#editor').empty();
            
              $('#editor').append($('<button/>').addClass('save_deck').text("Save Deck").click(function(){
                var deckName = window.prompt("What is your Deck's name?",localStorage.lastDeckName);
                localStorage.lastDeckName = deckName;
                localStorage.deck = JSON.stringify(deck);
                var request = {
                    "name":deckName,
                    "deck":localStorage.deck
                };
                $.post( "include/saveDeck.php",request).done(function( data ) {
                  window.alert(data);
                });
            }));
            var $dropdown = $('<div/>').addClass('dropdown').appendTo($('#editor'));
            $('<button/>').addClass('load_deck').text('Load Deck').appendTo($dropdown);
            var $dropContent = $('<div/>').addClass('dropdown-content').appendTo($dropdown);
            for(var i = 0; i < card_sets.length; i++){
                $('<button/>').val(card_sets[i]).text(card_sets[i]).appendTo($dropContent).click(function(){
                    var name = $(this).val();
                    if(window.confirm("Load "+name+"?")){
                        localStorage.lastDeckName = name;
                        $.ajax("include/loadDeck.php?name="+name).done(function(str){
                           try{
                               deck = JSON.parse(str);
                               localStorage.deck = str;
                               renderDeck();
                           }catch(e){
                               window.alert("Could not load file");
                               console.log(e);
                           }
                        });
                    }
                });
            }
            $('#editor').append($('<button/>').addClass('clear').text("Clear").click(function(){
                localStorage.deck = "[]";
                deck = [];
                renderDeck();
            }));
            $('#editor').append($('<br>'));
            
            $('#editor').append($('<select/>').addClass("card_set"));
            $('#editor').append($('<select/>').addClass("roles"));
            $('#editor .roles').append($('<option/>').text("All Roles"));
            $('#editor .roles').append($('<option/>').text("Warrior"));
            $('#editor .roles').append($('<option/>').text("Mage"));
            $('#editor .roles').append($('<option/>').text("Rogue"));
            $('#editor .roles').append($('<option/>').text("Priest"));
            $('#editor').append($('<div/>').addClass('card_list'));
            $('#editor').append($('<div/>').addClass('deck'));
            renderDeck();
            $.ajax("include/listCardSets.php").done(function(data){
                var sets = JSON.parse(data);
                for(var i = 0; i < sets.length; i++){
                    $('#editor .card_set').append(
                        $('<option/>').text(sets[i])
                    );
                }
            });
            $('#editor .card_set').change(function(){
                var set_name = $(this).val();
                $.ajax("include/loadCardSet.php?name="+set_name).done(function(data){
                    current_set = JSON.parse(data);
                    renderSet(icons);  
                });
            });
            $('#editor .roles').change(function(){
                renderSet(icons);  
            });
        });
     });
});

function renderSet(icons){
    $('#editor .card_list').empty();
    var cards = current_set;
    for(var i = 0; i < cards.length; i++){
        if($('#editor .roles').val()=="All Roles" || matches_filter(cards[i])){
            var $btn = $('<button/>').text("+ "+cards[i].name).addClass("card_option");
            $('#editor .card_list').append($btn);
            renderCard($btn, cards[i], icons);
            var card = cards[i];
            $btn.click(function(card){
               return function(){
                   var set_name = $('.card_set').val();
                   pushCard(card.type, card.name, set_name);
               };
            }(card));
        }
    }
}

function pushCard(type, name, set){
    var n = 0;
    for(var i = 0; i < deck.length; i++){
        if(deck[i].card_name == name)
            n++;
    }
    console.log(name+", "+n);
    var max = type == "Class" ||  type == "Race" ? 1 : 2;
    if(n>=max) return;
    deck.push({
       card_set:set,
       card_name:name,
       type:type
   });
   localStorage.deck = JSON.stringify(deck);
   renderDeck();
}

function matches_filter(card){
    var role = $('#editor .roles').val();
    var action = "Manoeuvre";
    if(role=="Mage")action="Spell";
    if(role=="Rogue")action="Trick";
    if(role=="Priest")action="Invocation";
    if(card.type == "Race")return true;
    if(card.type == action)return true;
    if(card.type != "Class")return false;
    return card.role == role;
}

function renderDeck(){
    deck = JSON.parse(localStorage.deck);
    $('.deck').empty();
    var freqTable = {};
    for(var i = 0; i < deck.length; i++){
        var $listing = $('<div/>').addClass('deck_listing').appendTo($('.deck'));
        $listing.append($('<button/>').data("card_name", deck[i].card_name).text("x").click(function(){
            for(var i = 0; i < deck.length; i++){
                if(deck[i].card_name == $(this).data("card_name")){
                    deck.splice(i,1);
                    localStorage.deck = JSON.stringify(deck);
                    renderDeck();
                    return;
                }
            }
            localStorage.deck = JSON.stringify(deck);
            renderDeck();
        }));
        $listing.append($('<b/>').text(deck[i].card_name));
        $listing.append($('<i/>').text(" ("+deck[i].type+" from "+deck[i].card_set+")"));
        if(freqTable[deck[i].type] === undefined){
            freqTable[deck[i].type] = 1;
        }else{
            freqTable[deck[i].type]++;
        }
    }
    $('#editor .stats').remove();
    $('#editor').append($('<div/>').addClass('stats'));
    
    for(var type in freqTable)
        $('#editor .stats').append(
            $("<div/>").text(freqTable[type]+" x "+type)
        );
}

