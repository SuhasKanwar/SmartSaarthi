import { Router } from "express";
import { signinHandler, signoutHandler, signupHandler } from "../controller/authenticationController";

const router = Router();

router.post('/signin', signinHandler);
router.post('/signup', signupHandler);
router.post('/signout', signoutHandler);

export default router;