import {Card, CardContent, CardFooter, CardHeader} from "./ui/card";
import {Avatar} from "@radix-ui/react-avatar";

const PostSkeletonLoad = () => {
    return (
        <Card className="max-w-xl mx-auto overflow-hidden animate-pulse">
            <CardHeader className="flex flex-row items-center space-y-0 gap-3">
                <Avatar>
                    <div className="bg-gray-300 rounded-full h-10 w-10" />
                </Avatar>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-6 w-6 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="px-4 py-2 space-y-2">
                <div className="h-5 bg-gray-300 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
            </CardContent>
            <CardFooter className="px-4 py-2 flex justify-between items-center">
                <div className="flex space-x-4">
                    <div className="h-5 w-10 bg-gray-200 rounded" />
                    <div className="h-5 w-10 bg-gray-200 rounded" />
                </div>
                <div className="h-3 w-16 bg-gray-200 rounded" />
            </CardFooter>
        </Card>
    );
};

export default PostSkeletonLoad;