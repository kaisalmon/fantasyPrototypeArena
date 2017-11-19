<?php

    include 'utils.php';
    $icon = $_GET["icon"];
    if(is_valid_name($icon)){
        $file = "../icons/".$icon.".png";
        $question_mark_url = "http://game-icons.net//icons/lorc/originals/png/000000/transparent/uncertainty.png";
        if(file_exists($file)){
            $img = fopen($file, 'rb');
        }else{
            $json_file = file_get_contents('../json/icons.json');
            $icons = json_decode($json_file,$assoc = true);
            $url = $icons[$icon];
            if($url){
                file_put_contents($file, file_get_contents($url));
                $img = fopen($file, 'rb');
            }else{
                file_put_contents($file, file_get_contents($question_mark_url));
                $img = fopen($file, 'rb');
            }
        }
        // send the right headers
        header("Content-Type: image/png");
        header("Content-Length: " . filesize($file));
        
        // dump the picture and stop the script
        fpassthru($img);
    }
    exit;
    
?>
