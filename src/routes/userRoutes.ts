import { Router } from 'express';
import { PrismaClient, User } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { email, name, username } = req.body;
  console.log(email, name, username);

  try {
    const user: User = await prisma.user.create({
      data: { email, name, username },
    });
    res.json(user);
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'username and email should be unique' });
  }
});

router.get('/', async (req, res) => {
  const allUser = await prisma.user.findMany();

  res.json(allUser);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });

  res.json(user);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { bio, name, image } = req.body;

  try {
    const result: User = await prisma.user.update({
      where: { id: Number(id) },
      data: { bio: bio, name: name, image: image },
    });
    res.json(result);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to update the user' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'User Deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete', error: error });
  }
});

export default router;
