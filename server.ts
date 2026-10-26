import express from 'express';
import path from 'node:path';
import { apiRouter } from './server/api.ts';
import { AutomationScheduler } from './server/automation-scheduler.ts';

const app = express();
const PORT = process.env.PORT || 3000;

// Start persistent scheduler
AutomationScheduler.start();

// Static assets (renders, uploads, dist)
app.use(express.static(path.resolve(process.cwd(), 'dist')));
app.use('/rendered', express.static(path.resolve(process.cwd(), 'public', 'rendered')));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads')));

// Mount API router
app.use('/api', apiRouter);
app.use('/mcp', apiRouter);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HardLife Creator Studio running on http://0.0.0.0:${PORT}`);
});
