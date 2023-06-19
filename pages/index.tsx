import { RedirectType } from 'next/dist/client/components/redirect'
import { redirect } from 'next/navigation'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

const Home = () => {
    const router = useRouter()

    const isTokenAvailable = (): boolean => {
        const token = localStorage.getItem(process.env.AT_ID)
        return !!token
    }

    useEffect(() => {
        const tokenExist = isTokenAvailable()

        if (tokenExist) {
            router.push('/submissions/pending')
            return
        }

        router.push('/auth/signin')
    }, [router])

    return null
}

export default Home
