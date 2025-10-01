// services/commentService.ts
import { Types } from 'mongoose';
import Comment, {
  validateComment,
  validateCommentInput,
} from '../models/comment';
import { CommentUpdateInput } from '../Types/comment';

export const createComment = async (
  userId: string,
  postId: string,
  content: string,
) => {
  // ✅ FIXED: Validate the input first (before creating full object)
  const inputValidation = validateCommentInput({ post: postId, content });
  if (!inputValidation.success) {
    // Transform Zod errors into user-friendly format
    const formattedErrors = inputValidation.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    throw {
      status: 400,
      message: 'Validation failed',
      errors: formattedErrors,
    };
  }

  // ✅ Validate user ID separately
  if (!Types.ObjectId.isValid(userId)) {
    throw {
      status: 400,
      message: 'Invalid user ID',
      errors: [{ path: ['user'], message: 'Invalid user ID' }],
    };
  }

  const commentData = {
    user: new Types.ObjectId(userId),
    post: new Types.ObjectId(postId),
    content,
    likes: [],
    createdAt: new Date(),
  };

  // ✅ Optional: Validate the complete object (redundant but safe)
  const result = validateComment(commentData);
  if (!result.success) {
    throw {
      status: 400,
      message: 'Validation failed',
      errors: result.error.errors,
    };
  }

  const comment = new Comment(commentData);
  await comment.save();
  await comment.populate('user', 'username avatar');
  const populatedComment = await comment.populate<{
    user: { _id: Types.ObjectId; username: string; avatar: string };
  }>('user', 'username avatar');

  return {
    _id: populatedComment._id,
    content: populatedComment.content,
    createdAt: populatedComment.createdAt,
    user: populatedComment.user,
  };
};

export const deleteComment = async (commentId: string) => {
  if (!Types.ObjectId.isValid(commentId)) {
    throw {
      status: 400,
      message: 'Invalid comment ID',
      errors: { id: 'Invalid comment ID' },
    };
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw { status: 404, message: 'Comment not found' };
  }

  await Comment.deleteOne({ _id: commentId });
  return true;
};

export const updateComment = async (
  commentId: string,
  body: CommentUpdateInput,
) => {
  if (!Types.ObjectId.isValid(commentId)) {
    throw {
      status: 400,
      message: 'Invalid comment ID',
      errors: { id: 'Invalid comment ID' },
    };
  }
  if (!body.content) {
    throw { status: 400, message: 'Content is required' };
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw { status: 404, message: 'Comment not found' };
  }

  const updateData = {
    ...body,
    user: comment.user,
    post: comment.post,
    createdAt: comment.createdAt,
    likes: comment.likes,
  };

  const result = validateComment(updateData);
  if (!result.success) {
    throw {
      status: 400,
      message: 'Validation failed',
      errors: result.error.errors,
    };
  }

  await Comment.findByIdAndUpdate(
    commentId,
    { $set: updateData },
    { new: true },
  ).populate('user', 'username avatar');

  return updateData;
};

export const getCommentsByPost = async (postId: string) => {
  if (!Types.ObjectId.isValid(postId)) {
    throw { status: 400, message: 'Invalid post ID' };
  }

  return await Comment.find({ post: postId })
    .populate('user', 'username avatar')
    .sort({ createdAt: -1 });
};

export const likeComment = async (commentId: string, userId: string) => {
  if (!Types.ObjectId.isValid(commentId)) {
    throw {
      status: 400,
      message: 'Invalid comment ID',
      errors: { id: 'Invalid comment ID' },
    };
  }

  if (!Types.ObjectId.isValid(userId)) {
    throw {
      status: 400,
      message: 'Invalid user ID',
      errors: { id: 'Invalid user ID' },
    };
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw { status: 404, message: 'Comment not found' };
  }

  const alreadyLiked = comment.likes.some(
    (like) => like.user.toString() === userId.toString(),
  );

  if (alreadyLiked) {
    comment.likes = comment.likes.filter(
      (like) => like.user.toString() !== userId.toString(),
    );
  } else {
    comment.likes.push({
      user: new Types.ObjectId(userId),
      createdAt: new Date(),
    });
  }

  await comment.save();

  const likesUserIds = comment.likes.map((like) => like.user.toString());

  return {
    alreadyLiked,
    likes: likesUserIds,
  };
};
