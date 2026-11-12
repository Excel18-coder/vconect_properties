declare const router: import("express-serve-static-core").Router;
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
export declare function extractGatewayReference(response: PayHeroGatewayResponse): any;
export declare function buildPayHeroHeaders(): Record<string, string>;
export declare function getPayHeroBaseUrl(): string;
export default router;
//# sourceMappingURL=payments.d.ts.map