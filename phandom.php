<?php
$params = $_SERVER["REQUEST_URI"];
$parsableParam = $params;

if ($params){
    
    $parsableParam = preg_replace(/&/, '\",\"',$parsableParam);
    $parsableParam = preg_replace(/=/, '\":\"',$parsableParam);
    $parsableParam = rawurldecode($parasableParam);
    $parsableParam = preg_replace(/\+/, " ",$parsableParam);
    $parseString = '{"' . $parasableParam . '"}';

    $headline_object = json_decode($parseString);
    $urls = ($headline_object['u'] ? explode(',',$headline_object['u'] : 'empty');

    if ($headline_object['u'] != 'empty') {
        $img_url = $headline_object['u'][0];
    }
}

?>

<!DOCTYPE html>
<head>
    <!-- Web Fonts: Prevent FOUT-->
    <script type="text/javascript">
        WebFontConfig = {
        google: { families: [ 'Lobster::latin', 'Oswald:400,700,300:latin' ] }
        };
        (function() {
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
          '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
    })(); </script>

    <title>Phandom</title>
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    <link rel="icon" href="favicon.ico" type="image/x-icon">
    
    <!-- JS: Google, jQuery, Phandom -->
    <script src="js/jsapi.js"></script>
    <script src="js/jquery.min.js"></script>
    <script src="js/phandom-urlfix.js"></script>

    <!-- CSS & JS: FB Friend Selector-->
    <link type="text/css" href="friend-selector/jquery.friend.selector.css" rel="stylesheet" />
    <script type="text/javascript" src="friend-selector/jquery.friend.selector-1.2.js"></script>

    <!-- Canonical -->
    <link rel="canonical" href="http://phandom.co<?php echo $params; ?>"/>

    <!-- CSS: FB Button & Custom Bootstap-->
    <link type="text/css" href="css/fb-buttons.css" rel="stylesheet" />
    <link href="css/bootstrap.css" rel="stylesheet" media="screen">
    <script type="text/javascript" src="js/bootstrap.min.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <meta property="fb:app_id" content="108428925994348" />
    <meta property="og:title" content="Phandom" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="http://phandom.co<?php echo $params; ?>" />
    <meta property="og:image" content="https://twimg0-a.akamaihd.net/profile_images/3371376883/4bf54ef19f02f6366b45bb454d0806de_bigger.png" />
    <meta property="og:site_name" content="Phandom" />
    <meta property="fb:admins" content="20706217" />
    <meta property="og:description"
          content="Phandom lets you make fake headlines about your favorite celebrities, friends, politicians and more!"/>
</head>
<body>

    <!-- Load Facebook App-->
    <div id="fb-root"></div>
    <script type="text/javascript">
    var fb_token;
    function showLoggedInButtons(){
        console.log('in');
        $('.fb-choose').show();
        $('.fb-login-group').hide();
        $('.fb-logout-group').show();
    }

    function showLoggedOutButtons(){
        console.log('out');
        $('.fb-choose').hide();
        $('.fb-login-group').show();
        $('.fb-logout-group').hide();
    }

    function fbLogin() {
        FB.login(function(response) {
            if (response.authResponse) {
                // connected
                showLoggedInButtons();
                fb_token = FB.getAuthResponse()['accessToken'];
            } else {
                // cancelled
            }
        });
    }

    function fbLogout(){
        FB.logout(function(response) {
            // user is now logged out
            showLoggedOutButtons();
        });
    }

    function fbAddPerson($checked){
        var selected = $fb_tab + '_selected';
        $(selected).children().remove();
        $checked.children('.fs-friends, .fs_fullname').remove();
        $checked.children('.fs-name').css('display','inline');
        var $remove = $('<a>Remove</a>').css({'float':'right','cursor':'pointer'});
        $remove.click(function(){
            $(this).closest('.active').find('.custom-image').val('');
            $(this).closest('.fs-anchor').remove();
        });
        $checked.children('.fs-name').append($remove)
        $checked.css('cursor','default');
        $checked.appendTo(selected);
    }
    var $fb_tab;

//    function twitterPrepend(id){
//        var handle = '@'+$(id).find('.custom-image-source').val();
//        $(id).find('.custom-image').val(handle)
//
//    }

    window.fbAsyncInit = function() {
    // init the FB JS SDK
        FB.init({
            appId      : '108428925994348', // App ID from the App Dashboard
            channelUrl : '//phandom.co/channel.html', // Channel File for x-domain communication
            status     : true, // check the login status upon init?
            cookie     : true, // set sessions cookies to allow your server to access the session?
            xfbml      : true  // parse XFBML tags on this page?
        });
    // Additional initialization code such as adding Event Listeners goes here
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                // connected
                showLoggedInButtons();
                fb_token =   FB.getAuthResponse()['accessToken'];
            } else if (response.status === 'not_authorized') {
                // not_authorized
                showLoggedOutButtons();
            } else {
                // not_logged_in
                showLoggedOutButtons();
            }
        });

        
        $('.fb-logout').click(function(){
            fbLogout();
        });

        $('.fb-login').click(function(){
            fbLogin();
        });
        
        $(".fb-choose").click(function(){
                $fb_tab = '#' + $(this).closest('.active').attr('id');
                console.log($fb_tab);
            })
            .fSelector({
                max:1,
                closeOnSubmit:true,
                showSelectedCount:true,
                showButtonSelectAll:false,
                lang:{title:'Choose One Friend',
                    buttonSubmit:'Add',
                    summaryBoxResult:'{1} result(s) for {0}',
                    fbConnectError:'Please click the Facebook "Login" button to connect to Phandom.',
                    selectedCountResult:'Selection complete. Now click "Add" below.',
                    selectedLimitResult:'Only select 1 person. Click "Add" to continue.'},
                onSubmit: function(response){
                    console.log($fb_tab);
                    var $checked = $('.checked a');
                    fbAddPerson($checked);
                    // example response usage
                    var selected_friends = [];
                    $.each(response, function(k, v){
                        selected_friends[k] = v;
                    });
                    $($fb_tab).find('.custom-image').val(selected_friends[0]);
                }
            });


    };

    (function(d, debug){
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "http://connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
        ref.parentNode.insertBefore(js, ref);
        }(document, /*debug*/ false)
    );
    </script>

          
    <div class="container">
        <div class="row bordered">
            <div class="span12">
                <div class="row" style="margin-top:10px;">
                    <div class="span8" style="min-width:770px;">
                        <div class="row">
                            <div class="span4">
                                <a href="/">
                                    <img src="img/logo.png">
                                </a>
                                <!--
                                <a href="http://www.phandom.co">
                                    <span class="lobster logo" style="color:#F1238D">Phandom</span>
                                    <img src="img/shuffle2.png" style=" margin-left: -11px; margin-bottom: -8px; vertical-align:default">
                                </a>
                                -->
                                <div class="oswald fontlight" style="color:#595959;margin-left:7px;">NEWS YOU CANT TRUST &#153;</div> 
                                <div style="margin-left:7px;margin-bottom:20px">
                                    <div class="pink lobster" style="display:inline-block">Click Like!</div>
                                    <div class="fb-like" data-href="http://www.phandom.co" data-send="false" data-layout="button_count" data-width="300" data-show-faces="false" style="display:inline-block"></div>
                                </div>
                                
                            </div>
                            <div class="span4">

                            </div>
                        </div>
                        <div class="row">
                            <div class="span8" >
                                <span style="position:relative;">
                                    <div class="share">
                                        <div class="rectangle">
                                            <img class="tshare" src="img/tshare.png">
                                            <!--<img class="fbshare" src="img/fbshare2.png">-->
                                            <!--<div class="fb-like" id="fb" data-href="http://www.phandom.co" data-send="false" data-layout="button_count" data-width="450" data-show-faces="false" style="height:20px; vertical-align: top;"></div>-->
                                            <div class="fb-share-box" >
                                                <div class="fb-share-icon"></div>
                                                <div class="fb-share-text">Share</div>
                                            </div>
                                        </div>
                                        <div class="triangle-l"></div>
                                    </div>
                                    <div class="contentContainer">
                                        <div style="position:absolute;left:333px">
                                            <div class="spinner"></div>
                                        </div>
                                        <div class="imgContainer"></div>
                                        <div class="headline next"></div>
                                    </div>
                                </span>
                        <div class="fb-comments" href="http://phandom.co<?php echo $params; ?>" data-width="770" data-num-posts="10"></div>
                                
                                <div class="well customHeadlineForm" style="min-width:730px">
