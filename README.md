# gd-libraries-api
A Cloudflare Workers API JSON wrapper for more convenient use of Geometry Dash's music & SFX libraries' data.

## Usage
With this API, you may access two endpoints:
- `GET /api/music` for a JSON output of the music library.
- `GET /api/sfx` for a JSON output of the SFX library.

Additionally, you may use the `?search=` query parameter to filter results around a specific string like so:

`/api/music?search=Flamewall`
```json
{
    "type": "music",
    "total": 12881,
    "version": 141,
    "lastCheck": 1767629014471,
    "search": "Flamewall",
    "data": [
        {
            "id": 10007151,
            "name": "Flamewall",
            "artists": [
                {
                    "id": 10002569,
                    "name": "Camellia",
                    "website": "https://cametek.jp",
                    "youtube": "UCV4ggxLd_Vz-I-ePGSKfFog"
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