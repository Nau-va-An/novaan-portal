'use client'
import { useRouter } from 'next/router'
import React, { Component, useEffect } from 'react'

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
    const router = useRouter()

    const goToSignIn = (): void => {
        router.push('/auth/signin')
    }

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div>
            <h2>Đã có lỗi xảy ra</h2>
            <button onClick={goToSignIn}>Quay về đăng nhập</button>
        </div>
    )
}

export default Error
