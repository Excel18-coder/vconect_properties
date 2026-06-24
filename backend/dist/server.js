"use strict";
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
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
// Connect MongoDB
(0, db_1.default)();
// ===============================
// CORS CONFIGURATION
// ===============================
const allowedOrigins = [
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
    console.log(`🚀 VConnect API running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map