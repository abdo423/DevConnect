import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Heart, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import { addComment, fetchComments } from "@/features/Commments/commetSlice";

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

export default function CommentsPopUp({
                                          isLoggedIn = true,
                                          onNavigateToLogin,
                                          postData
                                      }: CommentsPopUpProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { comments, loading, error } = useSelector((state: RootState) => state.comments);
    const { user } = useSelector((state: RootState) => state.auth);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    console.log(comments);
    // Ensure comments is always an array
    const commentsArray = Array.isArray(comments) ? comments : [];



    const formatDate = (dateInput: string | Date | undefined): string => {
        if (!dateInput) return "some time ago";
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        return formatDistanceToNow(date, { addSuffix: true });
    };

    const handleAddComment = () => {
        if (!isLoggedIn) {
            onNavigateToLogin?.();
            return;
        }

        if (newComment.trim() && postData?._id) {
            dispatch(addComment({
                post: postData._id,
                content: newComment.trim()
            }));
            setNewComment("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

    const handleTriggerClick = () => {
        if (!isLoggedIn) {
            onNavigateToLogin?.();
            return false;
        }
        dispatch(fetchComments(postData?._id));
        return true;
    };

    return (
        <Dialog>
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
            <DialogDescription>

            </DialogDescription>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Post Header */}
                <div className="relative">
                    <img
                        src={postData?.image || "/placeholder.svg?height=300&width=600"}
                        alt="Post image"
                        className="w-full h-64 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-lg" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h2 className="text-xl font-bold mb-2">
                            {postData?.title || "Building Modern Web Applications with Next.js"}
                        </h2>
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border-2 border-white">
                                <AvatarImage src={postData?.authorAvatar || "/placeholder.svg?height=32&width=32"} />
                                <AvatarFallback>
                                    {postData?.author?.split(' ').map(n => n[0]).join('') || 'JD'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <p className="font-medium">{postData?.author || "John Developer"}</p>
                                <p className="text-white/80">{formatDate(postData?.date)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post Engagement */}
                <div className="px-6 py-4 border-b bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`gap-2 ${isLiked ? "text-red-500" : "text-gray-600"} hover:text-red-500`}
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                                {postData?.likes || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-blue-500">
                                <MessageCircle className="w-4 h-4" />
                                {commentsArray.length}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-green-500">
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

                <DialogHeader className="px-6 pt-4 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <MessageCircle className="w-5 h-5 text-blue-500" />
                        Comments ({commentsArray.length})
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6">
                    {/* Add Comment Section */}
                    {isLoggedIn ? (
                        <div className="space-y-3 border-b pb-4">
                            <div className="flex gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40"} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                        {user?.username?.split(' ').map(n => n[0]).join('') || 'Y'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                    <Textarea
                                        placeholder="Share your thoughts..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="min-h-[100px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                                    />
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500">Press Enter to post, Shift+Enter for new line</p>
                                        <Button
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim()}
                                            size="sm"
                                            className="gap-2 bg-blue-600 hover:bg-blue-700"
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

                    {/* Comments List */}
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <p>Loading comments...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">
                            <p>Error loading comments: {error}</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <ScrollArea className="h-full">
                                <div className="space-y-6 pr-4">
                                    {commentsArray.map((comment: any) => (
                                        <div key={comment._id} className="flex gap-3 group">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={comment.user?.avatar || "/placeholder.svg"} />
                                                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600">
                                                    {comment.user?.username
                                                        ?.split(" ")
                                                        .map((n: any) => n[0])
                                                        .join("") || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <div className="bg-gray-50 rounded-2xl px-4 py-3 group-hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-sm text-gray-900">
                                                            {comment.user?.username || "Anonymous"}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-gray-700">{comment.content}</p>
                                                </div>
                                                <div className="flex items-center gap-4 px-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-gray-500 hover:text-blue-600 h-6 px-2"
                                                        onClick={() => !isLoggedIn && onNavigateToLogin?.()}
                                                    >
                                                        Like
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-gray-500 hover:text-blue-600 h-6 px-2"
                                                        onClick={() => !isLoggedIn && onNavigateToLogin?.()}
                                                    >
                                                        Reply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {commentsArray.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                            <h3 className="font-medium mb-2">No comments yet</h3>
                                            <p className="text-sm">Be the first to share your thoughts!</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}