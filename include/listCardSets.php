 <?php
    include 'utils.php';
    
    function json_file($file){
        return preg_match('/.*\.json$/',$file);
    }
    
    $result = '[';
    foreach (array_filter(scandir("../card_sets"), "json_file") as $dir){
        $result .= '"';
        $result .= split("\.",$dir)[0];
        $result .= '",';
    }
    $result = rtrim($result, ",");
    $result .= ']';
    echo $result;
 ?> 