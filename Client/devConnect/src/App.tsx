import { Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './Pages/Home.tsx';
import RegisterPage from './Pages/Register.tsx';
import LoginPage from './Pages/Login.tsx';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store.ts';
import { fetchCurrentUser } from '@/features/Auth/authSlice.ts';
import Profile from '@/Pages/Profile.tsx';
import EditProfile from '@/Pages/EditProfile.tsx';
import PrivateRoutes from '@/components/PrivateRoutes.tsx';
import MessagePage from '@/Pages/Messeages.tsx';
function App() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/messages" element={<MessagePage />} />
        </Route>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<h1>404</h1>} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;
