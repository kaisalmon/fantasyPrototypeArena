 <?php
    $GLOBALS["sets"] = [];
    
    function get_card($name, $set){
        if(!array_key_exists($set, $GLOBALS["sets"])){
            $GLOBALS["sets"][$set] = 
                json_decode(file_get_contents("../card_sets/".$set.".json"));
        }
        $set_json =  $GLOBALS["sets"][$set];
        for($i = 0; $i < count($set_json); $i++){
            if($set_json[$i]->name == $name)
                return json_encode($set_json[$i]);
        }
        return "{}";
    }
 
    include 'utils.php';
    if(is_valid_name($_GET['name'])){
        $src = "../decks/".$_GET['name'].".json";
        if(!isset($_GET['full'])){
            echo file_get_contents($src);
        }else{
            $file =  file_get_contents($src);
            $cards = json_decode($file);
            echo "[";
            for($j=0; $j<count($cards);$j++){
                echo get_card($cards[$j]->card_name, $cards[$j]->card_set);
                if( $j+1 != count($cards) ){
                    echo ", ";
                }
            }
            echo "]";
        }
    }else{
        echo "Invalid Name Entered";
    }
    
 ?> 