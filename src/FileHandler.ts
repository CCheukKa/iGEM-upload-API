import fs = require('fs-extra');
import FormData = require('form-data');
import NetworkHandler from './NetworkHandler';
import { FILE_TYPES, REQUEST_METHODS, QueryDirectoryResponseBody, UploadFileResponseBody, DeleteFileResponseBody } from './ApiTypes';
import PathArrayable from './Path';

/**
 * Represents the data for a remote resource.
 */
export type RemoteResourceData = {
    localFilePath: string;
    isSuccessful: boolean;
    url: string | null;
};

/**
 * Handles file operations such as listing directory contents, uploading files, and deleting files.
 */
export default class FileHandler {
    //! public functions
    /**
     * Lists the contents of a directory.
     * @param remoteDirectoryPath - The path of the directory to list.
     * @param teamNumber - The team number.
     * @param sessionToken - The session token.
     * @returns A Promise that resolves to the response body containing the directory contents.
     */
    public static async listDirectory(remoteDirectoryPath: PathArrayable, teamNumber: number, sessionToken: string): Promise<QueryDirectoryResponseBody> {
        const requestPath: QueryDirectoryResponseBody['_requestPath'] = ['websites', 'teams', teamNumber];
        const requestMethod = REQUEST_METHODS.GET;
        const requestParameters = { directory: remoteDirectoryPath.sanitise().condense().getNullablePath() as string | null };
        const response = NetworkHandler.assertStatusCode(
            await NetworkHandler.sendRequest(new PathArrayable(requestPath), requestMethod, { parameters: requestParameters, sessionToken }),
            200, 'List directory failed!'
        );
        const rawResponseBody = response.data;
        const { CommonPrefixes, Contents, ...rest } = rawResponseBody as any;
        const responseBody = {
            ...rest,
            Folders: CommonPrefixes,
            Files: Contents,
        }
        return {
            _requestPath: requestPath,
            _requestParameters: requestParameters,
            _requestMethod: requestMethod,
            data: responseBody as QueryDirectoryResponseBody['data'],
        };
    }
    /**
     * Uploads a file to the server.
     * @param remoteDirectoryPath - The path to the directory where the file should be uploaded.
     * @param localDirectoryPath - The local path to the file.
     * @param fileName - The name of the file.
     * @param teamNumber - The team number.
     * @param sessionToken - The session token.
     * @returns A promise that resolves to the response body containing the uploaded file URL.
     * @throws An error if the file is not found or if the file type is not supported.
     */
    public static async uploadFile(remoteDirectoryPath: PathArrayable, localDirectoryPath: PathArrayable, fileName: string, teamNumber: number, sessionToken: string): Promise<UploadFileResponseBody> {
        const requestPath: UploadFileResponseBody['_requestPath'] = ['websites', 'teams', teamNumber];
        const requestMethod = REQUEST_METHODS.POST;
        const requestParameters = { directory: remoteDirectoryPath.sanitise().condense().getNullablePath() as string | null };
        // 
        const fileFullPath: string = localDirectoryPath.append(fileName).condenseEnd();
        if (!fs.exists(fileFullPath)) { throw new Error('File not found!'); }
        this.assertSupportedFileType(fileName);
        // 
        const formData = new FormData();
        const fileStream = fs.createReadStream(fileFullPath);
        formData.append('file', fileStream, fileName);
        const response = NetworkHandler.assertStatusCode(
            await NetworkHandler.sendRequest(new PathArrayable(requestPath), requestMethod, { parameters: requestParameters, body: formData, sessionToken }),
            201, 'Upload file failed!'
        );
        return {
            _requestPath: requestPath,
            _requestParameters: requestParameters,
            _requestMethod: requestMethod,
            url: response.data as string,
        };
    }
    /**
     * Deletes a file from the specified directory path for a given team.
     * @param remoteDirectoryPath - The path to the directory where the file is located.
     * @param fileName - The name of the file to be deleted.
     * @param teamNumber - The team number associated with the file.
     * @param sessionToken - The session token for authentication.
     * @returns A promise that resolves to the response body containing information about the deleted file.
     */
    public static async deleteFile(remoteDirectoryPath: PathArrayable, fileName: string, teamNumber: number, sessionToken: string): Promise<DeleteFileResponseBody> {
        const requestPath: DeleteFileResponseBody['_requestPath'] = ['websites', 'teams', teamNumber, fileName];
        const requestMethod = REQUEST_METHODS.DELETE;
        const requestParameters = { directory: remoteDirectoryPath.sanitise().condense().getNullablePath() as string | null };
        const response = NetworkHandler.assertStatusCode(
            await NetworkHandler.sendRequest(new PathArrayable(requestPath), requestMethod, { parameters: requestParameters, sessionToken }),
            200, 'Delete file failed!'
        );
        return {
            _requestPath: requestPath,
            _requestParameters: requestParameters,
            _requestMethod: requestMethod
        };
    }

