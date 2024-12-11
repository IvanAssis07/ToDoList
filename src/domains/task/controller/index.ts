import { Request, Response, Router, NextFunction } from "express";
import { statusCodes } from "../../../../utils/constants/statusCodes";
import { notLoggedIn, loginMiddleware, verifyJWT } from '../../../middlewares/auth';
import { taskService } from "../service/taskService";

export const router = Router();

router.post(
    '/',
    verifyJWT,
    async(req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.CREATED).json(await taskService.create(req.body, req.user.id));
        } catch (error) {
            next(error);
        }
    }
)

router.delete(
    '/:id',
    verifyJWT,
    async(req: Request, res: Response, next: NextFunction) => {
        try {
            await taskService.delete(req.params.id, req.user.id);
            res.status(statusCodes.NO_CONTENT).end();
        } catch(error) {
            next(error);
        }
    }
)

router.put(
    '/:id',
    verifyJWT,
    async(req: Request, res: Response, next: NextFunction) => {
        try {
            await taskService.update(req.body, req.params.id, req.user.id);
            res.status(statusCodes.NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    '/search',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const showCompleted = req.query.showCompleted === 'true';
            const searchInput = req.query.searchInput as string;

            const tasks = await taskService.searchTask(showCompleted, searchInput, req.user.id);

            res.status(statusCodes.SUCCESS).json(tasks);
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/:id',
    verifyJWT,
    async(req: Request, res: Response, next: NextFunction) => {
        try {
            const tasks = await taskService.get(req.params.id);
            res.status(statusCodes.SUCCESS).json(tasks);
        } catch (error) {   
            next (error);
        }
    }
)
