import { checkLibraryUpdate, getFilteredLibraryData } from "./functions.js";

const MUSIC_LIBRARY = { version: null, data: null, lastCheck: 0 };
const SFX_LIBRARY = { version: null, data: null, lastCheck: 0 };

export default {
	async fetch(request) {
		const url = new URL(request.url);
		const search = url.searchParams.get("search")?.trim() || "";

		switch (true) {
			case url.pathname.startsWith("/api/music/"):
				await checkLibraryUpdate("music", MUSIC_LIBRARY);

				const musicId = url.pathname.split("/").pop();
				const music = MUSIC_LIBRARY.data.filter(entry => entry.id == musicId);

				if (music.length == 1)
					return Response.redirect(music[0].url);
				else
					return Response.redirect("https://gd-libraries-api.m336.workers.dev/api/music");

			case url.pathname.startsWith("/api/sfx/"):
				await checkLibraryUpdate("sfx", SFX_LIBRARY);

				const sfxId = url.pathname.split("/").pop();
				const sfx = SFX_LIBRARY.data.filter(entry => entry.id == sfxId);

				if (sfx.length == 1)
					return Response.redirect(sfx[0].url);
				else
					return Response.redirect("https://gd-libraries-api.m336.workers.dev/api/sfx");

			case url.pathname === "/api/music":
				await checkLibraryUpdate("music", MUSIC_LIBRARY);

				return new Response(JSON.stringify(
					{
						type: "music",
						total: MUSIC_LIBRARY.data.length,
						version: MUSIC_LIBRARY.version,
						lastCheck: MUSIC_LIBRARY.lastCheck,
						search,

						data: search ? getFilteredLibraryData(MUSIC_LIBRARY.data, search) : MUSIC_LIBRARY.data
					}
				), { headers: { "Content-Type": "application/json" } });
			case url.pathname === "/api/sfx":
				await checkLibraryUpdate("sfx", SFX_LIBRARY);

				return new Response(JSON.stringify(
					{
						type: "sfx",
						total: SFX_LIBRARY.data.length,
						version: SFX_LIBRARY.version,
						lastCheck: SFX_LIBRARY.lastCheck,
						search,

						data: search ? getFilteredLibraryData(SFX_LIBRARY.data, search) : SFX_LIBRARY.data
					}
				), { headers: { "Content-Type": "application/json" } });
			default:
				return new Response("Not Found", { status: 404 });
		}
	}
};