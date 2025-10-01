import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MoreHorizontal } from 'lucide-react';
import { erasePost, likesPost } from '@/features/Posts/postsSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import UpdatePostModal from './UpdatePostForm.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PostSkeletonLoad from '@/components/PostSkeletonLoad.tsx';
import CommentsPopUp from '@/components/CommentsPopUp.tsx';
import { fetchComments } from '@/features/Comments/commentsSlice.ts';
import { PostProps } from '../../Types/post.ts';

const Post = ({ post, user }: PostProps) => {
  const { isLoggedIn, user: currentUser } = useSelector(
    (state: RootState) => state.auth
  );
  const { loading } = useSelector((state: RootState) => state.post);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Narrow author_id to object if needed
  const author =
    typeof post.author_id === 'string'
      ? {
          _id: post.author_id,
          email: 'unknown@example.com',
          username: 'Unknown',
        }
      : post.author_id;

  const likesArray = post.likes ?? [];
  const commentsArray = post.comments ?? [];

  // Current user ID
  const currentUserId = currentUser?._id || user?.id;

  // Check if liked
  const initialIsLiked = currentUserId
    ? likesArray.some((like) =>
        typeof like === 'string'
          ? like === currentUserId
          : like.user === currentUserId
      )
    : false;

  const [likeCount, setLikeCount] = useState(likesArray.length);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [expandedText, setExpandedText] = useState(false);

  useEffect(() => {
    if (post._id) {
      dispatch(fetchComments(post._id));
    }
  }, [dispatch, post._id]);

  const handleLike = () => {
    if (!isLoggedIn) return navigate('/login');
    if (!currentUserId) return;

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    dispatch(likesPost(post._id))
      .unwrap()
      .catch(() => {
        setIsLiked(!newIsLiked);
        setLikeCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
      });
  };

  const generate3DigitCode = (input: string): number => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = input.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 900) + 100;
  };

  const baseUsername = author.email.split('@')[0];
  const uniqueCode = generate3DigitCode(author.email || author._id);
  const username = `${baseUsername}${uniqueCode}`;

  const profileNavigate = () => {
    if (!isLoggedIn) return navigate('/login');
    navigate(`/profile/${author._id}`);
  };

  if (loading) return <PostSkeletonLoad />;

  return (
    <Card className="max-w-xl mx-auto overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-around space-y-0 gap-3">
        <Avatar onClick={profileNavigate}>
          <AvatarImage
            src={author.avatar || user?.avatar || '/placeholder.svg'}
            alt={username}
          />
          <AvatarFallback>
            {(user?.username || author.username || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1" onClick={profileNavigate}>
          <div className="font-semibold">
            {user?.username || author.username}
          </div>
          <div className="text-xs text-muted-foreground">@{username}</div>
        </div>

        {isLoggedIn && currentUserId === author._id && (
          <UpdatePostModal
            post={{
              id: post._id,
              title: post.title,
              content: post.content,
              image: post.image || '',
            }}
          />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-4">
              <MoreHorizontal className="w-4 h-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Save post</DropdownMenuItem>
            {isLoggedIn && currentUserId === author._id && (
              <DropdownMenuItem
                onClick={() => dispatch(erasePost(post._id))}
                className="text-red-400 focus:text-red-500"
              >
                Delete post
              </DropdownMenuItem>
            )}
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
            onClick={() => {
              if (!isLoggedIn) return navigate('/login');
            }}
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
              <Heart
                className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
              />
              <span>{likeCount}</span>
            </Button>
            <CommentsPopUp
              isLoggedIn={isLoggedIn}
              onNavigateToLogin={() => navigate('/login')}
              postData={{
                _id: post._id,
                title: post.title,
                author: author.username,
                authorAvatar: author.avatar,
                image: post.image,
                date: post.createdAt,
                likes: likeCount,
                commentCount: commentsArray.length,
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Post;
