import {Menu, Search} from "lucide-react"
import {Link} from "react-router-dom"
import {useDispatch} from "react-redux"
import {useNavigate} from "react-router-dom"
import {AppDispatch} from "@/app/store.ts"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTrigger,
} from "@/components/ui/sheet"
import logo from "../assets/DevConnect.png"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx"
import {DialogTitle} from "@radix-ui/react-dialog";
import {logout} from "@/features/Auth/authSlice.ts";

interface Route {
    path: string;
    label: string;
    icon: React.ReactNode;
}

interface MobileNavbarProps {
    isLoggedIn: boolean;
    user?: {
        username: string;
        email: string;
        avatar?: string;
    },
    filteredRoutes: Route[];
}

const MobileNavbar = ({isLoggedIn, user, filteredRoutes}: MobileNavbarProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const handleLogout = async () => {
        dispatch(logout());
        navigate("/");
    }
    return (
        <Sheet>

            <DialogTitle>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5"/>
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
            </DialogTitle>
            <SheetContent>
                <SheetHeader>
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-2 font-bold text-xl">
                            <img src={logo || "/placeholder.svg"} alt="logo" className="w-25 h-25"/>
                        </div>
                    </div>
                    <SheetClose/>
                </SheetHeader>
                <SheetDescription asChild>
                    <div>
                        <div className="mt-6 w-[90%] mx-auto">
                            <form className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input type="search" placeholder="Search posts..." className="w-full pl-9"/>
                                <Button type="submit" className="w-full mt-2">
                                    Search
                                </Button>
                            </form>
                        </div>
                        {isLoggedIn && (
                            <div className="mt-6 w-[90%] mx-auto">
                                <div className="flex flex-col space-y-2">
                                    {filteredRoutes.map((route) => (
                                        <Button key={route.path} variant="ghost" asChild className="justify-start">
                                            <Link to={route.path} className="flex items-center">
                                                <span>{route.icon}</span><span className="text-muted-foreground">{route.label}</span>
                                            </Link>
                                        </Button>
                                    ))}

                                    <Button onClick={handleLogout} variant="ghost"
                                            className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                                            Logout
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </SheetDescription>
                {isLoggedIn && user ? (
                    <SheetFooter className="w-[90%] mx-auto border-t">
                        <div className="mt-auto w-full pt-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"}
                                                 alt={user.username}/>
                                    <AvatarFallback>{user.username?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-medium text-black">{user.username}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </SheetFooter>
                ) : (
                    <SheetFooter className="w-[90%] mx-auto">
                        <div className="mt-auto flex flex-col gap-2 pt-4">
                            <Button variant="outline" >
                                <Link to="/login">Log in</Link>
                            </Button>
                            <Button >
                                <Link to="/register">Sign up</Link>
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default MobileNavbar