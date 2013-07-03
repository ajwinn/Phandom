// Get the current link 
        var pathname = window.location.href;
        var basePath = pathname.split('?')[0];

        if (pathname.split('?').length > 1){
            var fromFB = pathname.split('?')[1].match('fb_action_ids');
            if (fromFB) {
                window.location.href = 'http://www.phandom.co';    
            };
        };

        var preview_headline, preview_images;
        var headline_object = {};
        var bitlyUrl, next_headline_object;
        var fb_token;

        // Configure the 'google' object from jsapi to do  'search' with API version '1'
        google.load('search','1',{'nocss':true});

        // We need a variable that can store a list of Google Searches
        var primarySearchObject = [];

        // Checking if outmoded by new customLink
        function customHeadlineParse(){
            
            preview_headline = $('#custom-headline').val().capAll();
            preview_images = $('#custom-images').val().capAll();
            preview_images = preview_images.replace(/\,\s/g,',')

            // Write the headline and celebs list preview
            $('.headline-output').text(preview_headline);
            $('.image-output').text(preview_images);
        }

        function customLink(){

            preview_headline = $('.custom-headline').val().capAll();
            preview_images = '';
            $('.custom-image').each(function(){
                console.log(this.value);
                preview_images += preview_images == '' && this.value != '' ? this.value : ',' + this.value;
            });

            var h = preview_headline ? escape(preview_headline.replace(/\s/g,"+")) : '';
            var i = preview_images ? escape(preview_images.replace(/\s/g,"+")) : '';
            var twitter_handle = i.match(/@[A-Za-z0-9_]{1,15}/g);
            var t = twitter_handle !== null ? escape(twitter_handle) : '';

            var new_link = basePath+"?"+"h="+h+"&i="+i+"&t="+t;
            if (h != '' && i != ''){
                //window.location.href = new_link;    
            }
            console.log(new_link);
        }

        function getShareUrl(){
            var h, i, t, shareUrl;
            h = escape(headline_object.headline.replace(/\s/g,"+"));
            i = escape(headline_object.celebs_in_headline);
            t = escape(headline_object.celebs_twitter);
            shareUrl = basePath+"?"+"h="+h+"&i="+i+"&t="+t;
            return shareUrl;
        }

        function getBitlyUrl(){
            console.log('getting bitly');
            var shareUrl = getShareUrl();
            $.getJSON(
                "http://api.bitly.com/v3/shorten?callback=?", 
                { 
                    "format": "json",
                    "title":document.title,
                    "apiKey": "R_9ffd0605d4b86cac1e2ec226057f21cf",
                    "login": "phandom",
                    "longUrl": shareUrl
                },
                function(response)
                {
                    bitlyUrl = response.data.url;
                }
            );
        }

        // FB functions

        function showLoggedInButtons(){
            console.log('in');
            $('.fb-friend-select').removeClass('disabled');
            $('.fb-login').hide();
            $('.fb-logout-group').show();
        }

        function showLoggedOutButtons(){
            console.log('out');
            $('.fb-friend-select').addClass('disabled');
            $('.fb-login').show();
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
            
        $(document).ready(function(){

            $('.fb-share-box').click(function(){
                var img_source = $('.imgContainer img').attr('src');
                var caption = headline_object.celebs_in_headline.toString() + "- Secrets, Secrets!";
                var shareUrl = getShareUrl();
                // calling the API ...
                var obj = {
                  method: 'feed',
                  display:'dialog',
                  redirect_uri: shareUrl,
                  link: shareUrl,
                  picture: img_source,
                  name: document.title,
                  caption: caption,
                  description: 'Make some shocking headlines of your own at www.phandom.co.'
                };

                function callback(response) {
                  
                }

                FB.ui(obj, callback);
            });

            $('.tshare').click(function(){                
                var tbase = 'https://twitter.com/intent/tweet?';
                var referer = 'original_referer=' + encodeURIComponent(pathname);
                var url = '&url=' + bitlyUrl;
                var countUrl = '&counturl=' + encodeURIComponent(pathname);
                var text = '&text='+document.title + encodeURIComponent(headline_object.celebs_twitter_text);
                var hashtags = '&hashtags=phndm';
                var w = 640; var h = 460; 
                var sTop = window.screen.height/2-(h/2); 
                var sLeft = window.screen.width/2-(w/2);
                var url = '&url=' + bitlyUrl;        
                var address = tbase + referer + url + countUrl + text + hashtags;
                window.open(address, "Share", "status=1,height="+h+",width="+w+",top="+sTop+",left="+sLeft+",resizable=0");
            })


            $('.celeb-typeahead').typeahead({source:celeb_names});

            // Allow click of custom link generator button
            $('.custom-link').click(function(){
                customLink();
            });

            $('#custom-headline').keypress(function(e){
                
                if ( e.which == 13 ){
                    e.preventDefault();
//                    return false;
                    customLink();
                };
            });
            $('#custom-images').keypress(function(e){
                
                if ( e.which == 13 ){
                    e.preventDefault();
//                    return false;
                    customLink();
                };
            });

            var truncated = next_headline_object.headline.substring(0,25);
            $('#next-text').html('<span style="color:gray" class="fontlight">NEXT: </span>'+truncated+'...'+'&raquo;');

            // Get the parameters from the current link
            function getParams(){
                
                var headline_object = {};
                // Temporarily change the first ? to a #
                var escapedPath = pathname.replace('?','#')
                var params = escapedPath.split('#')[1];
                if (params){
                    params = JSON.parse('{"' + unescape(params.replace(/&/g, "\",\"").replace(/=/g,"\":\"")).replace(/\+/g,' ') + '"}');
                    params.i = params.i.split(',');
                    params.t = params.t ? params.t.split(',') : '';
                    headline_object.headline = params.h;
                    headline_object.celebs_in_headline = params.i;
                    headline_object.celebs_twitter = params.t;
                } else {
                    headline_object = undefined;
                }
                return headline_object;
            }

            // Create a random link
            function makeParams(){
                var h = escape(next_headline_object.headline.replace(/\s/g,'+'));
                var i = escape(next_headline_object.celebs_in_headline);
                var t = escape(next_headline_object.celebs_twitter);
                var new_link = basePath+"?"+"h="+h+"&i="+i+"&t="+t;
                return new_link;
            }

            $('.next').click(function(){
                window.location.href = getNextParams();
            });

            var dimensions = {width:0,height:400};
            var pictures_loaded = 0;

            // If the searchImage function completes, set all pictures to 400px height, then resize to fit
            function addImage(number, searchObject){
                
                if (searchObject[number].results && searchObject[number].results.length > 0) {
                    var results = searchObject[number].results;
                    var result = results[0];
                    var newImg = $('<img>');
                    newImg.attr({'src':result.unescapedUrl})
                        .addClass('celebImg')
                        .css('display','none')
                        .load(function(){
                            pictures_loaded++;
                            $(this).appendTo('.imgContainer');
                            dimensions.width += $(this).width();
                            
                            if (pictures_loaded === celebs_in_headline.length) {
                                var container_width = $('.contentContainer').width();
                                var container_height = $('.contentContainer').height();

                                var new_height = dimensions.width < container_width ? (dimensions.height*container_width)/dimensions.width : dimensions.height;
                                var horizontal_offset = dimensions.width > container_width ? -(dimensions.width - container_width)/2 : 0;
                                var vertical_offset = '0%';
                                
                                if (celebs_in_headline.length === 1 && this.height > this.width){

                                    vertical_offset = '-10%';
                                }

                                $('.imgContainer img').each(function(){
                                    $(this).height(new_height)
                                        .css({
                                            'display':'inline-block',
                                            'marginTop':vertical_offset
                                        });
                                });
                                $('.imgContainer').css({
                                    'marginLeft':horizontal_offset,
                                });
                            };
                        })
                        .error(function(){
                            searchImages([celebs_in_headline[number]],primarySearchObject);
                        });
                }
            }

            // Find medium size pics of each celeb's face
            function searchImages(query, searchObject){
                
                for (var i = 0; i < query.length; i++) {
                    var twitter_handle = query[i].match(/@[A-Za-z0-9_]{1,15}/g);
                    if (twitter_handle !== null) {
                        var handle = twitter_handle[0].replace('@','');
                        var base = 'http://api.twitter.com/1/users/profile_image?screen_name=';
                        var size = '&size=original';
                        var link = base + handle + size;
                        searchObject[i] = {results:[{unescapedUrl:link}]};
                        addImage(i, searchObject);
                    } else {
                        searchObject[i] = new google.search.ImageSearch();
                        searchObject[i].setRestriction(
                            google.search.ImageSearch.RESTRICT_IMAGESIZE,
                            google.search.ImageSearch.IMAGESIZE_MEDIUM);
                        searchObject[i].setRestriction(
                            google.search.ImageSearch.RESTRICT_SAFESEARCH,
                            google.search.ImageSearch.SAFESEARCH_STRICT);
                        // searchObject[i].setRestriction(
                        //     google.search.ImageSearch.RESTRICT_IMAGETYPE,
                        //     google.search.ImageSearch.IMAGETYPE_FACES);
                        searchObject[i].setSearchCompleteCallback(this, addImage, [i, searchObject]);
                        searchObject[i].execute(query[i]);                        
                    }
                };
            }

            // If there are params in the URL, use them, otherwise, get a new Headline
            var params = getParams();
            headline_object = params ? params : getHeadline();
            var headline = headline_object.headline;
            var celebs_in_headline = headline_object.celebs_in_headline;
            var celebs_twitter = headline_object.celebs_twitter;

            headline_object.celebs_twitter_text = '';
            if (celebs_twitter) {
                for (var i = 0; i < celebs_twitter.length; i++) {
                    headline_object.celebs_twitter_text += " " + celebs_twitter[i]; 
                };          
            };

            var fontsize = '35px';
            if (headline.length > 99){
                fontsize = '27px';
            } else if (headline.length > 115){
                fontsize = '22px';
            }

            $('.headline').css({'font-size':fontsize});
            document.getElementsByClassName('headline')[0].innerHTML = headline;
            document.title = headline;
            searchImages(celebs_in_headline,primarySearchObject);

            getBitlyUrl();

        });

var sites = ["site:usmagazine.com ","site:tmz.com ","site:etonline.com ","site:people.com ","site:omg.yahoo.com ","site:wonderwall.msn.com ","site:perezhilton.com ","site:eonline.com ","site:mediatakeout.com ","site:gawker.com ","site:starpulse.com ","site:radaronline.com ","site:thesuperficial.com ","site:thehollywoodgossip.com ","site:popsugar.com ","site:gossipcenter.com ","site:newyorkpost.com "];

var celebs = [
{'name':'Adam Sandler','tags':['any','old','white','male'],'twitter':'@AdamSandler'},
{'name':'Bilbo Baggins','tags':['any','fictional'],'twitter':'@hobbitmovieblog'},
{'name':'Bill Clinton','tags':['any','ancient','white','male'],'twitter':'@PimpBillClinton'},
{'name':'Bruce Jenner','tags':['any','ancient','white','male'],'twitter':'@iambrucejenner'},
{'name':'Christopher Waltz','tags':['any','old','white','male'],'twitter':'@chris_waltz'},
{'name':'Danny Trejo','tags':['any','hispanic','male'],'twitter':'@officialDannyT'},
{'name':'Darth Vader','tags':['any','fictional'],'twitter':'@darthvader'},
{'name':'Denzel Washington','tags':['any','old','black','male'],'twitter':'@DenzelWashingt'},
{'name':'Eddie Murphy','tags':['any','old','black','male'],'twitter':'@EDDlEMURPHY'},
{'name':'George W. Bush','tags':['any','ancient','white','male'],'twitter':'@GeorgeBush'},
{'name':'Hugh Jackman','tags':['any','old','white','male'],'twitter':'@RealHughJackman'},
{'name':'Matthew McConaughey','tags':['any','old','white','male'],'twitter':'@McConaughey'},
{'name':'Mickey Rourke','tags':['any','old','white','male'],'twitter':'@Mickey_Rourke'},
{'name':'Paul Rudd','tags':['any','old','white','male'],'twitter':'@PaullRuddd'},
{'name':'Robert Pattinson','tags':['any','young','white','male'],'twitter':'@Robby_Pattinson'},
{'name':'Ron Howard','tags':['any','old','white','male'],'twitter':'@RealRonHoward'},
{'name':'Sean Penn','tags':['any','old','white','male'],'twitter':'@SoSeanPenn'},
{'name':'Tom Cruise','tags':['any','old','white','male'],'twitter':'@TomCruise'},
{'name':'Tom Hardy','tags':['any','young','white','male'],'twitter':'@OfficialHardy_'},
{'name':'Wesley Snipes','tags':['any','old','black','male'],'twitter':'@WesleyTSnipes'},
{'name':'Kanye West','tags':['any','old','black','male'],'twitter':'@kanyewest'},
{'name':'Chris Brown','tags':['any','young','black','male'],'twitter':'@chrisbrown'},
{'name':'Donald Sutherland','tags':['any','ancient','white','male'],'twitter':''},
{'name':'Ryan Seacrest','tags':['any','old','white','male'],'twitter':'@RyanSeacrest'},
{'name':'Ryan Gossling','tags':['any','old','white','male'],'twitter':'@RyanGosling'},
{'name':'Harrison Ford','tags':['any','ancient','white','male'],'twitter':'@HarrisonJFord'},
{'name':'Steve Carrel','tags':['any','old','white','male'],'twitter':'@SteveCarell'},
{'name':'Robin Williams','tags':['any','ancient','white','male'],'twitter':'@robinwilliams'},
{'name':'Ryan Reynolds','tags':['any','old','white -male'],'twitter':'@reynoldryan'},
{'name':'Aaron Paul','tags':['any','old','white','male'],'twitter':'@aaronpaul_8'},
{'name':'Nick Cage','tags':['any','ancient','white','male'],'twitter':'@NicolasCageFake'},
{'name':'Will Smith','tags':['any','old','black','male'],'twitter':'@WilII_Smith'},
{'name':'John C. Riley','tags':['any','old','white','male'],'twitter':''},
{'name':'James Earl Jones','tags':['any','ancient','black','male'],'twitter':'@James_EarlJones'},
{'name':'Jack Black','tags':['any','old','white','male'],'twitter':' @JackBlack42'},
{'name':'Gerard Butler','tags':['any','old','white','male'],'twitter':'@GerardButler'},
{'name':'Tyler Perry','tags':['any','old','black','male'],'twitter':'@tylerperry'},
{'name':'Christian Bale','tags':['any','old','white','male'],'twitter':'@ChristiancBale'},
{'name':'Rob Dyrdek','tags':['any','old','white','male'],'twitter':'@robdyrdek'},
{'name':'Kevin Spacey','tags':['any','ancient','white','male'],'twitter':'@KevinSpacey'},
{'name':'Jay-Z','tags':['any','old','black','male'],'twitter':''},
{'name':'John Mayer','tags':['any','old','white','male'],'twitter':'@JohnMayer'},
{'name':'James Franco','tags':['any','old','white','male'],'twitter':'@JamesFrancoTV'},
{'name':'Morgan Freeman','tags':['any','old','black','male'],'twitter':'@Morrgan_Freeman'},
{'name':'Samuel L. Jackson','tags':['any','old','black','male'],'twitter':'@SamuelLJackson'},
{'name':'Terrence Howard','tags':['any','old','black','male'],'twitter':''},
{'name':'Laurence Fishburne','tags':['any','old','black','male'],'twitter':''},
{'name':'Ossie Davis','tags':['any','ancient','black','male'],'twitter':''},
{'name':'Jamie Foxx','tags':['any','old','black','male'],'twitter':'@iamjamiefoxx'},
{'name':'Mos Def','tags':['any','old','black','male'],'twitter':''},
{'name':'Ludacris','tags':['any','old','black','male'],'twitter':'@Ludacris'},
{'name':'Cuba Gooding Jr.','tags':['any','old','black','male'],'twitter':''},
{'name':'Bill Cosby','tags':['any','ancient','black','male'],'twitter':'@BillCosby'},
{'name':'Danny Glover','tags':['any','ancient','black','male'],'twitter':'@mrdannyglover'},
{'name':'Jaleel White','tags':['any','old','black','male'],'twitter':'@jaleelwhite'},
{'name':'Don Cheadle','tags':['any','old','black','male'],'twitter':'@IamDonCheadle'},
{'name':'Forest Whitaker','tags':['any','old','black','male'],'twitter':'@ForestWhitaker'},
{'name':'Zac Efron','tags':['any','young','white','male'],'twitter':'@ZacEfron'},
{'name':'Taylor Lautner','tags':['any','young','white','male'],'twitter':'@TayLautnerOrg'},
{'name':'Logan Lerman','tags':['any','young','white','male'],'twitter':'@LoganLerman'},
{'name':'Daniel Radcliffe','tags':['any','young','white','male'],'twitter':'@DanieIRadcIiffe'},
{'name':'William Moseley','tags':['any','young','white','male'],'twitter':''},
{'name':'Michael Cera','tags':['any','young','white','male'],'twitter':'@MCeraWeakBaby'},
{'name':'Hunter Parrish','tags':['any','young','white','male'],'twitter':'@HunterParrish'},
{'name':'Ashton Kutcher','tags':['any','old','white','male'],'twitter':'@aplusk'},
{'name':'Justin Bieber','tags':['any','young','white','male'],'twitter':'@justinbieber'},
{'name':'Rosario Dawson','tags':['any','old','black','female'],'twitter':'@rosariodawson'},
{'name':'Angela Basset','tags':['any','old','black','female'],'twitter':'@ImAngelaBassett'},
{'name':'Ruby Dee','tags':['any','ancient','black','female'],'twitter':''},
{'name':'Halle Berry','tags':['any','old','black','female'],'twitter':'@haIIeberry'},
{'name':'Oprah Winfrey','tags':['any','ancient','black','female'],'twitter':'@Oprah'},
{'name':'Whoopie Goldberg','tags':['any','ancient','black','female'],'twitter':'@WhoopiGoldberg'},
{'name':'Diana Ross','tags':['any','ancient','black','female'],'twitter':'@DianaRossFans'},
{'name':'Rashida Jones','tags':['any','old','black','white','female'],'twitter':'@iamrashidajones'},
{'name':'Jada Pinkett Smith','tags':['any','old','black','female'],'twitter':'@jadapsmith'},
{'name':'Thandie Newton','tags':['any','old','black','female'],'twitter':'@Thandie_Newton'},
{'name':'Beyonce','tags':['any','old','black','female'],'twitter':'@Beyonce'},
{'name':'Queen Latifah','tags':['any','old','black','female'],'twitter':'@IAMQUEENLATIFAH'},
{'name':'Gabrielle Union','tags':['any','old','black','female'],'twitter':'@itsgabrielleu'},
{'name':'Kerry Washington','tags':['any','old','black','female'],'twitter':'@kerrywashington'},
{'name':'Jane Fonda','tags':['any','ancient','white','female'],'twitter':'@Janefonda'},
{'name':'Liza Minnelli','tags':['any','ancient','white','female'],'twitter':''},
{'name':'Martha Stewart','tags':['any','ancient','white','female'],'twitter':'@MarthaStewart'},
{'name':'Catherine Zeta-Jones','tags':['any','old','white','female'],'twitter':'@CatheZetaJones'},
{'name':'Michelle Pfeiffer','tags':['any','ancient','white','female'],'twitter':'@1MichPfeiffer'},
{'name':'Elizabeth Hurley','tags':['any','old','white','female'],'twitter':'@ElizabethHurley'},
{'name':'Heather Locklear','tags':['any','ancient','white','female'],'twitter':''},
{'name':'Denise Richards','tags':['any','old','white','female'],'twitter':'@DENISE_RICHARDS'},
{'name':'Marcia Cross','tags':['any','ancient','white','female'],'twitter':'@ReallyMarcia'},
{'name':'Teri Hatcher','tags':['any','old','white','female'],'twitter':'@HatchingChange'},
{'name':'Julie Bowen','tags':['any','old','white','female'],'twitter':'@itsJulieBowen'},
{'name':'Courteney Cox','tags':['any','old','white','female'],'twitter':'@CourteneyCox'},
{'name':'Julianne Moore','tags':['any','old','white','female'],'twitter':'@_juliannemoore'},
{'name':'Demi Moore','tags':['any','old','white','female'],'twitter':'@justdemi'},
{'name':'Naomi Watts','tags':['any','old','white','female -good'],'twitter':'@thenaomiwatts'},
{'name':'Angelina Jolie','tags':['any','old','white','female'],'twitter':'@joliefans'},
{'name':'Megan Fox','tags':['any','young','white','female'],'twitter':'@meganfox'},
{'name':'Selena Gomez','tags':['any','young','hispanic','female'],'twitter':'@selenagomez'},
{'name':'Jennifer Lopez','tags':['any','old','hispanic','female'],'twitter':'@JLo'},
{'name':'Marisa Tomei','tags':['any','old','white','female'],'twitter':'@marisatomei'},
{'name':'Jennifer Lawrence','tags':['any','young','white','female'],'twitter':'@JennifLawrence_'},
{'name':'Kristen Stewart','tags':['any','young','white','female'],'twitter':'@KristenResource'},
{'name':'Ashley Judd','tags':['any','old','white','female'],'twitter':'@AshleyJudd'},
{'name':'Jennifer Aniston','tags':['any','old','white','female'],'twitter':'@jenifferaniston'},
{'name':'Amanda Seyfried','tags':['any','young','white','female'],'twitter':'@AmandaSeyfried'},
{'name':'Christina Aguilera','tags':['any','old','hispanic','white','female'],'twitter':'@TheRealXtina'},
{'name':'Natalie Portman','tags':['any','old','white','female'],'twitter':'@NPortmanFans'},
{'name':'Sarah Jessica Parker','tags':['any','old','white','female'],'twitter':'@SJP'},
{'name':'Jessica Biel','tags':['any','old','white','female'],'twitter':'@JessicaBiel'},
{'name':'Jessica Alba','tags':['any','old','white','female'],'twitter':'@jessicaalba'},
{'name':'Miley Cyrus','tags':['any','young','white','female'],'twitter':'@MileyCyrus'},
{'name':'Hannah Montanna','tags':['any','young','white','female','fictional'],'twitter':'@__HannahMontana'},
{'name':'Kathleen Turner','tags':['any','ancient','white','female'],'twitter':''},
{'name':'Nicole Kidman','tags':['any','old','white','female'],'twitter':''},
{'name':'Lindsay Lohan','tags':['any','young','white','female'],'twitter':'@lindsaylohan'},
{'name':'Scarlett Johansson','tags':['any','young','white','female'],'twitter':'@ScarlettJOnline'},
{'name':'Kim Kardashian','tags':['any','old','white','female'],'twitter':'@KimKardashian'},
{'name':'Jennifer Garner','tags':['any','old','white','female'],'twitter':''},
{'name':'Zooey Deschanel','tags':['any','old','white','female'],'twitter':'@ZooeyDeschanel'},
{'name':'Jessica Chastain','tags':['any','old','white','female'],'twitter':''},
{'name':'Emma Thompson','tags':['any','ancient','white','female'],'twitter':''},
{'name':'Kris Jenner','tags':['any','ancient','white','female'],'twitter':'@KrisJenner'},
{'name':'Lauren Conrad','tags':['any','young','white','female','slut'],'twitter':'@LaurenConrad'},
{'name':'Claire Daines','tags':['any','old','white','female'],'twitter':''},
{'name':'Lady Gaga','tags':['any','young','white','female'],'twitter':'@ladygaga'},
{'name':'Adele','tags':['any','young','white','female'],'twitter':'@OfficialAdele'},
{'name':'Madonna','tags':['any','ancient','white','female'],'twitter':'@MadonnaWorld'},
{'name':'Taylor Swift','tags':['any','young','white','female'],'twitter':'@taylorswift13'},
{'name':'Ashley Greene','tags':['any','young','white','female'],'twitter':'@AshleyMGreene'},
{'name':'Meryl Streep','tags':['any','ancient','white','female'],'twitter':'@Meryl_Streep'},
{'name':'Genesis Rodriguez','tags':['any','young','hispanic','female'],'twitter':'@genirodriguez'},
{'name':'Dakota Fanning','tags':['any','young','white','female'],'twitter':'@itsDakotaFannin'},
{'name':'Blake Lively','tags':['any','young','white','female'],'twitter':'@iam_blakelively'},
{'name':'Katy Perry','tags':['any','young','white','female'],'twitter':'@katyperry'},
{'name':'Ellen DeGeneres','tags':['any','ancient','white','female'],'twitter':'@TheEllenShow'},
{'name':'Keira Knightley','tags':['any','young','white','female'],'twitter':'@kieraknightley'},
{'name':'Pam Anderson','tags':['any','old','white','female'],'twitter':'@PamelaDAnderson'},
{'name':'Janet Reno','tags':['any','ancient','white','female'],'twitter':'@JanetReno'},
{'name':'Eva Mendez','tags':['any','old','hispanic','female'],'twitter':'@evamendes'},
{'name':'Mila Kunis','tags':['any','young','white','female'],'twitter':'@ReaIMilaKunis'}];

var headlines = [
"[any] tells all: the [magazine_word], the [disease], and my faith in that [bad_adjective] thing of a [bad_noun] I call Mom.",
"[any] Overcoming [disease] with friend [any]:'We're trying not to be too [bad_adjective] but these [bad_noun_plural] hurt.'",
"[any] is giving [any] the cold-shoulder For 'Stealing my Drugs'",
"Doctor confirms: [any] gave [any] '[disease]' ",
"[any] Fights to Stay Alive Despite [any]'s '[disease]' Curse",
"[any] Caught Sneaking into [any]'s Mansion",
"[any] is over [any]! 'Gotta get me some [any] now!'",
"[any] Debuts Incredible Post-baby Body in Hawaii while stalking [any]!",
"[any] Caught in Bar Brawl with [any]!",
"[any] to Serve Jailtime after Assaulting [any] With Molten Glass",
"[any] Naked on Letterman...again. Co-guest, [any], shrugs.",
"[any] Spied at Starbucks Secretly Sipping [any]'s coffee",
"Love at First Sight? [any]'s Secret Crush on [any]!",
"[female]: 'I feel Super Pregnant'",
"Word Battle: [any] Calls [any] a '[bad_adjective] ol' [bad_noun]'",
"Wardrobe Malfunction: [any] Blames [any] for 'Nipple Disaster'",
"[any] Comes Out of Closet! [any] Goes Back in!",
"[any]'s Sex Change goes horribly wrong. Best friend, [any] finds him/her stitching up penis in bathroom",
"[any] Talks Engagement With [any]",
"[male] Dyes Hair Bubblegum pink!",
"[any] Tells Family: '[any] is more important than you'",
"[any]: 'I don't hate [any] any more than I hate [any]'",
"[any] and [any]'s Hot Romance Broken Up By [any]",
"[any] 'Puked Guts Out' while watching [any]'s Performance",
"[female] Flaunts Sweaty Cleavage, Drinks [any]'s Blood While Distracted",
"[any] Retires: '[any] Says I'm Dead If I Don't!'",
"[any] Apologizes for 'Smoking Weed' During [any]'s Performance",
"[any] And [any] Have Been Spending 'Time Together' says Source",
"[any] Nominated For 'Best Friend Of [any]'",
"[any] confesses: [any] Is Hotter Than [any]",
"'[male] cheated on us!' -[female], [male]",
"[any] Trades STDs in Sexy Romp with [any], Source Says",
"[any] Reunites with [any] Despite Hyper-Contagious '[disease]' sores",
"[any] Reveals Secret to Successful Marriage: 'Don't Marry [any]'",
"[any] Wants [any] to Stop Sleeping Around!",
"[old,female] Wants Another Penis! And 'Not [black,male]'s This Time!'",
"Sex Tape: [any] & [any] 'Misplace It' on YouTube!",
"Cougar Alert: [old,female] says [young,male] is Better than [young,male] in the Sack",
"[any] Helps orphans in Uganda while [any] Arrested By S.W.A.T. Team Yet Again",
"[any] Joins 'Scientology' to Teach [any] a Lesson",
"[female] Uses Last Designer Tampon Despite [female]'s Heavier Flow",
"[any] 'No Good in Bed', says ex-'just friend' [any]",
"[any] Kicked Out of Topless Bar After 'Bad [any] Impersonation'",
"[any] Spied Giving [any] Tour of Sexy New York City Brothels",
"[any] considered 'Least Desirable Skinny Dipper at Party' by a [any] Fan Club",
"[any] 'Fights like a whiny little [bad_noun],' says confidential source, [any]",
"[female] Forgives [male] For Stabbing Ex-Lover ([female])",
"[male]'s High School Teacher Slept With Him...and Survived To Tell All",
"[male] 'Scared For His Life' after 'Full Frontal Nudity' Meltdown In Front of Co-Star [any]",
"[male] Donates $1M to Local Police After Assault by [male] in Nudey Bar Parking Lot",
"'Our Parents Are Siblings...SO WHAT?!' Reads Billboard Paid For by New Celebrity Super Couple, [any] & [any]",
"[male] Denies Ties to Mafia While Strangling [any] in Bathroom of LA Nightclub",
"[black,male] Cracks Joke on [white,female] - [black,male] Takes All The Credit",
"[any] Mistaken For [any] By Police - [any] Sues",
"Nude Photos of [any] Are 'Hard To Find on the Internet' Source Claims",
"[any] Returns to Work Despite Botched Sex Change Surgery",
"[male] Confesses To Making Sex Tape With [any]'s Entire Landscaping Crew And Selling It to the Chinese to Pay Rent",
"[any] to appear in a Japanese Game Show series Based on the Life of [any]",
"[any] Found Pretending to Be Asleep in [any]'s Backyard After Boring Night with [any]",
"'Where'd They Go!?' [male]'s Brave Search for Car Keys After a Sultry Night with [female]",
"Mechanical Miracle: [any] Donates Broken Computer to Orphanage - [any] says, 'It'll Probably Work'",
"Make Room: [male] and [male] Made a Baby - Inside Surrogate [female]!",
"Brush with Death: [male] Castrated By Tourists at [any]'s Summer Home",
"Switched at Birth? [male] and [female] Go On Hunt for the Truth",
"Past Lives: [female] Claims She's NOT [any]'s Reincarnated Neighbor",
"[male] Claims He's Never Had Diarrhea...Pictures Taken by [any] say otherwise",
"[male] Has Stomach Surgery, Doctors Find [any]'s Wallet!",
"Scary Afternoon: How [any] Dropped Acid With Co-star [any] and Woke Up a Prostitute for the Mexican Drug Cartel",
"[old,female]'s Weight Loss Secret? Banging [young,male]!",
"[female]'s New Boy Toy, [male], is: 'Gayer Than I Thought - I Love It!'",
"Tom Cruise converts [young,male] to Scientology - 'Couldn't have done it without [black,female]'s help!",
"Love Triangle: [old,female], [young,male], [black,male] State Vows On 'Real World: International Space Station'",
"'You thought I was f***ed up, last year? That's so sweet!' - [white,female]",
"[female]: I screwed [male] in front of the police to avoid jail time",
"[any]:  My last movie ruined my life.' How [any] saved it",
"[male]: My realestate skills are as hot as my girlfriend [female]",
"[female]'s gynecologist to release a new research paper titled 'Inside [female]'",
"[female]: Who do I have to sleep with to win an Oscar around here?",
"[any] trips and refuses to apologize",
"[male]: Who I plan on sleeping with tonight. Hint: It's [female].",
"[female] & [male]: How we accidentally made a baby.",
"[female]'s 13 year old daughter picked out her Oscar dress? 'I didn't even know I had a daughter!' - [female]",
"[male]: 'Why it's so hard to be married to [female] & why it's going to be even harder to divorce her.'",
"[any]: Why [any] kills my sex drive.",
"[female]: 'How I got pregnant without [male]'s help.'",
"Meet the new cast of 'Dancing With The Stars' [female] and [male].",
"See [female] and [male] strip for racy photo shoot.",
"[male] Hides from paparazzi by wearing a gas mask.",
"[female] and [male] sell their baby on ebay for $3.2M!",
"[female]'s doctor says unfortunately she will die someday.",
"Why it sucks to be [male] and what he plans on doing about it.",
"[male] divorces [female] via tweet!",
"[female]: If [female] were really my BFF, why is she sleeping with [male]?",
"[young,male]: How [old,female] stole my virginity... two nights in a row!",
"[male]: [female] punched me in the penis! I seriously thought I was going to die!",
"[male] Announces: [female] and I only have sex on the weekend!",
"[female] Apologizes: Unfortunately [male] and I will not be having sex anymore!",
"[female]: [male] kicked me in the [female_body_part]!",
"[female] Claims [male] got plastic surgery on his [male_body_part] and [body_part]!",
"After witnessing [male]'s plastic surgery [female] says she'll never get her [body_part] done again!",
"[male] is donating his [body_part] to charity - 'It's for a really good cause.'",
"[male] donates his [male_body_part] to charity [female] says 'We're through!",
"[female] donates her [female_body_part] to charity [male] says 'We're through!",
];

var words = {
female_body_part:["nipples", "vagina", "mammary glands", "uterus", "baby maker","boobs"],
male_body_part:["penis","balls","nut sack","weiner","testies","'long john silver'","little one eyed snake"],
body_part:["legs","arms","butt","hands","feet","biceps","sphincter","scalp","forearms","nipples","gut","arm pits","belly button","fingers"],
disease:["Acne","AIDS","Albinism","Alcoholic hepatitis","Allergy","Alopecia","Alzheimer's disease","Amblyopia","Amebiasis","Anemia","Aneurdu","Anorexia","Anosmia","Anotia","Anthrax","Appendicitis","Apraxia","Argyria","Arthritis","Aseptic meningitis","Asthenia","Asthma","Astigmatism","Atherosclerosis","Athetosis","Atrophy","Bacterial meningitis","Beriberi","Black Death","Botulism","Breast cancer","Bronchitis","Brucellosis","Bubonic plague","Bunion","Bella killer","Calculi","Campylobacter infection","Cancer","Candidiasis","Carbon monoxide poisoning","Cerebral palsy","Chagas disease","Chalazion","Chancroid","Chavia","Cherubism","Chickenpox","Chlamydia","Chlamydia trachomatis","Cholera","Chordoma","Chorea","Chronic fatigue syndrome","Circadian rhythm sleep disorder","Coccidioidomycosis","Colitis","Common cold","Condyloma","Congestive heart disease","Coronary heart disease","Cowpox","Cretinism","Crohn's Disease","Dengue","Diabetes mellitus","Diphtheria","Dehydration","[change]E","Ear infection","Ebola","Encephalitis","Emphysema","Epilepsy","Erectile dysfunction","Foodborne illness","Gangrene","Gastroenteritis","Genital herpes","GERD","Goitre","Gonorrhea","[change]H","Heart disease","Hepatitis A","Hepatitis B","Hepatitis C","Hepatitis D","Hepatitis E","HistiocytosisÊ(Childhood Cancer)","HIV","Human papillomavirus","Huntington's disease","Hypermetropia","Hyperopia","Hyperthyroidism","Hypothermia","Hypothyroid","Hypotonia","Impetigo","Infertility","Influenza","Interstitial cystitis","Iritis","Iron-deficiency anemia","Irritable bowel syndrome","Ignious Syndrome","Jaundice","[change]K","Keloids","Kuru","Kwashiorkor","Laryngitis","Lead poisoning","Legionellosis","Leishmaniasis","Leprosy","Leptospirosis","Listeriosis","Leukemia","Lice","Loiasis","Lung cancer","Lupus erythematosus","Lyme disease","Lymphogranuloma venereum","Lymphoma","Malaria","Marburg fever","Measles","Melanoma","Melioidosis","Metastatic cancer","MŽnire's disease","Meningitis","Migraine","Mononucleosis","Multiple myeloma","Multiple sclerosis","Mumps","Muscular dystrophy","Myasthenia gravis","Myelitis","Myoclonus","Myopia","Myxedema","Morquio Syndrome","Mattticular syndrome","Neoplasm","Non-gonococcal urethritis","Necrotizing Fasciitis","Night blindness","Obesity","Osteoarthritis","Osteoporosis","Otitis","Palindromic rheumatism","Paratyphoid fever","Parkinson's disease","Pelvic inflammatory disease","Peritonitis","Periodontal disease","Pertussis","Phenylketonuria","Plague","Poliomyelitis","Porphyria","Progeria","Prostatitis","Psittacosis","Psoriasis","Pubic lice","Pulmonary embolism","Pilia","Q fever","Ques fever","Rabies","Repetitive strain injury","Rheumatic fever","Rheumatic heart","Rheumatism","Rheumatoid arthritis","Rickets","Rift Valley fever","Rocky Mountain spotted fever","Rubella","Sabia","Salmonellosis","Scabies","Scarlet fever","Sciatica","Scleroderma","Scrapie","Scurvy","Sepsis","Septicemia","SARS","Shigellosis","Shin splints","Shingles","Sickle-cell anemia","Siderosis","SIDS","Silicosis","Smallpox","Stevens-Johnson syndrome","Stomach flu","Stomach ulcers","Strabismus","Strep throat","Streptococcal infection","Synovitis","Syphilis","Swine influenza","Schizophrenia","Taeniasis","Tay-Sachs disease","Tennis elbow","Teratoma","Tetanus","Thalassaemia","Thrush","Thymoma","Tinnitus","Tonsillitis","Tooth decay","Toxic shock syndrome","Trichinosis","Trichomoniasis","Trisomy","Tuberculosis","Tularemia","Tungiasis","Typhoid fever","Typhus","Tumor","Ulcerative colitis","Ulcers","Uremia","Urticaria","Uveitis","Varicella","Varicose veins","Vasovagal syncope","Vitiligo","Von Hippel-Lindau disease","Viral fever","Viral meningitis","valeria disease killer","Warkany syndrome","Warts","Yellow fever","Yersiniosis"],
bad_noun_plural:["bitches","dicks","morons","idiots","assholes","weiners","mother f*****s","jerks"],
bad_noun:["bitch","dick","moron","idiot","asshole","weiner","mother f***er","jerk"],
magazine_word:["mugshot","no make up","bikini","red carpet","scowling","beach","suntan","popparazzi","divorce","nightclub","movie","yearbook","angry","shouting","yelling","shops","fights","ugly","cheats"],
bad_adjective:["angry","bewildered","clumsy","defeated","embarrassed","fierce","grumpy","helpless","itchy","jealous","lazy","mysterious","nervous","obnoxious","panicky","repulsive","scary","thoughtless","uptight","worried","ugly"],
common_word:["child","clash","opinion","religion","clergy","container","house","factory","hotel","company","research","town","funeral","tradition","port","circle","blanket","album","campaign","bottle","inflation","nation","shoe","bird","fish","holiday","remains","telescope","camera","balloon","telephone","rocket","bomb","clock","parachute","television","radar","microscope","machine","problem","cancer","border","passport","coffee","tea","desert","ancestor","pig","sheep","cow","parent","regret","sister","battle","conflict","square","corn","rice","bread","statue","light","electricity","police","legislature","parliament","wheat","tribe","cabinet","parade","jury","committee","community","crew","party","team","adult","ceasefire","rock","metal","glass","hat","stove","truck","general","gold","volcano","pain","profession","anarchy","island","wealth","river","horse","lake","territory","sea","treasure","tank","mob","convention","planet","case (court)","bill","term","animal","custom","valley","road","book","pipe","tube","rope","line","wire","engine","helicopter","brother","male","husband","person","cloud","star","fog","cotton","plastic","cloth","degree","minute","hour","conference","minister","letter","pan","system","offensive","base","air force","movie","trip","motion","path","ally","country","ambassador","baby","group","series","troops","percent","piece","mountain","example","way","fine","week","year","patient","hostage","hero","soldier","officer","sailor","chairman","friend","enemy","slave","doctor","passenger","terrorist","engineer","guerrilla","refugee","citizen","criminal","diplomat","candidate","dissident","astronaut","official","expert","extremist","daughter","son","memory","map","flag","device","ballot","school","university","forest","station","market","prison","airport","zoo","theater","hospital","camp","position"]
};

String.prototype.cap = function(){
  return this.charAt(0).toUpperCase() + this.slice(1)
}

String.prototype.capAll = function(){
  var words = this.toString().split(' ');
  var phrase = "";
  for (var i = 0; i < words.length; i++) {
      phrase += i === 0 ? words[i].cap() : " " + words[i].cap();
  };
  return phrase;
}

String.prototype.getStringArrays = function(){
    var pattern=/\[.+?\]/g;
    var stringArrays = this.match(pattern);
    return stringArrays;
}


String.prototype.getArrayGroups = function(){
    var arrays = this.getStringArrays();
    for (var i = 0; i < arrays.length; i++) {
        arrays[i] = eval(arrays[i].replace(/\[/g,'["').replace(/\]/g,'"]').replace(/\,/g,'","'));
    };
    return arrays;
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

Array.prototype.containsAll = function(tag_array) {
    for (var i = 0; i < tag_array.length; i++) {
        if (this.contains(tag_array[i]) === false){
            return false;
        };
    };
    return true;
}

Array.prototype.getRandom = function(){
    var max = this.length-1;
    var min = 0;
    var item_number = Math.floor(Math.random() * (max - min + 1)) + min;
    return this[item_number];
}

String.prototype.celebrify = function(celebs,words){

    // Get the string & arrays as string & transformed-to-array
    var text = this.toString();
    var string_arrays = text.getStringArrays();
    var array_groups = text.getArrayGroups();

    // Replace non-celeb stuff
    var word_categories = Object.keys(words);
    var string_arrays_of_non_celebs = [];
    for (var a = 0; a < array_groups.length; a++) {
        for (var w = 0; w < word_categories.length; w++) {
            if (array_groups[a].length === 1 && array_groups[a].contains(word_categories[w])){
                var word = words[word_categories[w] .toString()].getRandom();
                text = text.replace('['+array_groups[a].toString()+']',word);
            }
        };    
    };

    // Re-Get the string & arrays now that non-celebs have been replaced
    var string_arrays = text.getStringArrays();
    var array_groups = text.getArrayGroups();

    // Turn array_groups [[],[],[]] into array_groups_celebs  [ [{},{}] , [{},{}] , ...]
    var array_groups_celebs = [];
    for (var a = 0; a < array_groups.length; a++) {
        array_groups_celebs[a] = [];
        for (var c = 0; c < celebs.length; c++) {
            if (celebs[c]['tags'].containsAll(array_groups[a])){
                array_groups_celebs[a].push(celebs[c]);
            }
        };
    };

    // Choose a random celeb
    var array_groups_celebs_chosen = [];
    for (var i = 0; i < array_groups_celebs.length; i++) {
        array_groups_celebs_chosen[i] = array_groups_celebs[i].getRandom();
    };

    // Replace the original stringed arrays with celeb names
    var chosen_celebs_arrays = [];
    var chosen_celebs_arrays_twitter = [];
    for (var i = 0; i < array_groups_celebs_chosen.length; i++) {
        text = text.replace(string_arrays[i],array_groups_celebs_chosen[i].name);
        chosen_celebs_arrays.push(array_groups_celebs_chosen[i].name);
        chosen_celebs_arrays_twitter.push(array_groups_celebs_chosen[i].twitter);
    };

    var headline_object = {};
    headline_object.headline = text.capAll();
    headline_object.celebs_in_headline = chosen_celebs_arrays;
    headline_object.celebs_twitter = chosen_celebs_arrays_twitter;

    return headline_object;
}

function getHeadline(){

    var headline = headlines.getRandom();
    var headline_object = headline.celebrify(celebs,words);
    return headline_object;
}

var celeb_names = [];
for (var i = 0; i < celebs.length; i++) {
    celeb_names.push(celebs[i].name);
};
celeb_names.sort();

next_headline_object = getHeadline();
    