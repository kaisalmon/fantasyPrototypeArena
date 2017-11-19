/* global $ */

var HAND_SIZE = 7;
var STARTING_HAND = 7;
var STARTING_GOLD = 15;

var KILLS_TO_WIN = 3;

var GOLD_GAIN = 3;

var CHAR_COST = 7;
var CHAR_FROM_DECK_COST = 14;

var CHAR_HEALTH = 20;
var FIRST_CHAR_HEALTH = CHAR_HEALTH; //Survive 4 hits
var CHAR_FROM_DECK_HEALTH = CHAR_HEALTH;
var CHAR_CARD_DAMAGE = 5;
var CHAR_ATK_DAMAGE = 3;


var CAN_BUY_FROM_DECK = true;
var HAS_SICKNESS = true;
var BONUS_ACTIONS_ON_HERO = 0;
var CYCLE_CARDS = true;

var CHANCE_OF_CLASS = 2;
var CHANCE_OF_RACE = 2;
var CHANCE_OF_ACTION = 7;
var CHANCE_TOTAL = CHANCE_OF_CLASS+ CHANCE_OF_RACE + CHANCE_OF_ACTION;

var seed = 1;

function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

$( document ).ready(function() {
    runMultiGame();
});

function runMultiGame(){
    addButtons();
    var NUMBER = 500;
    $('<h3/>').text('Summary').appendTo($('#result'));
    var $summary = $('<div/>').addClass('summary').appendTo($('#result'));
    var info = {};
    info.rounds = 0;
    info.leftSurvivingHeros = 0;
    info.rightSurvivingHeros = 0;
    info.leftTotalHeros = 0;
    info.rightTotalHeros = 0;
    info.winByKills = 0;
    info.firstPlayerWins = 0;
    
    var turnList = [];
    
    for(var i = 1; i <= NUMBER; i++){
        $('<h3/>').text("Game "+i).appendTo($('#result'));
        var g = runGame(i, false);
        printGame(g);
        info.rounds += g.turn/2;
        turnList.push(g.turn);
        info.leftSurvivingHeros += g.leftPlayer.heros.length;
        info.rightSurvivingHeros += g.rightPlayer.heros.length;
        info.leftTotalHeros += g.leftPlayer.totalHeros;
        info.rightTotalHeros += g.rightPlayer.totalHeros;
        info.winByKills += (g.rightPlayer.kills == KILLS_TO_WIN || g.leftPlayer.kills == KILLS_TO_WIN) ? 1 : 0;
        if(g.leftPlayer.kills==KILLS_TO_WIN || g.rightPlayer.heros.length==0)
            info.firstPlayerWins++;
        
    }
    for(var key in info){
        if(typeof info[key] !== "object"){
            var $line = $('<div/>').appendTo($summary);
            $line.append($('<b/>').text("Average "+key+": "));
            info[key] = Math.round(info[key]/NUMBER * 100) / 100;
            $line.append($('<span/>').text(info[key]));
        }
    }
    
    var turnFreq = {};
    var highestTurn = 0;
    var highestFreq = 0;
    
    for(i = 0; i < NUMBER; i++){
        turnFreq[turnList[i]] = turnFreq[turnList[i]]  ? turnFreq[turnList[i]] + 1 : 1;
        highestTurn = Math.max(turnList[i],highestTurn);
        highestFreq = Math.max(turnFreq[turnList[i]],highestFreq);
    }
    
    $('<h3/>').text('Frequency of Number of Turns in Game (Not Rounds)').appendTo($summary);
    var $graph = $('<div/>').addClass('graph').appendTo($summary);
    for(i = 0; i < highestTurn; i++){
        var val = turnFreq[i] ? turnFreq[i] : 0;
        //$graph.append($('<b/>').text(i+": "));
       //$graph.append($('<span/>').text(val+", "));
       var height = val*80/highestFreq;
       $graph.append($('<div/>').addClass('block').css('height',height+'%').text(i));
    }
}

function addButtons(){
 $('<button/>').text('New Game').click(function(){
        $('#result').empty();
       runGame(parseInt(window.prompt("Game Seed","2")),true); 
    }).appendTo($('#result'));
    $('<button/>').text('Run Many Games').click(function(){
        $('#result').empty();
       runMultiGame();
    }).appendTo($('#result'));
}

function runGame(newSeed, draw){
    seed = newSeed;
    var game = {"turn":0};
    if(draw){
        addButtons();
    }
    game.leftPlayer = spawnPlayer();
    game.rightPlayer = spawnPlayer();
    if(draw)printGame(game);
    while(!gameover(game)){
        playTurn(game.leftPlayer, game.rightPlayer, game);
        if(draw){
            printGame(game);
        }
        if(!gameover(game)){
            playTurn(game.rightPlayer, game.leftPlayer, game);
            if(draw){
                printGame(game);
            }
        }
    }
    return game;
}

