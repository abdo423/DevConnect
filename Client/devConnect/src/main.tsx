import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router";
import {setupStore} from './app/store'
import {Provider} from 'react-redux'
const store = setupStore()
createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <BrowserRouter>
            <StrictMode>
                <App/>
            </StrictMode>
        </BrowserRouter>

    </Provider>
    ,
)
