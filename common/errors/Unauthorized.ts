export default class UnauthorizedError extends Error {
    // 401 Unauthorized
    // 403 Forbidden
    statusCode = 401 | 403
    constructor() {
        super()
    }
}
