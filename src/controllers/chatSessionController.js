import ChatSession from '../models/ChatSession.js';

// Get all chat sessions
export const getAllChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find()
      .sort({ updatedAt: -1 })
      .select('-messages'); // Don't send all messages, just session info
    
    res.status(200).json({
      success: true,
      message: 'Chat sessions retrieved successfully',
      sessions
    });
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving chat sessions',
      error: error.message
    });
  }
};

// Get single chat session
export const getChatSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await ChatSession.findById(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Chat session retrieved successfully',
      session
    });
  } catch (error) {
    console.error('Error getting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving chat session',
      error: error.message
    });
  }
};

// Create new chat session
export const createChatSession = async (req, res) => {
  try {
    const { customerName, customerEmail } = req.body;
    
    if (!customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required'
      });
    }
    
    const session = new ChatSession({
      customerName,
      customerEmail,
      status: 'active',
      messages: []
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      message: 'Chat session created successfully',
      session
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat session',
      error: error.message
    });
  }
};

// Update chat session (e.g., change status)
export const updateChatSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const session = await ChatSession.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Chat session updated successfully',
      session
    });
  } catch (error) {
    console.error('Error updating chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating chat session',
      error: error.message
    });
  }
};

// Delete chat session
export const deleteChatSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await ChatSession.findByIdAndDelete(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting chat session',
      error: error.message
    });
  }
};

// Get messages for a session
export const getSessionMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await ChatSession.findById(id).select('messages');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      messages: session.messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving messages',
      error: error.message
    });
  }
};

// Add message to session
export const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { sender, message } = req.body;
    
    if (!sender || !message) {
      return res.status(400).json({
        success: false,
        message: 'Sender and message are required'
      });
    }
    
    if (!['customer', 'admin'].includes(sender)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender type'
      });
    }
    
    const session = await ChatSession.findById(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    session.messages.push({
      sender,
      message,
      createdAt: new Date()
    });
    
    session.updatedAt = Date.now();
    await session.save();
    
    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      messages: session.messages
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
};
