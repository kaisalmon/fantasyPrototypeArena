/* global $ */

var HAND_SIZE = 8;
var STARTING_HAND = 7;
var STARTING_GOLD = 15;

var KILLS_TO_WIN = 3;

var GOLD_GAIN = 3;
var CARD_DRAW = 1;

var CHAR_CARD_COST_MIN = 3;
var CHAR_CARD_COST_MAX = 6;
var CHAR_FROM_DECK_COST = (cost)=>{return Math.floor(2*cost)};

var CHAR_HEALTH = (c) => {return Math.floor(c*2+4)};
var CHAR_CARD_DAMAGE = (c) => {return Math.floor(c/2+2)};
var CHAR_ATK_DAMAGE = (c) => {return Math.floor(c/2)};

var ATTACK_WEAKEST = true; //Otherwise attack oldest

var CAN_BUY_FROM_DECK = true;
var HAS_SICKNESS = true;
var CYCLE_CARDS = true;

var VENGENCE_RATE = 0;
var VENGENCE_DAMAGE = (kills)=>{return +4};

var EXTRA_CARD_DRAW_RATE = 0.4;



//Deck Makeup
var CHANCE_OF_CLASS = 5;
var CHANCE_OF_RACE = 5;
var CHANCE_OF_DAMAGE_ACTION = 26;
var CHANCE_OF_BLOCK_REACTION = 4;
var CHANCE_OF_ON_SLAIN_REACTION = 0;
var CHANCE_TOTAL = CHANCE_OF_CLASS+ CHANCE_OF_RACE + CHANCE_OF_DAMAGE_ACTION + CHANCE_OF_BLOCK_REACTION + CHANCE_OF_ON_SLAIN_REACTION;

var seed = 1;

function random() {
    var x = Math.sin(seed+=1000) * 10000;
    return x - Math.floor(x);
}

$( document ).ready(function() {
    runMultiGame();
    //runGame(1, true);
});

function runMultiGame(){
    addButtons();
    var NUMBER = 1000;
    $('<h3/>').text('Summary').appendTo($('#result'));
    var $summary = $('<div/>').addClass('summary').appendTo($('#result'));
    var info = {};
    var importantInfo = {};
    importantInfo.rounds = 0;
    info.leftSurvivingHeros = 0;
    info.rightSurvivingHeros = 0;
    info.leftTotalHeros = 0;
    info.rightTotalHeros = 0;
    info.winnerTotalHeros = 0;
    info.loserTotalHeros = 0;
    info.winnerGoldSpent = 0;
    info.loserGoldSpent = 0;
    info.winnerCardDraw = 0;
    info.loserCardDraw = 0;
    importantInfo.winnerKills = 0;
    importantInfo.loserKills = 0;
    info.winnerAverageHeroCost = 0;
    info.loserAverageHeroCost = 0;
    importantInfo.winByKills = 0;
    importantInfo.firstPlayerWins = 0;
    importantInfo.firstPlayerGetsFirstBlood = 0;
    importantInfo.winningPlayerGetsFirstBlood = 0;
    importantInfo.roundsAfterFirstBlood = 0;
    info.loserActionsNegated = 0;
    info.winnerActionsNegated = 0;
    info.winnerOnSlainsUsed = 0;
    info.loserOnSlainsUsed = 0;
    info.roundOfFirstBlood = 0;
    var turnList = [];
    var winnerDrawList = [];
    var winnerCardsCycled = [];
    var loserKills = [];
    var firstBloodTurnList=[];
    var turnsAfterFirstBloodList=[];
    
    for(var i = 1; i <= NUMBER; i++){
        $('<h3/>').text("Game "+i).appendTo($('#result'));
        var g = runGame(i, false);
        printGame(g);
        importantInfo.rounds += g.turn/2;
        turnList.push(g.turn);
        loserKills.push(g.loser.kills);
        winnerDrawList.push(g.winner.cardsDrawn);
        firstBloodTurnList.push(g.turnOfFirstBlood);
        turnsAfterFirstBloodList.push(g.turn - g.turnOfFirstBlood);
        winnerCardsCycled.push(g.winner.cardsCycled);
        info.leftSurvivingHeros += g.leftPlayer.heros.length;
        info.rightSurvivingHeros += g.rightPlayer.heros.length;
        info.leftTotalHeros += g.leftPlayer.totalHeros;
        info.rightTotalHeros += g.rightPlayer.totalHeros;
        info.winnerTotalHeros += g.winner.totalHeros;
        info.loserTotalHeros += g.loser.totalHeros;
        info.winnerGoldSpent += g.winner.goldSpent;
        info.loserGoldSpent += g.loser.goldSpent;
        info.winnerCardDraw += g.winner.cardsDrawn;
        info.loserCardDraw += g.loser.cardsDrawn;
        info.winnerOnSlainsUsed += g.winner.onSlainUsed;
        info.loserOnSlainsUsed += g.loser.onSlainUsed;
        importantInfo.winnerKills += g.winner.kills;
        importantInfo.loserKills += g.loser.kills;
        info.roundOfFirstBlood += Math.ceil(g.turnOfFirstBlood/2);
        importantInfo.roundsAfterFirstBlood += g.turn/2 - g.turnOfFirstBlood/2;
        info.loserActionsNegated += g.loser.actions_negated;
        info.winnerActionsNegated += g.winner.actions_negated;
        info.winnerAverageHeroCost += (g.winner.goldSpent/g.winner.totalHeros);
        info.loserAverageHeroCost += (g.loser.goldSpent/g.loser.totalHeros);
        importantInfo.firstPlayerGetsFirstBlood += g.leftPlayer.firstBlood ? 1: 0;
        importantInfo.winningPlayerGetsFirstBlood += g.winner.firstBlood ? 1: 0;
        importantInfo.winByKills += (g.rightPlayer.kills == KILLS_TO_WIN || g.leftPlayer.kills == KILLS_TO_WIN) ? 1 : 0;
        if(g.winner == g.leftPlayer)
            importantInfo.firstPlayerWins++;
        
    }
    for(var key in importantInfo){
        if(typeof importantInfo[key] !== "object"){
            var $line = $('<div/>').appendTo($summary);
            $line.css("font-size","125%");
            $line.append($('<b/>').text("Average "+key.replace(/([A-Z])/g, ' $1').toLowerCase()+": "));
            importantInfo[key] = Math.round(importantInfo[key]/NUMBER * 100) / 100;
            $line.append($('<span/>').text(importantInfo[key]));
        }
    }
    for(key in info){
        if(typeof info[key] !== "object"){
            var $line = $('<div/>').appendTo($summary);
            $line.append($('<b/>').text("Average "+key.replace(/([A-Z])/g, ' $1').toLowerCase()+": "));
            info[key] = Math.round(info[key]/NUMBER * 100) / 100;
            $line.append($('<span/>').text(info[key]));
        }
    }
    
    graphFreq(turnList,NUMBER, 'Frequency of Number of Turns in Game (Not Rounds)', $summary);
    graphFreq(loserKills,NUMBER, 'Frequency Kills by the Loser', $summary);
    graphFreq(winnerDrawList,NUMBER, 'Frequency of Cards Drawn by Victor', $summary);
    graphFreq(winnerCardsCycled,NUMBER, 'Frequency of Cards Cycled by Victor', $summary);
    graphFreq(turnsAfterFirstBloodList,NUMBER, 'Frequency of Number of Turns after First Blood', $summary);
    graphFreq(firstBloodTurnList,NUMBER, 'Frequency of Turn Number For  First Blood', $summary);
}

