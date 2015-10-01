/**
 * Created by yuhwan on 2015. 8. 24..
 */

module.exports = {
    ensureAuthorized: function(req, res, next) {
        var bearerToken;
        var bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== 'undefined') {
            var bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];
            req.token = bearerToken;
            console.log("token: " + req.token);

            User.findOne({token: req.token} , function(err, user) {
                if(err) {
                    res.json({
                        type: false,
                        data: "Error occured: " + err
                    });
                } else {
                    if(user) {
                        next();
                    }
                    else {
                         res.json({
                        type: false,
                        data: "Error occured: " + err
                    });
                    }
                }
            });

        } else {
             res.sendStatus(403);
        }
    }
};