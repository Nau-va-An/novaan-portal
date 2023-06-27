import UnauthorizedError from './errors/Unauthorized'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import {
    ACCESS_TOKEN_STORAGE_KEY,
    DEFAULT_API_TIMEOUT,
    DEFAULT_API_URL,
} from './constants'

interface RequestConfig {
    timeout: number
    authorizationRequired: boolean
}

enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

export const useFetch = (config: RequestConfig) => {
    const router = useRouter()

    const getDefaultConfig = (): RequestConfig => {
        return {
            timeout: DEFAULT_API_TIMEOUT,
            authorizationRequired: false,
        }
    }

    config = config || getDefaultConfig()

    const getHeaders = useCallback(
        async (accessTokenRequired: boolean = false): Promise<Headers> => {
            const headers = new Headers()
            headers.append('Content-Type', 'application/json')
            headers.append('Accept', 'application/json')
            headers.append(
                'Access-Control-Allow-Origin',
                'http://localhost:3000'
            )
            headers.append(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept, Authorization'
            )

            if (accessTokenRequired) {
                // Get access token from secure storage
                const accessToken = localStorage.getItem(
                    ACCESS_TOKEN_STORAGE_KEY
                )
                if (accessToken == null) {
                    throw new UnauthorizedError()
                }
                headers.append('Authorization', `Bearer ${accessToken}`)
            }

            return headers
        },
        []
    )

    const handleServerError = useCallback(
        (error: Error) => {
            // Return to sign in page if unauthorized
            if (error instanceof UnauthorizedError) {
                router.push('/auth/signin')
                return true
            }

            return false
        },
        [router]
    )

    const sendBaseRequest = useCallback(
        async (url: string, method: HttpMethod, body?: any): Promise<any> => {
            try {
                const requestConfig = config || getDefaultConfig()
                const headers = await getHeaders(
                    requestConfig.authorizationRequired
                )

                // Use signal to avoid running the request for too long
                // Docs for canceling fetch API request
                // https://javascript.info/fetch-abort
                const timeout = requestConfig.timeout
                const controller = new AbortController()
                if (isNaN(timeout) || timeout <= 0) {
                    throw new Error(
                        'Timeout value is not valid. Please reconfig in .env'
                    )
                }

                const timeoutId = setTimeout(() => {
                    controller.abort()
                }, timeout)

                const response = await fetch(`${DEFAULT_API_URL}${url}`, {
                    method,
                    headers,
                    body: JSON.stringify(body),
                    signal: controller.signal,
                })

                if (response.status === 401) {
                    throw new UnauthorizedError()
                }

                clearTimeout(timeoutId)

                // Avoid empty response body from server
                try {
                    const body = await response.json()
                    return body
                } catch {
                    return true
                }
            } catch (err) {
                if (handleServerError(err)) {
                    return
                }

                throw err
            }
        },
        [config, getHeaders, handleServerError]
    )

    const getReq = useCallback(
        async (url: string): Promise<any> => {
            return sendBaseRequest(url, HttpMethod.GET)
        },
        [sendBaseRequest]
    )

    const postReq = useCallback(
        async <T>(url: string, body: T): Promise<any> => {
            return sendBaseRequest(url, HttpMethod.POST, body)
        },
        [sendBaseRequest]
    )

    const putReq = useCallback(
        async <T>(url: string, body: T): Promise<any> => {
            return sendBaseRequest(url, HttpMethod.PUT, body)
        },
        [sendBaseRequest]
    )

    const deleteReq = useCallback(
        async (url: string): Promise<any> => {
            return sendBaseRequest(url, HttpMethod.DELETE)
        },
        [sendBaseRequest]
    )

    return { getReq, postReq, putReq, deleteReq }
}
