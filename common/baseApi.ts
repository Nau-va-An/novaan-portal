import UnauthorizedError from './errors/Unauthorized'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import {
    ACCESS_TOKEN_STORAGE_KEY,
    DEFAULT_API_TIMEOUT,
    DEFAULT_API_URL,
} from './constants'
import { config } from 'dotenv'
import BadRequestError from './errors/BadRequest'
import { Undefinable } from './types/types'
import { getTokenPayload } from './utils/jwtoken'
import { AuthToken } from './types/token.type'
import moment from 'moment'
import { toast } from 'react-hot-toast'

// GLOBAL IN-MEMORY VARIABLE (DO NOT TOUCH)
let tokenExpTimestamp: number = -1
let currentToken = ''

const REFRESH = 'auth/refreshtoken'

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

export const responseObjectValid = (target: any): boolean => {
    if (typeof target !== 'object' || target == null) {
        return false
    }
    if (target.success != null && target.success === false) {
        return false
    }
    return true
}

const defaultConfig: RequestConfig = {
    timeout: Number(DEFAULT_API_TIMEOUT),
    authorizationRequired: false,
}

const isTimestampExpired = (exp: number): boolean => {
    return moment.unix(exp).diff(moment()) <= 5000
}

const getNewTokenIfExpired = async (currentToken: string): Promise<string> => {
    let exp = tokenExpTimestamp

    // If there are no cache exp, read exp from currentToken (and cache that)
    if (exp < 0) {
        const tokenPayload = getTokenPayload<AuthToken>(currentToken)

        if (tokenPayload.exp == null) {
            throw new UnauthorizedError()
        }
        exp = Number(tokenPayload.exp)
        tokenExpTimestamp = exp
    }

    if (isTimestampExpired(exp)) {
        // Try to refresh token
        const newToken = await refreshToken(currentToken)
        if (newToken == null) {
            throw new UnauthorizedError()
        }

        // Save new token into keychain store
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, newToken)

        // Cache new token exp into device memory
        const newPayload = getTokenPayload<AuthToken>(newToken)
        tokenExpTimestamp = Number(newPayload.exp)

        return newToken
    }

    // Return currentToken if it is still usable
    return currentToken
}

const refreshToken = async (oldToken: string): Promise<Undefinable<string>> => {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    headers.append('Accept', 'application/json')
    headers.append(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    headers.append('Authorization', `Bearer ${oldToken}`)

    const response = await fetch(`${DEFAULT_API_URL}${REFRESH}`, {
        headers,
        body: '{}',
        method: 'POST',
    })
    if (!response.ok) {
        return undefined
    }

    const body = await response.json()

    if (!responseObjectValid(body)) {
        return undefined
    }

    return body.token as string
}

const getHeaders = async (
    accessTokenRequired: boolean = false
): Promise<Headers> => {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    headers.append('Accept', 'application/json')
    headers.append('Access-Control-Allow-Origin', 'http://localhost:3000')
    headers.append(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )

    if (accessTokenRequired) {
        // Get access token from secure storage
        let currentToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
        if (currentToken == null) {
            throw new UnauthorizedError()
        }

        // Check current token before sending request
        currentToken = await getNewTokenIfExpired(currentToken)
        headers.append('Authorization', `Bearer ${currentToken}`)
    }

    return headers
}

const sendBaseRequest = async (
    url: string,
    method: HttpMethod,
    config: RequestConfig,
    body?: any
): Promise<Response> => {
    const requestConfig = { ...defaultConfig, ...config }
    const headers = await getHeaders(requestConfig.authorizationRequired)

    // Use signal to avoid running the request for too long
    // Docs for canceling fetch API request
    // https://javascript.info/fetch-abort
    const timeout = requestConfig.timeout
    const controller = new AbortController()
    if (isNaN(timeout) || timeout <= 0) {
        throw new Error('Timeout value is not valid. Please reconfig in .env')
    }

    const timeoutId = setTimeout(() => {
        controller.abort()
    }, timeout)

    let response: Response
    try {
        response = await fetch(`${DEFAULT_API_URL}${url}`, {
            method,
            headers,
            body: JSON.stringify(body),
            signal: controller.signal,
        })
    } catch (error) {
        console.log('Error', error)
    }

    if (!response.ok) {
        switch (response.status) {
            case 400:
                throw new BadRequestError()
            case 401:
                throw new UnauthorizedError()
            case 403:
                throw new UnauthorizedError()
            default:
                throw new Error('Unknown error')
        }
    }

    clearTimeout(timeoutId)
    return response
}

export const useFetch = (config: RequestConfig) => {
    const router = useRouter()

    const handleServerError = useCallback(
        (error: Error) => {
            // Return to sign in page if unauthorized
            if (error instanceof UnauthorizedError) {
                toast.error('Failed to load content. Unauthorized')
                return true
            }

            throw error
        },
        [router]
    )

    const sendRequest = useCallback(
        async (url: string, method: HttpMethod, body?: any): Promise<any> => {
            try {
                const response = await sendBaseRequest(
                    url,
                    method,
                    config,
                    body
                )
                try {
                    const result = await response.json()
                    return result
                } catch {
                    if (response.ok) {
                        return { success: true }
                    } else {
                        return { success: false, statusCode: response.status }
                    }
                }
            } catch (error) {
                if (handleServerError(error)) {
                    return {}
                }
                throw error
            }
        },
        [config, handleServerError]
    )

    const getReq = useCallback(
        async (url: string): Promise<any> => {
            return sendRequest(url, HttpMethod.GET)
        },
        [sendRequest]
    )

    const postReq = useCallback(
        async <T>(url: string, body: T): Promise<any> => {
            return sendRequest(url, HttpMethod.POST, body)
        },
        [sendRequest]
    )

    const putReq = useCallback(
        async <T>(url: string, body: T): Promise<any> => {
            return sendRequest(url, HttpMethod.PUT, body)
        },
        [sendRequest]
    )

    const deleteReq = useCallback(
        async (url: string): Promise<any> => {
            return sendRequest(url, HttpMethod.DELETE)
        },
        [sendRequest]
    )

    return { getReq, postReq, putReq, deleteReq }
}
