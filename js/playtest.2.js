/* global $ */

var HAND_SIZE = 8;
var STARTING_HAND = 7;
var STARTING_GOLD = 15;

var KILLS_TO_WIN = 3;

var GOLD_GAIN = 3;

var CHAR_CARD_COST_MIN = 3;
var CHAR_CARD_COST_MAX = 5;
var CHAR_FROM_DECK_COST = (cost)=>{return cost*2};

var CHAR_HEALTH = (cost)=>{return Math.floor(7*cost/4 + 7.5)};
var CHAR_CARD_DAMAGE = 5;
var CHAR_ATK_DAMAGE = 3;


var CAN_BUY_FROM_DECK = true;
var HAS_SICKNESS = true;
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
    var NUMBER = 2000;
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
    var player = {"hand":[], "totalHeros":0, "gold":STARTING_GOLD, "heros":[], "kills":0};
    player.hand.push(spawnCharCard('class')); 
    player.hand.push(spawnCharCard('race'));
    for(var i = 0; i < STARTING_HAND-2; i++){
        drawCard(player);
    }
    player.raceCards = function(){
        return player.hand.filter(function(card){
            return card.type == "race";
        }); 
    };
    player.actionCards = function(){
        return player.hand.filter(function(card){
            return card.type == "action";
        }); 
    };
    player.classCards = function(){
        return player.hand.filter(function(card){
            return card.type == "class";
        }); 
    };
    player.popCard = function(type){
        var options = player.hand.filter(function(card){
            return card.type == type;
        });
        var index = player.hand.indexOf(options[0]);
        if (index > -1) {
            player.hand.splice(index, 1);
            return options[0];
        }else{
            return undefined;
        }
    };
    player.remove = function(card){
        player.hand.splice(player.hand.indexOf(card), 1);
    };
    player.buyHero = function(){
        //BUY FROM HAND
        for(var i = 0; i < player.classCards().length; i ++){
            var classCard = player.classCards()[i];  
            for(var j = 0; j < player.raceCards().length; j ++){
                var raceCard = player.raceCards()[j];  
                var cost = classCard.cost + raceCard.cost;
                if(cost <= player.gold){
                    addHero(player,classCard,raceCard);
                    player.remove(classCard);
                    player.remove(raceCard);
                    player.gold -= cost;
                }
            }    
        }   
        if(CAN_BUY_FROM_DECK){
            for(i = 0; i < player.classCards().length; i ++){
                classCard = player.classCards()[i];  
                raceCard = spawnCharCard('race');
                cost = classCard.cost + raceCard.cost;
                if(CHAR_FROM_DECK_COST(cost) <= player.gold){
                    addHero(player,classCard,raceCard);
                    player.remove(classCard);
                    player.gold -= CHAR_FROM_DECK_COST(cost);
                }  
            }
             for(i = 0; i < player.raceCards().length; i ++){
                raceCard = player.raceCards()[i];  
                classCard = spawnCharCard('class');
                cost = classCard.cost + raceCard.cost;
                if(CHAR_FROM_DECK_COST(cost) <= player.gold){
                    addHero(player,classCard,raceCard);
                    player.remove(raceCard);
                    player.gold -= CHAR_FROM_DECK_COST(cost);
                }  
            }            
        }
    };
    return player;
}

function drawCard(player){
    var r = Math.floor(random() * CHANCE_TOTAL);
    if(r < CHANCE_OF_ACTION)
        player.hand.push({"type":"action"});
    else if(r < CHANCE_OF_ACTION + CHANCE_OF_CLASS)
        player.hand.push(spawnCharCard('class'));
    else
        player.hand.push(spawnCharCard('race'));
}

function spawnCharCard(type){
    var cost = Math.floor(
        Math.random() * (1+CHAR_CARD_COST_MAX-CHAR_CARD_COST_MIN) + CHAR_CARD_COST_MIN
    );
    return {"type":type, "cost":cost};
}

function addHero(player, classCard, raceCard) {
    var cost = classCard.cost + raceCard.cost;
    player.heros.push({'health':CHAR_HEALTH(cost), 'sick':HAS_SICKNESS});
    player.totalHeros++;
}

function playTurn(player, foe, game){
    
    //Draw Cards 
    if(game.turn != 0 && player.hand.length < HAND_SIZE)
        drawCard(player);
    
    if(game.turn > 1 && CYCLE_CARDS){
        if(player.raceCards().length == 0 || player.classCards().length == 0){
            if(player.actionCards().length != 0){
                player.popCard('action');
                drawCard(player);
            }else if(player.raceCards != 0){
                player.popCard('race');
                drawCard(player);
            }else if(player.classCards != 0){
                player.popCard('class');
                drawCard(player);
            }
        }
    }
    
    if(game.turn > 1)
        player.gold+=GOLD_GAIN;
    
    player.buyHero();

    if(foe.heros.length>0){
        for(var i = 0; i < player.heros.length; i++){
            if(player.heros[i].sick){
                player.heros[i].sick = false;
            }else{
                if(player.actionCards().length>0){
                    if(foe.heros.length>0){
                        foe.heros[0].health -= CHAR_CARD_DAMAGE;  
                        player.popCard('action');
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
        if(typeof player[key] !== "object"  && typeof player[key] !== "function"){
            var $line = $('<div/>').appendTo($player);
            $line.append($('<b/>').text(key+": "));
            $line.append($('<span/>').text(player[key]));
        }
    }
    $line = $('<div/>').appendTo($player);
    $line.append($('<b/>').text("Hand: "));
    for(var i = 0; i < player.hand.length; i++){
        var cost = player.hand[i].cost ? "("+player.hand[i].cost+")" : "";
         $line.append($('<span/>').text(player.hand[i].type+cost+", "));
    }
    for(i = 0; i < player.heros.length; i++){
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