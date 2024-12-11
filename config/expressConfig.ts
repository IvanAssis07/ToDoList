import dotenv from 'dotenv'
import express, { Express } from 'express'
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';

dotenv.config();
export const app: Express = express();
export const Prisma: PrismaClient = new PrismaClient();

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.use(express.json());

import { router as userRouter } from '../src/domains/user/controller';
app.use('/api/users', userRouter);

import { router as taskRouter } from '../src/domains/task/controller';
app.use('/api/tasks', taskRouter); 