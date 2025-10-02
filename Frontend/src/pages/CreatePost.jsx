import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useEffect, useRef, useState } from 'react';
import RichTextEditor from '../components/RichTextEditor';
import { useNotificationStore } from '../stores/notificationStore';
import { Upload } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';

export default function CreatePost() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: { published: true, title: '', tags: '', body: '' },
  });
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  const [imageItems, setImageItems] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const onEditorUpdate = (html) => {
    setValue('body', html, { shouldValidate: true, shouldDirty: true });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length + imageItems.length > 5) {
      addNotification('Maximum 5 images allowed.',"error");
      return;
    }

    const newItems = files.map((file) => {
      if (!file.type.startsWith('image/')) {
        addNotification("Upload a valid image.","error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        addNotification("Maximum 5MB allowed.");
        return;
      } 
      return { file, url: URL.createObjectURL(file) };
    }).filter(Boolean);

    setImageItems((prev) => [...prev, ...newItems]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      imageItems.forEach((it) => it.url && URL.revokeObjectURL(it.url));
    };
    
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('title', data.title);
      submitData.append('body', data.body || '');
      
      const tagsArr = (data.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      submitData.append('tags', JSON.stringify(tagsArr));
      submitData.append('published', data.published ? 'true' : 'false');

      imageItems.forEach((it) => submitData.append('images', it.file));

      const response = await api.post('/posts', submitData);

      const slug = response?.data?.slug;
      if (slug) {
        
        imageItems.forEach((it) => it.url && URL.revokeObjectURL(it.url));
        
        reset({ published: true, title: '', tags: '', body: '' });
        setImageItems([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        navigate(`/posts/${slug}`);
      } else {
        throw new Error('Server did not return new post slug.');
      }
    } catch (err) {
      console.error(err);
      
      const msg =
        err?.response?.data?.msg || err?.message || 'Failed to create post.';
      addNotification(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-[90%] max-w-[700px] flex flex-col items-center justify-center py-4">

      <form className='w-full flex flex-col justify-center space-y-4' onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" noValidate>
        <label className="block mb-2">
          <input
            type="text"
            {...register('title', {
              required: 'Title is required.',
              minLength: { value: 3, message: 'Title must be 3+ characters long.' },
              maxLength: { value: 100, message: 'Title must not exceed 100 characters.' },
            })}
            placeholder="Title to your post"
            className="border-b border-b-black dark:border-b-white focus:outline-0 focus:border-b-2 h-[50px] w-full"
            disabled={isSubmitting}
          />
        </label>
        {errors.title && <p className="text-red-500 text-xs sm:text-sm">{errors.title.message}</p>}

        <label className="block mt-4">
          <input
            ref={fileInputRef}
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="mt-1"
            hidden
            disabled={isSubmitting}
            aria-describedby="image-help"
          />
          <button type="button" onClick={()=>fileInputRef.current?.click()}><Upload size={30}/></button>
          <div id="image-help" className="text-xs text-gray-500">You can upload up to 5 images.</div>
        </label>

        {imageItems.length > 0 && (
          <div className="h-[120px] w-full overflow-x-auto flex items-start gap-2 mt-3">
            {imageItems.map((it, i) => (
              <div key={i} className="relative inline-block">
                <img
                  className="h-[100px] w-auto rounded-md shadow-sm object-cover"
                  src={it.url}
                  alt={`Selected ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeImageAt(i)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                  aria-label={`Remove image ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <input type="hidden" {...register('body', { required: 'Body is required.' })} />

        <div className="min-h-[100px]">
          <RichTextEditor  content={watch('body') || ''} onUpdate={onEditorUpdate} editable={true} />
        </div>
        
        {errors.body && <p className="text-red-500 text-xs sm:text-sm">{errors.body.message}</p>}

        <label className="block mt-4">
          <input
            type="text"
            {...register('tags')}
            placeholder="Tags (Comma separated)"
            className="w-full border-b focus:outline-0 focus:border-b-2 px-2 py-1"
            disabled={isSubmitting}
          />
        </label>
        {errors.tags && <p className="text-red-500 text-xs sm:text-sm">{errors.tags.message}</p>}

        <label className="inline-flex items-center gap-2 mt-4">
          <input type="checkbox" {...register('published')} defaultChecked disabled={isSubmitting} />
          <span>Publish</span>
        </label>

        <button
          type="submit"
          className={`max-w-[500px] text-white mx-auto w-full h-[50px] rounded-2xl bg-blue-600`}
          disabled={isSubmitting}
        >
          {isSubmitting && <CircularProgress color="white" size={10} className="inline" />}
          {isSubmitting ? 'Posting…' : 'Post'}
        </button>
      </form>
    </div>
  );
}