export default class BadRequestError extends Error {
    statusCode = 400
    constructor() {
        super()
    }
}
