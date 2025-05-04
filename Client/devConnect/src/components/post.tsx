import  { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dummy post object
const dummyPost = {
    user: {
        name: "John Doe",
        username: "johndoe",
        avatar: "",
    },
    content: "This is a dummy post to demonstrate the component layout. It can contain longer text to test the show more/show less feature.",
    image: "https://placehold.co/600x400",
    createdAt: new Date(),
};

// Dummy comments
const dummyComments = [
    {
        user: {
            name: "Jane Smith",
            avatar: "",
        },
        content: "Great post!",
    },
    {
        user: {
            name: "Alice",
            avatar: "",
        },
        content: "Nice shot!",
    },
];

const Post = () => {
    const [post] = useState(dummyPost);
    const [comments] = useState(dummyComments);
    const [likeCount, setLikeCount] = useState(10)
    const [isLiked, setIsLiked] = useState(false);
    const [commentOpen, setCommentOpen] = useState(false);
    const [expandedText, setExpandedText] = useState(false);

    const handleLike = () => {
        setIsLiked((prev) => !prev);
        setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    };


    return (
        <Card className="max-w-xl mx-auto overflow-hidden">
            <CardHeader className="flex flex-row items-center space-y-0 gap-3">
                <Avatar>
                    <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="font-semibold">{post.user.name}</div>
                    <div className="text-xs text-muted-foreground">@{post.user.username}</div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                            <span className="sr-only">More options</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Save post</DropdownMenuItem>
                        <DropdownMenuItem>Edit post</DropdownMenuItem>
                        <DropdownMenuItem>Delete post</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="p-0">
                {post.content && post.content.length > 150 && !expandedText ? (
                    <div className="px-4 py-2 text-sm">
                        <p>{post.content.substring(0, 150)}...</p>
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpandedText(true);
                            }}
                        >
                            Show more
                        </Button>
                    </div>
                ) : post.content ? (
                    <div className="px-4 py-2 text-sm">
                        <p>{post.content}</p>
                        {post.content.length > 150 && (
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedText(false);
                                }}
                            >
                                Show less
                            </Button>
                        )}
                    </div>
                ) : null}

                <div
                    className="relative aspect-[3/2] w-full cursor-pointer"
                    onClick={() => setCommentOpen(true)}
                >
                    <img
                        src={post.image || "/placeholder.svg"}
                        alt="Post image"
                        className="w-full h-full object-cover"
                    />
                </div>
            </CardContent>

            <CardFooter className="p-4 flex flex-col">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 px-2"
                            onClick={handleLike}
                        >
                            <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                            <span>{likeCount}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 px-2"
                            onClick={() => setCommentOpen(true)}
                        >
                            <MessageCircle className="h-5 w-5" />
                            <span>{comments.length}</span>
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                    </div>
                </div>

                {comments.length > 0 && (
                    <div className="mt-3 w-full">
                        <Separator className="my-2" />
                        <div className="flex items-start gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage
                                    src={comments[0].user.avatar || "/placeholder.svg"}
                                    alt={comments[0].user.name}
                                />
                                <AvatarFallback>{comments[0].user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="text-xs">
                                    <span className="font-semibold">{comments[0].user.name}</span> {comments[0].content}
                                </div>
                            </div>
                        </div>
                        {comments.length > 1 && (
                            <Button
                                variant="link"
                                size="sm"
                                className="px-0 h-auto mt-1 text-xs text-muted-foreground"
                                onClick={() => setCommentOpen(true)}
                            >
                                View all {comments.length} comments
                            </Button>
                        )}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};

export default Post;
