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

const defaultConfig: RequestConfig = {
    timeout: DEFAULT_API_TIMEOUT,
    authorizationRequired: false,
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
        const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
        if (accessToken == null) {
            throw new UnauthorizedError()
        }
        headers.append('Authorization', `Bearer ${accessToken}`)
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
                router.push('/auth/signin')
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

                const result = await response.json()
                return result
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
