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
import {login} from "@/features/Auth/authSlice";
import {useSelector, useDispatch} from "react-redux";
import type {AppDispatch, RootState} from "../app/store";
import {Link,useNavigate} from "react-router-dom";
import {User, Lock} from "lucide-react";
import {useState} from "react"; // 👈 Add this
//import axios from 'axios';
import FormSuccess from "./FormSuccess.tsx";
import FormError from "./FormError.tsx";
import ApiError from "../../Types/apiError.ts";


const formSchema = z.object({
    email: z.string().min(8).max(50).email(),
    password: z.string().min(8).max(50),
});

const LoginForm = () => {
    const { loading} = useSelector((state: RootState) => state.auth);
    const [status, setStatus] = useState<{ success: string; error: string }>({
        success: '',
        error: ''
    });

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleLogin = (data: z.infer<typeof formSchema>) => {
        dispatch(login({ email: data.email, password: data.password }))
            .unwrap()
            .then((result) => {
                setStatus({ error: "", success: result.message || "Login successful" });
                navigate("/");
                form.reset();
            })
            .catch((error: unknown) => {
                let errorMessage = "Authentication failed";

                // Narrow type from unknown → ApiError
                if (typeof error === "string") {
                    errorMessage = error;
                } else if (error && typeof error === "object" && "message" in error) {
                    errorMessage = (error as ApiError).message || errorMessage;
                }

                setStatus({ success: "", error: errorMessage });
            });
    };

    return (
        <Card
            className="w-full max-w-md border border-white/30 bg-white/10 backdrop-blur-xl shadow-2xl text-white rounded-xl relative overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 pointer-events-none"/>

            <CardHeader className="relative text-white">
                <CardTitle className="text-3xl drop-shadow-sm">Login</CardTitle>
                <CardDescription className="text-white/80 drop-shadow-sm">
                    Log in to your account.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(handleLogin)}>
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
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <div className="flex items-center justify-between mb-2">
                                        <FormLabel className="text-white">Password</FormLabel>
                                        <Link
                                            to="/forgot-password"
                                            className="text-sm text-white/80 hover:text-white underline underline-offset-4"
                                        >
                                            Forgot your password?
                                        </Link>
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
                        <FormSuccess message={status.success} />
                        <FormError message={status.error } />
                        <Button
                            disabled={loading}
                            type="submit"
                            className="w-full  text-white font-semibold cursor-pointer"
                        >
                            Login
                        </Button>

                        <div className="text-center text-sm text-white">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="text-white underline underline-offset-4 hover:text-white/90"
                            >
                                Sign up
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default LoginForm;