function spawnPlayer(){
    var player = {"actionCards":0, "classCards":1, "raceCards":1, "totalHeros":0, "gold":STARTING_GOLD, "heros":[], "kills":0};
    for(var i = 0; i < STARTING_HAND-2; i++){
        drawCard(player);
    }
    return player;
}

function drawCard(player){
    var r = Math.floor(random() * CHANCE_TOTAL);
    if(r < CHANCE_OF_ACTION)
        player.actionCards++;
    else if(r < CHANCE_OF_ACTION + CHANCE_OF_CLASS)
        player.raceCards++;
    else
        player.classCards++;
}

function playTurn(player, foe, game){
    //Draw Cards 
    if(game.turn != 0 && player.actionCards < HAND_SIZE)
        drawCard(player);
    
    if(game.turn > 1 && CYCLE_CARDS){
        if(player.raceCards == 0 || player.classCards == 0){
            if(player.actionCards != 0){
                player.actionCards--;
                drawCard(player);
            }else if(player.raceCards != 0){
                player.raceCards--;
                drawCard(player);
            }else if(player.classCards != 0){
                player.classCards--;
                drawCard(player);
            }
        }
    }
    
    if(game.turn > 1)
        player.gold+=GOLD_GAIN;
    
    if(player.classCards >= 1 && player.raceCards >= 1 && player.gold >= CHAR_COST){
        if(player.totalHeros==0)
            player.heros.push({'health':FIRST_CHAR_HEALTH, 'sick':HAS_SICKNESS});
        else
            player.heros.push({'health':CHAR_HEALTH, 'sick':HAS_SICKNESS});
        player.totalHeros++;
        player.gold -= CHAR_COST;
        player.classCards -= 1;
        player.raceCards -= 1;
        player.actionCards += BONUS_ACTIONS_ON_HERO;
    }else if(player.gold >= CHAR_FROM_DECK_COST && CAN_BUY_FROM_DECK){
        if(player.classCards>0 || player.raceCards>0){
            player.heros.push({'health':CHAR_FROM_DECK_HEALTH, 'sick':HAS_SICKNESS});
            player.totalHeros++;
            player.gold -= CHAR_FROM_DECK_COST;
            player.actionCards += BONUS_ACTIONS_ON_HERO;
            if(player.raceCards>0)
                player.raceCards--;
            if(player.classCards>0)
                player.classCards--;
        }
    }

    if(foe.heros.length>0){
        for(var i = 0; i < player.heros.length; i++){
            if(player.heros[i].sick){
                player.heros[i].sick = false;
            }else{
                if(player.actionCards>0){
                    if(foe.heros.length>0){
                        foe.heros[0].health -= CHAR_CARD_DAMAGE;  
                        player.actionCards--;
                    }
                }else{
                    if(foe.heros.length>0){
                        foe.heros[0].health -= CHAR_ATK_DAMAGE;
                    }
                }
                if(foe.heros.length > 0 && foe.heros[0].health <= 0){
                    foe.heros.shift();
                    player.kills++;
                } 
            }
        }
    }
    
    game.turn++;
}

function gameover(game){
    if(game.turn<=1)
        return false;
    if(game.leftPlayer.heros.length==0 || game.rightPlayer.heros.length==0)
        return true;
    if(game.leftPlayer.kills>=KILLS_TO_WIN || game.rightPlayer.kills>=KILLS_TO_WIN)
        return true;
    if(game.turn > 50)
        return true;
    return false;
}

function printGame(game){
    $('<h3/>').text("Turn "+game.turn).appendTo($('#result'));
    var $turn = $('<div/>').addClass('turn').appendTo($('#result'));
    renderPlayer(game.leftPlayer).appendTo($turn);
    renderPlayer(game.rightPlayer).appendTo($turn);
    if(gameover(game))
        $('<div/>').text("GAMEOVER").appendTo($('#result'));
}

function renderPlayer(player){
    var $player = $('<div/>').addClass('player');
    for(var key in player){
        if(typeof player[key] !== "object"){
            var $line = $('<div/>').appendTo($player);
            $line.append($('<b/>').text(key+": "));
            $line.append($('<span/>').text(player[key]));
        }
    }
    for(var i = 0; i < player.heros.length; i++){
        var hero = player.heros[i];
        var $hero = $('<div/>').addClass('hero');
        for(key in hero){
            if(typeof hero[key] !== "object"){
                $line = $('<div/>').appendTo($hero);
                $line.append($('<b/>').text(key+": "));
                $line.append($('<span/>').text(hero[key]));
            }
        }
        $hero.appendTo($player);
    }
    return $player;
}