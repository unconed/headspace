# Headspace

Headspace is a dynamic soundtrack player for the web, based on the game [Hardspace Shipbreaker](https://hardspace-shipbreaker.com/) by [Blackbird Interactive](https://blackbirdinteractive.com/).

It plays back multiple sound files while allowing the user to control levels according to a pre-defined parameter mapping. This turns a song into an instrument you can play.

Demo at: [https://headspace.acko.net/](https://headspace.acko.net/).

### Running Locally

Running a local copy:

- `node` and `yarn` required
- `git clone` this repo
- `cd headspace`
- `yarn install`
- `node scripts/process-music.js`
- `yarn start`

### Format

The headspace album/track format is documented in [FORMAT.md](FORMAT.md). If you put new album data inside `/music`, `node scripts/process-music.js` will pick it up and allow you to play it with the UI remotely.

It can carry arbitrary number of layers, parameters, and even custom mixing formulas (via a simple AST).

### Auto-Control

The playback parameters can be controlled remotely by opening e.g.:

[https://headspace.acko.net/#listen=http://localhost:44100](https://headspace.acko.net/#listen=http://localhost:44100).

This is used by the [Visual Studio Code extension](https://github.com/unconed/vscode-headspace) to provide a live coding soundtrack.

The player will connect to an HTTP EventStream (i.e. Server-Sent Events) at the given url (`http://localhost:44100`). It will expect JSON-formatted packets with parameter updates, e.g.:

`{"activity": 0.24, "hazard": 0.31}`

Adding a `time` value will control the speed of transitions, though this is still hard-limited by an internal limit of 150ms and plenty of smoothing.

### Changelog

2021-04-29
* Add shuffle and volume
* Dip main score by 10% on full hazard

### Colofon

Code by <a target="_blank" href="https://acko.net/">unconed</a>. Music extracted from .WEM using <a target="_blank" href="https://vgmstream.org">VGMStream</a>. Thanks to <a href="https://github.com/hcs64/ww2ogg">hcs</a>.</small>
      
Hardspace: Shipbreaker music by Jono Grant, Traz Damji, Philip J Bennett, Ben McCullough.

_This repo does not contain any copyrighted songs._