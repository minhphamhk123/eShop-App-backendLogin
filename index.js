import express from 'express';

import { connectDB } from './config/db.js';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import swaggerUi from "swagger-ui-express";
import swaggerSpec from './utils/swagger.js'

const __dirname = path.resolve();

const app = express();

// Sử dụng cors middleware
app.use(cors());
// app.use(express.static(path.join(__dirname, '/client/dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// });

app.use(express.json());

app.use(cookieParser());
// App listener
const server = app.listen(process.env.PORT || 8080, async () => {
  console.log(`Server running on port ${process.env.PORT || 8080}`);
  try {
    console.log('⏳ Database connecting...');
    await connectDB;
    console.log('✅ Database connected.');
  } catch (error) {
    console.log('❌ Error:', error);
  }
});

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**  
* @openapi
* /api/auth/signup:
* post:
* summary: Sign Up new account
* description: Post a new account to add to database. Not verified yet. Still on work email verified.
* parameters:
* — in: path
* schema:
* type: string
* responses:
* 200:
* description: Successful response
*/
app.use('/api/auth', authRoutes);

//app.use(authCheck);
app.use("/api/user", userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
//JSON.stringify(preContent, null, 2)