import "dotenv/config"

import express from 'express';
import { NextFunction, Request, Response } from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import createHttpError, { isHttpError } from "http-errors";

import env from './config/validateEnv';
import logger from './config/logger'

const app = express();

import taskRouter from './routes/tasks';
import { Constants } from './utility/constants';


dotenv.config();

mongoose
.connect(env.MONGO_CONNECTION_STRING)
.then(() => {
  logger.info("Mongoose connected");
})
.catch(logger.error)

// Listen to server
const port = 3000;
app.listen(port, () => console.log(`Server Up and running at http://localhost:${port}`));

//Middleware
app.use(express.json());
app.use(cors());

// Import Routes
app.use('/api/tasks', taskRouter);

// No route
app.use((req, res, next) => {
  next(createHttpError(404, Constants.routeNotFound));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let errorMessage = "An unknown error occured.";
  let statusCode = 500;
  
  if (isHttpError(error)) {
    errorMessage = error.message;
    statusCode = error.status;
  }
  res.status(statusCode).json({
    success: false,
    message: error,
  });
});

