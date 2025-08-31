import {useEffect} from "react";
import {useSelector,useDispatch} from "react-redux";
import {fetchProfile, followUserThunk} from "@/features/Profile/profileSlice.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Grid, Heart, SquarePen, Settings, UserCheck, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Post from "@/components/Post.tsx";
import {AppDispatch, RootState} from "@/app/store.ts";
import {getProfileByIdThunk} from "@/features/Profile/profileSlice.ts";
import {useParams,Link} from "react-router-dom";
const ProfileComponent = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {profile,loading,error} = useSelector((state:RootState) => (state.profile));

    const {user} = useSelector((state:RootState) => (state.auth));
    const isFollowing = profile?.followers?.some(followerId => followerId === user?._id);
    const userData = {
        id: profile?._id || "",
        username: profile?.username || "",
        email: profile?.email || "",
        bio: profile?.bio || "",
        avatar: profile?.avatar || "",
    };

    const { id } = useParams();
    useEffect(() => {
        if (id) {
            dispatch(getProfileByIdThunk(id));

        }else{
            dispatch(fetchProfile());
        }
    }, [dispatch, id]);
;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-primary animate-spin"></div>
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-4xl mx-auto px-4 py-12 flex justify-center">
                <p className="text-red-500">Error loading profile: {error}</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container max-w-4xl mx-auto px-4 py-12 flex justify-center">
                <p>No profile data available</p>
            </div>
        );
    }

    const handleFollow = () => {
        dispatch(followUserThunk(profile._id)).unwrap().then(
            () => {
                // Refresh the profile data to get updated followers
                if (id) {
                    dispatch(getProfileByIdThunk(id));
                } else {
                    dispatch(fetchProfile());
                }
            },
            (error) => {
               //todo make error handling
            }
        );
    };

    const isCurrentUser = user && profile && user._id === profile._id;


    return (
        <div className="container max-w-4xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Avatar */}
                <div className="flex justify-center md:justify-start">
                    <Avatar className="h-32 w-32 border-4 border-background">
                        <AvatarImage src={profile.avatar || "/placeholder.svg?height=128&width=128"} alt="profile" />
                        <AvatarFallback className="text-4xl">
                            {profile.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{profile.username}</h1>
                            <p className="text-muted-foreground">@{profile.username}</p>
                        </div>

                        <div className="flex gap-2">
                            {isCurrentUser ? (
                                <Button variant="outline">
                                    <Settings className="h-4 w-4 mr-2" />
                                    <Link to="/profile/edit">   Edit Profile</Link>

                                </Button>
                            ) : (
                                <Button
                                    variant={isFollowing ? "outline" : "default"}
                                    onClick={handleFollow}
                                    className="min-w-[100px]"
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Following
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Follow
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    <h3>{profile.bio || "No bio yet"}</h3>

                    <div className="flex text-sm gap-4">
                        <div>
                            <span className="font-bold">{profile.posts?.length || 0}</span>
                            <span className="text-muted-foreground"> posts</span>
                        </div>
                        <div>
                            <span className="font-bold">{profile.followers?.length || 0}</span>
                            <span className="text-muted-foreground"> Followers</span>
                        </div>
                        <div>
                            <span className="font-bold">{profile.following?.length || 0}</span>
                            <span className="text-muted-foreground"> Following</span>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-6" />

            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6 w-full">
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                    <TabsTrigger value="liked">Liked</TabsTrigger>
                </TabsList>

                <TabsContent value="posts">
                    {profile.posts?.length ? (
                        profile.posts.map(post => (
                            <Post key={post._id} post={post} user={userData} />
                        ))
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <SquarePen className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">Posts</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    {isCurrentUser
                                        ? "Posts that you've made will appear here."
                                        : `${profile.username} hasn't posted anything yet.`}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="saved">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Grid className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Saved</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                {isCurrentUser
                                    ? "Posts that you've saved will appear here."
                                    : `Saved posts are private.`}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="liked">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Liked posts</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                {isCurrentUser
                                    ? "Posts that you've liked will appear here."
                                    : `Liked posts are private.`}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProfileComponent;