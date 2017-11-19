 <?php
    include 'utils.php';
    
    if(is_json($_POST['cards']) && is_valid_name($_POST['name'])){
        $dest = "../card_sets/" . $_POST['name'].".json";
        if(file_exists($dest)){
            rename($dest,$dest.".".time());
        }
        file_put_contents ($dest , $_POST['cards']);
        echo "Card Set Saved!";
    }else{
        echo "Error Saving Card Set!";
    }
        
 ?> 