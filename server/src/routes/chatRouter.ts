import express from "express";
import multer from "multer";
import { authenticateMiddleware } from "../middlewares/authentication";
import {
    createConversation,
    getConversations,
    sendMessage,
    deleteConversation,
    renameConversation,
    getConversationMessages
} from "../controller/chatController";

const chatRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

chatRouter.use(authenticateMiddleware);

chatRouter.post('/conversation', createConversation);
chatRouter.get('/conversation', getConversations);
chatRouter.delete('/conversation/:id', deleteConversation);
chatRouter.put('/conversation/:id', renameConversation);
chatRouter.get('/conversation/:id/messages', getConversationMessages);

// Support handling multiple files. Using 'files' as field name or 'file' just in case. 
// Frontend typically sends 'files' based on my plan, but let's support 'files' array.
chatRouter.post('/message', upload.array('files'), sendMessage);

export default chatRouter;
