import LoginForm from '@/components/LoginForm.tsx';
import loginBackground from '../assets/LoginBackground.png';

const LoginPage = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen relative overflow-hidden">
      {/* Background image */}
      <img
        src={loginBackground}
        alt="login-background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Overlay for darkening or tint (optional) */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Login Form */}
      <div className="z-20 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
