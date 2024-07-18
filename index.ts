import { FolderData, FileData, FILE_TYPES } from './src/ApiTypes';
import AuthHandler from './src/AuthHandler';
import FileHandler, { RemoteResourceData } from './src/FileHandler';
import PathArrayable, { PathArrayableType } from './src/Path';

const noTokenError = new Error('No started session!');

/**
 * Represents a directory listing containing folders and files.
 */
export type DirectoryListing = {
    folders?: FolderData[];
    files?: FileData[];
};

export { FileData, FolderData, PathArrayableType, RemoteResourceData, FILE_TYPES };

/**
 * Represents the iGEM Upload Tool API.
 */
export default class igemUploadToolApi {
    /**
     * The session token for authentication.
     */
    private sessionToken: string | null = null;

    /**
     * Creates an instance of the iGEMUploadToolAPI class.
     * @param teamNumber - The team number.
     * @param username - The username.
     * @param password - The password.
     */
    constructor(private teamNumber: number, private username: string, private password: string) { }

    // ! public src functions
    /**
     * Starts a new session by signing in the user with the provided username and password.
     * Authenticates the session after signing in to confirm session token is valid.
     * @param username - The username of the user.
     * @param password - The password of the user.
     * @returns A Promise that resolves to void when the session is started successfully.
     */
    public async startSession(): Promise<void> {
        this.sessionToken = (await AuthHandler.signIn(this.username, this.password)).sessionToken;
        await AuthHandler.authenticate(this.sessionToken);
    }
    /**
     * Ends the current session by signing out the user.
     * Not technically necessary, but good practice to end the session.
     * @returns A Promise that resolves when the session is successfully ended.
     * @throws {Error} If there is no session token available.
     */
    public async endSession(): Promise<void> {
        if (this.sessionToken === null) { throw noTokenError; }
        await AuthHandler.signOut(this.sessionToken);
        this.sessionToken = null;
    }
    /**
     * Purges a directory by deleting all its contents.
     * @param remoteDirectoryPath - The path of the directory to purge.
     * @param recursive - Indicates whether to delete the contents recursively.
     * @returns A Promise that resolves when the directory is successfully purged.
     * @throws {Error} If there is no session token available.
     */
    public async purgeDirectory(remoteDirectoryPath: PathArrayableType, recursive: boolean = false): Promise<void> {
        if (this.sessionToken === null) { throw noTokenError; }
        await FileHandler.purgeDirectory(new PathArrayable(remoteDirectoryPath), this.teamNumber, this.sessionToken, recursive);
    }
    /**
     * Lists the contents of a directory.
     * @param remoteDirectoryPath - The path of the directory to list.
     * @returns A Promise that resolves with the directory contents.
     * @throws {Error} If there is no session token available.
     */
    public async listDirectory(remoteDirectoryPath: PathArrayableType): Promise<DirectoryListing> {
        if (this.sessionToken === null) { throw noTokenError; }
        const response = await FileHandler.listDirectory(new PathArrayable(remoteDirectoryPath), this.teamNumber, this.sessionToken);
        return { folders: response.data.Folders, files: response.data.Files };
    }
    /**
     * Uploads a file to a directory.
     * @param remoteDirectoryPath - The path of the directory to upload the file to.
     * @param localDirectoryPath - The local path of the file to upload.
     * @param fileName - The name of the file to upload.
     * @returns A Promise that resolves when the file is successfully uploaded.
     * @throws {Error} If there is no session token available.
     */
    public async uploadFile(remoteDirectoryPath: PathArrayableType, localDirectoryPath: PathArrayableType, fileName: string): Promise<string> {
        if (this.sessionToken === null) { throw noTokenError; }
        return (await FileHandler.uploadFile(new PathArrayable(remoteDirectoryPath), new PathArrayable(localDirectoryPath), fileName, this.teamNumber, this.sessionToken)).url;
    }
    /**
     * Deletes a file from the specified remote directory.
     * 
     * @param remoteDirectoryPath - The path to the remote directory where the file is located.
     * @param fileName - The name of the file to be deleted.
     * @returns A Promise that resolves when the file is successfully deleted.
     * @throws {Error} If the session token is undefined.
     */
    public async deleteFile(remoteDirectoryPath: PathArrayableType, fileName: string): Promise<void> {
        if (this.sessionToken === null) { throw noTokenError; }
        await FileHandler.deleteFile(new PathArrayable(remoteDirectoryPath), fileName, this.teamNumber, this.sessionToken);
    }
    /**
     * Uploads a directory to a remote location.
     * @param remoteDirectoryPath - The path of the remote directory where the files will be uploaded.
     * @param localDirectoryPath - The path of the local directory that contains the files to be uploaded.
     * @returns A Promise that resolves when the upload is complete.
     * @throws {Error} If the session token is undefined.
     */
    public async uploadDirectory(remoteDirectoryPath: PathArrayableType, localDirectoryPath: PathArrayableType): Promise<RemoteResourceData[]> {
        if (this.sessionToken === null) { throw noTokenError; }
        return await FileHandler.uploadDirectory(new PathArrayable(remoteDirectoryPath), new PathArrayable(localDirectoryPath), this.teamNumber, this.sessionToken);
    }
}