<form>
  <fieldset>
    <legend class="oswald blue" style="font-size:40px;line-height:60px;">Make Your Own Headline
    <img src="img/google_search_box.gif" style="float:right">
    </legend>

<div id="generatorContainer">
    <div class="top">
        <div class="topL">
            <div class="topLContainer">
                <p><span style="font-size:28px"><span class="lobster pink" >Step 1</span></span>
                    <!--
                    <span class="alert alert-success" style="float:right">'Beyonce'<i class="icon-ok step-one-ok" style="margin-left:10px"></i></span>
                    -->
                    <div class="oswald fontlight">  CHOOSE FIRST PICTURE</div>
                </p>
                <ul class="nav nav-tabs">
                  <li class="active"><a href="#google1" data-toggle="tab">Google Search</a></li>
                  <li class=""><a href="#facebook1" data-toggle="tab">Facebook</a></li>
                  <li class=""><a href="#twitter1" data-toggle="tab">Twitter</a></li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane fade active in" id="google1">
                        <div class="input-append">
                            <input id="google-search-1-input" class="span2" type="text" placeholder="e.g. Beyonce" data-provide="typeahead">
                            <button id="google-search-1" class="btn" type="button">Search</button>
                        </div>                        
                        <div id="google-search-1-results"></div>
                        <input class='custom-image'>
                    </div>
                    <div class="tab-pane fade" id="facebook1">
                        <p>
                            <div class="fb-login-group">
                                <p><a class='fb-login uibutton confirm' style="text-decoration:none;">Login</a></p>
                                <p>Log in to Facebook to use a picture of a friend.</p>
                            </div>
                            <p><span class="fb-logout-group">
                                <a class='fb-choose uibutton icon add' style="text-decoration:none; color:black">Choose One Friend</a>
                                <p>Pick a friend's profile image to use.</p>
                            </span></p>
                            <div id="facebook1_selected"></div>

                            <input class='custom-image'>
                        </p>
                    </div>
                    <div class="tab-pane fade" id="twitter1">
                        <p>
                            <div class="input-prepend">
                                <span class="add-on">@</span>
                                <input class="span2 custom-image-source" type="text" placeholder="Username" onkeyup="twitterPrepend('#twitter1')">
                            </div>
                            <p>Can't remember a username? Look at your <a href="https://twitter.com/following" target="_blank">following list.</a> </p>

                            <input class='custom-image'>
                        </p>
                    </div>
                </div>

            </div>
        </div>
        <div class="topR">
            <div class="topRContainer">
                <p><span style="font-size:28px"><span class="lobster pink" >Step 2 </span></span>
                    <div class="oswald fontlight">  CHOOSE SECOND PICTURE</div>
                </p>
                <ul class="nav nav-tabs">
                  <li class="active"><a href="#google2" data-toggle="tab">Google Search</a></li>
                  <li class=""><a href="#facebook2" data-toggle="tab">Facebook</a></li>
                  <li class=""><a href="#twitter2" data-toggle="tab">Twitter</a></li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane fade active in" id="google2">
                        <div class="input-append">
                            <input id="google-search-2-input" class="span2" type="text" placeholder="e.g. Beyonce" data-provide="typeahead">
                            <button id="google-search-2" class="btn" type="button">Search</button>
                        </div>
                        <div id="google-search-2-results"></div>
                        <input class='custom-image'>
                    </div>
                    <div class="tab-pane fade" id="facebook2">
                        <p>
                            <div class="fb-login-group">
                                <p><a class='fb-login uibutton confirm' style="text-decoration:none;">Login</a></p>
                                <p>Log in to Facebook to use a picture of a friend.</p>
                            </div>
                            <p><span class="fb-logout-group">
                                <a class='fb-choose uibutton icon add' style="text-decoration:none; color:black">Choose One Friend</a>
                                <p>Pick a friend's profile image to use.</p>
                            </span></p>
                            <div id="facebook2_selected"></div>

                            <input class='custom-image'>
                        </p>
                    </div>
                    <div class="tab-pane fade" id="twitter2">
                        <p>
                            <div class="input-prepend">
                                <span class="add-on">@</span>
                                <input class="span2 custom-image-source" type="text" placeholder="Username" onkeyup="twitterPrepend('#twitter2')">
                            </div>
                            <p>Can't remember a username? Look at your <a href="https://twitter.com/following" target="_blank">following list.</a> </p>

                            <input class='custom-image'>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <div class="bottom">
        <div class="bottomContainer">
            <p class="lobster pink" style="font-size:28px">Step 3</p>
            <p class="oswald fontlight">  WRITE HEADLINE TEXT</p>
            <p><input class='custom-headline span6' type="text"></p>
            
        </div>
    </div>
