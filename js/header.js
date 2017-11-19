/* global $ */
$( document ).ready(function() {
    var pages = {
        "Card Editor":"/cardgame/index.html",
        "Deck Editor":"/cardgame/deckEditor.html",
        "Card Gallery":"/cardgame/print.html",
        "Role Summary":"/cardgame/roles.html",
        "Tabletop":"/cardgame/table/index.html"
    };
    var $nav = $('<nav/>');
    $nav.append($('<div/>').addClass('thumb'));
    var $links = $('<div/>').addClass('links').appendTo($nav);
    for(var p in pages){
        $links.append(
            $('<a href='+pages[p]+'/>').text(p)  
        );
    }
    var $title = $('h1:first-of-type');
    var $header = $('<header/>');
    $header.prependTo($('body'));
    $nav.appendTo($header);
    $title.appendTo($header);
});
