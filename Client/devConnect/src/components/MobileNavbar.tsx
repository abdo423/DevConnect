import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTrigger,
} from "../components/ui/sheet"
import {Menu, Search} from "lucide-react"
import {Button} from "@/components/ui/button.tsx";
import logo from '../assets/DevConnect.png';
import {Input} from "@/components/ui/input.tsx";

const MobileNavbar = () => {
    return (
        <Sheet >
            <SheetTrigger>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5"/>
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <div className="flex items-center justify-between border-b pb-4  ">
                        <div className="flex items-center gap-2 font-bold text-xl">
                            <img src={logo} alt="logo" className="w-25 h-25"/>
                        </div>
                    </div>
                    <SheetClose/>
                </SheetHeader>
                <SheetDescription>

                    <div className="mt-6 w-[90%] mx-auto">
                        <form className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                type="search"
                                placeholder="Search posts..."
                                className="w-full pl-9"
                            />
                            <Button type="submit" className="w-full mt-2">
                                Search
                            </Button>
                        </form>
                    </div>
                </SheetDescription>
                <SheetFooter className=" w-[90%] mx-auto">
                    <div className="mt-auto flex flex-col gap-2 pt-4">
                        <Button variant="outline">
                            Log in
                        </Button>
                        <Button>Sign up</Button>
                    </div>
                </SheetFooter>
            </SheetContent>

        </Sheet>
    )
}

export default MobileNavbar;