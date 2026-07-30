import { Router } from 'express';

const publicRouter = Router();

// Public routes go here
publicRouter.get('/', (req, res) => {
  res.json({ message: 'Public API' });
});

export { publicRouter };

