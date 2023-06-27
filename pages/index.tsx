import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { ACCESS_TOKEN_STORAGE_KEY } from '@/common/constants'

const Home = () => {
    const router = useRouter()

    const isTokenAvailable = (): boolean => {
        const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
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
