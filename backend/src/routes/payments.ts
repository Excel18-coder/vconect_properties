import { Router, Response as ExpressResponse } from 'express';
import { z } from 'zod';
import Payment from '../models/Payment';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

type FetchResponse = globalThis.Response;

type PayHeroGatewayResponse = {
    success?: boolean;
    status?: string;
    reference?: string;
    external_reference?: string;
    ExternalReference?: string;
    CheckoutRequestID?: string;
    checkout_request_id?: string;
    payment_reference?: string;
    paymentReference?: string;
    payment_reference_id?: string;
    provider_reference?: string;
    providerReference?: string;
    checkoutUrl?: string;
    paymentUrl?: string;
    url?: string;
    transactionReference?: string;
    id?: string;
    message?: string;
    error?: string;
    [key: string]: any;
};

type PayHeroPaymentChannel = {
    id?: number | string;
    account_id?: number | string;
    is_active?: boolean;
    channel_type?: string;
    transaction_type?: string;
    [key: string]: any;
};

const sellerPlans = {
    pro: { id: 'pro', name: 'Professional', role: 'seller' as const, monthly: 500, yearly: 500 },
    agency: { id: 'agency', name: 'Agency', role: 'seller' as const, monthly: 500, yearly: 500 },
};

const buyerPlans = {
    plus: { id: 'plus', name: 'Buyer Plus', role: 'buyer' as const, monthly: 500, yearly: 500 },
    premium: { id: 'premium', name: 'Buyer Premium', role: 'buyer' as const, monthly: 500, yearly: 500 },
};

const planCatalog = {
    seller: sellerPlans,
    buyer: buyerPlans,
};

type PaymentPlan = {
    id: string;
    name: string;
    role: 'seller' | 'buyer';
    monthly: number;
    yearly: number;
};

function getBackendBaseUrl() {
    return (
        process.env.PAYHERO_CALLBACK_BASE_URL ||
        process.env.BACKEND_URL ||
        process.env.RENDER_EXTERNAL_URL ||
        process.env.API_URL ||
        process.env.SERVER_URL ||
        process.env.PUBLIC_API_URL ||
        ''
    ).replace(/\/+$/, '');
}

function resolveBackendUrl(pathname: string) {
    const baseUrl = getBackendBaseUrl();
    if (!baseUrl) return undefined;
    return `${baseUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function resolveRequestBaseUrl(req: AuthRequest) {
    const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const protocol = forwardedProto || req.protocol || 'http';
    const host = req.get('host');

    if (!host) return undefined;

    return `${protocol}://${host}`.replace(/\/+$/, '');
}

function readGatewayValue(payload: Record<string, any>, keys: string[]) {
    for (const key of keys) {
        const value = payload?.[key];
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }

    return undefined;
}

function parseNumericId(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function getConfiguredPayHeroChannelId() {
    return parseNumericId(process.env.PAYHERO_CHANNEL_ID || process.env.PAYHERO_ACCOUNT_ID);
}

function extractGatewayPayload(response: PayHeroGatewayResponse) {
    if (!response || typeof response !== 'object') {
        return {} as PayHeroGatewayResponse;
    }

    const nestedPayload =
        (response.data && typeof response.data === 'object' && response.data) ||
        (response.result && typeof response.result === 'object' && response.result) ||
        (response.payload && typeof response.payload === 'object' && response.payload) ||
        response;

    return nestedPayload as PayHeroGatewayResponse;
}

function extractGatewayReference(response: PayHeroGatewayResponse) {
    const payload = extractGatewayPayload(response);
    return readGatewayValue(payload, [
        'reference',
        'ExternalReference',
        'external_reference',
        'payment_reference',
        'paymentReference',
        'merchantReference',
        'merchant_reference',
        'accountReference',
        'account_reference',
        'transactionReference',
        'transaction_reference',
        'CheckoutRequestID',
        'checkout_request_id',
        'id',
        'checkoutId',
    ]);
}

function extractCheckoutUrl(response: PayHeroGatewayResponse) {
    const payload = extractGatewayPayload(response);
    return readGatewayValue(payload, ['checkoutUrl', 'paymentUrl', 'payment_url', 'url', 'redirectUrl', 'redirect_url']);
}

function normalizeGatewayStatus(value?: string) {
    return String(value || '').toLowerCase().replace(/\s+/g, '_');
}

function buildPayHeroHeaders() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const authToken = process.env.PAYHERO_AUTH_TOKEN || process.env.PAYHERO_API_TOKEN;

    if (authToken) {
        headers.Authorization = authToken.startsWith('Basic ') || authToken.startsWith('Bearer ')
            ? authToken
            : `Bearer ${authToken}`;
        return headers;
    }

    const username = process.env.PAYHERO_API_USERNAME;
    const password = process.env.PAYHERO_API_PASSWORD;

    if (username && password) {
        headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    }

    return headers;
}

