import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { generateChatResponse, MicroserviceFile, SessionMessage } from "../lib/microservice";
import { generateSpeech } from "../lib/elevenlabs";

interface MulterRequest extends Request {
    files?: Express.Multer.File[];
}

export const createConversation = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        // ... existing code ...
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const conversation = await prisma.conversation.create({
            data: {
                userId,
                title: "New Conversation",
            }
        });

        res.json({ success: true, conversation });
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getConversations = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const conversations = await prisma.conversation.findMany({
            where: { userId },
            orderBy: { lastUpdated: 'desc' },
            include: {
                chats: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        res.json({ success: true, conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const deleteConversation = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.userId;

        await prisma.conversation.deleteMany({
            where: { id, userId } // Ensure user owns it
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const renameConversation = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title } = req.body;
        const userId = req.userId;

        await prisma.conversation.updateMany({
            where: { id, userId },
            data: { title }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error renaming conversation:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getConversationMessages = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.userId;

        // Verify ownership
        const convo = await prisma.conversation.findFirst({
            where: { id, userId }
        });

        if (!convo) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }

        const messages = await prisma.chat.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: 'asc' }
        });

        // Map to frontend format if needed, but returning raw is fine for now
        // Frontend expects: { id, text, sender }
        const formatted = messages.map(m => ({
            id: m.id,
            text: m.content,
            sender: m.sender
        }));

        res.json({ success: true, messages: formatted });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { conversationId, content } = req.body;
        const userId = req.userId;
        const files = (req as MulterRequest).files || [];

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        if (!conversationId || (!content && files.length === 0)) {
            res.status(400).json({ success: false, message: "Missing conversationId or content/files" });
            return;
        }

        // 1. Verify conversation belongs to user
        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId, userId },
            include: { _count: { select: { chats: true } } }
        });

        if (!conversation) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }

        // Auto-Rename if first message
        if (conversation._count.chats === 0 && content) {
            const newTitle = content.substring(0, 30) + (content.length > 30 ? "..." : "");
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { title: newTitle }
            });
        }

        // 2. Save User Message
        // If files are present, we note it in content or separate type. 
        // For simplicity, appending [Attachment] marker if content is blank.
        const messageText = content || (files.length > 0 ? "[Sent an attachment]" : "");

        const userMessage = await prisma.chat.create({
            data: {
                conversationId,
                content: messageText,
                sender: 'user',
                type: 'text'
            }
        });

        // 3. Get History
        const previousChats = await prisma.chat.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: 20 // Limit history context
        });

        const history: SessionMessage[] = previousChats.map((chat: any) => ({
            role: chat.sender === 'user' ? 'user' : 'assistant',
            content: chat.content || ""
        }));

        // 4. Prepare Files for Microservice
        const microserviceFiles: MicroserviceFile[] = files.map(f => ({
            buffer: f.buffer,
            originalname: f.originalname,
            mimetype: f.mimetype
        }));

        // 5. Call Microservice
        let aiResponseText = "";
        try {
            aiResponseText = await generateChatResponse(messageText, history, microserviceFiles);
        } catch (err) {
            aiResponseText = "I'm sorry, I'm having trouble connecting to my brain right now.";
        }

        // 6. Save AI Response
        const botMessage = await prisma.chat.create({
            data: {
                conversationId,
                content: aiResponseText,
                sender: 'bot',
                type: 'text',
                model: 'llama'
            }
        });

        // 7. Update Conversation Timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastUpdated: new Date() }
        });

        // 8. Generate Speech (ElevenLabs)
        let audioBase64 = null;
        try {
            const audioBuffer = await generateSpeech(aiResponseText);
            audioBase64 = audioBuffer.toString('base64');
        } catch (speechError) {
            console.error("TTS Error:", speechError);
            // Non-blocking, continue without audio
        }

        res.json({ success: true, userMessage, botMessage, audio: audioBase64 });

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
