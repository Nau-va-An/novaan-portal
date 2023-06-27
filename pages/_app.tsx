import ErrorBoundary from '@/common/components/ErrorBoundary'
import { Inter } from 'next/font/google'

import '@/styles/globals.css'
import {
    AppBar,
    Box,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material'
import { customColors } from '@/tailwind.config'
import Navbar from '@/common/components/Navbar'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }) {
    return (
        <div className={inter.className}>
            <ErrorBoundary>
                <Navbar />
                <Component {...pageProps} />
                <Toaster />
            </ErrorBoundary>
        </div>
    )
}
