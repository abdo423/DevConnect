import { Request, Response } from 'express';

import Message from '../models/message';

import * as messageService from '../services/messageService';
import { AppError } from '../Types/Error';

export const createMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?.id as string;
    const { receiverId, content } = req.body;

    const message = await messageService.createMessageService(
      senderId,
      receiverId,
      content,
    );

    return res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (err: unknown) {
    const error = err as AppError;
    return res.status(error.status || 500).json({
      message: error.message || 'Internal server error',
      ...(error.errors && { errors: error.errors }), // Include validation errors if present
    });
  }
};

export const getMessagesBetweenUsers = async (req: Request, res: Response) => {
  const { id } = req.params; // other user ID
  const currentUserId = req.user?.id as string;
  const otherUserId = id;

  try {
    const plainMessages = await messageService.getMessagesBetweenUsersService(
      currentUserId,
      otherUserId,
    );

    return res.status(200).json({
      messages: plainMessages,
      count: plainMessages.length,
    });
  } catch (err: unknown) {
    const error = err as AppError;
    return res.status(error.status || 500).json({
      message: error.message || 'Error fetching messages',
      errors: error.errors || undefined,
    });
  }
};

export const getSendersForCurrentUser = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const currentUserId = req.user.id;

  try {
    // Get all messages where current user is the receiver
    const uniqueSenders =
      await messageService.getSendersForCurrentUserService(currentUserId);
    return res.status(200).json({
      senders: uniqueSenders,
      count: uniqueSenders.length,
    });
  } catch (err: unknown) {
    const error = err as AppError;
    return res.status(error.status || 500).json({
      message: error.message || 'Error fetching messages',
      errors: error.errors || undefined,
    });
  }
};
