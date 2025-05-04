import logo from '../assets/DevConnect.png';
import SearchBar from "@/components/SearchBar.tsx";
import {Button} from "@/components/ui/button.tsx";
import MobileNav from "@/components/MobileNavbar.tsx";
import {Link} from "react-router-dom"; // Ensure correct import for React Router V6+
import {useSelector} from 'react-redux';
import {RootState} from "../app/store";
import UserMenu from "@/components/user-menu.tsx";

const Navbar = () => {
    const {user, isLoggedIn } = useSelector((state: RootState) => state.auth);
    return (
        <header className="mx-auto sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-[1400px] flex flex-row justify-between items-center h-20 px-5">

                <img src={logo} className="w-30 h-30" alt="logo"/>

                <div className="flex grow justify-center">
                    <SearchBar className="hidden md:block"/>
                </div>

                {isLoggedIn ? (
                    <UserMenu user={user} />
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="hidden md:flex">
                            <Link to="/login">Log in</Link>
                        </Button>
                        <Button size="sm" className="hidden md:flex">
                            Sign up
                        </Button>
                    </div>
                )}

                <MobileNav isLoggedIn={isLoggedIn} user={user}/>
            </div>
        </header>
    );
};

export default Navbar;
