import {Routes, Route} from "react-router-dom"
import './App.css'
import HomePage from "./Pages/Home.tsx";
import RegisterPage from "./Pages/Register.tsx";
import LoginPage from "./Pages/Login.tsx";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/app/store.ts";
import {fetchCurrentUser} from "@/features/Auth/authSlice.ts";
import Profile from "@/Pages/Profile.tsx";
function App() {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/profile/:id" element={<Profile/>}/>
                <Route path="*" element={<h1>404</h1>}/>
            </Routes>
        </>
    )
}

export default App
