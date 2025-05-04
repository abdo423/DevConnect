import Navbar from "../components/Navbar.tsx";
import CreatePost from "@/components/create-post.tsx";
import Post from "@/components/post.tsx";

const HomePage = () => {
    return (
        <div >
            <Navbar/>
            <CreatePost/>
            <Post/>

        </div>
    );
};
export default HomePage;
