import ErrorBoundary from '@/common/components/error'
import { Inter } from 'next/font/google'

import '@/styles/globals.css'
import Navbar from '@/components/common/navbar/Navbar'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }) {
    return (
        <div className={inter.className}>
            <Navbar />
            <Component {...pageProps} />
            <Toaster />
        </div>
    )
}
