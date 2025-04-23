import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

const RegisterPage  = () => {
    return (
        <div className="min-h-[350px] w-full flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
            <Card className="w-full max-w-md border border-white/20 bg-white/10 backdrop-blur-md shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                <CardHeader className="relative">
                    <CardTitle className="text-white text-2xl">Glass Effect Card</CardTitle>
                    <CardDescription className="text-white/70">A beautiful card with a modern glass effect</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4 text-white/80">
                    <p>
                        This card uses a combination of backdrop filters, transparency, and subtle borders to create a glass
                        morphism effect that's popular in modern UI design.
                    </p>
                    <p>The effect works best when placed on top of colorful backgrounds or images.</p>
                </CardContent>
                <CardFooter className="relative flex justify-between">
                    <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                        Cancel
                    </Button>
                    <Button className="bg-white/20 text-white hover:bg-white/30">Continue</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;