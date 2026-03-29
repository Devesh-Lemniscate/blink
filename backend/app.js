import express from "express";
import {nanoid} from "nanoid"
import dotenv from "dotenv"
import connectDB from "./src/config/monogo.config.js"
import { connectRedis } from "./src/config/redis.config.js"
import short_url from "./src/routes/short_url.route.js"
import user_routes from "./src/routes/user.routes.js"
import auth_routes from "./src/routes/auth.routes.js"
import analytics_routes from "./src/routes/analytics.routes.js"
import { redirectFromShortUrl } from "./src/controller/short_url.controller.js";
import { errorHandler } from "./src/utils/errorHandler.js";
import { rateLimiter, authRateLimiter, redirectRateLimiter } from "./src/middleware/rateLimiter.middleware.js";
import cors from "cors"
import { attachUser } from "./src/utils/attachUser.js";
import cookieParser from "cookie-parser"

dotenv.config("./.env")

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // your React app
    credentials: true // 👈 this allows cookies to be sent
}));

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use(attachUser)

// Apply rate limiting to API routes
app.use("/api/user", rateLimiter, user_routes)
app.use("/api/auth", authRateLimiter, auth_routes)
app.use("/api/create", rateLimiter, short_url)
app.use("/api/analytics", rateLimiter, analytics_routes)

// Redirect endpoint with higher rate limits
app.get("/:id", redirectRateLimiter, redirectFromShortUrl)

app.use(errorHandler)

const PORT = process.env.PORT || 3000

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB()
        
        // Connect to Redis (optional - app works without it)
        await connectRedis()
        
        app.listen(PORT, () => {
            console.log(`⚡ Blink server is running on http://localhost:${PORT}`);
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()

// GET - Redirection 
