import { useState, useRef } from "react"
import { ImagePlus, X, Smile, Send } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"


const CreatePost = () => {
    const [postText, setPostText] = useState("")
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setSelectedImage(e.target?.result as string)
              //  console.log(reader.result);
            }
            reader.readAsDataURL(file)
        }

    }

    const removeImage = () => {
        setSelectedImage(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <Card className="max-w-xl mx-auto mb-6 mt-6">
            <CardContent className="p-4">
                <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your profile" />
                        <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <Textarea
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            className="min-h-[80px] border-0 focus-visible:ring-0 focus:outline-none resize-none p-0 text-sm shadow-none"
                            placeholder="What's on your mind?"
                        />

                        {selectedImage && (
                            <div className="relative mt-2 rounded-md overflow-hidden">
                                <img
                                    src={selectedImage}
                                    alt="Selected"
                                    className="max-h-60 w-auto rounded-md object-contain"
                                />
                                <button
                                    onClick={removeImage}
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
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImagePlus className="h-5 w-5 mr-1" />
                        <span className="hidden sm:inline">Photo</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Smile className="h-5 w-5 mr-1" />
                        <span className="hidden sm:inline">Emoji</span>
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    {postText.length > 0 && (
                        <span className={`text-xs ${postText.length > 280 ? "text-red-500" : "text-muted-foreground"}`}>
                          {postText.length}/280
                        </span>
                    )}
                    <Button
                        size="sm"
                        disabled={isSubmitting || (!postText.trim() && !selectedImage) || postText.length > 280}
                    >
                        <Send className="h-4 w-4 mr-1" />
                        Post
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

export default CreatePost;