/* global $ */
/* global localStorage */
/* global renderCard */
/* global getJSON*/

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

$( document ).ready(function() {
    $('#print').text("Loading..");
    getJSON("/json/icons.json").then(function(icons){ 
        renderAll(icons);
    });
});

function renderAll(icons){
    //var cards = JSON.parse(localStorage.cards);
    getJSON("include/allCards.php?card_set="+getUrlParameter("set")).then(function(cards){
        console.log(cards);
        $('#print').empty();
        for(var i = 0; i < cards.length; i++){
            renderCard($('#print'), cards[i], icons);
        }
        $('.card').click(function(){
            console.log($(this).text());
        });
    });
}

