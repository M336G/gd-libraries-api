# gd-libraries-api
A Cloudflare Workers API JSON wrapper for more convenient use of Geometry Dash's music & SFX libraries' data.

## Usage
With this API, you may access a total of four endpoints:
- `GET /api/music/<id>` to get redirected to a music's direct download link with up-to-date CDN tokens (works as a permanent endpoint).
- `GET /api/sfx/<id>` to get redirected to an SFX's direct download link with up-to-date CDN tokens (works as a permanent endpoint).
- `GET /api/music` to get a JSON output of the music library.
- `GET /api/sfx` to get a JSON output of the SFX library.

Additionally, you may use the `?search=` query parameter to filter results around a specific string like so:

`/api/music?search=Flamewall`
```json
{
    "type": "music",
    "total": 12881,
    "version": 141,
    "lastCheck": 1767725513750,
    "search": "Flamewall",
    "data": [
        {
            "id": 10007151,
            "name": "Flamewall",
            "url": "https://geometrydashfiles.b-cdn.net/music/10007151.ogg?expires=1767729113&token=9pz-g7Zk-kNTF_r1YQ8tJw",
            "artists": [
                {
                    "id": 10002569,
                    "name": "Camellia",
                    "website": "https://cametek.jp",
                    "youtube": "https://www.youtube.com/channel/UCV4ggxLd_Vz-I-ePGSKfFog"
                }
            ],
            "size": 8720828,
            "duration": 407,
            "tags": [
                "Electronic"
            ]
        }
    ]
}
```
***Note:** this query parameter can be used for both endpoints, not just the music library one.*

## Contributing
Feel free to open pull requests if you wish to contribute to the project!

## License
This project is licensed under the [Mozilla Public License Version 2.0](https://github.com/M336G/gd-libraries-api/blob/main/LICENSE).