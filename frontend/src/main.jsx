import { Provider } from 'react-redux'
import ReactDOM from 'react-dom/client'
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'

import store, { persistor } from './redux/store'

import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext';
import { NetworkProvider } from './contexts/NetworkContext';

import './index.css'
import './assets/custom.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <BrowserRouter>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <ThemeProvider>
                        <Toaster position="top-right" reverseOrder={false} />
                        <NetworkProvider>
                            <App />
                        </NetworkProvider>
                    </ThemeProvider>
                </PersistGate>
            </Provider>
        </BrowserRouter>
    </ErrorBoundary>
)
