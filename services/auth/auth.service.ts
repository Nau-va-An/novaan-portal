import { useState } from 'react'
import { useFetch } from '@/common/baseApi'
import { TypeOf, object, string } from 'zod'

const SignInBody = object({
    email: string().regex(/^\w+([.-]?\w+)*(@\w+([.-]?\w+)*(\.\w{2,3})+)?$/),
    password: string().min(8),
})

export const useSignIn = () => {
    const { postReq } = useFetch({
        authorizationRequired: false,
        timeout: 10000,
    })

    const [token, setToken] = useState('')

    const signInWithPayload = async (payload: TypeOf<typeof SignInBody>) => {
        const signInResponse = await postReq('auth/signin', payload)
        if (signInResponse == null || !('token' in signInResponse)) {
            return
        }

        setToken(signInResponse.token)
    }

    return { token, signInWithPayload }
}
