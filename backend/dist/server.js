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
// Connect to MongoDB
(0, db_1.default)();
// CORS — allow frontend origin
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/properties', properties_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/inquiries', inquiries_1.default);
app.use('/api/favorites', favorites_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/admin', admin_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`🚀 VConnect API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
exports.default = app;
//# sourceMappingURL=server.js.map