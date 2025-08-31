import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ChevronDown, LogOut} from "lucide-react";
import {Link, useNavigate, } from "react-router-dom";
import {AppDispatch} from "@/app/store.ts";
import {useDispatch} from "react-redux";
import {logout} from "@/features/Auth/authSlice";

interface Route {
    path: string;
    label: string;
    icon: React.ReactNode;
}

interface UserMenuProps {
    user: {
        id: string;
        username: string;
        email: string;
        avatar: string;
        bio: string;
    };
    filteredRoutes: Route[];
}


const UserMenu = ({user,filteredRoutes}: UserMenuProps) => {

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    if (!user) return null; // 👈 Prevent crash if user is undefined

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            navigate("/");
        } catch (error) {
           //todo make error handling
        }
    };

    return (
        <div className="hidden md:block">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 px-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || "/placeholder.svg?height=32&width=32"} alt="User"/>
                            <AvatarFallback>{user.username?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>

                    {filteredRoutes.map((route) => (
                        <DropdownMenuItem asChild key={route.path}>
                            <Link to={route.path} className="flex cursor-pointer items-center">
                                {route.icon}
                                <span>{route.label}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}


                    <DropdownMenuItem onClick={handleLogout}>
                        <div className="flex cursor-pointer items-center">
                            <LogOut className="mr-2 h-4 w-4"/>
                            <span>Logout</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

    );
};

export default UserMenu;
