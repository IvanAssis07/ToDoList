import { userService } from "./userService";
import { prismaMock } from "../../../../config/singleton";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";

process.env.SALT_ROUNDS = '10';

describe('Tests for create method', function() {
    test('Shouldn´t create user with email already registered', async() => {
        const user = {
            id: "1",
            name: "user1",
            password: "user1",
            email: "user1@email.com",
            sex: "masculine",
            company: "company",
            photo: "base64Photo",
            birthDate: new Date('December 07, 1999 04:00:00'),
            createdAt: new Date()
        }

        const userToRegistry = {
            id: '2',
            name: "user2",
            password: "user2",
            email: "user1@email.com",
            sex: "masculine",
            company: "company",
            photo: "base64Photo",
            birthDate: new Date('December 07, 1999 04:00:00'),
            createdAt: new Date()
        }

        prismaMock.user.findUnique.mockResolvedValueOnce(user);

        await expect(userService.create(userToRegistry)).rejects.toThrow(new ConflictError('Email already exists in the system!'));
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: user.email } });
    });

    test('Should create an user', async() => {
        require('dotenv').config();

        const user = {
            name: "user1",
            password: "user1",
            email: "user1@email.com",
            sex: "masculine",
            company: "company",
            photo: "base64Photo",
            birthDate: new Date('December 07, 1999 04:00:00'),
            createdAt: new Date()
        }

        await expect(userService.create(user)).resolves.not.toThrow();

        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: user.email } });
        expect(prismaMock.user.create).toHaveBeenCalledWith({
            data: {
                name: user.name,
                email: user.email,
                birthDate: user.birthDate,
                sex: user.sex,
                company: user.company,
                photo: user.photo,
                password: expect.any(String),
            },
            select: {
                id: true,
            },
        });
    })
});

describe("Tests for update method", function() {
    test("Should throw an error when user not found", async()  => {
        const userData = {
            name: "user1",
            password: "user1",
            email: "user1@email.com",
            sex: "masculine",
            company: "company",
            photo: "base64Photo",
            birthDate: new Date('December 07, 1999 04:00:00'),
            createdAt: new Date()
        }
        const userId = '1';
        const loggedUserId = '1'

        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(userService.update(userData, userId, loggedUserId)).rejects.toThrow(new InvalidParamError(`User with ${userId} not found.`));
        expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
    });

    test("Should throw an error when user found has a different ID in relation to the logged user.", async()  => {
        const userId = '1';
        const loggedUserId = '2'
        const userData = {
            name: "user1",
            password: "user1",
            email: "user1@email.com",
            sex: "masculine",
            company: "company",
            photo: "base64Photo",
            birthDate: new Date('December 07, 1999 04:00:00'),
            createdAt: new Date()
        }

        const user = {
            id: '1',
            name: "user1",
            password: "user1",
            email: "user1@email.com",
            sex: "masculine",
            company: "company",
            photo: "base64Photo",
            birthDate: new Date('December 07, 1999 04:00:00'),
            createdAt: new Date()
        }

        prismaMock.user.findUnique.mockResolvedValue(user);

        await expect(userService.update(userData, userId, loggedUserId)).rejects.toThrow(new PermissionError('You do not have permission to perform this action.'));
        expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
    });

    test('Should update the user correctly', async() => {
        const userId = '1';
        const loggedUserId = '1'
        const userData = {
            name: "user1",
            password: "user1",
            email: "user1@email.com",
            sex: "masculine",
            company: "company",
            photo: "base64Photo",
            birthDate: new Date('December 07, 1999 04:00:00'),
            createdAt: new Date()
        }

        const user = {
            id: '1',
            name: "user1",
            password: "user1",
            email: "user1@email.com",
            sex: "masculine",
            company: "company",
            photo: "base64Photo",
            birthDate: new Date('December 07, 1999 04:00:00'),
            createdAt: new Date()
        }

        prismaMock.user.findUnique.mockResolvedValue(user);

        await expect(userService.update(userData, userId, loggedUserId)).resolves.not.toThrow();
        expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
    });
})

describe("Tests for getProfileMethod", function() {
    test("Should throw an error if user not found.", async () => {
        const userId = '1';
        prismaMock.user.findUnique.mockResolvedValue(null);
    
        await expect(userService.getProfile(userId)).rejects.toThrow(
            new InvalidParamError(`User with ${userId} not found.`)
        );
    });

    test("Should get user profile", async()=> {
        const userId = '1';
        const userData = {
            name: "user1",
            id: userId,
            password: "user1",
            email: "user1@email.com",
            sex: "masculine",
            company: "company",
            photo: "base64Photo",
            birthDate: new Date('December 07, 1999 04:00:00'),
            createdAt: new Date()
        }

        prismaMock.user.findUnique.mockResolvedValue(userData);

        await expect(userService.getProfile(userId)).resolves.not.toThrow();
        await expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
})
