import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Bookmark,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Send,
    Share2,
} from "lucide-react";
import { AppDispatch, RootState } from "@/app/store";
import {
    addComment,
    fetchComments,
    likeComment,
} from "@/features/Comments/commentsSlice.ts";

interface CommentsPopUpProps {
    isLoggedIn?: boolean;
    onNavigateToLogin?: () => void;
    postData?: {
        _id: string;
        title?: string;
        author?: string;
        authorAvatar?: string;
        image?: string;
        date?: Date;
        likes?: number;
        commentCount?: number;
    };
}

interface CommentUser {
    _id: string;
    username: string;
    avatar?: string;
}

interface Comment {
    _id: string;
    content: string;
    user: CommentUser;
    createdAt: string | Date;
    likes?: string[];
}

export default function CommentsPopUp({
                                          isLoggedIn = true,
                                          onNavigateToLogin,
                                          postData,
                                      }: CommentsPopUpProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { comments, loading, error } = useSelector(
        (state: RootState) => state.comments
    );

    const { user } = useSelector((state: RootState) => state.auth);
    const [newComment, setNewComment] = useState("");
    const [optimisticLikes, setOptimisticLikes] = useState<Record<string, string[]>>({});

    const commentsArray = Array.isArray(comments) ? comments : [];

    const formatDate = (dateInput?: string | Date): string => {
        if (!dateInput) return "some time ago";
        const date =
            typeof dateInput === "string" ? new Date(dateInput) : dateInput;
        return formatDistanceToNow(date, { addSuffix: true });
    };

    const handleAddComment = async () => {
        if (!isLoggedIn) return onNavigateToLogin?.();
        if (newComment.trim() && postData?._id) {
            try {
                await dispatch(
                    addComment({
                        post: postData._id,
                        content: newComment.trim(),
                    })
                ).unwrap();
                setNewComment("");
                dispatch(fetchComments(postData._id));
            } catch (error) {
                //todo make error handling
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

    const handleTriggerClick = () => {
        if (!isLoggedIn) return onNavigateToLogin?.();
        if (postData?._id) dispatch(fetchComments(postData._id));
    };

    const handleLikeComment = async (commentId: string) => {
        if (!isLoggedIn) return onNavigateToLogin?.();
        if (!user?._id) return;

        // Optimistic UI update
        setOptimisticLikes((prev) => {
            const currentLikes = prev[commentId] || [];
            const alreadyLiked = currentLikes.includes(user._id);
            return {
                ...prev,
                [commentId]: alreadyLiked
                    ? currentLikes.filter((id) => id !== user._id)
                    : [...currentLikes, user._id],
            };
        });

        try {
            await dispatch(likeComment(commentId)).unwrap();
            // Clear optimistic state after successful update
            setOptimisticLikes((prev) => {
                const newState = { ...prev };
                delete newState[commentId];
                return newState;
            });
        } catch (error) {

            // Revert optimistic update on error
            setOptimisticLikes((prev) => {
                const newState = { ...prev };
                delete newState[commentId];
                return newState;
            });
        }
    };
    const checkIfLiked = (comment: Comment) => {
        const likes = optimisticLikes[comment._id] ?? comment.likes ?? [];
        return user?._id ? likes.includes(user._id) : false;
    };

    const getLikeCount = (comment: Comment) => {
        const likes = optimisticLikes[comment._id] ?? comment.likes ?? [];
        return likes.length;
    };

    return (
        <Dialog
            onOpenChange={(open) => {
                if (open && isLoggedIn && postData?._id) {
                    dispatch(fetchComments(postData._id));
                }
            }}
        >
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 px-2"
                    onClick={handleTriggerClick}
                >
                    <MessageCircle className="h-5 w-5" />
                    <span>{postData?.commentCount}</span>
                </Button>
            </DialogTrigger>

            <DialogDescription />

            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header */}
                <div className="relative">
                    <img
                        src={postData?.image || "https://placehold.co/600x400"}
                        alt="Post image"
                        className="w-full h-64 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h2 className="text-xl font-bold mb-2">{postData?.title}</h2>
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border-2 border-white">
                                <AvatarImage src={postData?.authorAvatar} />
                                <AvatarFallback>
                                    {postData?.author?.split(" ").map((n) => n[0]).join("") || "JD"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <p className="font-medium">{postData?.author}</p>
                                <p className="text-white/80">{formatDate(postData?.date)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post Actions */}
                <div className="px-6 py-4 border-b bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-gray-600 hover:text-red-500"
                            >
                                <Heart className="w-4 h-4" />
                                {postData?.likes || 0}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-gray-600 hover:text-blue-500"
                            >
                                <MessageCircle className="w-4 h-4" />
                                {commentsArray.length}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-gray-600 hover:text-green-500"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                                <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Comments */}
                <DialogHeader className="px-6 pt-4 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <MessageCircle className="w-5 h-5 text-blue-500" />
                        Comments ({commentsArray.length})
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6">
                    {isLoggedIn ? (
                        <div className="space-y-3 border-b pb-4">
                            <div className="flex gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                    <Textarea
                                        placeholder="Share your thoughts..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="min-h-[100px] resize-none"
                                    />
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500">Press Enter to post</p>
                                        <Button
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim()}
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Send className="w-4 h-4" />
                                            Post Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 border-b">
                            <p className="text-gray-600 mb-3">Please log in to leave a comment</p>
                            <Button onClick={onNavigateToLogin} className="bg-blue-600 hover:bg-blue-700">
                                Log In
                            </Button>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="ml-3">Loading comments...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">
                            <p>Error loading comments: {error}</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="space-y-6 pr-4">
                                {commentsArray.map((comment: Comment) => {
                                    const isCommentLiked = checkIfLiked(comment);
                                    return (
                                        <div key={comment._id} className="flex gap-3 group">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={comment.user.avatar} />
                                                <AvatarFallback>
                                                    {comment.user.username
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("") || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <div className="bg-gray-50 rounded-2xl px-4 py-3">
                                                    <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {comment.user.username}
                            </span>
                                                        <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{comment.content}</p>
                                                </div>
                                                <div className="flex items-center gap-4 px-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`text-xs ${
                                                            isCommentLiked
                                                                ? "!text-red-500"
                                                                : "text-gray-500 hover:!text-red-600"
                                                        }`}
                                                        onClick={() => handleLikeComment(comment._id)}
                                                    >
                                                        <Heart className="w-3 h-3 mr-1" stroke="currentColor" />
                                                        Like ({getLikeCount(comment)})
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-gray-500 hover:text-blue-600"
                                                    >
                                                        Reply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {commentsArray.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <h3 className="font-medium mb-2">No comments yet</h3>
                                        <p className="text-sm">Be the first to share your thoughts!</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
