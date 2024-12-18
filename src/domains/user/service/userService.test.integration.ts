import bcrypt from 'bcrypt';
import prisma from "../../../../config/integration-setup";
import { ConflictError } from "../../../../errors/ConflictError";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { userService } from "./userService";

import type { User } from "@prisma/client";

beforeEach(async () => {
    await prisma.user.deleteMany();
});

describe('Tests for create method', function () {
    test('should create an user', async () => {
        const userData: Omit<User, 'id' | 'createdAt'> = {
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
        const userData: Omit<User, 'id' | 'createdAt'> = {
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

    test('should create a user with an empty photo field', async () => {
        const userData: Omit<User, 'id' | 'createdAt'> = {
            name: 'Photo Optional User',
            email: 'photoOptional@mail.com',
            password: 'password123',
            birthDate: new Date(),
            company: 'PhotoCompany',
            photo: '', // Campo opcional
            sex: 'female',
        };

        const createdUser = await userService.create(userData);

        const fetchedUser = await prisma.user.findUnique({ where: { id: createdUser.id } });
        expect(fetchedUser).toBeDefined();
        expect(fetchedUser?.photo).toBe('');
    });

    test('should create a user and persist hashed password in the database', async () => {
        const userData = {
            name: 'Integration Test User',
            email: 'integrationuser@mail.com',
            password: 'securePassword123',
            birthDate: new Date(),
            company: 'IntegrationCompany',
            photo: '',
            sex: 'female',
        };
    
        // Criação do usuário
        const createdUser = await userService.create(userData);
    
        // Busca o usuário no banco de dados
        const fetchedUser = await prisma.user.findUnique({
            where: { id: createdUser.id }
        });
    
        expect(fetchedUser).toBeDefined();
        expect(fetchedUser?.email).toBe(userData.email);
    
        // Verifica a senha hashada
        expect(fetchedUser?.password).not.toBe(userData.password);
        const isPasswordValid = await bcrypt.compare(userData.password, fetchedUser!.password);
        expect(isPasswordValid).toBe(true);
    
        // Valida se todos os dados foram persistidos corretamente
        expect(fetchedUser?.name).toBe(userData.name);
        expect(fetchedUser?.company).toBe(userData.company);
    });
    
});

describe('Tests getProfile method', function () {
    test('should return user profile', async () => {
        // Dados do usuário
        const userData = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            birthDate: new Date(),
            company: 'Test Company',
            photo: '',
            sex: 'male'
        };

        // Criação do usuário
        const createdUser = await userService.create(userData);

        // Buscar o perfil do usuário pelo ID
        const fetchedUser = await userService.getProfile(createdUser.id);

        expect(fetchedUser).toBeDefined();
        expect(fetchedUser?.email).toBe(userData.email);

        // Verifica se apenas 1 usuário existe no banco
        const allUsers = await prisma.user.findMany();
        expect(allUsers).toHaveLength(1);
    });

    test('should throw an error if user does not exist', async () => {
        await expect(userService.getProfile('nonexistentId')).rejects.toThrow(new InvalidParamError('User with nonexistentId not found.'));
    });
});