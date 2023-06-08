import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import SignIn from './auth/SignIn'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    return (
        <>
            <SignIn />
        </>
    )
}