    //! private functions
    /**
     * Asserts whether the given file type is supported.
     * @param filename - The name of the file.
     * @throws {Error} If the file type is not supported.
     */
    private static assertSupportedFileType(filename: string): void {
        const extension = filename.split('.').pop()?.toLowerCase();
        if (!Object.values(FILE_TYPES).includes(extension as any)) { throw new Error(`Unsupported file type ${extension}; must be [${Object.values(FILE_TYPES).join(', ')}]`); }
    }

    //$ public function wrappers
    /**
     * Recursively deletes all files and folders within a directory.
     * @param remoteDirectoryPath - The path of the directory to purge.
     * @param teamNumber - The team number associated with the directory.
     * @param sessionToken - The session token for authentication.
     * @param recursive - Indicates whether to delete files and folders recursively.
     * @returns A Promise that resolves when the directory is purged.
     */
    public static async purgeDirectory(remoteDirectoryPath: PathArrayable, teamNumber: number, sessionToken: string, recursive: boolean): Promise<void> {
        const directory = await FileHandler.listDirectory(remoteDirectoryPath, teamNumber, sessionToken);
        await Promise.all(directory.data.Files?.map(file => FileHandler.deleteFile(remoteDirectoryPath, file.Name, teamNumber, sessionToken)) ?? []);
        if (!recursive) { return; }
        await Promise.all(directory.data.Folders?.map(folder => FileHandler.purgeDirectory(remoteDirectoryPath.append(folder.Name), teamNumber, sessionToken, recursive)) ?? []);
    }
    /**
     * Uploads a directory and its contents recursively to a remote server.
     * 
     * @param remoteDirectoryPath - The path of the remote directory to upload to.
     * @param localDirectoryPath - The path of the local directory to upload from.
     * @param teamNumber - The team number associated with the upload.
     * @param sessionToken - The session token for authentication.
     * @returns A Promise that resolves when the upload is complete.
     */
    public static async uploadDirectory(remoteDirectoryPath: PathArrayable, localDirectoryPath: PathArrayable, teamNumber: number, sessionToken: string): Promise<RemoteResourceData[]> {
        const errors: { localFilePath: string, error: any }[] = [];
        const remoteResourceUrls: RemoteResourceData[] = [];
        await uploadDirectoryRecurse(remoteDirectoryPath, localDirectoryPath);
        if (errors.length > 0) { console.error('The following errors occurred during the upload:', errors); }
        console.log(`Upload complete with ${errors.length} fails!`, { remoteResourceUrls });
        return remoteResourceUrls;
        // 
        async function uploadDirectoryRecurse(remoteDirectoryPath: PathArrayable, localDirectoryPath: PathArrayable): Promise<void> {
            const files = fs.readdirSync(localDirectoryPath.condenseEnd());
            for (const fileName of files) {
                console.log('exploring', remoteDirectoryPath, localDirectoryPath, fileName);
                const localFilePath: string = localDirectoryPath.new().append(fileName).condenseEnd();
                console.log('children', localFilePath);
                const stats = fs.statSync(localFilePath);
                if (stats.isDirectory()) {
                    await uploadDirectoryRecurse(remoteDirectoryPath.new().append(fileName), localDirectoryPath.new().append(fileName));
                } else {
                    await FileHandler.uploadFile(remoteDirectoryPath.new(), localDirectoryPath.new(), fileName, teamNumber, sessionToken)
                        .then(response => {
                            const url = response.url;
                            remoteResourceUrls.push({ localFilePath, isSuccessful: true, url });
                        })
                        .catch(error => {
                            errors.push({ localFilePath, error })
                            remoteResourceUrls.push({ localFilePath, isSuccessful: false, url: null });
                        });
                }
            }
        }
    }
}