function getPayHeroBaseUrl() {
    return (process.env.PAYHERO_BASE_URL || 'https://backend.payhero.co.ke').replace(/\/+$/, '');
}

function resolvePayHeroUrl(preferredUrl?: string, fallbackPath?: string) {
    if (preferredUrl) return preferredUrl;
    if (!fallbackPath) return undefined;
    return `${getPayHeroBaseUrl()}${fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`}`;
}

function normalizeGatewayResponse(response: PayHeroGatewayResponse): PayHeroGatewayResponse {
    return response || {};
}

async function fetchPayHeroPaymentChannels() {
    const channelsUrl = resolvePayHeroUrl(process.env.PAYHERO_PAYMENT_CHANNELS_URL, '/api/v2/payment_channels');
    if (!channelsUrl) return [] as PayHeroPaymentChannel[];

    const url = new URL(channelsUrl);
    url.searchParams.set('is_active', 'true');

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: buildPayHeroHeaders(),
    });

    const text = await response.text();
    let data: PayHeroGatewayResponse = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { raw: text };
    }

    if (!response.ok) {
        const rawBody = (text || '').trim();
        const gatewayMessage = extractGatewayErrorMessage(data);
        throw new Error(gatewayMessage || rawBody || `PayHero payment channels lookup failed (${response.status})`);
    }

    const payload = extractGatewayPayload(data);
    const channels = payload.payment_channels || payload.channels || payload.data || [];
    return Array.isArray(channels) ? channels as PayHeroPaymentChannel[] : [];
}

async function resolvePayHeroChannelId() {
    const configuredChannelId = getConfiguredPayHeroChannelId();
    const channels = await fetchPayHeroPaymentChannels();

    if (configuredChannelId) {
        const match = channels.find((channel) => Number(channel.id) === configuredChannelId);
        if (match) {
            return configuredChannelId;
        }

        const accountMatch = channels.find((channel) => Number(channel.account_id) === configuredChannelId);
        if (accountMatch && Number(accountMatch.id)) {
            return Number(accountMatch.id);
        }

        throw new Error(
            `Configured PAYHERO_CHANNEL_ID ${configuredChannelId} does not match any active PayHero payment channel. Register a channel in PayHero and set PAYHERO_CHANNEL_ID to the channel id from /api/v2/payment_channels.`
        );
    }

    if (channels.length === 1 && Number(channels[0].id)) {
        return Number(channels[0].id);
    }

    if (!channels.length) {
        throw new Error(
            'No active PayHero payment channels are registered for this account. Register a payment channel in PayHero, then set PAYHERO_CHANNEL_ID to that channel id.'
        );
    }

    throw new Error(
        'Multiple PayHero payment channels are registered but PAYHERO_CHANNEL_ID is not set. Set PAYHERO_CHANNEL_ID to the correct channel id from /api/v2/payment_channels.'
    );
}

async function syncPaymentSubscription(payment: any, gatewayReference?: string) {
    if (payment.purpose && payment.purpose !== 'subscription') {
        payment.status = 'paid';
        payment.paidAt = payment.paidAt || new Date();
        payment.providerReference = gatewayReference || payment.providerReference;
        await payment.save();
        return payment;
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (payment.billingCycle === 'yearly' ? 12 : 1));

    payment.status = 'paid';
    payment.paidAt = payment.paidAt || new Date();
    payment.providerReference = gatewayReference || payment.providerReference;
    payment.expiresAt = expiresAt;
    await payment.save();

    await User.findByIdAndUpdate(payment.userId, {
        subscriptionRole: payment.role,
        subscriptionPlan: payment.planId,
        subscriptionStatus: 'active',
        subscriptionProvider: 'payhero',
        subscriptionReference: payment.providerReference,
        subscriptionExpiresAt: payment.expiresAt,
    });

    return payment;
}

async function fetchPayHeroStatus(reference: string) {
    const statusUrl = resolvePayHeroUrl(process.env.PAYHERO_STATUS_URL, '/api/v2/transaction-status');
    if (!statusUrl) return null;

    const url = new URL(statusUrl);
    url.searchParams.set('reference', reference);
    url.searchParams.set('payment_reference', reference);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: buildPayHeroHeaders(),
    });

    const text = await response.text();
    if (!response.ok) {
        throw new Error(text || 'PayHero status lookup failed');
    }

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return { raw: text };
    }
}

function getPlan(role: 'seller' | 'buyer', planId: string): PaymentPlan | null {
    const plan = planCatalog[role][planId as keyof typeof planCatalog[typeof role]];
    return plan || null;
}

function getPlanAmount(plan: PaymentPlan, billingCycle: 'monthly' | 'yearly') {
    return billingCycle === 'yearly' ? plan.yearly : plan.monthly;
}

function normalizeKenyanPhone(phone?: string) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('254') && digits.length >= 12) return `0${digits.slice(3)}`;
    if (digits.startsWith('0') && digits.length >= 10) return digits;
    if (digits.length === 9) return `0${digits}`;

    return phone.trim();
}

async function initiatePayHeroCheckout(payload: Record<string, any>) {
    const url = resolvePayHeroUrl(process.env.PAYHERO_INITIATE_URL, process.env.PAYHERO_INITIATE_PATH || '/api/v2/payments');
    if (!url) {
        throw new Error('PAYHERO_INITIATE_URL is not configured');
    }

    const headers = buildPayHeroHeaders();

    let response: FetchResponse;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });
    } catch (error: any) {
        throw new Error(`PayHero gateway request failed: ${error?.message || 'network error'}`);
    }

    const text = await response.text();
    let data: PayHeroGatewayResponse = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { raw: text };
    }

    if (!response.ok) {
        const rawBody = (text || '').trim();
        const gatewayMessage = extractGatewayErrorMessage(data);
        const htmlHint = /<!doctype html|<html|<body/i.test(rawBody) ? ' The PayHero endpoint is returning HTML instead of JSON. Check PAYHERO_INITIATE_URL, PAYHERO_AUTH_TOKEN, and the gateway credentials.' : '';
        const errorMessage = gatewayMessage || rawBody || `PayHero checkout initiation failed (${response.status})`;
        throw new Error(`${errorMessage}${htmlHint}`);
    }

    return normalizeGatewayResponse(data);
}

function extractGatewayErrorMessage(response: PayHeroGatewayResponse | any) {
    if (!response || typeof response !== 'object') {
        return '';
    }

    const payload = extractGatewayPayload(response as PayHeroGatewayResponse);
    const message = readGatewayValue(payload, ['message', 'error', 'errorMessage', 'detail', 'details']);
    if (typeof message === 'string' && message.trim()) {
        return message.trim();
    }

    const raw = typeof response?.raw === 'string' ? response.raw : typeof payload?.raw === 'string' ? payload.raw : '';
    return raw.trim();
}

async function findPaymentForWebhook(reference: string) {
    const byId = await Payment.findById(reference);
    if (byId) return byId;

    return Payment.findOne({
        $or: [
            { providerReference: reference },
            { 'metadata.payment_reference': reference },
            { 'metadata.reference': reference },
            { 'metadata.transactionReference': reference },
        ],
    });
}

router.get('/plans', protect, async (req: AuthRequest, res: ExpressResponse) => {
    const role = req.query.role === 'buyer' ? 'buyer' : 'seller';
    res.json({
        success: true,
        data: Object.values(planCatalog[role]).map((plan) => ({
            ...plan,
            monthlyAmount: plan.monthly,
            yearlyAmount: plan.yearly,
        })),
    });
});

router.get('/me', protect, async (req: AuthRequest, res: ExpressResponse) => {
    const payments = await Payment.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(20).lean();
    res.json({ success: true, data: payments });
});

router.get('/entitlements/inquiry/:propertyId', protect, async (req: AuthRequest, res: ExpressResponse) => {
    const payment = await Payment.findOne({
        userId: req.user!._id,
        purpose: 'inquiry_fee',
        status: 'paid',
        'metadata.propertyId': req.params.propertyId,
    })
        .sort({ createdAt: -1 })
        .lean();

    res.json({
        success: true,
        data: {
            eligible: Boolean(payment),
            payment,
        },
    });
});

router.get('/status/:paymentId', protect, async (req: AuthRequest, res: ExpressResponse) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            res.status(404).json({ success: false, message: 'Payment not found' });
            return;
        }

        if (String(payment.userId) !== String(req.user!._id) && req.user!.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        const gatewayReference = payment.providerReference || String(payment._id);
        let gatewayStatus: any = null;

        try {
            gatewayStatus = extractGatewayPayload(await fetchPayHeroStatus(gatewayReference));
        } catch (lookupError) {
            gatewayStatus = null;
        }

        const statusValue = normalizeGatewayStatus(
            readGatewayValue(gatewayStatus || {}, ['status', 'paymentStatus', 'payment_status', 'state']) || payment.status
        );

        if (statusValue === 'paid' || statusValue === 'success' || statusValue === 'completed' || statusValue === 'confirmed') {
            await syncPaymentSubscription(payment, gatewayReference);
        } else if (statusValue === 'failed' || statusValue === 'cancelled' || statusValue === 'canceled') {
            payment.status = statusValue === 'cancelled' || statusValue === 'canceled' ? 'cancelled' : 'failed';
            await payment.save();
        }

        const refreshed = await Payment.findById(payment._id).lean();
        res.json({ success: true, data: { payment: refreshed, gatewayStatus } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
});

router.post('/initiate', protect, async (req: AuthRequest, res: ExpressResponse) => {
    try {
        const schema = z.object({
            role: z.enum(['seller', 'buyer']),
            purpose: z.enum(['subscription', 'inquiry_fee']).default('subscription'),
            planId: z.string().min(1).optional(),
            billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
            phone: z.string().optional(),
            propertyId: z.string().optional(),
        });

        const data = schema.parse(req.body);
        if (req.user!.role !== data.role && req.user!.role !== 'admin') {
            res.status(403).json({ success: false, message: 'You can only buy a plan for your account type' });
            return;
        }

        const phone = normalizeKenyanPhone(data.phone || req.user!.phone);
        if (!phone) {
            res.status(400).json({ success: false, message: 'Phone number is required for STK push payments' });
            return;
        }

        let plan: PaymentPlan | { id: string; name: string; role: 'seller' | 'buyer'; monthly: number; yearly: number };
        let amount: number;
        let metadata: Record<string, any> = {
            userId: String(req.user!._id),
            role: data.role,
            phone,
        };

        if (data.purpose === 'inquiry_fee') {
            if (data.role !== 'buyer') {
                res.status(403).json({ success: false, message: 'Inquiry fee is only available for buyers' });
                return;
            }

            if (!data.propertyId) {
                res.status(400).json({ success: false, message: 'Property ID is required for inquiry payments' });
                return;
            }

            plan = { id: 'property_inquiry', name: 'Property Information Access', role: 'buyer', monthly: 350, yearly: 350 };
            amount = 350;
            metadata = {
                ...metadata,
                purpose: 'inquiry_fee',
                propertyId: data.propertyId,
            };
        } else {
            if (!data.planId) {
                res.status(400).json({ success: false, message: 'Plan ID is required for subscriptions' });
                return;
            }

            const subscriptionPlan = getPlan(data.role, data.planId);
            if (!subscriptionPlan) {
                res.status(404).json({ success: false, message: 'Plan not found' });
                return;
            }

            plan = subscriptionPlan;
            amount = getPlanAmount(subscriptionPlan, data.billingCycle);
            metadata = {
                ...metadata,
                purpose: 'subscription',
                planId: subscriptionPlan.id,
            };
        }

        const description = data.purpose === 'inquiry_fee'
            ? 'Property information access fee'
            : `${plan.name} ${data.role} subscription`;

        const payment = await Payment.create({
            userId: req.user!._id,
            role: data.role,
            purpose: data.purpose,
            planId: plan.id,
            planName: plan.name,
            billingCycle: data.billingCycle,
            amount,
            currency: 'KES',
            status: 'pending',
            provider: 'payhero',
            metadata,
        });

        const callbackUrl =
            resolveBackendUrl('/api/payments/webhook/payhero') ||
            resolveRequestBaseUrl(req)?.concat('/api/payments/webhook/payhero') ||
            process.env.PAYHERO_CALLBACK_URL;
        const successUrl = resolvePayHeroUrl(process.env.PAYHERO_SUCCESS_URL) || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments`;
        const failureUrl = resolvePayHeroUrl(process.env.PAYHERO_FAILURE_URL) || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments`;

        const channelId = await resolvePayHeroChannelId();

        const checkoutResponse = await initiatePayHeroCheckout({
            amount,
            phone_number: phone,
            channel_id: channelId,
            provider: 'm-pesa',
            external_reference: String(payment._id),
            customer_name: req.user!.fullName,
            callback_url: callbackUrl,
        });

        const checkoutUrl = extractCheckoutUrl(checkoutResponse);
        const providerReference = extractGatewayReference(checkoutResponse) || String(payment._id);

        if (!checkoutUrl && !providerReference) {
            payment.status = 'failed';
            await payment.save();
            res.status(502).json({
                success: false,
                message: 'PayHero did not return a checkout link or reference',
                data: { paymentId: payment._id, gatewayResponse: checkoutResponse },
            });
            return;
        }

        payment.checkoutUrl = checkoutUrl;
        payment.providerReference = providerReference;
        payment.status = checkoutUrl ? 'processing' : 'pending';
        await payment.save();

        res.status(201).json({
            success: true,
            data: {
                paymentId: payment._id,
                checkoutUrl,
                providerReference,
                payment,
                gatewayResponse: checkoutResponse,
            },
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }

        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
});

router.post('/webhook/payhero', async (req, res: ExpressResponse) => {
    try {
        const payload = req.body || {};
        const reference =
            readGatewayValue(payload, [
                'reference',
                'Reference',
                'external_reference',
                'ExternalReference',
                'payment_reference',
                'paymentReference',
                'merchantReference',
                'merchant_reference',
                'accountReference',
                'account_reference',
                'transactionReference',
                'transaction_reference',
                'CheckoutRequestID',
                'checkout_request_id',
            ]) ||
            readGatewayValue(payload?.data || {}, [
                'reference',
                'Reference',
                'external_reference',
                'ExternalReference',
                'payment_reference',
                'paymentReference',
                'merchantReference',
                'merchant_reference',
                'accountReference',
                'account_reference',
                'transactionReference',
                'transaction_reference',
                'CheckoutRequestID',
                'checkout_request_id',
            ]);
        const status = normalizeGatewayStatus(
            readGatewayValue(payload, ['status', 'paymentStatus', 'payment_status', 'state', 'ResultDesc', 'resultDesc']) ||
            readGatewayValue(payload?.data || {}, ['status', 'paymentStatus', 'payment_status', 'state', 'ResultDesc', 'resultDesc'])
        );

        if (!reference) {
            res.status(400).json({ success: false, message: 'Missing payment reference' });
            return;
        }

        const payment = await findPaymentForWebhook(String(reference));
        if (!payment) {
            res.status(404).json({ success: false, message: 'Payment not found' });
            return;
        }

        if (status === 'paid' || status === 'success' || status === 'completed' || status === 'confirmed') {
            await syncPaymentSubscription(
                payment,
                String(
                    readGatewayValue(payload, ['transactionReference', 'transaction_reference', 'reference']) ||
                    readGatewayValue(payload?.data || {}, ['transactionReference', 'transaction_reference', 'reference']) ||
                    payment.providerReference ||
                    payment._id
                )
            );
        } else if (status === 'failed' || status === 'cancelled' || status === 'canceled') {
            payment.status = status === 'cancelled' || status === 'canceled' ? 'cancelled' : 'failed';
            await payment.save();
        } else {
            payment.status = payment.status === 'paid' ? 'paid' : 'processing';
            await payment.save();
        }

        res.json({ success: true, message: 'Webhook processed' });
    } catch {
        res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
});

export default router;