function graphFreq(list,max, title, $summary){
    var turnFreq = {};
    var highestTurn = 0;
    var highestTurnFreq = 0;
    for(var i = 0; i < max; i++){
        turnFreq[list[i]] = turnFreq[list[i]]  ? turnFreq[list[i]] + 1 : 1;
        highestTurn = Math.max(list[i], highestTurn);
        highestTurnFreq = Math.max(turnFreq[list[i]] , highestTurnFreq);
    }
    
    $('<h3/>').text(title).appendTo($summary);
    var $graph = $('<div/>').addClass('graph').appendTo($summary);
    
    for(i = 0; i <= highestTurn; i++){
        var val = turnFreq[i] ? turnFreq[i] : 0;
        //$graph.append($('<b/>').text(i+": "));
       //$graph.append($('<span/>').text(val+", "));
       var height = val*99/highestTurnFreq;
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
        playTurn(game.leftPlayer, game.rightPlayer, game, draw);
        if(draw){
            printGame(game);
        }
        if(!gameover(game)){
            playTurn(game.rightPlayer, game.leftPlayer, game, draw);
            if(draw){
                printGame(game);
            }
        }
    }
    game.winner = gameover(game);
    if(game.winner == game.leftPlayer)
        game.loser = game.rightPlayer;
    else
        game.loser = game.leftPlayer;
        
    return game;
}

function spawnPlayer(){
    var player = {"hand":[],"firstBlood":false, "cardsCycled":0, "goldSpent":0, "totalHeros":0, "gold":STARTING_GOLD, "heros":[], "kills":0};
    player.actions_negated = 0;
    player.onSlainUsed = 0;
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
    }
    player.onSlainCards = function(){
        return player.hand.filter(function(card){
            return card.type == "on_slain";
        }); 
    };
    player.blockCards = function(){
        return player.hand.filter(function(card){
            return card.type == "block";
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
    player.spendGold = function(gold){
        player.gold = Math.max(player.gold-gold, 0);
        player.goldSpent+=gold;
    };
    player.remove = function(card){
        player.hand.splice(player.hand.indexOf(card), 1);
    };
    player.attackedHero = function(){
       
        if(ATTACK_WEAKEST){
            var weakest = player.heros[0];
            for(var i = 1; i < player.heros.length; i++){
                if(player.heros[i].health < weakest.health){
                    weakest = player.heros[i];
                }
            }
            return weakest;
        }else{
            return player.heros[0];
        }
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
                    player.spendGold(cost);
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
                    player.spendGold(CHAR_FROM_DECK_COST(cost));
                }  
            }
             for(i = 0; i < player.raceCards().length; i ++){
                raceCard = player.raceCards()[i];  
                classCard = spawnCharCard('class');
                cost = classCard.cost + raceCard.cost;
                if(CHAR_FROM_DECK_COST(cost) <= player.gold){
                    addHero(player,classCard,raceCard);
                    player.remove(raceCard);
                    player.spendGold(CHAR_FROM_DECK_COST(cost));
                }  
            }            
        }
    };
    return player;
}

