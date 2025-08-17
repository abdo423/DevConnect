import logo from "../assets/DevConnect.png";
import SearchBar from "@/components/SearchBar.tsx";
import {Button} from "@/components/ui/button.tsx";
import MobileNav from "@/components/MobileNavbar.tsx";
import {Link, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../app/store";
import UserMenu from "@/components/UserMenu.tsx";
import {House, MessageCircle, User} from "lucide-react";

const Navbar = () => {
    const routes = [
        {path: "/", label: "Home", icon: <House className="mr-2 h-4 w-4"/>},
        {path: "/profile", label: "Profile", icon: <User className="mr-2 h-4 w-4"/>},
        {path: "/messages", label: "Messages", icon: <MessageCircle className="mr-2 h-4 w-4"/>},
    ];

    const location = useLocation();
    const filteredRoutes = routes.filter((route) => route.path !== location.pathname);

    const {user, isLoggedIn} = useSelector((state: RootState) => state.auth);


    // If no user → show logged-out navbar
    if (!user) {
        return (
            <header
                className="mx-auto sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto max-w-[1400px] flex flex-row justify-between items-center h-20 px-5">
                    <img src={logo} className="w-30 h-30" alt="logo"/>

                    <div className="flex grow justify-center">
                        <SearchBar className="hidden md:block"/>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="hidden md:flex">
                            <Link to="/login">Log in</Link>
                        </Button>
                        <Button size="sm" className="hidden md:flex">
                            <Link to="/register">Sign up</Link>
                        </Button>
                    </div>
                </div>
            </header>
        );
    }

    // Build user objects
    const userNav = {
        username: user.username,
        avatar: user.avatar,
        email: user.email,
    };

    const userMenu = {
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        id: user._id,
        bio: user.bio,
    };

    return (
        <header className="mx-auto sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-[1400px] flex flex-row justify-between items-center h-20 px-5">
                {/* Logo */}
                <img src={logo} className="w-30 h-30" alt="logo"/>

                {/* Search Bar (desktop only) */}
                <div className="flex grow justify-center">
                    <SearchBar className="hidden md:block"/>
                </div>

                {/* Right side */}
                {isLoggedIn ? (
                    <UserMenu user={userMenu} filteredRoutes={filteredRoutes}/>
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

                {/* Mobile nav */}
                <MobileNav isLoggedIn={isLoggedIn} user={userNav} filteredRoutes={filteredRoutes}/>
            </div>
        </header>
    );
};

export default Navbar;
