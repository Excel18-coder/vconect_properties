import mongoose from 'mongoose';
import { VybzCoinTransactionType } from '../models/VybzCoinTransaction';
export declare function getVybzRewardConfig(): Promise<mongoose.Document<unknown, {}, import("../models/VybzRewardConfig").IVybzRewardConfig, {}, {}> & import("../models/VybzRewardConfig").IVybzRewardConfig & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function getOrCreateWallet(userId: mongoose.Types.ObjectId): Promise<mongoose.Document<unknown, {}, import("../models/VybzWallet").IVybzWallet, {}, {}> & import("../models/VybzWallet").IVybzWallet & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function createPendingReward({ userId, postId, type, coins, sourceKey, description, session, }: {
    userId: mongoose.Types.ObjectId;
    postId?: mongoose.Types.ObjectId;
    type: VybzCoinTransactionType;
    coins: number;
    sourceKey: string;
    description: string;
    session?: mongoose.ClientSession;
}): Promise<(mongoose.Document<unknown, {}, import("../models/VybzCoinTransaction").IVybzCoinTransaction, {}, {}> & import("../models/VybzCoinTransaction").IVybzCoinTransaction & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare function settleMaturedRewards(userId: mongoose.Types.ObjectId): Promise<mongoose.Document<unknown, {}, import("../models/VybzWallet").IVybzWallet, {}, {}> & import("../models/VybzWallet").IVybzWallet & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function normalizeKenyanPhone(phone?: string): Promise<string>;
export declare function recordQualifiedView({ postId, creatorId, viewerId, watchSeconds, qualificationKey, }: {
    postId: mongoose.Types.ObjectId;
    creatorId: mongoose.Types.ObjectId;
    viewerId: mongoose.Types.ObjectId;
    watchSeconds: number;
    qualificationKey: string;
}): Promise<{
    qualified: boolean;
    reason: string;
    eventId?: undefined;
} | {
    qualified: boolean;
    eventId: mongoose.Types.ObjectId;
    reason?: undefined;
}>;
//# sourceMappingURL=vybzRewards.d.ts.map