<?php
/*



Use this to tunnel a file through json for crossdomain access.  Just stick this
on any server with open internet access for your redirects.

*Authors
*Jacob Evans (github.com/jacobevans)
*Spike Grobstein (github.com/spikegrobstein)

  
  Takes up to 2 GET vars:
    * uri -- the URI to return
    * _callback -- optional. used for jsonp.
    
*/
try {
    
    $uri = $_GET['uri'];            // the URI that we're fetching
    $callback = $_GET['_callback']; // the callback that's used with jsonp (optional)
    $return_jsonp = !is_null($callback); // whether we are returning jsonp or json
    
    if (is_null($_GET['uri'])) {
        throw new Exception('Bad URI');
    }

    $ch = curl_init($uri);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $contents = curl_exec($ch);
    $info = curl_getinfo($ch);
    
    if ($info['http_code'] >= 400) {
        throw new Exception('Bad error code (' . $info['http_code'] . ')');
    }

    // header shit. ensure the client doesn't cache or anything
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    
    // set content-type appropriately
    $content_type = "application/" . ($return_jsonp ? "json" : "javascript");
    header('Content-type: ' . $content_type);
    

    // base64 encode the data
    $data = base64_encode($contents);

    $json_data = '{ "data" : "'. $data .'", "return_code":' . $info['http_code'] . ' }';
    
    if ($return_jsonp) {
        // if no callback was specified, then just send back the json data.
        echo $json_data;
    } else {
        // if a callback was supplied (_callback GET var), then wrap the json data in the callback function
        echo $callback . '(' . $json_data . ');';
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
    exit(1);
}



?>