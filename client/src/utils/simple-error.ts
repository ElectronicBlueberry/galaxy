interface ResponseError {
    response: {
        status: string;
        statusText: string;
        data?: {
            err_msg?: string;
        };
    };
}

export function errorMessageAsString(e: ResponseError | string, defaultMessage = "Request failed.") {
    let message = defaultMessage;
    if (typeof e == "string") {
        message = e;
    } else if (e && e.response && e.response.data && e.response.data.err_msg) {
        message = e.response.data.err_msg;
    } else if (e && e.response) {
        message = `${e.response.statusText} (${e.response.status})`;
    } else if (e instanceof Error) {
        message = e.message;
    } else if (typeof e == "string") {
        message = e;
    }
    return message;
}

export function rethrowSimple(e: ResponseError | string): never {
    console.debug(e);
    throw Error(errorMessageAsString(e));
}
