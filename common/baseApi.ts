import { Undefinable } from '@/common/types'
import dotenv from 'dotenv'
import UnauthorizedError from './errors/Unauthorized'
import { useRouter } from 'next/router'
dotenv.config()

const API_URL = 'http://localhost:8000/api/'
const API_TIMEOUT = 3000
const ACCESS_TOKEN_ID = 'AccessToken'

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
            timeout: API_TIMEOUT,
            authorizationRequired: false,
        }
    }

    config = config || getDefaultConfig()
    const apiUrl = API_URL
    const accessTokenId = ACCESS_TOKEN_ID || 'AccessToken'

    const getHeaders = async (
        accessTokenRequired: boolean = false
    ): Promise<Headers> => {
        const headers = new Headers()
        headers.append('Content-Type', 'application/json')
        // headers.append('Accept', '*/*')
        // headers.append('Access-Control-Allow-Origin', "http://localhost:3000")
        // headers.append(
        //     'Access-Control-Allow-Headers',
        //     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        // )

        if (accessTokenRequired) {
            // Get access token from secure storage
            const accessToken = localStorage.getItem(accessTokenId)
            if (accessToken == null) {
                throw new Error('Access token not found')
            }
            headers.append('Authorization', `Bearer ${accessToken}`)
        }

        return headers
    }

    const handleServerError = (error: Error) => {
        console.log(error.message)

        // Return to sign in page if unauthorized
        if (error instanceof UnauthorizedError) {
            router.push('/auth/signin')
            return
        }
        // router.push('/errors')
    }

    const sendBaseRequest = async (
        url: string,
        method: HttpMethod,
        body?: any
    ): Promise<any> => {
        const requestConfig = config || getDefaultConfig()
        const headers = await getHeaders(requestConfig.authorizationRequired)

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

        try {
            const response = await fetch(`${apiUrl}${url}`, {
                method,
                headers,
                body: JSON.stringify(body),
                signal: controller.signal,
            })

            if (response.status === 401) {
                throw new UnauthorizedError()
            }

            clearTimeout(timeoutId)
            return response.json()
        } catch (err) {
            handleServerError(err)
            return null
        }
    }

    const getReq = async (url: string): Promise<any> => {
        return sendBaseRequest(url, HttpMethod.GET)
    }

    const postReq = async <T>(url: string, body: T): Promise<any> => {
        return sendBaseRequest(url, HttpMethod.POST, body)
    }

    const putReq = async <T>(url: string, body: T): Promise<any> => {
        return sendBaseRequest(url, HttpMethod.PUT, body)
    }

    const deleteReq = async (url: string): Promise<any> => {
        return sendBaseRequest(url, HttpMethod.DELETE)
    }

    return { getReq, postReq, putReq, deleteReq }
}
