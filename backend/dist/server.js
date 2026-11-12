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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const properties_1 = __importDefault(require("./routes/properties"));
const upload_1 = __importDefault(require("./routes/upload"));
const inquiries_1 = __importDefault(require("./routes/inquiries"));
const favorites_1 = __importDefault(require("./routes/favorites"));
const profile_1 = __importDefault(require("./routes/profile"));
const admin_1 = __importStar(require("./routes/admin"));
const payments_1 = __importDefault(require("./routes/payments"));
const vybz_1 = __importDefault(require("./routes/vybz"));
const vybzRewards_1 = __importDefault(require("./routes/vybzRewards"));
const app = (0, express_1.default)();
// Connect MongoDB
(0, db_1.default)();
// ===============================
// CORS CONFIGURATION
// ===============================
const allowedOrigins = [
    'https://www.vconect.co.ke',
    'https://vconect.co.ke',
    'http://www.vconect.co.ke',
    'http://vconect.co.ke',
    'https://vconect-properties.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        console.log("Incoming origin:", origin);
        // Allow Postman/mobile/server requests
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.log("Blocked by CORS:", origin);
        return callback(new Error("CORS blocked this origin"));
    },
    credentials: true,
    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
    ],
    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ]
}));
// handle preflight
app.options('*', (0, cors_1.default)());
// ===============================
// BODY PARSER
// ===============================
app.use(express_1.default.json({
    limit: '10mb'
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '10mb'
}));
// ===============================
// HEALTH CHECK
// ===============================
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});
// ===============================
// API ROUTES
// ===============================
app.use('/api/auth', auth_1.default);
app.use('/api/properties', properties_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/inquiries', inquiries_1.default);
app.use('/api/favorites', favorites_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/admin', admin_1.vybzPayoutCallbackRouter);
app.use('/api/payments', payments_1.default);
app.use('/api/vybz', vybz_1.default);
app.use('/api/vybz', vybzRewards_1.default);
// ===============================
// 404
// ===============================
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
// ===============================
// ERROR HANDLER
// ===============================
app.use((err, _req, res, _next) => {
    console.error("Server error:", err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});
// ===============================
// START SERVER
// ===============================
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`🚀 vconect API running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map