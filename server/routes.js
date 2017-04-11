/**
 * Created by sony on 2016/10/13.
 */
const manjusri = require('./wechat/manjusri'),
    manjusriPages = require('./wechat/manjusriPages'),
    linkages = require('./rests'),
    auth = require('./auth').manjusri,
    passport = require('passport'),
    payment = require('./wechat/payment'),
    part = require('./biz/part'),
    payRoute = require('./payurl').payRoute,
    statistics = require('./rest/statistics'),
    pray = require('./rest/pray'),
    paymentShare = require('./wechat/paymentShare');

var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

const virtues = require('./rest/virtues');

module.exports = {
    attachTo: function (app) {
        app.get('/jingyin/manjusri/login', manjusri.login);
        app.get(linkages.getUrlTemplete('home'), manjusriPages.home);
        app.get(linkages.getUrlTemplete('dailyVirtue'), auth, manjusriPages.dailyVirtue);
        //app.get(linkages.getUrlTemplete('dailyVirtue'), manjusriPages.dailyVirtue);
        app.get(linkages.getUrlTemplete('suixi'), auth, manjusriPages.suixi);
        //app.get(linkages.getUrlTemplete('suixi'), manjusriPages.suixi);
        app.get(linkages.getUrlTemplete('jiansi'), manjusriPages.jiansi);
        app.get(linkages.getUrlTemplete('pray'), manjusriPages.pray);
        app.get('/jingyin/manjusri/trans/:partId', auth, manjusri.trans);
        app.get('/jingyin/manjusri/pay/confirm', payment.pay);
        app.get('/jingyin/manjusri/pay/notify', payment.result);
        app.post('/jingyin/manjusri/pay/notify', virtues.paidNotify);
        app.get('/jingyin/manjusri/lordvirtues', auth, manjusri.lordVirtues);
        app.get('/jingyin/manjusri/lords/:openid/profile', auth, manjusri.lordProfile);
        app.put('/jingyin/manjusri/lords/:openid/profile', manjusri.updateLordProfile);

        /*----------------------------restful--------------------------------------------------*/
        app.post('/jingyin/rest/virtues/prepay', virtues.prepay);
        app.post('/jingyin/rests/manjusri/pray', pray.pray);
        app.get('/jingyin/rests/manjusri/statistics', statistics.query);

        /*------------------------------ Biz view--------------------------------------------------*/
        app.get('/jingyin/biz', function (req, res) {
            res.render('biz/home', {user: req.user});
        });

//displays our signup page
        app.get('/jingyin/biz/signin', function (req, res) {
            res.render('biz/signin');
        });

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
        app.post('/jingyin/biz/local-reg', passport.authenticate('local-signup', {
                successRedirect: '/jingyin/biz',
                failureRedirect: '/jingyin/biz/signin'
            })
        );

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
        app.post('/jingyin/biz/login', passport.authenticate('local-signin', {
                successRedirect: '/jingyin/biz',
                failureRedirect: '/jingyin/biz/signin'
            })
        );

//logs user out of site, deleting them from the session, and returns to homepage
        app.get('/jingyin/biz/logout', function (req, res) {
            var name = req.user.username;
            console.log("LOGGIN OUT " + req.user.username)
            req.logout();
            res.redirect('/jingyin/biz');
            req.session.notice = "You have successfully been logged out " + name + "!";
        });

        app.get('/jingyin/payment/share',paymentShare.result);
    }
}
