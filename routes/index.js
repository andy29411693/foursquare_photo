var express = require('express');
var router = express.Router();
var config = {
  'secrets' : {
    'clientId' : 'IDWM4PFJ010CTC0BWOLWBYI3JYBFUHO4ZHALASYEPN1I21EZ',
    'clientSecret' : 'BGARZ1PMRUTNC0PYC1LCNNJCA50DXZRK2RQDKKZ2BLDGTD4M',
    'redirectUrl' : 'http://localhost:3000/callback'
  }
}

var foursquare = require('node-foursquare')(config);
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Foursquare Photos' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' })
});

/* GET Hello World page. */
router.get('/getPhotos', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' })
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});


/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("userlist");
            // And forward to success page
            res.redirect("userlist");
        }
    });
});

router.get('/login', function(req, res) {
  res.writeHead(303, { 'location': foursquare.getAuthClientRedirectUrl() });
  res.end();
});


router.get('/callback', function (req, res) {
  foursquare.getAccessToken({
    code: req.query.code
  }, function (error, accessToken) {
    if(error) {
      res.send('An error was thrown: ' + error.message);
    }
    else {
      // Save the accessToken and redirect.
    // If it worked, set the header so the address bar doesn't still say /adduser
        res.location("photos");
        // And forward to success page
        console.log(accessToken);
        res.redirect("photos/"+accessToken);
    }
  });
});

router.get('/photos/:token', function(req, res){
    console.log("access token:"+req.param.token);
    var token = req.params.token;
    function getFoursqareVenueLink(venueName, veneuId) {
        return "https://foursquare.com/v/"+venueName.replace(/\s+/g, '-')+"/"+veneuId;
    }
    foursquare.Users.getPhotos(null, null, token, function (error, data) {
        var photos = [];
        data.photos.items.forEach(function(photo){
            var link = photo.prefix+photo.width+"x"+photo.height+photo.suffix;
            var venueName = photo.venue.name;
            var venueId = photo.venue.id;
            var foursquareLink = getFoursqareVenueLink(venueName, venueId);
            photos.push({link: link, name: venueName, foursquareLink: foursquareLink} );
        });

        res.render("photos",{ title: req.params.token, photos: photos});
    });

});

module.exports = router;
