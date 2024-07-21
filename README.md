# iGEM upload API
This is an API that interfaces with the [iGEM upload tool](https://uploads.igem.org) to allow automatic file management and organisation. The goal is to entirely replace the manual process of uploading files to the iGEM server, which is time-consuming and very user-unfriendly.  

> [!CAUTION]  
> The iGEM internal API is not officially supposed to be used by the public. This entire project is reverse-engineered from the [upload tool](https://uploads.igem.org) web app and may break at any time. Please use at your own discretion.  

## Disclaimer
> [!IMPORTANT]  
> ⚠️ ***This project is not affiliated with or endorsed by the [iGEM Foundation](https://igem.org/).***

## Installation
```sh
npm install igem-upload-api
```

## Usage
```js
import igemUploadApi from 'igem-upload-api';

// Wrap in async function to use await
(async () => {

    // Create an instance of the iGEM API
    const TEAM_NUMBER = 1234;
    const USERNAME = 'lowercase-username-you-use-to-login';
    const PASSWORD = 'password-you-use-to-login';
    const api = new igemUploadApi(TEAM_NUMBER, USERNAME, PASSWORD);

    // Start a new session
    await api.startSession();

    // List the contents a remote directory non-recursively
    await api.listDirectory([]);                // Remote root directory
    await api.listDirectory(['']);              // Remote root directory
    await api.listDirectory(['foo']);           // Remote 'foo' directory
    await api.listDirectory(['foo', 'bar']);    // Remote 'foo/bar' directory
    await api.listDirectory('foo/bar');         // Remote 'foo/bar' directory
    // Do something with the response
    const { folders: folders1, files: files1 } = await api.listDirectory([]);

    // Upload a file
    // Upload local 'path/to/file/image.png' to remote 'image.png'
    await api.uploadFile([], ['path', 'to', 'file'], 'image.png');
    await api.uploadFile([], 'path/to/file', 'image.png');
    // Upload local 'path/to/file/font.woff2' to remote 'foo/bar/font.woff2'
    await api.uploadFile(['foo', 'bar'], ['path', 'to', 'file'], 'font.woff2');
    await api.uploadFile('foo/bar', 'path/to/file', 'font.woff2');
    // Do something with the response
    const url = await api.uploadFile([], ['path', 'to', 'file'], 'image.png');

    // Delete a file
    // Delete 'image.png' from remote root directory
    await api.deleteFile([], 'image.png');
    // Delete 'icon.svg' from remote 'foo/bar' directory
    await api.deleteFile(['foo', 'bar'], 'icon.svg');

    // Upload a directory
    // Upload local 'path/to/assets' to remote 'assets'
    await api.uploadDirectory(['assets'], ['path', 'to', 'assets']);
    await api.uploadDirectory('assets', 'path/to/assets');
    // Do something with the response
    const remoteResourceUrls = await api.uploadDirectory(['assets'], ['path', 'to', 'assets']);

    // Purge a directory
    // Purge remote 'assets' directory non-recursively
    await api.purgeDirectory(['assets']);
    // Purge remote 'foo/bar' directory and its sub-directories recursively
    await api.purgeDirectory('foo/bar', true);

    // End the session
    await api.endSession();
})();
```

> [!TIP]  
> iGEM handles passwords in unencrypted plaintext. Please absolutely do not reuse your iGEM password for any other service.  

## Types
You can import types from the package to use in your own code.  
```ts
// Import the main API export and some extra types
import igemUploadApi, { DirectoryListing, RemoteResourceData } from 'igem-upload-api';

// Here are all the importable types
import igemUploadApi, { DirectoryListing, RemoteResourceData, PathArrayableType, FileData, FolderData, FILE_TYPES } from 'igem-upload-api';
```

Of course, you can dig deeper and import internal types not listed here, but doing so is not recommended.  

> [!NOTE]  
> Directory paths accept the following type:  
> ```ts
> type PathArrayableType = (string | number)[] | string;
> ```
> 
> Paths are automatically sanitised and coerced into valid paths. These directory patterns are supported but not recommended.  
> ```js
> await api.listDirectory(['   foo', '  bar ']);  // Leading and/or trailing whitespace
> await api.listDirectory(['foo', '', 'bar']);    // Empty string in array
> await api.listDirectory('///');                 // Malformed path
> await api.listDirectory('foo/../');             // Backtracking (local paths only)
> ```

## API

### `startSession(): Promise<void>`
Starts a new session with the iGEM upload tool API.  

### `listDirectory(remoteDirectoryPath: PathArrayableType): Promise<DirectoryListing>`
Lists the contents of a remote directory specified by the `remoteDirectoryPath` parameter non-recursively.  

Returns an object with two optional arrays.  
| Key                   | Required? | Type            | Description                                    |
| :-------------------- | :-------: | :-------------- | :--------------------------------------------- |
| `folders`             |    No     | `FolderData[]?` | List of subdirectories                         |
| `\|___.Prefix`        |    Yes    | `string`        | The URL path of the folder?                    |
| `\|___.Key`           |    Yes    | `string`        | The path of the folder                         |
| `\|___.Name`          |    Yes    | `string`        | The name of the folder                         |
| `\|___.Type`          |    Yes    | `"Folder"`      |                                                |
| `files`               |    No     | `FileData[]?`   | List of files                                  |
| `\|____.Key`          |    Yes    | `string`        | The path of the file                           |
| `\|____.LastModified` |    Yes    | `string`        | The last modified date (ISO date time string ) |
| `\|____.ETag`         |    Yes    | `string`        | The ETag of the file                           |
| `\|____.Size`         |    Yes    | `number`        | The size of the file (bytes)                   |
| `\|____.StorageClass` |    Yes    | `string`        | ?                                              |
| `\|____.Location`     |    Yes    | `string`        | The URL of the file                            |
| `\|____.Name`         |    Yes    | `string`        | The name of the file                           |
| `\|____.Type`         |    Yes    | `string`        | The file extension                             |

Example return object:  
```json
{
    "folders": [
        {
            "Prefix": "teams/1234/images/",
            "Key": "teams/1234/images/",
            "Name": "images",
            "Type": "Folder"
        }
    ],
    "files": [
        {
            "Key": "teams/1234/icon.svg",
            "LastModified": "2024-01-01T00:00:00.000Z",
            "ETag": "\"0123456789abcdef0123456789abcdef\"",
            "Size": 100,
            "StorageClass": "STANDARD",
            "Location": "https://static.igem.wiki/teams/1234/icon.svg",
            "Name": "icon.svg",
            "Type": "svg"
        }
    ]
}
```

### `uploadFile(remoteDirectoryPath: PathArrayableType, localDirectoryPath: PathArrayableType, fileName: string): Promise<string>`
Uploads a file from the local system to the remote directory specified by `remoteDirectoryPath`. The file is located at `localDirectoryPath` and has the name `fileName`.  

Returns the URL of the uploaded file.  

### `deleteFile(remoteDirectoryPath: PathArrayableType, fileName: string): Promise<void>`
Deletes a file from the remote directory specified by `remoteDirectoryPath`. The file to be deleted has the name `fileName`.  

> [!WARNING]  
> You should make sure the path is correct since the iGEM API does not provide any response to confirm the deletion.  

### `uploadDirectory(remoteDirectoryPath: PathArrayableType, localDirectoryPath: PathArrayableType): Promise<RemoteResourceData[]>`
Uploads a directory from the local system to the remote directory specified by `remoteDirectoryPath`. The directory is located at `localDirectoryPath`.  

Returns an array of remote resources data.  
| Key                    |   Required?   | Type                   | Description                                                                             |
| :--------------------- | :-----------: | :--------------------- | :-------------------------------------------------------------------------------------- |
| `...`                  |      Yes      | `RemoteResourceData[]` |
| `\|____.localFilePath` |      Yes      | `string`               | The local path of the file                                                              |
| `\|____.isSuccessful`  |      Yes      | `boolean`              | Whether the upload was successful                                                       |
| `\|____.url`           | *Conditional* | `string`               | The URL of the uploaded file; this property does not exist if `isSuccessful` is `false` |

Example return object:  
```json
[
    {
        "localFilePath": "assets/icon.svg",
        "isSuccessful": true,
        "url": "https://static.igem.wiki/teams/1234/assets/icon.svg"
    },
    {
        "localFilePath": "assets/data.json",
        "isSuccessful": false
    }
]
```
Note that the `url` property will be `null` if the upload was unsuccessful. In the example case, `data.json` was rejected due to an invalid file extension.  

### `purgeDirectory(remoteDirectoryPath: PathArrayableType, recursive: boolean = false): Promise<void>`
Purges a directory from the remote directory specified by `remotePath`. If `recursive` is set to `true`, the subdirectories and their contents will also be deleted.  

### `endSession(): Promise<void>`
Ends the current session with the iGEM upload tool API.  
