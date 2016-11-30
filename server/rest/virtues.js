/**
 * Created by clx on 2016/10/27.
 */
var virtues = require('../modules/virtues'),
    parts = require('../modules/parts'),
    userModel = require('../wechat/models/user'),
    partModel = require('../wechat/models/part'),
    linkages = require('../rests'),
    usersModule = require('../modules/users'),
    createResponseWrap = require('../../modules/responsewrap'),
    weixin = require('../weixin');
var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

function Virtues() {
}

Virtues.prototype.prepay = function (req, res) {
    var obj = req.body;
    var resWrap = createResponseWrap(res);

    function responseVirtue(virtue) {
        var selfUrl = linkages.getLink('virtue', {id: virtue.id});
        var payUrl = linkages.getLink('pay', {virtue: virtue.id});
        payUrl = encodeURIComponent(payUrl);
        payUrl = weixin.weixin.wrapRedirectURLByOath2Way(payUrl);
        var links = {
            self: selfUrl,
            pay: payUrl
        }
        res.links(links);
        res.header('Location', selfUrl);
        res.status(201).json(virtue);
    }


    var details = null;
    if(obj.num) details = {price:obj.price, num: obj.num};
    return virtues.place(obj.subject, obj.amount, details, obj.giving)
        .then(function (virtue) {
            if (!details || !details.num) {
                return responseVirtue(virtue);
            }
            return parts.updatePartNum(obj.subject, obj.num * 1)
                .then(function () {
                    return responseVirtue(virtue);
                });
        })
        .catch(function (err) {
            return resWrap.setError(500, null, err);
        });
};

//TODO: 调整菜单
//TODO: restful已支付服务是否有必要保留？
//TODO: 如果保留，那么这里的代码与../wechat/payment.js的paidNotify存在重复
Virtues.prototype.paid = function (req, res) {
    var data = req.body;

    function doPay(user) {
        virtueModel.pay(req.params.id, user.id, data.paymentNo, function (err, virtue) {
            var selfUrl = linkages.getLink('virtue', {id: virtue.id});
            var links = {
                self: selfUrl,
            }
            res.links(links);
            res.status(200).json(virtue);
        });
    }

    userModel.findOne({openid: data.openId}, function (err, user) {
        if (!user) {
            logger.info('Can not found user with openid:' + data.openId);
            usersModule.register(data.openId, function (err, userAdded) {
                if (err) {
                    logger.error('register user failed:' + err);
                    return;
                }
                doPay(userAdded);
            });
            return;
        }
        doPay(user);
    });

};

module.exports = new Virtues();