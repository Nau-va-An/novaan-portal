export interface AuthToken {
    exp: number
    iat: number
    nameid: string
    nbf: number
    urole: 'User' | 'Admin'
}
