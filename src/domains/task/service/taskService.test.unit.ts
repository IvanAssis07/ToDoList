import { taskService } from "./taskService";
import { prismaMock } from "../../../../config/singleton";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";

describe('Tests for create method', function() {
    test('Should create a task.', async() => {
        const loggedUserId = '1';
        const taskData = {
            name: "Task 1",
            description: "Description 1",
            deadline: new Date(),
            private: true,
            creatorName: "Creator",
            creatorId: "2",
        };

        await expect(taskService.create(taskData, loggedUserId)).resolves.not.toThrow();
        expect(prismaMock.task.create).toHaveBeenCalledTimes(1);
    });
});

describe('Test for delete method', function() {
    describe("delete method", () => {
        test("Should throw an error if task not found", async () => {
            const loggedUserId = '1';
            prismaMock.task.findUnique.mockResolvedValue(null);

            await expect(taskService.delete("task-1", loggedUserId)).rejects.toThrow(new InvalidParamError("Task with id:task-1 not found."));
        });

        test("Should throw a permission error if user is not the creator", async () => {
            const loggedUserId = '1';
            const taskData = {
                id: "task-1",
                name: "Task 1",
                description: "Description 1",
                status: "Registered",
                deadline: new Date(),
                private: true,
                creatorName: "Creator",
                creatorId: "2",
                createdAt: new Date()
            };
        
            prismaMock.task.findUnique.mockResolvedValue(taskData);
        
            await expect(taskService.delete("task-1", loggedUserId)).rejects.toThrow(new PermissionError("Você não tem permissão para fazer esta ação."));
        });

        test("Should delete the task if user is the creator", async () => {
            const loggedUserId = '1';
            const taskData = {
                id: "task-1",
                name: "Task 1",
                description: "Description 1",
                status: "Registered",
                deadline: new Date(),
                private: true,
                creatorName: "Creator",
                creatorId: loggedUserId,
                createdAt: new Date()
            };
        
            prismaMock.task.findUnique.mockResolvedValue(taskData);

            await expect(taskService.delete("task-1", loggedUserId)).resolves.not.toThrow();
            expect(prismaMock.task.delete).toHaveBeenCalledWith({ where: { id: "task-1" } });
        });
    });
})

describe('Test for update method', function() {
    test('Should throw an error with task not found in database', async() => {
        const loggedUserId = '1';
        const taskId = '1'
        const taskData = {
            id: "task-1",
            name: "Task 1",
            description: "Description 1",
            status: "Registered",
            deadline: new Date(),
            private: true,
            creatorName: "Creator",
            creatorId: "2",
            createdAt: new Date()
        }
        prismaMock.task.findUnique.mockResolvedValue(null);

        await expect(taskService.update(taskData, taskId, loggedUserId)).rejects.toThrow(new InvalidParamError("Task with id:1 not found."));
    });

    test('Should throw an error if logged user is not the task creator', async() => {
        const loggedUserId = '1';
        const taskId = '1'
        const taskData = {
            id: "task-1",
            name: "Task 1",
            description: "Description 1",
            status: "Registered",
            deadline: new Date(),
            private: true,
            creatorName: "Creator",
            creatorId: "2",
            createdAt: new Date()
        }
        
        prismaMock.task.findUnique.mockResolvedValue(taskData);

        await expect(taskService.update(taskData, taskId, loggedUserId)).rejects.toThrow(new PermissionError("Você não tem permissão para fazer esta ação."));
    });

    test('Should Update the task.', async() => {
        const loggedUserId = '1';
        const taskId = '1'
        const taskData = {
            id: "task-1",
            name: "Task 1",
            description: "Description 1",
            status: "Registered",
            deadline: new Date(),
            private: true,
            creatorName: "Creator",
            creatorId: "1",
            createdAt: new Date()
        }
        const newTaskData = {
            name: "New Name",
            description: "Description 1",
            status: "Registered",
            deadline: new Date(),
            private: true,
            creatorName: "Creator",
            creatorId: "1",
            createdAt: new Date()
        }

        prismaMock.task.findUnique.mockResolvedValue(taskData);
        
        await expect(taskService.update(newTaskData, taskId, loggedUserId)).resolves.not.toThrow();
        expect(prismaMock.task.update).toHaveBeenCalledTimes(1);

    });
});

