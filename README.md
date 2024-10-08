# iGEM upload API

<div align="center">

<picture>
    <source width="400px" media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/CCheukKa/iGEM-upload-API/main/assets/logo-dark.svg">
    <source width="400px" media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/CCheukKa/iGEM-upload-API/main/assets/logo-light.svg">
    <img width="400px" src="https://raw.githubusercontent.com/CCheukKa/iGEM-upload-API/main/assets/logo-light.svg" />
</picture>

**An API that interfaces with the [iGEM upload tool](https://uploads.igem.org) to allow automatic file management and organisation.**  
The goal is to entirely replace the manual process of uploading files to the iGEM server, which is time-consuming and very user-unfriendly.  

[![NPM Version](https://img.shields.io/npm/v/igem-upload-api?style=flat-square)](https://www.npmjs.org/package/igem-upload-api)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=igem-upload-api&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.com/result?p=igem-upload-api)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/igem-upload-api?style=flat-square)](https://bundlephobia.com/package/igem-upload-api@latest)
[![npm downloads](https://img.shields.io/npm/d18m/igem-upload-api?style=flat-square)](https://npm-stat.com/charts.html?package=igem-upload-api)

</div>

> [!CAUTION]  
> The iGEM internal API is not officially supposed to be used by the public. This entire project is reverse-engineered from the [upload tool](https://uploads.igem.org) web app and may break at any time. Please use at your own discretion.  

## Disclaimer
> [!IMPORTANT]  
> ⚠️ ***This project is not affiliated with or endorsed by the [iGEM Foundation](https://igem.org/).***

## Installation
### [Node](https://nodejs.org)
```sh
npm install igem-upload-api
```

## Usage
```js
// Import the main API export; see below for importing types
import igemUploadApi from 'igem-upload-api';

// Wrap in an async function to use await
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

> [!CAUTION]  
> iGEM handles passwords in unencrypted plaintext. They are sent across the internet in plaintext form.  
> Please absolutely do not reuse your iGEM password for any other service.  

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

### `new igemUploadApi(teamNumber: number, username: string, password: string): igemUploadApi`
Creates a new instance of the iGEM upload tool API.  

| Argument     | Required? | Type     | Description                                     |
| :----------- | :-------: | :------- | :---------------------------------------------- |
| `teamNumber` |    Yes    | `number` | The team number of the iGEM team                |
| `username`   |    Yes    | `string` | The username used to log in to the iGEM website |
| `password`   |    Yes    | `string` | The password used to log in to the iGEM website |

> [!TIP]
> If you are unsure about what the parameters are: 
> 1. Go to the [upload tool](https://tools.igem.org/uploads/teams).
> 2. Log in with your iGEM credentials, these are the same as `username` and `password`.
> 3. Click on the team you want to upload files to. There should be only one team.
> 4. The URL should look like `https://tools.igem.org/uploads/teams/1234`, where `1234` is the `teamNumber`.

> [!CAUTION]  
> iGEM handles passwords in unencrypted plaintext. They are sent across the internet in plaintext form.  
> Please absolutely do not reuse your iGEM password for any other service.  

### igemUploadApi.`startSession(): Promise<void>`
Starts a new session with the iGEM upload tool API.  

### igemUploadApi.`listDirectory(remoteDirectoryPath: PathArrayableType): Promise<DirectoryListing>`
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

### igemUploadApi.`uploadFile(remoteDirectoryPath: PathArrayableType, localDirectoryPath: PathArrayableType, fileName: string): Promise<string>`
Uploads a file from the local system to the remote directory specified by `remoteDirectoryPath`. The file is located at `localDirectoryPath` and has the name `fileName`.  

Returns the URL of the uploaded file.  

### igemUploadApi.`deleteFile(remoteDirectoryPath: PathArrayableType, fileName: string): Promise<void>`
Deletes a file from the remote directory specified by `remoteDirectoryPath`. The file to be deleted has the name `fileName`.  

> [!WARNING]  
> You should make sure the path is correct since the iGEM API does not provide any response to confirm the deletion.  

### igemUploadApi.`uploadDirectory(remoteDirectoryPath: PathArrayableType, localDirectoryPath: PathArrayableType): Promise<RemoteResourceData[]>`
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

### igemUploadApi.`purgeDirectory(remoteDirectoryPath: PathArrayableType, recursive: boolean = false): Promise<void>`
Purges a directory from the remote directory specified by `remotePath`. If `recursive` is set to `true`, the subdirectories and their contents will also be deleted.  

### igemUploadApi.`endSession(): Promise<void>`
Ends the current session with the iGEM upload tool API.  
