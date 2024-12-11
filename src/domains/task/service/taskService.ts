import { Task } from "@prisma/client";
import { Prisma } from "../../../../config/expressConfig";
import { InvalidParamError } from '../../../../errors/InvalidParamError';
import { ConflictError } from '../../../../errors/ConflictError';
import { PermissionError } from '../../../../errors/PermissionError';

class TaskService {
    async create(data: Omit<Task, 'id' | 'createdAt' | 'status'>, loggedUserId: string) {
        return await Prisma.task.create({
            data: {
                name: data.name,
                description: data.description,
                deadline: data.deadline,
                private: data.private,
                creatorName: data.creatorName,
                creatorId: loggedUserId
            },
            select: {
                id: true
            }
        });
    }

    async delete(taskId: string, loggedUserId: string) {
        const task = await Prisma.task.findUnique({
            where: {
                id: taskId
            },
            select: {
                id: true,
                creatorId: true
            }
        });

        if (!task) {
            throw new InvalidParamError(`Task with id:${taskId} not found.`);
        }

        if (task.creatorId !== loggedUserId) {
            throw new PermissionError("Você não tem permissão para fazer esta ação.")
        }

        await Prisma.task.delete({
            where: {
                id: taskId
            }
        });
    }

    async update(data: Omit<Task, 'id'|  'createdAt' | 'creatorName'>, taskId: string, loggedUserId: string) {
        const task = await Prisma.task.findUnique({
            where: {
                id: taskId
            },
            select: {
                id: true,
                creatorId: true
            }
        });

        if (!task) {
            throw new InvalidParamError(`Task with id:${taskId} not found.`);
        }

        if (task.creatorId !== loggedUserId) {
            throw new PermissionError("Você não tem permissão para fazer esta ação.");
        }
        
        await Prisma.task.update({
            where: {
                id: taskId
            },
            data: {
                name: data.name,
                description: data.description,
                deadline: data.deadline,
                status: data.status,
                private: data.private
            }
        })
    }

    async get(taskId: string) {
        const task = await Prisma.task.findUnique({
            where: {
                id: taskId
            }
        });

        if (!task) {
            throw new InvalidParamError("Task com este ID não foi encontrada.")
        }
        
        return task;
    }

    async searchTask(showCompleted: boolean, searchInput: string, loggedUserId: string) {
        const visibisityCondition = {
            OR : [
                { private: false },
                { private: true, creatorId: loggedUserId }
            ]
        };

        let additionalConditions = [];
    
        if (!showCompleted) {
            additionalConditions.push({
                status: {
                    not: 'Completed'
                }
            });
        }

        if (searchInput) {
            additionalConditions.push({ 
                name: { 
                    contains: searchInput
                }
            });
        }

        const whereClause = {
            AND: [
                visibisityCondition,
                ...additionalConditions
            ]
        };

        return await Prisma.task.findMany({
            where: whereClause
        })
    }
}

export const taskService = new TaskService;