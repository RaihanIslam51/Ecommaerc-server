import express from 'express';
import {
  getAllChatSessions,
  getChatSession,
  createChatSession,
  updateChatSession,
  deleteChatSession,
  getSessionMessages,
  addMessage
} from '../controllers/chatSessionController.js';

const router = express.Router();

// Chat session routes
router.get('/', getAllChatSessions);
router.get('/:id', getChatSession);
router.post('/', createChatSession);
router.patch('/:id', updateChatSession);
router.delete('/:id', deleteChatSession);

// Message routes
router.get('/:id/messages', getSessionMessages);
router.post('/:id/messages', addMessage);

export default router;
