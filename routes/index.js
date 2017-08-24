var express = require('express');
var router = express.Router();
var config = require('../config');
var fbMessageController = require('../controller/FacebookMessengerController');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/term-of-services', function(req, res, next) {
  res.render('tos', { title: 'Veirdo Bot Agent | Term of Service page' });
});

router.get('/privacy-policy', function(req, res, next) {
  res.render('privacy', { title: 'Veirdo Bot Agent | Privacy and Policy page' });
});

router.get('/verify', function(req, res, next){
    if(req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.fb_verify_token){
        console.log("Validating webhook");
        res.send(req.query['hub.challenge']);
    }else{
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

router.post('/verify', fbMessageController.incomingMessageReceived);



module.exports = router;
