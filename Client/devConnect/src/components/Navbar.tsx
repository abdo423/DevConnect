import logo from '../assets/DevConnect.png';
import SearchBar from "@/components/SearchBar.tsx";
import {Button} from "@/components/ui/button.tsx";
import MobileNav from "@/components/MobileNavbar.tsx";
import {Link} from "react-router-dom"; // Ensure correct import for React Router V6+
import {useSelector} from 'react-redux';
import {RootState} from "../app/store";
import UserMenu from "@/components/user-menu.tsx";
import {House, MessageCircle, User} from "lucide-react";
import {useLocation} from "react-router-dom";
const Navbar = () => {
    const routes = [
        {path: "/", label: "Home", icon: <House className="mr-2 h-4 w-4"/> }, // Not in your menu, but you might want to add it
        {path: "/profile", label: "Profile", icon: <User className="mr-2 h-4 w-4"/>},
        {path: "/messages", label: "Messages", icon: <MessageCircle className="mr-2 h-4 w-4"/> }, // Add if needed
    ];
    const location = useLocation();
    const filteredRoutes = routes.filter((route) => route.path !== location.pathname);
    const {user, isLoggedIn } = useSelector((state: RootState) => state.auth);
    console.log(user);
    return (
        <header className="mx-auto sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-[1400px] flex flex-row justify-between items-center h-20 px-5">

                <img src={logo} className="w-30 h-30" alt="logo"/>

                <div className="flex grow justify-center">
                    <SearchBar className="hidden md:block"/>
                </div>

                {isLoggedIn ? (
                    <UserMenu user={user} filteredRoutes={filteredRoutes} />
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="hidden md:flex">
                            <Link to="/login">Log in</Link>
                        </Button>
                        <Button size="sm" className="hidden md:flex">
                          <Link to="/register">Sign up</Link>
                        </Button>
                    </div>
                )}

                <MobileNav isLoggedIn={isLoggedIn} user={user} filteredRoutes={filteredRoutes} />
            </div>
        </header>
    );
};

export default Navbar;
