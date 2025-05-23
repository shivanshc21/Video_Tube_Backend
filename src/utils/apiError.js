class ApiError extends Errors {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        statck = ""
    ){
        super(message)                                              /// overwrites the message property of the Error class
        this.statusCode = statusCode,
        this.data = null,
        this.message = message,
        this.errors = errors

        if (statck) {
            this.statck = statck
        }
        else Error.captureStackTrace(this, this.constructor)            /// captures the stack trace of the error
    }
}