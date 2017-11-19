 <?php
    include '../include/utils.php';
    
    $file = "games/" . $_POST['id'] . "-" . $_POST['player'] . ".json";
    if(file_exists($file)){
        echo "[".file_get_contents ($file)."]";
        unlink($file);
    }else{
        echo "[]";
    }
      
 ?> 