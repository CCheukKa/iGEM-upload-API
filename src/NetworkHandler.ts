import axios, { AxiosResponse } from 'axios';
import { REQUEST_METHODS } from './ApiTypes';
import PathArrayable from './Path';

/**
 * Represents a network handler for making HTTP requests to the iGEM API.
 */
export default class NetworkHandler {
    /**
     * The base URL for the iGEM API.
     */
    public static apiUrl = 'https://api.igem.org/v1/';

    //! public functions
    /**
     * Sends a network request to the specified path using the specified method.
     * @param pathArrayable - The path to send the request to.
     * @param method - The HTTP method to use for the request.
     * @param args - Optional arguments for the request.
     * @returns A Promise that resolves to the AxiosResponse object representing the response.
     */
    public static async sendRequest(
        pathArrayable: PathArrayable, method: REQUEST_METHODS,
        args?: {
            parameters?: Object,
            body?: Object,
            sessionToken?: string
        }
    ): Promise<AxiosResponse> {
        const { parameters, body, sessionToken } = args ?? {};
        const pathString = pathArrayable.sanitise().condense().path;
        const requestUrl = `${this.apiUrl}${pathString}`;
        const headers = sessionToken ? { Cookie: `session=${sessionToken}` } : {};
        console.log('↓'.repeat(80));
        console.log(`Sending ${method} request to ${requestUrl}`, { headers, body });
        const response = await (() => {
            switch (method) {
                case REQUEST_METHODS.GET:
                    return axios.get(requestUrl, { params: parameters, headers, validateStatus: () => true });
                case REQUEST_METHODS.POST:
                    return axios.post(requestUrl, body, { params: parameters, headers, validateStatus: () => true });
                case REQUEST_METHODS.DELETE:
                    return axios.delete(requestUrl, { params: parameters, headers, validateStatus: () => true });
            }
        })();
        console.log(`Received response with status ${response.status}: ${response.statusText}`, { data: response.data });
        console.log('↑'.repeat(80));
        return response;
    }
    /**
     * Asserts the status code of an Axios response.
     * @param response - The Axios response object.
     * @param expectedStatusCode - The expected status code.
     * @param errorMessage - The error message to throw if the status code does not match the expected value.
     * @returns The original Axios response object.
     * @throws Error if the status code does not match the expected value.
     */
    public static assertStatusCode(response: AxiosResponse, expectedStatusCode: number, errorMessage: string): AxiosResponse {
        if (response.status !== expectedStatusCode) {
            console.log('Response:', response);
            throw new Error(`${errorMessage}\nExpected status code ${expectedStatusCode}, but received ${response.status}: ${response.statusText}`);
        }
        return response;
    }
}