/**
 * Enum representing the HTTP request methods the iGEM API uses.
 */
export enum REQUEST_METHODS {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE',
};
/**
 * Enum representing different file types the iGEM file server accepts.
 */
export enum FILE_TYPES {
    FOLDER = 'Folder',
    PNG = 'png',
    JPG = 'jpg',
    SVG = 'svg',
    WEBP = 'webp',
    WOFF2 = 'woff2',
};
/* -------------------------------------------------------------------------- */
/**
 * Represents the metadata associated with an API request.
 */
type $Metadata = {
    httpStatusCode: number;
    requestId: string;
    extendedRequestId: string;
    attempts: number;
    totalRetryDelay: number;
};
/**
 * Represents the data for a folder.
 */
type FolderData = {
    Prefix: string;
    Key: string;
    Name: string;
    Type: FILE_TYPES.FOLDER;
};
/**
 * Represents the data of a file.
 */
type FileData = {
    Key: string;
    LastModified: string;
    ETag: string;
    Size: number;
    StorageClass: string;
    Location: string;
    Name: string;
    Type: FILE_TYPES;
};
/**
 * Represents user data.
 */
type UserData = {
    uuid: string;
    id: number;
    publicName: string;
    username: string;
    privileges: any[];
    photoURL: string;
    firstName: string;
};
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/**
 * Represents the response body for the authentication sign-in API.
 */
export type AuthSignInResponseBody = {
    _requestPath: ['auth', 'sign-in'];
    _requestMethod: REQUEST_METHODS.POST;
    // 
    sessionToken: string;
    // Response body is empty
}
/**
 * Response body type for the 'auth/me' endpoint.
 */
export type AuthMeResponseBody = {
    _requestPath: ['auth', 'me'];
    _requestMethod: REQUEST_METHODS.GET;
    // 
    data: UserData;
};
/**
 * Represents the response body for querying a directory.
 */
export type QueryDirectoryResponseBody = {
    _requestPath: ['websites', 'teams', teamNumber: number];
    _requestParameters: {
        directory: string | null;
    };
    _requestMethod: REQUEST_METHODS.GET;
    // 
    data: {
        $metadata: $Metadata;
        Delimiter: string;
        IsTruncated: boolean;
        KeyCount: number;
        MaxKeys: number;
        Name: string;
        Prefix: string;
        // 
        Folders: FolderData[];
        Files: FileData[];
    };
};
/**
 * Represents the response body for deleting a file.
 */
export type DeleteFileResponseBody = {
    _requestPath: ['websites', 'teams', teamNumber: number, fileName: string];
    _requestParameters: {
        directory: string | null;
    };
    _requestMethod: REQUEST_METHODS.DELETE;
    // 
    // Response body is empty
};
/**
 * Represents the response body of an upload file request.
 */
export type UploadFileResponseBody = {
    _requestPath: ['websites', 'teams', teamNumber: number];
    _requestParameters: {
        directory: string | null;
    };
    _requestMethod: REQUEST_METHODS.POST;
    // 
    url: string;
};
/* -------------------------------------------------------------------------- */
