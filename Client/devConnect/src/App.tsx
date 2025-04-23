import {Routes,Route} from  "react-router-dom"
import './App.css'
import HomePage from "./Pages/Home.tsx";
import RegisterPage from "./Pages/Register.tsx";
import LoginPage from "./Pages/Login.tsx";
function App() {

  return (
    <>
     <Routes>
         <Route path="/" element={<HomePage />} />
         <Route path="/register" element={<RegisterPage/>}/>
         <Route path="/login" element={<LoginPage/>}/>
         <Route path="*" element={<h1>404</h1>}/>
     </Routes>
    </>
  )
}

export default App
