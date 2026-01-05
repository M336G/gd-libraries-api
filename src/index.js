import { checkLibraryUpdate, getFilteredLibraryData } from "./functions.js";

const GD_LIBRARY = { version: null, data: null, lastCheck: 0 };
const SFX_LIBRARY = { version: null, data: null, lastCheck: 0 };

export default {
	async fetch(request) {
		const url = new URL(request.url);
		const search = url.searchParams.get("search")?.trim() || "";

		switch (url.pathname) {
			case "/api/music":
				await checkLibraryUpdate("music", GD_LIBRARY);

				return new Response(JSON.stringify(
					{
						type: "music",
						total: GD_LIBRARY.data.length,
						version: GD_LIBRARY.version,
						lastCheck: GD_LIBRARY.lastCheck,
						search,

						data: search ? getFilteredLibraryData(GD_LIBRARY.data, search) : GD_LIBRARY.data
					}
				), { headers: { "Content-Type": "application/json" } });
			case "/api/sfx":
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