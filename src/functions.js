import { inflate as zlibInflate } from "node:zlib";
import { createHash as cryptoCreateHash } from "node:crypto";

/**
    * Generate the expires and token query parameters for the library endpoints
    * @param {String} endpoint - The library endpoint name (without the leading slash)
    * @returns {String} - A query string containing the expires and token parameters
**/
function generateLibraryExpiresAndTokenParametersString(endpoint) {
    const expires = Math.floor(Date.now() / 1000) + 3600;

    const token = cryptoCreateHash("md5")
        .update("8501f9c2-75ba-4230-8188-51037c4da102" + endpoint + expires)
        .digest("base64url");

    return `?expires=${expires}&token=${token}`;
}

/**
    * Fetch the latest music/sfx library version number
    * @param {String} type - Either music or sfx
    * @returns {Promise<Number>} - The library's version number
**/
async function getLibraryVersion(type) {
    let versionUrl;

    switch (type) {
        case "music":
            versionUrl = "https://geometrydashfiles.b-cdn.net/music/musiclibrary_version_02.txt" + generateLibraryExpiresAndTokenParametersString("musiclibrary_version_02.txt");
            break;
        case "sfx":
            versionUrl = "https://geometrydashfiles.b-cdn.net/sfx/sfxlibrary_version.txt" + generateLibraryExpiresAndTokenParametersString("sfxlibrary_version.txt");
            break;
        default:
            throw new Error(`Invalid library type: ${type}`);
    }

    const versionReq = await fetch(versionUrl);

    if (!versionReq?.ok)
        throw new Error(`Failed to get ${type} library's version`);

    return Number(await versionReq.text());
}

/**
    * Fetch the latest music/sfx library data
    * @param {String} type - Either music or sfx
    * @returns {Promise<String>} - The library's data
**/
async function getLibraryData(type) {
    let dataUrl;

    switch (type) {
        case "music":
            dataUrl = "https://geometrydashfiles.b-cdn.net/music/musiclibrary_02.dat" + generateLibraryExpiresAndTokenParametersString("musiclibrary_02.dat");
            break;
        case "sfx":
            dataUrl = "https://geometrydashfiles.b-cdn.net/sfx/sfxlibrary.dat" + generateLibraryExpiresAndTokenParametersString("sfxlibrary.dat");
            break;
        default:
            throw new Error(`Invalid library type: ${type}`);
    }

    const dataReq = await fetch(dataUrl);

    if (!dataReq?.ok)
        throw new Error(`Failed to get ${type} library's data`);

    return await dataReq.text();
}

/**
    * Decode a library's encoded data using Base64 URL-Safe decoding and ZLib inflate
    * @param {String} data - One of the libraries' encoded data
    * @returns {Promise<String>} - The decoded library data
**/
function decodeLibraryData(data) {
    return new Promise((resolve, reject) => {
        zlibInflate(Buffer.from(data, "base64url"), (error, buffer) => {
            if (error)
                return reject(error);

            resolve(buffer.toString("utf-8"));
        });
    });
}

/**
    * Parse the music library's decoded data into an object
    * @param {String} data - The music library's decoded data
    * @returns {Array<Object>} - An object containing the parsed music library data
**/
function parseMusicLibrary(data) {
    const [, artistsStr, songsStr, tagsStr] = data.split("|");

    const tagMap = new Map(
        tagsStr.split(";")
            .filter(Boolean)
            .map(entry => {
                const [id, name] = entry.split(",");
                return [Number(id), name];
            })
    );

    const artistMap = new Map(
        artistsStr.split(";")
            .filter(Boolean)
            .map(entry => {
                const [id, name, website, youtube] = entry.split(",");
                return [
                    Number(id),
                    {
                        id: Number(id),
                        name,
                        website: website === " " ? null : decodeURIComponent(website),
                        youtube: youtube === " " ? null : youtube
                    }
                ];
            })
    );

    return songsStr
        .split(";")
        .filter(Boolean)
        .map(entry => entry.split(","))
        .filter(parts => parts.length >= 8)
        .map(([
            id,
            name,
            primaryArtistID,
            size,
            duration,
            tagStr,
            _musicPlatform,
            extraArtistStr = ""
        ]) => ({
            id: Number(id),
            name,
            artists: [
                artistMap.get(Number(primaryArtistID)),
                ...extraArtistStr
                    .split(".")
                    .filter(Boolean)
                    .map(id => artistMap.get(Number(id)))
            ].filter(Boolean),
            size: Number(size),
            duration: Number(duration),
            tags: tagStr
                .split(".")
                .filter(Boolean)
                .map(id => tagMap.get(Number(id)))
                .filter(Boolean)
        }));
}

/**
    * Parse the SFX library's decoded data into an object
    * @param {String} data - The SFX library's decoded data
    * @returns {Array<Object>} - An object containing the parsed SFX library data
**/
function parseSfxLibrary(data) {
    const [sfxsStr] = data.split("|");

    if (!sfxsStr) return [];

    return sfxsStr
        .split(";")
        .filter(Boolean)
        .map(entry => entry.split(","))
        .filter(parts => parts.length === 6 && parts[2] !== "true")
        .map(([id, name, , , size, duration]) => ({
            id: Number(id),
            name,
            size: Number(size),
            duration: Number(duration)
        }));
}

/**
    * Check for updates for one of the libraries
    * @param {String} type - Either music or sfx
    * @param {Object} library - The mutable library object
    * @param {Number} library.version
    * @param {Array} library.data
    * @param {Number} library.lastCheck
    * @returns {Promise<void>}
**/
export async function checkLibraryUpdate(type, library) {
    if (library.lastCheck + 3600000 < Date.now()) {
        console.log(`Checking for a ${type} library update...`);
        const latestVersion = await getLibraryVersion(type);

        if (library.version !== latestVersion) {
            const libraryDataRaw = await getLibraryData(type)
            const libraryData = await decodeLibraryData(libraryDataRaw)
            const parsedLibraryData = type === "music" ? parseMusicLibrary(libraryData) : parseSfxLibrary(libraryData);

            library.version = latestVersion;
            library.data = parsedLibraryData;
            library.lastCheck = Date.now();
            console.log(`${type} library updated to version ${latestVersion}`);
        } else {
            library.lastCheck = Date.now();
            console.log(`${type} library is up to date`);
        }
    }
}

/**
    * Filter songs by name
    * @param {Array<Object>} data - A library's parsed data
    * @param {String} search - A string to search for
    * @returns {Array<Object>} Filtered library data
**/
export function getFilteredLibraryData(data, search) {
    return data.filter(song =>
        song.name?.toLowerCase().includes(search.toLowerCase())
    );
}