import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, User } from "lucide-react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import {updateProfileThunk} from "@/features/Profile/profileSlice.ts";
import {updateUser} from "@/features/Auth/authSlice.ts";

// Step 1: Define schema
const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    avatar: z.string().min(1, "Avatar is required"),
    bio: z.string().min(20, "Bio must be at least 20 characters"),
});

// Step 2: Define form types
type ProfileFormValues = z.infer<typeof formSchema>;

const EditProfile = () => {

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const {user} = useSelector((state: RootState) => state.auth);
    const {profile} = useSelector((state: RootState) => state.profile);

    const [isLoading, setIsLoading] = useState(false);
    // Step 3: Initialize form
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: user?.username || "",
            avatar: user?.avatar || "",
            bio: user?.bio || "",
        },
    });
    if(!user) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg font-medium text-muted-foreground">Redirecting to profile...</p>
            </div>
        </div>
    )
    const { control, handleSubmit, setValue } = form;

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setValue("avatar", event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        try {
            await dispatch(updateProfileThunk({ id: user?._id, profile: data })).unwrap().then((result)=>{
                dispatch(updateUser(result.user));
            })
            navigate(-1);
        } catch (error) {
            console.error("Failed to update profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-2xl mx-auto">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                        <CardTitle className="text-slate-800">Edit Profile</CardTitle>
                        <CardDescription className="text-slate-500">
                            Edit your profile details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Avatar Field */}
                                <FormField
                                    control={control}
                                    name="avatar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Avatar</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col items-center space-y-4">
                                                    <div className="relative">
                                                        <Avatar className="h-24 w-24 border-2 border-emerald-100">
                                                            <AvatarImage
                                                                src={field.value || "/placeholder.svg"}
                                                                alt={user?.username || "avatar"}
                                                                className="object-cover"
                                                            />
                                                            <AvatarFallback className="bg-emerald-50 text-emerald-600">
                                                                <User className="h-10 w-10" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute bottom-0 right-0">
                                                            <FormLabel htmlFor="avatar" className="cursor-pointer">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-colors">
                                                                    <Camera className="h-4 w-4" />
                                                                    <span className="sr-only">Upload avatar</span>
                                                                </div>
                                                            </FormLabel>
                                                            <Input
                                                                id="avatar"
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={handleAvatarChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Username Field */}
                                <FormField
                                    control={control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Bio Field */}
                                <FormField
                                    control={control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}

                                                    id="bio"
                                                    placeholder="Write a short bio about yourself"
                                                    rows={4}
                                                    className="resize-none border-slate-200 focus-visible:ring-emerald-500"
                                                />
                                            </FormControl>
                                            <p className="text-sm text-slate-500">
                                                Your bio will be displayed on your public profile.
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Footer Buttons */}
                                <CardFooter className="flex justify-between border-t border-slate-200 pt-6">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-800"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save changes"
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EditProfile;
