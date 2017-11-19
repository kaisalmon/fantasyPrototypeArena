 <?php
    include '../include/utils.php';
    
    if(is_json($_POST['action'])){
        $one = "games/" . $_POST['id']."-one.json";
        $two = "games/" . $_POST['id']."-two.json";
        if($_POST['target'] == 'one' || $_POST['target'] == 'both')
            json_append($one);
        if($_POST['target'] == 'two' || $_POST['target'] == 'both')
            json_append($two);
        echo "Success";
    }else{
        echo "Error";
    }
        
    function json_append($dest){
        if(file_exists($dest)){
            file_put_contents($dest ,",\n".$_POST['action'],FILE_APPEND);
        }else{
             file_put_contents($dest ,$_POST['action']);
        }
    }
 ?> 