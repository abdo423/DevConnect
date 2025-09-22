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

// Schema with exact error messages that match your tests
const createPostSchema = z.object({
    title: z.string()
        .min(2, { message: "title must be at least 2 characters" })
        .max(50, { message: "title must be at most 50 characters" }),
    content: z.string()
        .min(30, { message: "content must be at least 30 characters" })
        .max(280, { message: "content must be at most 280 characters" }),
    image: z
        .string()
        .refine((val) => val === "" || val.startsWith("data:image/"), {
            message: "Invalid image format.",
        })
        .optional(),
});

type CreatePostSchema = z.infer<typeof createPostSchema>;

const CreatePost = () => {
    const [titleText, setTitleText] = useState("");
    const [contentText, setContentText] = useState("");
    const [imageData, setImageData] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        title?: string;
        content?: string;
    }>({});
    const [showErrors, setShowErrors] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);

    const {  reset } = useForm<CreatePostSchema>({
        resolver: zodResolver(createPostSchema),
        defaultValues: {
            title: "",
            content: "",
            image: "",
        },
    });

    // Handle title change
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTitleText(value);

        // Clear validation error if field becomes valid
        if (validationErrors.title && value.length >= 2) {
            setValidationErrors(prev => ({ ...prev, title: undefined }));
        }
    };

    // Handle content change
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setContentText(value);

        // Clear validation error if field becomes valid
        if (validationErrors.content && value.length >= 30) {
            setValidationErrors(prev => ({ ...prev, content: undefined }));
        }
    };

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
            setImageData(base64);
        };
        reader.readAsDataURL(file);
    };

    // Remove selected image
    const removeImage = () => {
        setImageData("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Validate form data
    const validateForm = () => {
        const errors: { title?: string; content?: string } = {};

        if (titleText.length < 2) {
            errors.title = "title must be at least 2 characters";
        }

        if (contentText.length < 30) {
            errors.content = "content must be at least 30 characters";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit form
    const onSubmit = async (data: CreatePostSchema) => {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }

        setShowErrors(true);

        if (!validateForm()) {
            return;
        }

        const payload = {
            title: titleText,
            content: contentText,
            image: imageData || undefined,
        };

        try {
            setIsSubmitting(true);
            await dispatch(createPostThunk(payload)).unwrap();
            // Reset form
            setTitleText("");
            setContentText("");
            setImageData("");
            setValidationErrors({});
            setShowErrors(false);
            reset();
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle form submission
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title: titleText,
            content: contentText,
            image: imageData,
        });
    };

    // Check if form is valid for button state
    const isFormValid = titleText.length >= 2 && contentText.length >= 30;

    return (
        <form onSubmit={handleFormSubmit}>
            <Card className="max-w-xl mx-auto mb-6 mt-6">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.avatar || " "} alt="Profile" />
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <Input
                                placeholder="Post title"
                                className="border-0 focus-visible:ring-0 p-0 text-lg focus:outline-none shadow-none font-medium mb-1"
                                value={titleText}
                                onChange={handleTitleChange}
                            />
                            {showErrors && validationErrors.title && (
                                <p className="text-red-500 text-xs mb-1" role="alert">
                                    {validationErrors.title}
                                </p>
                            )}

                            <Textarea
                                className="min-h-[80px] border-0 focus-visible:ring-0 focus:outline-none resize-none p-0 text-sm shadow-none"
                                placeholder="What's on your mind?"
                                value={contentText}
                                onChange={handleContentChange}
                            />
                            {showErrors && validationErrors.content && (
                                <p className="text-red-500 text-xs mt-1" role="alert">
                                    {validationErrors.content}
                                </p>
                            )}

                            {imageData && (
                                <div className="relative mt-2 rounded-md overflow-hidden">
                                    <img
                                        src={imageData}
                                        alt="Selected"
                                        className="max-h-60 w-auto rounded-md object-contain"
                                    />
                                    <button
                                        onClick={removeImage}
                                        type="button"
                                        className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1 text-white"
                                        aria-label="Remove image"
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
                            aria-label="Photo"
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
                        <span
                            className={`text-xs ${
                                contentText.length > 280 ? "text-red-500" : "text-muted-foreground"
                            }`}
                            data-testid="character-counter"
                        >
                            {contentText.length}/280
                        </span>
                        <Button
                            size="sm"
                            type="submit"
                            disabled={isSubmitting || !isFormValid}
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