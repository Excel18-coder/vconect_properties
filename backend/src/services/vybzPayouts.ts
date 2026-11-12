import VybzCoinTransaction from '../models/VybzCoinTransaction';
import VybzWallet from '../models/VybzWallet';
import VybzWithdrawal from '../models/VybzWithdrawal';

export async function reconcileVybzPayout(reference: string, status: string, providerReference: string) {
    const withdrawal = await VybzWithdrawal.findOne({ reference });
    if (!withdrawal) throw new Error('VYBZ withdrawal not found');
    if (withdrawal.status === 'paid') return withdrawal;
    if (['paid', 'success', 'completed', 'confirmed'].includes(status)) {
        const updated = await VybzWithdrawal.findOneAndUpdate(
            { _id: withdrawal._id, status: 'processing' },
            { $set: { status: 'paid', providerReference: providerReference || reference, paidAt: new Date() } },
            { new: true }
        );
        if (updated) {
            await VybzWallet.updateOne({ userId: withdrawal.userId }, { $inc: { reservedCoins: -withdrawal.coins, redeemedCoins: withdrawal.coins } });
            await VybzCoinTransaction.updateOne({ sourceKey: `withdrawal:${reference}`, status: 'reserved' }, { $set: { status: 'redeemed', kesAmount: withdrawal.netKes } });
        }
        return updated || withdrawal;
    }
    if (['failed', 'rejected', 'cancelled', 'canceled'].includes(status)) {
        await VybzWithdrawal.updateOne({ _id: withdrawal._id, status: 'processing' }, { $set: { status: 'failed' } });
        await VybzWallet.updateOne({ userId: withdrawal.userId }, { $inc: { reservedCoins: -withdrawal.coins, availableCoins: withdrawal.coins } });
        await VybzCoinTransaction.updateOne({ sourceKey: `withdrawal:${reference}`, status: 'reserved' }, { $set: { status: 'reversed' } });
    }
    return withdrawal;
}
