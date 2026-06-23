import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';

// Routes
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import uploadRoutes from './routes/upload';
import inquiryRoutes from './routes/inquiries';
import favoriteRoutes from './routes/favorites';
import profileRoutes from './routes/profile';
import adminRoutes from './routes/admin';

const app = express();

// Connect MongoDB
connectDB();


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


app.use(
    cors({
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

            return callback(
                new Error("CORS blocked this origin")
            );
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
    })
);


// handle preflight
app.options('*', cors());


// ===============================
// BODY PARSER
// ===============================

app.use(express.json({
    limit: '10mb'
}));

app.use(express.urlencoded({
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

app.use('/api/auth', authRoutes);

app.use('/api/properties', propertyRoutes);

app.use('/api/upload', uploadRoutes);

app.use('/api/inquiries', inquiryRoutes);

app.use('/api/favorites', favoriteRoutes);

app.use('/api/profile', profileRoutes);

app.use('/api/admin', adminRoutes);


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

app.use(
    (
        err: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) => {

        console.error("Server error:", err.message);

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
);


// ===============================
// START SERVER
// ===============================

const PORT = Number(process.env.PORT) || 5000;


app.listen(PORT, () => {

    console.log(
        `🚀 VConnect API running on port ${PORT}`
    );

});


export default app;