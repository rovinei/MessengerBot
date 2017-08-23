var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/verify', function(req, res){
    if(req.query['hub.verify_token'] === 'SFn4ULHIwJgqbfQ0ZCGl769ZiA2rfnwJCZPS8WWYfQ0ZCGl7'){
        res.send(req.query['hub.challenge']);
    }

    res.send('Not authorized, 401')
});

module.exports = router;
