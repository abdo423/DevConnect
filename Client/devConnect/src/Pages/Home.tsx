
import Navbar from "../components/Navbar.tsx"
import CreatePost from "@/components/create-post.tsx"
import Post from "@/components/post.tsx"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../app/store"
import {fetchPosts} from "@/features/Posts/postsSlice"

const HomePage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { posts, loading } = useSelector((state: RootState) => state.post)
    useEffect(() => {
        dispatch(fetchPosts())
    }, [dispatch])

    return (
        <div>
            <Navbar />
            <CreatePost />

            {loading ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-primary animate-spin"></div>
                    <p className="text-muted-foreground">Loading posts...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="p-6 text-center">
                    <p className="text-muted-foreground">No posts found. Create your first post!</p>
                </div>
            ) : (
                <div className="space-y-6 p-4">
                    {posts.map((post: any) => (
                        <Post key={post._id} post={post} />
                    ))}
                </div>

            )}
        </div>
    )
}

export default HomePage
