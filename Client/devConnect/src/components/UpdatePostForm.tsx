import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormField, FormItem, Form } from '@/components/ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppDispatch } from '@/app/store.ts';
import { useDispatch } from 'react-redux';
import { PostUpdateThunk } from '@/features/Posts/postsSlice';

// Updated schema with optional fields
const formSchema = z.object({
  title: z.string().min(2).max(50).optional(),
  content: z.string().min(8).max(500).optional(),
  image: z.string().optional(),
});

interface Post {
  id: string;
  title: string;
  content: string;
  image: string;
}

interface UpdatePostModalProps {
  post: Post;
}

const UpdatePostModal = ({ post }: UpdatePostModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post.title,
      content: post.content,
      image: post.image,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = form;
  const imageUrlValue = watch('image');
  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const postData = {
        title: data.title || post.title,
        content: data.content || post.content,
        image: data.image || post.image,
      };

      await dispatch(
        PostUpdateThunk({
          id: post.id,
          post: postData,
        })
      ).unwrap();

      setOpen(false);
    } catch (err) {
      //todo make error handling
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setValue('image', result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex flex-row align-middle justify-center"
          variant="ghost"
          size="icon"
          aria-label="Edit post"
        >
          <Pencil className="h-5 w-5" />
          <span className="text-black">Edit post</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update post</DialogTitle>
          <DialogDescription>
            Make changes to your post here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({}) => (
                <FormItem>
                  <Label htmlFor="image-upload">Image</Label>
                  <div className="relative h-48 w-full overflow-hidden rounded-md">
                    <img
                      src={
                        imageUrlValue ||
                        post.image ||
                        'https://dummyimage.com/600x400/8c8c8c/fff'
                      }
                      alt="Post preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={triggerFileInput}
                    >
                      <Upload className="h-5 w-5 mr-1" />
                      <span>Upload</span>
                    </Button>
                    {imageFile && (
                      <span className="text-sm text-muted-foreground">
                        {imageFile.name}
                      </span>
                    )}
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePostModal;
