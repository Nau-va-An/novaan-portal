import ErrorBoundary from '@/common/components/ErrorBoundary'
import { Inter } from 'next/font/google'

import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }) {
    return (
        <main className={inter.className}>
            <ErrorBoundary>
                <Component {...pageProps} />
            </ErrorBoundary>
        </main>
    )
}
