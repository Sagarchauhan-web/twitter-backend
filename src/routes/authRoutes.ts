import { PrismaClient, Token } from '@prisma/client';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const EMAIL_ROKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;
const JWT_SECRET = process.env.JWT_SECRET!;

const router = Router();
const prisma = new PrismaClient();

// Generate a random 8 digit number as the email token
function generateEmailToken(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateAuthToken(tokenId: number): string {
  const jwtPayload = { tokenId };

  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: 'HS256',
    noTimestamp: true,
  });
}

// create a user, if it doesnt exist
// generate the emailToken and send it to their email
router.post('/login', async (req, res) => {
  const { email } = req.body;

  // generate token
  const emailToken = generateEmailToken();
  const expiration = new Date(
    new Date().getTime() + EMAIL_ROKEN_EXPIRATION_MINUTES * 60 * 1000,
  );

  try {
    const createdToken: Token = await prisma.token.create({
      data: {
        type: 'EMAIL',
        emailToken,
        expiration,
        user: { connectOrCreate: { where: { email }, create: { email } } },
      },
    });

    // TODO: send Email token to user email

    res.sendStatus(200);
  } catch (error) {
    res
      .sendStatus(400)
      .json({ error: 'Error occuered while creating email token' });
  }
});

// validate the emailToken
// Generate a long-lived JWT token
router.post('/authenticate', async (req, res) => {
  const { email, emailToken } = req.body;

  const dbEmailToken = await prisma.token.findUnique({
    where: { emailToken },
    include: { user: true },
  });

  if (!dbEmailToken || !dbEmailToken.valid) {
    return res.status(401).json({ error: 'Invalid email token' });
  }

  if (dbEmailToken?.expiration < new Date()) {
    return res.status(400).json({ error: 'token expired' });
  }

  if (dbEmailToken.user?.email !== email) {
    return res.sendStatus(401);
  }

  // Here we validated that the user is the owner of the email
  // generate an Api token

  const expiration = new Date(
    new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000,
  );

  const apiToken = await prisma.token.create({
    data: { type: 'API', expiration, user: { connect: { email } } },
  });

  // Invalidate email token
  await prisma.token.update({
    where: { emailToken },
    data: { valid: false },
  });

  // generate the JWT token
  const authToken = generateAuthToken(apiToken.id);

  res.json({ authToken });
});

export default router;
