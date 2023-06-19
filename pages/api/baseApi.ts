import { Undefinable } from '@/common/types'
import dotenv from 'dotenv'
dotenv.config()

const API_URL = process.env.API_URL
const API_TIMEOUT = process.env.API_TIMEOUT
const ACCESS_TOKEN_ID = process.env.AT_ID

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

export default class BaseApi {
    private readonly apiURL: string
    private readonly defaultTimeout: number
    private readonly accessTokenId: string

    constructor() {
        if (API_URL == null) {
            throw new Error('API_URL is not defined inside .env')
        }

        if (API_TIMEOUT == null) {
            throw new Error('API_TIMEOUT is not defined inside .env')
        }

        if (ACCESS_TOKEN_ID == null) {
            throw new Error('Access token id is not define inside .env')
        }

        this.apiURL = API_URL
        this.defaultTimeout = Number(API_TIMEOUT)
        this.accessTokenId = ACCESS_TOKEN_ID
    }

    getDefaultConfig(): RequestConfig {
        return {
            timeout: this.defaultTimeout,
            authorizationRequired: false,
        }
    }

    async getHeaders(accessTokenRequired: boolean = false): Promise<Headers> {
        const headers = new Headers()
        headers.append('Content-Type', 'application/json')
        headers.append('Accept', 'application/json')
        headers.append('Access-Control-Allow-Origin', '*')

        if (accessTokenRequired) {
            // Get access token from secure storage
            const accessToken = localStorage.getItem(this.accessTokenId)
            if (accessToken == null) {
                throw new Error('Access token not found')
            }
            headers.append('Authorization', `Bearer ${accessToken}`)
        }

        return headers
    }

    async get(url: string, requestConfig?: RequestConfig): Promise<Response> {
        return this.sendRequestBase(url, HttpMethod.GET, requestConfig)
    }

    async post<RequestType>(
        url: string,
        body: RequestType,
        requestConfig?: RequestConfig
    ): Promise<Response> {
        return this.sendRequestBase(url, HttpMethod.POST, requestConfig, body)
    }

    async put<RequestType>(
        url: string,
        body: RequestType,
        requestConfig?: RequestConfig
    ): Promise<Response> {
        return this.sendRequestBase(url, HttpMethod.PUT, requestConfig, body)
    }

    async delete(
        url: string,
        requestConfig?: RequestConfig
    ): Promise<Response> {
        return await this.sendRequestBase(url, HttpMethod.DELETE, requestConfig)
    }

    async sendRequestBase(
        url: string,
        method: string,
        requestConfig: Undefinable<RequestConfig> = this.getDefaultConfig(),
        body?: any
    ): Promise<Response> {
        const headers = await this.getHeaders(
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

        const response = await fetch(`${this.apiURL}${url}`, {
            method,
            headers,
            body,
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        return response
    }
}
