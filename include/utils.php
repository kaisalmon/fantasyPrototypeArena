<?php
 function is_json($string,$return_data = false) {
        if(! is_valid($string))
        return FALSE;
         $data = json_decode($string);
         return (json_last_error() == JSON_ERROR_NONE) ? ($return_data ? $data : TRUE) : FALSE;
    }
    
    function is_valid($string){
        return strlen($string) < 20000;
    }  
    function is_valid_name($string){
        $reg = "/[A-z\-]+/";
        return strlen($string) < 50 && preg_match($reg,$string); 
    }
?>