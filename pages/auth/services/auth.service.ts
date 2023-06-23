import { useFetch } from '@/common/baseApi'
import { NextApiRequest, NextApiResponse } from 'next'
import { useState } from 'react'
import { TypeOf, object, string } from 'zod'

const SignInBody = object({
    usernameOrEmail: string().regex(
        /^\w+([.-]?\w+)*(@\w+([.-]?\w+)*(\.\w{2,3})+)?$/
    ),
    password: string().min(8),
})

export const useSignIn = () => {
    const { postReq } = useFetch({
        authorizationRequired: false,
        timeout: 10000,
    })

    const [requested, setRequested] = useState(false)
    const [token, setToken] = useState('')

    const signInWithPayload = async (payload: TypeOf<typeof SignInBody>) => {
        if (requested) {
            return
        }

        const signInResponse = await postReq('auth/signin', payload)
        if (signInResponse == null || !('token' in signInResponse)) {
            return
        }

        setToken(signInResponse.token)
    }

    return { token, signInWithPayload }
}