</div>
        <p style="text-align: center; margin-top: 20px;">Click to see a preview of your headline.</p>
        <p>
            <div class="generator custom-link lobster">
            <span>Preview</span>
            </div>
        </p>
        

    <!--
    <label class="checkbox">
      <input type="checkbox"> Randomize Names
    </label>
    -->                                
  </fieldset>
</form> 
                    </div>

                    </div>
                        </div>
                    </div>
                    <div class="span4">

                        <div style="margin-top:4px;">

                            <div id="today" class="oswald fontlight" style="display:inline-block;color: rgb(131, 131, 131);font-size: 18px;float:right;">blah</div>
                            <script type="text/javascript">
                                var mydate=new Date();
                                var year=mydate.getYear();
                                if (year < 1000);
                                year+=1900;
                                var day=mydate.getDay();
                                var month=mydate.getMonth();
                                var daym=mydate.getDate();
                                if (daym<10){daym="0"+daym}
                                var dayarray=new Array("SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY");
                                var montharray=new Array("JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER");
                                var full = dayarray[day]+" "+montharray[month]+" "+daym+", "+year;
                                document.getElementById('today').innerHTML=full;
                            </script>
                        </div>
                        
                        <div class="next-headlines" style="margin-top:30px">

                        </div>
                        
                        <div class="well" style="padding-left:36px;padding-bottom:5px;min-width:299px">
                            <script type="text/javascript"><!--
                            google_ad_client = "ca-pub-5020232692897570";
                            /* Fandom */
                            google_ad_slot = "8769590915";
                            google_ad_width = 300;
                            google_ad_height = 250;
                            //-->
                            </script>
                            <script type="text/javascript"
                            src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
                            </script>                
                        </div>
                        <a class="twitter-timeline" href="https://twitter.com/search?q=%23phndm" height="658" data-widget-id="306606679800291329" data-related="phndm">Phandom Tweets "#phndm"</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="span12">
                <div id="footer" style="text-align:center">
                    <div class="container" style="padding-top:60px">
                        <p class="muted credit">A parody by the <span class="lobster" style="color:#F1238D">Brothers Winn</span>. 'spect.</p>
                        <p class="muted credit"><a href="/about.html">Terms & Privacy</a></p>
                        <p class="fb-logout-group">
                            <img src="img/fb.png">
                            <span> Logged in | </span>
                            <a class="fb-logout">Log Out</a>
                        </p>
                  </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script type="text/javascript">!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
<script type="text/javascript">

    var _gaq = _gaq || [];
    var pluginUrl = 
     '//www.google-analytics.com/plugins/ga/inpage_linkid.js';
    _gaq.push(['_require', 'inpage_linkid', pluginUrl]);
    _gaq.push(['_setAccount', 'UA-39152713-1']);
    _gaq.push(['_setDomainName', 'phandom.co']);
    _gaq.push(['_trackPageview']);

    (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

</script>
</div>

</body>
</html>