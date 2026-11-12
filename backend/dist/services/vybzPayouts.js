"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileVybzPayout = reconcileVybzPayout;
const VybzCoinTransaction_1 = __importDefault(require("../models/VybzCoinTransaction"));
const VybzWallet_1 = __importDefault(require("../models/VybzWallet"));
const VybzWithdrawal_1 = __importDefault(require("../models/VybzWithdrawal"));
async function reconcileVybzPayout(reference, status, providerReference) {
    const withdrawal = await VybzWithdrawal_1.default.findOne({ reference });
    if (!withdrawal)
        throw new Error('VYBZ withdrawal not found');
    if (withdrawal.status === 'paid')
        return withdrawal;
    if (['paid', 'success', 'completed', 'confirmed'].includes(status)) {
        const updated = await VybzWithdrawal_1.default.findOneAndUpdate({ _id: withdrawal._id, status: 'processing' }, { $set: { status: 'paid', providerReference: providerReference || reference, paidAt: new Date() } }, { new: true });
        if (updated) {
            await VybzWallet_1.default.updateOne({ userId: withdrawal.userId }, { $inc: { reservedCoins: -withdrawal.coins, redeemedCoins: withdrawal.coins } });
            await VybzCoinTransaction_1.default.updateOne({ sourceKey: `withdrawal:${reference}`, status: 'reserved' }, { $set: { status: 'redeemed', kesAmount: withdrawal.netKes } });
        }
        return updated || withdrawal;
    }
    if (['failed', 'rejected', 'cancelled', 'canceled'].includes(status)) {
        await VybzWithdrawal_1.default.updateOne({ _id: withdrawal._id, status: 'processing' }, { $set: { status: 'failed' } });
        await VybzWallet_1.default.updateOne({ userId: withdrawal.userId }, { $inc: { reservedCoins: -withdrawal.coins, availableCoins: withdrawal.coins } });
        await VybzCoinTransaction_1.default.updateOne({ sourceKey: `withdrawal:${reference}`, status: 'reserved' }, { $set: { status: 'reversed' } });
    }
    return withdrawal;
}
//# sourceMappingURL=vybzPayouts.js.map