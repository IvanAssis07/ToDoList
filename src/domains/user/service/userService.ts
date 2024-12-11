import { User } from '@prisma/client'
import { Prisma } from '../../../../config/expressConfig';
import { InvalidParamError } from '../../../../errors/InvalidParamError';
import { ConflictError } from '../../../../errors/ConflictError';
import { getEnv } from '../../../../utils/functions/getEnv';
import bcrypt from "bcrypt";
import { PermissionError } from '../../../../errors/PermissionError';


class UserService {
    async create(data: Omit<User, 'id' | 'createdAt'>) {
        const user = await Prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (user) {
            throw new ConflictError('Email already exists in the system!');
        }
  
        const hashedPassword = await bcrypt.hash(data.password, parseInt(getEnv('SALT_ROUNDS')))

        return Prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                birthDate: data.birthDate,
                sex: data.sex,
                company: data.company,
                photo: data.photo,
                password: hashedPassword,
            },
            select: {
                id: true
            }
        });
    }

    async update(data: Omit<User, 'id' | 'createdAt'>, userId: string, loggedUserId: string) {
        const user = await Prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new InvalidParamError(`User with ${userId} not found.`);
        }

        if (user.id !== loggedUserId) {
            throw new PermissionError('You do not have permission to perform this action.');
        } 

        if (data.password) {
            data.password = await bcrypt.hash(data.password, parseInt(getEnv('SALT_ROUNDS')))
        }

        Prisma.user.update({
            where: {
                id: userId
            },
            data: {
                name: data.name,
                password: data.password,
                email: data.email,
                sex: data.sex,
                company: data.company,
                photo: data.photo,
                birthDate: data.birthDate
            }
        })
    }

    async getProfile(userId: string) {
        const user = await Prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            throw new InvalidParamError(`User with ${userId} not found.`) ;
        }

        return user;
    }
}

export const userService = new UserService;