import {
    AUTH_EMAIL_INVALID,
    AUTH_FAILED,
    AUTH_PASSWORD_TOO_SHORT,
    COMMON_EMPTY_FIELD_NOT_ALLOWED,
} from '@/common/strings'
import ErrText from '@/components/common/ErrText'
import { snowflakeCursor } from '@/utils/fun/SnowFlake'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Toaster, toast } from 'react-hot-toast'
import { useSignIn } from './services/auth.service'
import { ACCESS_TOKEN_STORAGE_KEY } from '@/common/constants'
import { getTokenPayload } from '@/common/utils/jwtoken'
import { AuthToken } from '@/common/types/token.type'
import BadRequestError from '@/common/errors/BadRequest'
import { throttle } from 'lodash'
import moment from 'moment'

type SignInData = {
    email: string
    password: string
}

const SignIn = () => {
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'all',
    })

    const { token, signInWithPayload } = useSignIn()

    const handleSignIn = useCallback(
        throttle(
            async (data: SignInData): Promise<void> => {
                try {
                    const payload = {
                        email: data.email,
                        password: data.password,
                    }
                    await signInWithPayload(payload)
                } catch (err) {
                    if (err instanceof BadRequestError) {
                        notifyErr(AUTH_FAILED)
                    }
                }
            },
            2000,
            { leading: true }
        ),
        []
    )

    const onSignIn = async (data: SignInData): Promise<void> => {
        await handleSignIn(data)
    }

    const onSuccessfulSignIn = () => {
        router.push('/submissions/pending')
    }

    useEffect(() => {
        // Enable to see something funny
        // snowflakeCursor();

        // Persistent sign in
        const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
        const payload = getTokenPayload<AuthToken>(token)

        console.log('payload', payload)

        // Check exp and redirect if needed
        const isExpired = moment().diff(moment.unix(payload.exp)) >= 0
        if (isExpired) {
            return
        }

        onSuccessfulSignIn()
    }, [])

    useEffect(() => {
        if (token == null || token === '') {
            return
        }

        // Reject the request if user trying to signin
        const payload = getTokenPayload<AuthToken>(token)
        if (payload.urole === 'User') {
            notifyErr('Người dùng không được phép đăng nhập vào Admin Portal')
            return
        }

        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
        onSuccessfulSignIn()
    }, [token, router])

    const notifyErr = (message: string): void => {
        toast.error(message, { duration: 2000 })
    }

    return (
        <div className="h-screen flex items-center justify-center flex-col">
            <div>
                <h1 className="text-4xl text-cprimary-300">Nấu và Ăn</h1>
            </div>
            <form
                onSubmit={handleSubmit(onSignIn)}
                className="w-2/3 max-w-xl mt-12 flex flex-col items-center justify-center"
            >
                <div className="flex flex-col w-full">
                    <label htmlFor="email">Email</label>
                    <input
                        type="text"
                        id="email"
                        placeholder="Enter email"
                        className="mt-2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        {...register('email', {
                            required: true,
                            pattern:
                                /^\w+([.-]?\w+)*(@\w+([.-]?\w+)*\.\w{2,3})+$/,
                        })}
                    />
                    <div className="mt-2">
                        {errors.email?.type === 'required' && (
                            <ErrText>{COMMON_EMPTY_FIELD_NOT_ALLOWED}</ErrText>
                        )}
                        {errors.email?.type === 'pattern' && (
                            <ErrText>{AUTH_EMAIL_INVALID}</ErrText>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex flex-col w-full">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter password"
                        className="mt-2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        {...register('password', { required: true, min: 8 })}
                    />
                    <div className="mt-2">
                        {errors.password?.type === 'required' && (
                            <ErrText>{COMMON_EMPTY_FIELD_NOT_ALLOWED}</ErrText>
                        )}
                        {errors.password?.type === 'min' && (
                            <ErrText>{AUTH_PASSWORD_TOO_SHORT}</ErrText>
                        )}
                    </div>
                </div>
                <button className="mt-8 px-4 py-2 rounded-lg bg-cprimary-300 text-white">
                    Sign In
                </button>
            </form>
            <Toaster />
        </div>
    )
}

export default SignIn
