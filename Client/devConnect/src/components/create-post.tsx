import { useState, useRef } from "react";
import { ImagePlus, X, Smile, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { createPostThunk } from "@/features/Posts/postsSlice";
import { useNavigate } from "react-router-dom";

// Schema
const createPostSchema = z.object({
    title: z.string()
        .min(2, { message: "Title must be at least 2 characters long." })
        .max(50, { message: "Title must be at most 50 characters long." }),
    content: z.string()
        .min(2, { message: "Content must be at least 2 characters long." })
        .max(280, { message: "Content must be at most 280 characters long." }),
    image: z
        .string()
        .refine((val) => val === "" || val.startsWith("data:image/"), {
            message: "Invalid image format.",
        })
        .optional(),
});


type CreatePostSchema = z.infer<typeof createPostSchema>;

const CreatePost = () => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreatePostSchema>({
        resolver: zodResolver(createPostSchema),
        defaultValues: {
            title: "",
            content: "",
            image: "",
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const {user,isLoggedIn} = useSelector((state: RootState) => state.auth);

    const selectedImage = watch("image");
    const postText = watch("content");

    // Handle image upload
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("Image too large! Please choose an image under 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setValue("image", base64);
        };
        reader.readAsDataURL(file);
    };

    // Remove selected image
    const removeImage = () => {
        setValue("image", "");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Submit form
    const onSubmit = (data: CreatePostSchema) => {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }

        // Remove image field if it's an empty string
        const payload = {
            ...data,
            image: data.image?.trim() === "" ? undefined : data.image,
        };

        setIsSubmitting(true);
        dispatch(createPostThunk(payload));
        reset();
        setTimeout(() => setIsSubmitting(false), 1000);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="max-w-xl mx-auto mb-6 mt-6">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt="Profile" />
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <Input
                                placeholder="Post title"
                                className="border-0 focus-visible:ring-0 p-0 text-lg focus:outline-none shadow-none font-medium mb-1"
                                {...register("title")}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-xs mb-1">{errors.title.message}</p>
                            )}

                            <Textarea
                                className="min-h-[80px] border-0 focus-visible:ring-0 focus:outline-none resize-none p-0 text-sm shadow-none"
                                placeholder="What's on your mind?"
                                {...register("content")}
                            />
                            {errors.content && (
                                <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
                            )}

                            {selectedImage && (
                                <div className="relative mt-2 rounded-md overflow-hidden">
                                    <img
                                        src={selectedImage}
                                        alt="Selected"
                                        className="max-h-60 w-auto rounded-md object-contain"
                                    />
                                    <button
                                        onClick={removeImage}
                                        type="button"
                                        className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="px-4 py-3 border-t flex justify-between">
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImagePlus className="h-5 w-5 mr-1" />
                            <span className="hidden sm:inline">Photo</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            type="button"
                        >
                            <Smile className="h-5 w-5 mr-1" />
                            <span className="hidden sm:inline">Emoji</span>
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {postText.length > 0 && (
                            <span
                                className={`text-xs ${
                                    postText.length > 280 ? "text-red-500" : "text-muted-foreground"
                                }`}
                            >
                                {postText.length}/280
                            </span>
                        )}
                        <Button
                            size="sm"
                            type="submit"
                            disabled={
                                isSubmitting ||
                                (!postText.trim() && !selectedImage) ||
                                postText.length > 280
                            }
                        >
                            <Send className="h-4 w-4 mr-1" />
                            Post
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
    );
};

export default CreatePost;
