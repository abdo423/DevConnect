import {useState} from "react";
import {formatDistanceToNow} from "date-fns";
import {Heart, MessageCircle, MoreHorizontal} from "lucide-react";
import {erasePost, likesPost} from "@/features/Posts/postsSlice";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {useDispatch,useSelector} from "react-redux";
import {AppDispatch,RootState} from "../app/store";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PostSkeleton from "@/components/post-skeleton.tsx";

type PostProps = {
    post: {
        _id: string;
        title: string;
        content: string;
        image?: string;
        author_id: {
            _id: string;
            email: string;
            avatar?: string;
        };
        likes: Array<{
            user: string;
            createdAt: string;
            _id: string;
        }>;
        comments: string[];
        createdAt: string | Date;
        updatedAt: string;
        __v: number;
    };

};

const Post = ({post}: PostProps) => {
    const [comments] = useState(post.comments || []);
    const dispatch = useDispatch<AppDispatch>();
    const [likeCount, setLikeCount] = useState((post.likes || []).length);
    const [isLiked, setIsLiked] = useState(() => {
        if (!post?.author_id?._id || !post?.likes) return false;
        return post.likes.some(like => like.user === post.author_id._id);
    });
     const{loading, error} = useSelector((state: RootState) => state.post)
    const [commentOpen, setCommentOpen] = useState(false);
    const [expandedText, setExpandedText] = useState(false);

    const handleLike = () => {
        setIsLiked((prev) => !prev);
        setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
        dispatch(likesPost(post._id));
    };
    console.log(post.author_id);
    // Extract username from email (everything before @)
    const generate3DigitCode = (input: string): number => {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = input.charCodeAt(i) + ((hash << 5) - hash);
        }
        const code = Math.abs(hash % 900) + 100; // Ensures value between 100–999
        return code;
    };

    const baseUsername = post.author_id?.email?.split('@')[0] || 'Unknown';
    const uniqueCode = generate3DigitCode(post.author_id?.email || post.author_id?._id || 'user');
    const username = `${baseUsername}${uniqueCode}`;
    console.log(post);
    if (loading) {
        return <PostSkeleton />;
    }
    return (
        <Card className="max-w-xl mx-auto overflow-hidden">
            <CardHeader className="flex flex-row items-center space-y-0 gap-3">
                <Avatar>
                    <AvatarImage src={post.author_id.avatar || "/placeholder.svg"} alt={username} />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="font-semibold">{username}</div>
                    <div className="text-xs text-muted-foreground">@{username}</div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4"/>
                            <span className="sr-only">More options</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Save post</DropdownMenuItem>


                        <DropdownMenuItem>Edit post</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 focus:text-red-500 " onClick={()=>{
                            dispatch(erasePost(post._id));
                        }}>Delete post</DropdownMenuItem>


                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="p-0">
                {post.title && (
                    <div className="px-4 py-2">
                        <h2 className="text-xl font-bold">{post.title}</h2>
                    </div>
                )}
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

                {post.image && (
                    <div
                        className="relative aspect-[3/2] w-full cursor-pointer"
                        onClick={() => setCommentOpen(true)}
                    >
                        <img
                            src={post.image}
                            alt="Post"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
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
                            <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}/>
                            <span>{likeCount}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 px-2"
                            onClick={() => setCommentOpen(true)}
                        >
                            <MessageCircle className="h-5 w-5"/>
                            <span>{comments.length}</span>
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), {addSuffix: true})}
                    </div>
                </div>

                {comments.length > 0 && (
                    <div className="mt-3 w-full">
                        <Separator className="my-2"/>
                        <div className="text-xs text-muted-foreground">
                            {comments.length} comment{comments.length !== 1 ? 's' : ''}
                        </div>
                        <Button
                            variant="link"
                            size="sm"
                            className="px-0 h-auto mt-1 text-xs text-muted-foreground"
                            onClick={() => setCommentOpen(true)}
                        >
                            View all comments
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};

export default Post;