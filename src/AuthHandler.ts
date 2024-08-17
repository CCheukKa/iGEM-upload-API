import { AxiosResponse } from 'axios';
import NetworkHandler from './NetworkHandler';
import { REQUEST_METHODS, AuthMeResponseBody, AuthSignInResponseBody } from './ApiTypes';
import PathArrayable from './Path';
import { isDebug } from './FlagGetter';

/**
 * Handles authentication-related operations.
 */
export default class AuthHandler {
    //! public functions
    /**
     * Signs in a user with the provided username and password.
     * @param username - The username of the user.
     * @param password - The password of the user.
     * @returns A Promise that resolves to a session token string.
     * @throws An error if the sign-in fails.
     */
    public static async signIn(username: string, password: string): Promise<AuthSignInResponseBody> {
        const requestPath: AuthSignInResponseBody['_requestPath'] = ['auth', 'sign-in'];
        const requestMethod = REQUEST_METHODS.POST;
        const body = { identifier: username, password };
        console.log(`Signing in as ${username}...`);
        const response = NetworkHandler.assertStatusCode(
            await NetworkHandler.sendRequest(new PathArrayable(requestPath), requestMethod, { body }),
            201, 'Sign in failed!'
        );
        const sessionToken = this.grabSessionToken(response);
        if (!sessionToken) { throw new Error('Login failed!'); }
        isDebug
            ? console.log(`Received session token: ${sessionToken}`)
            : console.log('Received session token.');
        return {
            _requestPath: requestPath,
            _requestMethod: requestMethod,
            sessionToken,
        };
    }
    /**
     * Authenticates the user using the provided session token.
     * Not technically necessary outside of session token validation.
     * @param sessionToken The session token for authentication.
     * @returns A promise that resolves to the response body containing the authenticated user's data.
     */
    public static async authenticate(sessionToken: string): Promise<AuthMeResponseBody> {
        const requestPath: AuthMeResponseBody['_requestPath'] = ['auth', 'me'];
        const requestMethod = REQUEST_METHODS.GET;
        console.log('Authenticating...');
        const response = NetworkHandler.assertStatusCode(
            await NetworkHandler.sendRequest(new PathArrayable(requestPath), requestMethod, { sessionToken }),
            200, 'Authentication failed!'
        );
        const responseBody = response.data;
        return {
            _requestPath: requestPath,
            _requestMethod: requestMethod,
            data: responseBody as AuthMeResponseBody['data'],
        }
    }
    /**
     * Signs out the user with the provided session token.
     * Not technically necessary, but good practice to end the session.
     * @param sessionToken - The session token of the user.
     * @returns A Promise that resolves when the sign out is successful.
     * @throws {Error} If the sign out fails.
     */
    public static async signOut(sessionToken: string): Promise<void> {
        const requestPath = ['auth', 'sign-out'];
        const requestMethod = REQUEST_METHODS.POST;
        console.log('Signing out...');
        const response = NetworkHandler.assertStatusCode(
            await NetworkHandler.sendRequest(new PathArrayable(requestPath), requestMethod, { sessionToken }),
            201, 'Sign out failed!'
        );
    }

    //! private functions
    /**
     * Extracts the session token from the response headers.
     * @param response - The Axios response object.
     * @returns The session token if found, otherwise undefined.
     */
    private static grabSessionToken(response: AxiosResponse): string | undefined {
        return response.headers['set-cookie']?.[0].match(/(?<=session=)([^;]+)/)?.[0];
    }
}