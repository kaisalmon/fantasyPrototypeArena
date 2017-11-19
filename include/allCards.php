<?php    
    include 'utils.php';
    if(isset($_GET['card_set']) && $_GET['card_set']!='undefined' && is_valid_name($_GET['card_set'])){
        echo file_get_contents('../card_sets/'.$_GET['card_set'].".json");
    }else{
        $scanDir = scandir("../card_sets/");
        $array = [];
        $names = [];
        for ($i=0;$i<count($scanDir);$i++){
            $f = $scanDir[$i];
            if(preg_match ('/[A-z]+\.json$/' , $f)){
                $json_file = file_get_contents('../card_sets/'.$f);
                $cards = json_decode($json_file);
                for($j=0; $j<count($cards);$j++){
                    if(!in_array($cards[$j]->name, $names)){
                        array_push($array, $cards[$j]);
                        array_push($names, $cards[$j]->name);
                    }
                }
            }
        }
        echo json_encode($array);
    }
?>