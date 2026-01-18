import { checkLibraryUpdate, getFilteredLibraryData } from "./functions.js";

const MUSIC_LIBRARY = { version: null, data: null, lastCheck: 0 };
const SFX_LIBRARY = { version: null, data: null, lastCheck: 0 };

export default {
	async fetch(request) {
		const url = new URL(request.url);

		const search = url.searchParams.get("search")?.trim() || "";
		const random = Boolean(url.searchParams.get("random")?.trim()) || false;

		switch (true) {
			case url.pathname === "/":
				return Response.redirect("https://gd-libraries-api.m336.workers.dev/api/music");

			case url.pathname.startsWith("/api/music/"):
				await checkLibraryUpdate("music", MUSIC_LIBRARY);

				const musicId = url.pathname.split("/").pop();
				let music;

				if (musicId === "random") {
					music = MUSIC_LIBRARY.data[Math.floor(Math.random() * MUSIC_LIBRARY.data.length)];
				} else {
					music = MUSIC_LIBRARY.data.find(entry => entry.id == musicId);

					if (!music)
						return Response.redirect("https://gd-libraries-api.m336.workers.dev/api/music");
				}

				return Response.redirect(music.url);

			case url.pathname.startsWith("/api/sfx/"):
				await checkLibraryUpdate("sfx", SFX_LIBRARY);

				const sfxId = url.pathname.split("/").pop();
				let sfx;

				if (sfxId === "random") {
					sfx = SFX_LIBRARY.data[Math.floor(Math.random() * SFX_LIBRARY.data.length)];
				} else {
					sfx = SFX_LIBRARY.data.find(entry => entry.id == sfxId);

					if (!sfx)
						return Response.redirect("https://gd-libraries-api.m336.workers.dev/api/music");
				}

				return Response.redirect(sfx.url);

			case url.pathname === "/api/music":
				await checkLibraryUpdate("music", MUSIC_LIBRARY);
				const musicLibraryData = search ? getFilteredLibraryData(MUSIC_LIBRARY.data, search) : MUSIC_LIBRARY.data;

				return new Response(JSON.stringify(
					{
						type: "music",
						total: MUSIC_LIBRARY.data.length,
						version: MUSIC_LIBRARY.version,
						lastCheck: MUSIC_LIBRARY.lastCheck,
						search,

						data: random ? musicLibraryData[Math.floor(Math.random() * musicLibraryData.length)] : musicLibraryData
					}
				), { headers: { "Content-Type": "application/json" } });
			case url.pathname === "/api/sfx":
				await checkLibraryUpdate("sfx", SFX_LIBRARY);
				const sfxLibraryData = search ? getFilteredLibraryData(SFX_LIBRARY.data, search) : SFX_LIBRARY.data;

				return new Response(JSON.stringify(
					{
						type: "sfx",
						total: SFX_LIBRARY.data.length,
						version: SFX_LIBRARY.version,
						lastCheck: SFX_LIBRARY.lastCheck,
						search,

						data: random ? sfxLibraryData[Math.floor(Math.random() * sfxLibraryData.length)] : sfxLibraryData
					}
				), { headers: { "Content-Type": "application/json" } });
			default:
				return new Response("Not Found", { status: 404 });
		}
	}
};