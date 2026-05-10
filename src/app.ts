import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { sessionsRouter } from './modules/sessions/sessions.routes';
import { reservationsRouter } from './modules/reservations/reservations.routes';
import { pagesRouter } from './modules/pages/pages.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', usersRouter);
app.use('/api/v1', sessionsRouter);
app.use('/api/v1', reservationsRouter);
app.use('/api/v1', pagesRouter);

app.use(notFound);
app.use(errorHandler);
