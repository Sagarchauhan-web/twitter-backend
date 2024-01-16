import { PrismaClient, Tweet } from '@prisma/client';
import { Router } from 'express';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { content, image, userId } = req.body;

  try {
    const result: Tweet = await prisma.tweet.create({
      data: {
        content,
        image,
        userId,
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
