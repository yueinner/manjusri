var Part = require('./models/part'),
    Virtue = require('./models/virtue'),
    virtuesModule = require('../modules/virtues'),
    Promise = require('bluebird'),
    createResponseWrap = require('../../modules/responsewrap'),
    wx = require('../weixin');

var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

function listVirtuesAndTotalTimes() {
    return new Promise(function (resolve, reject) {
        var data = {};
        return virtuesModule.listLastVirtues(30)
            .then(function (list) {
                data.virtues = list;
                return Virtue.count({state: 'payed'});
            })
            .then(function (times) {
                data.times = times;
                return resolve(data);
            })
            .catch(function (err) {
                return reject(err);
            });
    });
}

module.exports = {
    home: function (req, res) {
        var res = createResponseWrap(res);
        return listVirtuesAndTotalTimes()
            .then(function (data) {
                data.title = '首页';
                return res.render('wechat/index', data);
            }, function (err) {
                return res.setError(500, null, err);
            });
    },

    jiansi: function (req, res) {
        var data = {
            title: '建寺',
            parts: []
        };
        var res = createResponseWrap(res);
        return Part.find({type: 'part', onSale: true})
            .then(function (parts) {
                    data.parts = parts;
                    return res.render('wechat/jiansi', data);
                }, function (err) {
                    return res.setError(500, null, err);
                }
            );
    },

    dailyVirtue: function (req, res) {
        var data;
        var res = createResponseWrap(res);
        return listVirtuesAndTotalTimes()
            .then(function (result) {
                data = result;
                return Part.findOne({type: 'daily', onSale: true});
            })
            .then(function (part) {
                if (!part) return res.setError(500, '日行一善相关信息未建立');
                data.part = part;
                data.title = '建寺-日行一善';
                return res.render('wechat/dailyVirtue', data);
            })
            .catch(function (err) {
                return res.setError(500, null, err);
            });
    },

    suixi: function (req, res) {
        var data = {
            title: '建寺-随喜所有建庙功德'
        };
        var res = createResponseWrap(res);
        return Part.findOne({type: 'suixi', onSale: true})
            .then(function (part) {
                if (!part) return res.setError(500, '随喜相关信息未建立');
                data.part = part;
                return res.render('wechat/suixi', data);
            }, function (err) {
                return res.setError(500, null, err);
            });
    },

    trans: function (req, res) {
        var id = req.params.partId;
        var res = createResponseWrap(res);
        return Part.findById(id)
            .then(function (part) {
                if (!part) {
                    return res.setError(404, 'part ' + id.toString() + ' is not found');
                }
                return res.render('wechat/trans', {
                    title: '建寺-' + part.name,
                    part: part
                });
            }, function (err) {
                return res.setError(500, null, err);
            });
    },

    lordVirtues: function (req, res) {
        var code = req.query.code;
        if(code){
            logger.debug("The code of request:" + code);
            return res.render('wechat/lordVirtues');
        }
        //var lordVirtuesUrl = "http://jingyintemple.top" + req.originalUrl;
        var redirectUrl = wx.weixinConfig.wrapRedirectURLByOath2WayBaseScope(req.originalUrl);
        return res.redirect(redirectUrl);
        //return res.setError(404, 'redirect err');
    }
};

