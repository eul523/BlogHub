import { useForm } from "react-hook-form";
import { Form, useNavigate, Link, useSearchParams } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from "react-hot-toast";
import GoogleIcon from '@mui/icons-material/Google';

export default function Register(){
    const { register, handleSubmit, formState : { errors, isSubmitting }} = useForm();
    const { register:registerUser , error:authError, isAuthenticated, checkAuth } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/';
    
        const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };
    

    const onSubmit = async (data) => {
        try{
            await registerUser(data.name, data.email, data.password );
            navigate(redirectTo);
        }catch(err){

        }
    }

    if(authError)toast.error(authError);

    return (
        <div className="m-auto flex flex-col justify-center items-center w-[90%]">
            {isAuthenticated && <p className="text-green-500 font-medium">Registered successfully.</p>}

            <div className="mt-8 w-full">
                <Form method="post" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 mx-auto justify-center items-center">
                    <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name should be atleast 2 characters long.' } })} type="text" className="max-w-[700px] w-full border-2 rounded-2xl pl-2 h-[50px] outline-gray-800 focus:outline-2 focus:outline-gray-600" placeholder="Name"></input>
                    {errors.name && <p className="text-red-500 text-xs sm:text-sm">{errors.name.message}</p>}

                    <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} type="email" className="max-w-[700px] w-full border-2 rounded-2xl pl-2 h-[50px] outline-gray-800 focus:outline-2 focus:outline-gray-600" placeholder="Email"></input>
                    {errors.email && <p className="text-red-500 text-xs sm:text-sm">{errors.email.message}</p>}
                    

                    <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be atleast 6 characters.' } })} type="password" className="max-w-[700px] w-full border-2 rounded-2xl pl-2 h-[50px] outline-gray-800 focus:outline-2 focus:outline-gray-600" placeholder="Password"></input>
                    {errors.password && <p className="text-red-500 text-xs sm:text-sm">{errors.password.message}</p>}

                    <button className="max-w-[700px] w-full h-[50px] rounded-2xl bg-blue-600 text-white" type="submit" disabled={isSubmitting}>{isSubmitting && <CircularProgress color="white" size={10} className="inline" />}{isSubmitting ? "Submitting" : "Submit"}</button>
                </Form>

                <p className="py-4 w-fit mx-auto text-sm">Already have an account? <Link className="underline" to={`/login?redirectTo=${redirectTo}`}>Login here.</Link></p>
            </div>

            <p>or</p>

            <button
        onClick={handleGoogleLogin}
        className="w-full max-w-sm mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex gap-2 items-center justify-center"
      >
        <GoogleIcon/>
        Continue with Google
      </button>

        </div>
    )

}