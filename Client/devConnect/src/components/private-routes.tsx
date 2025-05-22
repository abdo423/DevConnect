import {Outlet, Navigate} from 'react-router-dom'
import {useSelector} from "react-redux";
import {RootState} from "@/app/store";
import Cookies from 'js-cookie';
// interface PrivateRouteProps {
//     children: React.ReactNode;
//
// }

// const PrivateRoute = ({children, ...rest}: PrivateRouteProps) => {
//     let auth = {'token': Cookies.get('auth-token')};
//     return (
//         <Route {...rest}>
//             {!auth.token
//                 ?
//                 <Navigate to="/login"/>
//                 :
//                 children}
//         </Route>
//     )
// }
const PrivateRoutes = () => {
    const token = Cookies.get("auth-token") // or use js-cookie
    const {loading} = useSelector((state: RootState) => state.auth);
    if (loading) return <div>Loading...</div>;
    return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;