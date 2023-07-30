import { decode } from 'jsonwebtoken'

export const getTokenPayload = <T>(token: string): T => {
    const decodedToken = decode(token, { json: true, complete: true })
    return decodedToken.payload as T
}
