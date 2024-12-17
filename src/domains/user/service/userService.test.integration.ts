import prisma from "../../../../config/integration-setup";
import { userService } from "./userService";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";

import type { User } from "@prisma/client";

beforeEach(async () => {
    await prisma.user.deleteMany();
});

describe('Tests for create method', function () {
    test('should create an user', async () => {
        const userData:Omit<User,  'id' | 'createdAt'> = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            birthDate: new Date(),
            company: 'myCompany',
            photo: '',
            sex: 'male'
        };

        const createdUser = await userService.create(userData);

        expect(createdUser).toBeDefined();
        expect(createdUser.id).toBeTruthy();

        const fetchedUser = await prisma.user.findUnique({ where: { id: createdUser.id } });
        expect(fetchedUser).toBeDefined();
        });

    test('should throw an error if email already exists', async () => {
        const userData:Omit<User,  'id' | 'createdAt'> = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            birthDate: new Date(),
            company: 'myCompany',
            photo: '',
            sex: 'male'
        };

        await userService.create(userData);

        // Criando um usuário com o email já existente
        await expect(userService.create(userData)).rejects.toThrow(new ConflictError('Email already exists in the system!'))
    })
});