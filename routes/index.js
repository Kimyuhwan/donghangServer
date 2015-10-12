var express = require('express');
var router = express.Router();

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: '동행 서버' });
//});

/* GET Start page */
router.get('/start/:invitation_code', function(req, res) {
    res.render('start', {invitation_code: req.params.invitation_code});
});

module.exports = router;
