interface ResponseError {
    response: {
        status: string;
        statusText: string;
        data?: {
            err_msg?: string;
        };
    };
}

function isResponseError(e: unknown): e is ResponseError {
    return typeof e === "object" && e !== null && "response" in e;
}

export function errorMessageAsString(e: ResponseError | string | Error, defaultMessage = "Request failed.") {
    let message = defaultMessage;
    if (typeof e == "string") {
        message = e;
    } else if (isResponseError(e) && e.response.data && e.response.data.err_msg) {
        message = e.response.data.err_msg;
    } else if (isResponseError(e)) {
        message = `${e.response.statusText} (${e.response.status})`;
    }
    return message;
}

export function rethrowSimple(e: ResponseError | string | Error): never {
    console.debug(e);
    throw Error(errorMessageAsString(e));
}