describe('Tests for searchTask method', () => {
    test('Should return only tasks visible to the logged user', async () => {
        const loggedUserId = '1';
        const tasks = [
            { id: "task-1", name: "Public Task", description: "Description 1", private: false, creatorId: "2", status: "Registered", deadline: new Date(), createdAt: new Date(), creatorName: "Another user"},
            { id: "task-2", name: "Private Task", description: "Description 2", private: true, creatorId: loggedUserId, status: "Registered", deadline: new Date(), createdAt: new Date(), creatorName: "Logged User"}
        ];

        prismaMock.task.findMany.mockResolvedValue(tasks);

        const result = await taskService.searchTask(true, "", loggedUserId);

        expect(result).toEqual(tasks);
        expect(prismaMock.task.findMany).toHaveBeenCalledWith({
            where: {
                AND: [
                    {
                        OR: [
                            { private: false },
                            { private: true, creatorId: loggedUserId }
                        ]
                    }
                ]
            }
        });
    });

    test('Should filter out completed tasks when showCompleted is false', async () => {
        const loggedUserId = '1';
        const tasks = [
            { id: "task-1", name: "Public Task", description: "Description 1", private: false, creatorId: "2", status: "Registered", deadline: new Date(), createdAt: new Date(), creatorName: "Another user"},
        ];

        prismaMock.task.findMany.mockResolvedValue(tasks);

        const result = await taskService.searchTask(false, "", loggedUserId);

        expect(result).toEqual(tasks);
        expect(prismaMock.task.findMany).toHaveBeenCalledWith({
            where: {
                AND: [
                    {
                        OR: [
                            { private: false },
                            { private: true, creatorId: loggedUserId }
                        ]
                    },
                    {
                        status: {
                            not: "Completed"
                        }
                    }
                ]
            }
        });
    });

    test('Should filter tasks by name when searchInput is provided', async () => {
        const loggedUserId = '1';
        const searchInput = "Task";
        const tasks = [
            { id: "task-1", name: "Public Task", description: "Description 1", private: false, creatorId: "2", status: "Registered", deadline: new Date(), createdAt: new Date(), creatorName: "Another user"},
        ];

        prismaMock.task.findMany.mockResolvedValue(tasks);

        const result = await taskService.searchTask(true, searchInput, loggedUserId);

        expect(result).toEqual(tasks);
        expect(prismaMock.task.findMany).toHaveBeenCalledWith({
            where: {
                AND: [
                    {
                        OR: [
                            { private: false },
                            { private: true, creatorId: loggedUserId }
                        ]
                    },
                    {
                        name: {
                            contains: searchInput
                        }
                    }
                ]
            }
        });
    });

    test('Should combine conditions correctly when both filters are applied', async () => {
        const loggedUserId = '1';
        const searchInput = "Task";
        const tasks = [
            { id: "task-1", name: "Public Task", description: "Description 1", private: true, creatorId: "2", status: "Registered", deadline: new Date(), createdAt: new Date(), creatorName: "Another user"},
        ];

        prismaMock.task.findMany.mockResolvedValue(tasks);

        const result = await taskService.searchTask(false, searchInput, loggedUserId);

        expect(result).toEqual(tasks);
        expect(prismaMock.task.findMany).toHaveBeenCalledWith({
            where: {
                AND: [
                    {
                        OR: [
                            { private: false },
                            { private: true, creatorId: loggedUserId }
                        ]
                    },
                    {
                        status: {
                            not: "Completed"
                        }
                    },
                    {
                        name: {
                            contains: searchInput
                        }
                    }
                ]
            }
        });
    });
});

describe('Tests for getTask method', function() {
    test('Should throw an error if task not found in database.', async() => {
        const taksId = "1";
        prismaMock.task.findUnique.mockResolvedValue(null);

        await expect(taskService.get(taksId)).rejects.toThrow(new InvalidParamError("Task com este ID não foi encontrada."));
    });

    test('Should return a task.', async() => {
        const taksId = "1";
        const taskData = {
            id: taksId,
            name: "Task 1",
            description: "Description 1",
            status: "Registered",
            deadline: new Date(),
            private: true,
            creatorName: "Creator",
            creatorId: "2",
            createdAt: new Date()
        };

        prismaMock.task.findUnique.mockResolvedValue(taskData);

        await expect(taskService.get(taksId)).resolves.not.toThrow();
        expect(prismaMock.task.findUnique).toHaveBeenCalledTimes(1);
    });
});