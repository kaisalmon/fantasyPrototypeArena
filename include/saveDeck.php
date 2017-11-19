 <?php
    include 'utils.php';
    
    if(is_json($_POST['deck']) && is_valid_name($_POST['name'])){
        $dest = "../decks/" . $_POST['name'].".json";
        if(file_exists($dest)){
            rename($dest,$dest.".".time());
        }
        file_put_contents ($dest , $_POST['deck']);
        echo "Deck Saved!";
    }else{
        echo "Error Saving Deck!";
    }
        
 ?> 