<?php
    //start buffering again
    ob_start();
    
    //include file, capturing output into the output buffer
    include "allCards.php";
    
    //get current output buffer (output from test.php)
    $json_file = ob_get_clean();
    
    //start output buffering again.
    ob_start();
    $cards = json_decode($json_file);
    for($j=0; $j<count($cards);$j++){
        $c = $cards[$j];
        if($c->type=="Class"){
             for($i=0; $i<count($cards);$i++){
                $r = $cards[$i];
                if($r->type=="Race"){
                    if(!($r->strength == 0 && $c->role == "Warrior")){
                        echo $r->cost+$c->cost;
                        echo " ";
                        $d = ($r->strength+$c->strength);
                        $a = ($r->arcana+$c->arcana);
                        if($a>$d)$d = $a;
                        echo $d;
                        echo "<br>";
                    }
                }
            }
        }
    }
?>