function drawCard(player){
    player.cardsDrawn = player.cardsDrawn ? player.cardsDrawn + 1 : 3;
    var r = Math.floor(random() * CHANCE_TOTAL);
    if(r < CHANCE_OF_DAMAGE_ACTION)
        player.hand.push({"type":"action"});
    else if(r < CHANCE_OF_DAMAGE_ACTION + CHANCE_OF_CLASS)
        player.hand.push(spawnCharCard('class'));
    else if(r < CHANCE_OF_DAMAGE_ACTION + CHANCE_OF_CLASS + CHANCE_OF_RACE)
        player.hand.push(spawnCharCard('race'));
    else if(r < CHANCE_OF_DAMAGE_ACTION + CHANCE_OF_CLASS + CHANCE_OF_RACE + CHANCE_OF_ON_SLAIN_REACTION)
        player.hand.push({"type":"on_slain"});
    else
        player.hand.push({"type":"block"});
}

function spawnCharCard(type){
    var cost = Math.floor(
        random() * (1+CHAR_CARD_COST_MAX-CHAR_CARD_COST_MIN) + CHAR_CARD_COST_MIN
    );
    return {"type":type, "cost":cost};
}

function addHero(player, classCard, raceCard) {
    var hero = {'health':CHAR_HEALTH(raceCard.cost)+CHAR_HEALTH(classCard.cost), 'sick':HAS_SICKNESS};
    player.heros.push(hero);
    hero.cost = raceCard.cost + classCard.cost;
    hero.max_health = hero.health;
    player.totalHeros++;
}

function playTurn(player, foe, game, print){
    
    //Draw Cards  
    var bonus_draw = EXTRA_CARD_DRAW_RATE < random() ? 1 : 0;
    for(var i = 0; i < CARD_DRAW+bonus_draw; i++){
        if(game.turn != 0 && player.hand.length < HAND_SIZE)
            drawCard(player);
    }
    
    if(game.turn > 1 && CYCLE_CARDS){
        if(player.raceCards().length == 0 || player.classCards().length == 0){
            if(player.actionCards().length != 0){
                player.popCard('action');
                player.cardsCycled++;
                drawCard(player);
            }else if(player.raceCards != 0){
                player.popCard('race');
                player.cardsCycled++;
                drawCard(player);
            }else if(player.classCards != 0){
                player.popCard('class');
                player.cardsCycled++;
                drawCard(player);
            }
        }
    }
    
    if(game.turn > 1)
        player.gold+=GOLD_GAIN;
    
    player.buyHero();

    if(print)
        printGame(game);
    var one = foe.heros.length;
    for(var i = 0; i < player.heros.length; i++){
        var target = foe.attackedHero();
        if(target){
            if(player.heros[i].sick){
                player.heros[i].sick = false;
            }else{
                if(player.actionCards().length>0){ 
                    player.popCard('action');
                    if(foe.blockCards().length == 0){
                        var bonus_damage = 0;
                        if(foe.kills != 0 && VENGENCE_RATE > random()){
                            bonus_damage+=VENGENCE_DAMAGE(foe.kills);
                        }
                        target.health -= CHAR_CARD_DAMAGE(player.heros[i].cost)+bonus_damage;
                        
                    }else{
                        foe.actions_negated++;
                        foe.popCard('block');
                    }
                }else{
                    target.health -= CHAR_ATK_DAMAGE(player.heros[i].cost) ;
                }
                if(target.health <= 0){
                    foe.heros.splice(foe.heros.indexOf(target),1);
                    player.kills++;
                    if(foe.firstBlood == false && player.firstBlood == false){
                        player.firstBlood = true;
                        game.turnOfFirstBlood = game.turn;
                    }
                    if(foe.onSlainCards().length!=0 && foe.heros.length != 0){
                       foe.popCard('on_slain');
                       foe.attackedHero().health = foe.attackedHero().max_health;
                       foe.onSlainUsed++;
                    }
                } 
            }
        }
    } 
    if(print)
        printGame(game);

    game.turn++;
}

function gameover(game){
    if(game.turn<=1)
        return undefined;
    if(game.leftPlayer.heros.length==0 || game.rightPlayer.kills>=KILLS_TO_WIN)
        return game.rightPlayer;
    if(game.leftPlayer.kills>=KILLS_TO_WIN || game.rightPlayer.heros.length==0)
        return game.leftPlayer;
    if(game.turn > 50)
        return true;
    return undefined;
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