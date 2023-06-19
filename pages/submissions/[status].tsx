import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

const SubmissionsView = () => {
    const router = useRouter()

    useEffect(() => {
        console.log(router.query.status)
    }, [router])

    return <h1 className="text-6xl text-center">{router.query.status}</h1>
}

export default SubmissionsView
