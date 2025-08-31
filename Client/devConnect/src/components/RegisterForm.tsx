import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {register} from "@/features/Auth/authSlice";
import {useSelector, useDispatch} from "react-redux";
import type {AppDispatch, RootState} from "../app/store";
import {User, Lock, AtSign} from "lucide-react";
import {useState} from "react";
//import axios from 'axios';
import FormSuccess from "./FormSuccess.tsx";
import FormError from "./FormError.tsx";

const formSchema = z.object({
    email: z.string().min(2).max(50),
    password: z.string().min(8).max(50),
    username: z.string().min(8).max(50),
});

const RegisterForm = () => {
    const { loading} = useSelector((state: RootState) => state.auth);
    const [status, setStatus] = useState<{ success: string; error: string }>({
        success: '',
        error: ''
    });

    const dispatch = useDispatch<AppDispatch>();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            username: ""
        },
    });

    const handleRegister = (data: z.infer<typeof formSchema>) => {
        dispatch(register({
            email: data.email,
            password: data.password,
            username: data.username
        }))
            .unwrap()
            .then((result) => {

                setStatus({
                    error: "",
                    success: result.message || "Registration successful"
                });
                form.reset();
                window.location.href = "/login";
            })
            .catch((error) => {
                // Extract the error message from backend response
                const errorMessage =
                error || "Registration failed";
                setStatus({
                    success: "",
                    error: errorMessage
                });
            });
    };



    return (
        <Card
            className="w-full max-w-md border border-white/30 bg-white/10 backdrop-blur-xl shadow-2xl text-white rounded-xl relative overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 pointer-events-none"/>

            <CardHeader className="relative text-white">
                <CardTitle className="text-3xl drop-shadow-sm">Register</CardTitle>
                <CardDescription className="text-white/80 drop-shadow-sm">
                    create a new  account.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(handleRegister)}>
                        <FormField
                            disabled={loading}

                            control={form.control}
                            name="username"
                            render={({field}) => (
                                <FormItem>
                                    <div className="flex items-center justify-between mb-2">
                                        <FormLabel className="text-white">Username</FormLabel>

                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                className="pl-10 text-white placeholder-white/60 bg-white/10 border border-white/30 focus:border-white focus:ring-white"
                                                placeholder="Enter your username"
                                                {...field}
                                            />
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
                                                  size={18}/>
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            disabled={loading}
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                className="pl-10 text-white placeholder-white/60 bg-white/10 border border-white/30 focus:border-white focus:ring-white"
                                                placeholder="Enter your Email"
                                                {...field}
                                            />
                                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
                                                    size={18}/>
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            disabled={loading}

                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <div className="flex items-center justify-between mb-2">
                                        <FormLabel className="text-white">Password</FormLabel>

                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type="password"
                                                className="pl-10 text-white placeholder-white/60 bg-white/10 border border-white/30 focus:border-white focus:ring-white"
                                                placeholder="Enter your password"
                                                {...field}
                                            />
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
                                                  size={18}/>
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormSuccess message={status.success}/>
                        <FormError message={status.error}/>
                        <Button
                            disabled={loading}
                            type="submit"
                            className="w-full  text-white font-semibold cursor-pointer"
                        >
                            Register
                        </Button>


                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default RegisterForm;
