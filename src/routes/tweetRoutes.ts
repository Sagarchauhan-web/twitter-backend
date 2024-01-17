import { PrismaClient, Token, Tweet, User } from '@prisma/client';
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
type AuthRequest = Request & { user?: User };

router.post('/', async (req: AuthRequest, res: Response) => {
  const { content, image } = req.body;
  const user = req.user;

  if (!user) return res.sendStatus(401);

  try {
    const result: Tweet = await prisma.tweet.create({
      data: {
        content,
        image,
        userId: user?.id,
      },
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Unable to create Tweet' });
  }
});

router.get('/', async (req, res) => {
  const allTweets = await prisma.tweet.findMany({ include: { user: true } });

  res.json(allTweets);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await prisma.tweet.findUnique({
    where: { id: Number(id) },
    include: { user: true },
  });

  res.json(result);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: 'Not Implemented' + id });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await prisma.tweet.delete({ where: { id: Number(id) } });

  res.sendStatus(200).json(result);
});

export default router;
