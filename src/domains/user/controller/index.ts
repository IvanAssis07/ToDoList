import { Request, Response, Router, NextFunction } from "express";
import { statusCodes } from "../../../../utils/constants/statusCodes";
import { notLoggedIn, loginMiddleware, verifyJWT } from '../../../middlewares/auth';
import { userService } from "../service/userService";

export const router = Router();

router.post("/login", notLoggedIn, loginMiddleware);

router.post(
    "/logout",
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.clearCookie('jwt').status(statusCodes.NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
)

router.post(
    "/",
    notLoggedIn,
    async(req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.CREATED).json(await userService.create(req.body));
        } catch (error) {
            next(error);
        }
    }
)

router.put(
    '/:id',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await userService.update(req.body, req.params.id, req.user.id);
            res.status(statusCodes.NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/:id',
    verifyJWT, 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await userService.getProfile(req.params.id);
            res.status(statusCodes.SUCCESS).json(users);
        } catch (error) {
            next(error);
        }
    }
);

