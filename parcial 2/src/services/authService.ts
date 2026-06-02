import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

const expiresIn = 8 * 60 * 60;
const prisma = new PrismaClient();

export class AuthService {
  async register(email: string, password: string, role: string = 'OPERATOR') {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('El email ya está registrado', 400);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
      select: { id: true, email: true, role: true },
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Credenciales inválidas', 401);
    }

const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn }      // ahora es number, aceptado
);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      token,
    };
  }
}