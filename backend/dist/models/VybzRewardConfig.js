"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const schema = new mongoose_1.Schema({
    coinsPerThousandViews: { type: Number, required: true, min: 0, default: 100 },
    coinsPerLike: { type: Number, required: true, min: 0, default: 5 },
    viewThreshold: { type: Number, required: true, min: 1, default: 1000 },
    minimumWithdrawalCoins: { type: Number, required: true, min: 1, default: 20000 },
    maximumWithdrawalCoins: { type: Number, min: 1 },
    coinsPerKes: { type: Number, required: true, min: 1, default: 100 },
    withdrawalFeeKes: { type: Number, required: true, min: 0, default: 0 },
    verificationPeriodDays: { type: Number, required: true, min: 0, default: 7 },
    minimumWatchSeconds: { type: Number, required: true, min: 0, default: 5 },
    shortVideoCompletionPercent: { type: Number, required: true, min: 0, max: 100, default: 90 },
    viewBonusThreshold: { type: Number, required: true, min: 1, default: 10000 },
    viewBonusCoins: { type: Number, required: true, min: 0, default: 500 },
    likeBonusThreshold: { type: Number, required: true, min: 1, default: 100 },
    likeBonusCoins: { type: Number, required: true, min: 0, default: 100 },
    dailyEarningLimit: { type: Number, required: true, min: 0, default: 0 },
    monthlyEarningLimit: { type: Number, required: true, min: 0, default: 0 },
    rewardsActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
exports.default = mongoose_1.default.model('VybzRewardConfig', schema);
//# sourceMappingURL=VybzRewardConfig.js.map