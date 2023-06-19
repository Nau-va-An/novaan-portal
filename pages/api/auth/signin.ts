import { NextApiRequest, NextApiResponse } from 'next'
import { TypeOf, object, string } from 'zod'
import ErrorResponse from '../common/types/ErrorResponse'
import BaseApi from '../baseApi'
import { sign } from 'crypto'

const SignInBody = object({
    usernameOrEmail: string().regex(
        /^\w+([.-]?\w+)*(@\w+([.-]?\w+)*(\.\w{2,3})+)?$/
    ),
    password: string().min(8),
})

interface SignInRequest extends NextApiRequest {
    body: TypeOf<typeof SignInBody>
}

export default async function authHandler(
    req: SignInRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' })
        return
    }

    try {
        const baseApi = new BaseApi()

        const signInRes = await baseApi.post('auth/signin', req.body)
        const result = await signInRes.json()
        if (!signInRes.ok) {
            res.status(signInRes.status).json(result)
        }
        res.status(200).json({ token: result.token })
        return
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
