import Post, { validatePost, validateUpdatePost } from '../models/post';
import User from '../models/user';
import Comment from '../models/comment';
import { Types } from 'mongoose';

export const createPost = async (userId: string, postBody: any) => {
  if (!userId) {
    throw { status: 401, message: 'User not authenticated' };
  }

  // Use schema type (no Mongoose Document methods)
  const postData = {
    ...postBody,
    author_id: userId,
    likes: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = validatePost(postData);

  if (!result.success) {
    throw { status: 400, message: result.error.errors };
  }

  const post = new Post(postData);
  await post.save();

  const populatedPost = await Post.findById(post._id)
    .populate('author_id', 'username email avatar')
    .populate('comments', 'content createdAt');

  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, success: false, message: "account doesn't exist" };
  }

  await User.findByIdAndUpdate(
    userId,
    { $push: { posts: post.id } },
    { new: true },
  );

  return populatedPost;
};
export const deletePost = async (postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw { status: 404, message: 'Post not found' };
  }
  await Post.deleteOne({ _id: postId });
  return post;
};

export const getAllPosts = async () => {
  return Post.find()
    .sort({ createdAt: -1 })
    .populate('author_id', 'name email avatar username')
    .populate('comments', 'content createdAt');
};

export const updatePost = async (postId: string, postBody: any) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw { status: 404, message: 'Post not found' };
  }
  postBody = postBody ?? {};

  const updateData = {
    title: postBody.title ?? post.title,
    content: postBody.content ?? post.content,
    image: postBody.image ?? post.image,
    author_id: post.author_id.toString(),
    likes: post.likes,
    comments: post.comments,
    createdAt: post.createdAt,
    updatedAt: new Date(),
  };

  const result = validateUpdatePost(updateData);
  if (!result.success) {
    throw {
      status: 400,
      message: 'Validation failed',
      errors: result.error.errors,
    };
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $set: updateData },
    {
      new: true,
      populate: {
        path: 'author_id',
        select: 'username email avatar',
      },
    },
  );

  if (!updatedPost) {
    throw { status: 404, message: 'Post not found after update' };
  }

  return updatedPost;
};

export const likePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw { status: 404, message: 'Post not found' };
  }

  const alreadyLiked = post.likes.some(
    (like) => like.user.toString() === userId.toString(),
  );

  if (alreadyLiked) {
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== userId.toString(),
    );
  } else {
    post.likes.push({
      user: new Types.ObjectId(userId),
      createdAt: new Date(),
    });
  }

  await post.save();
  return { alreadyLiked, likes: post.likes };
};

export const getCommentsByPostId = async (postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw { status: 404, message: 'Post not found' };
  }

  const comments = await Comment.find({ _id: { $in: post.comments } })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  return comments;
};
