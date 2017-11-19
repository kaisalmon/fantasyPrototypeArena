 <?php
    include 'utils.php';
    if(is_valid_name($_GET['name'])){
        $src = "../card_sets/".$_GET['name'].".json";
        echo file_get_contents($src);
    }else{
        echo "Invalid Name Entered";
    }
 ?> 