## Headspace Music Format

A headspace track contains multiple sound layers which are played simultaneously. The layers are mixed together according to a mixing graph, controlled by input parameters.

It is packaged as a set of files:
- `album.json` - Album & Track metadata
- `[file].mp3` xN - Sound layer
- `index.html` - cover art (+ jpg/pngs)

These may be zipped for convenience into a `.headspace.zip` file.

The data inside `/music` contains an example definition. The MP3 files are not included but can be heard on [https://headspace.acko.net/](https://headspace.acko.net/).

The track data in `/music` is split up into individual `track.json` files. The `scripts/process-music.js` script produces the combined `album.json` JSON.

### Track

```js
{
  // Track metadata
  "meta": {
    "name": "Labor of Love ✨"
  },
  // Sound files
  "files": ["339731771.mp3", "201128030.mp3", "646167737.mp3"],
  // Input parameter names (0...1)
  "inputs": ["activity", "hazard"],
  // Marker points inside the parameter space (0..1) for the 3 sound layers
  "points": [[0, 0], [1, 0], [0.5, 1]],
  // Mixing expression
  "expr": 
    // ["add", a, b] - add two tracks
    ["add",
      // ["mix", a, b, t] - mix two signals a and b with a sqrt crossfade of ratio t (0..1) (for uncorrelated signals)
      // ["lerp", a, b, t] - mix two signals a and b with a linear crossfade of ratio t (0..1) (for correlated signals)
      ["mix",
        // ["track", i] - play track #
        ["track", 0],
        ["track", 1],
        // ["input", name] - use parameter (0..1)
        // ["input", name, a, b] - use parameter with (a..b) remapped to (0..1)
        // ["input", name, a, b, c, d] - use parameter with (a..b) remapped to (c..d)
        ["input", "activity"]
      ],
      // ["mul", a, s] - scale a's gain by factor s
      ["mul",
        ["track", 2],
        ["input", "hazard"]
      ]
    ],
  // Global type marker
  "type": "@acko.net/headspace/album"
}
```

### Album

```js
{
  // Unique album ID
  "id": "hardspace-shipbreaker-2021-04",
  // Album metadata
  "meta": {
    "name": "Hardspace: Shipbreaker OST",
    "artist": "Jono Grant, Traz Damji, Philip J Bennett, Ben McCullough"
  },
  // Tracks
  "tracks": [{...Track}],
  // Cover art
  "art": "index.html",
  // Global type marker
  "type": "@acko.net/headspace/album"
}

