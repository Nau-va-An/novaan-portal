import {
    AUTH_EMAIL_INVALID,
    AUTH_PASSWORD_TOO_SHORT,
    COMMON_EMPTY_FIELD_NOT_ALLOWED,
} from '@/common/strings'
import ErrText from '@/components/common/ErrText'
import { snowflakeCursor } from '@/utils/fun/SnowFlake'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Toaster, toast } from 'react-hot-toast'
import { useSignIn } from './services/auth.service'
import { ACCESS_TOKEN_STORAGE_KEY } from '@/common/constants'

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

    useEffect(() => {
        // Enable to see something funny
        // snowflakeCursor();
    }, [])

    useEffect(() => {
        if (token == null || token === '') {
            return
        }
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
        router.push('/submissions/pending')
    }, [token, router])

    const notifyErr = (message: string): void => {
        toast.error(message)
    }

    const redirectToSubmissions = () => {
        router.push('/submissions/pending')
    }

    const onSignIn = async (data: SignInData): Promise<void> => {
        setLoading(true)
        try {
            const payload = {
                email: data.email,
                password: data.password,
            }
            await signInWithPayload(payload)
        } catch (err) {
            notifyErr(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-screen flex items-center justify-center flex-col">
            <div>
                <h1 className="text-4xl text-cprimary-300">Nấu và Ăn</h1>
            </div>
            <form
                onSubmit={handleSubmit(onSignIn)}
                className="w-1/3 mt-12 flex flex-col items-center justify-center"
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
                                /^\w+([.-]?\w+)*(@\w+([.-]?\w+)*(\.\w{2,3})+)?$/,
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
        </div>
    )
}

export default SignIn
