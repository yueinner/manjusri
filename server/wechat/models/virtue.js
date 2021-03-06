var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    PartModel = require('./part');

function validateAmount(val) {
    return Math.round(val*100)/100 === val && val > 0;
}

function validateSubjectMustExist(subject, res) {
    return PartModel.findById(subject)
        .then(function (doc) {
            return res(doc)
        })
}

function validateNum(val) {
    return Number.isInteger(val) && val > 0;
}

var VirtueSchema = new Schema({
    lord: {type: Schema.Types.ObjectId, ref: 'User'},
    subject: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Part',
        validate: [validateSubjectMustExist, '{PATH} {VALUE} 不存在']
    },
    num: {
        type: Number,
        validate: [validateNum, '{PATH}必须为正整数']
    },
    price: {type: Number, validate: [validateAmount, '{PATH}:[{VALUE}], 为金额最多两位小数且大于零']},
    amount: {type: Number, required: true, validate: [validateAmount, '{PATH}:[{VALUE}], 为金额最多两位小数且大于零']},
    giving: String,
    paymentNo: String,
    timestamp: {type: Date, default: Date.now()},
    state: {type: String, default: 'new', enum: ['new', 'payed']}
});

module.exports = mongoose.model('Virtue', VirtueSchema);

