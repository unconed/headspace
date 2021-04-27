import { evaluateTrack } from './track';

const TRACK = {
  "name": "track",
  "files": ["a.mp3", "b.mp3", "c.mp3", "d.mp3"],
  "inputs": ["activity", "hazard"],
  "expr": 
    ["add",
      ["lerp",
        ["mix",
          ["track", 0],
          ["track", 1],
          ["input", "activity", 0, 0.5, 0, 0.5]
        ],
        ["track", 2],
        ["input", "activity", 0.5, 1.0]
      ],
      ["mul",
        ["track", 3],
        ["input", "hazard"]
      ]
    ]
};

it("tests", () => {
  const sq = Math.sqrt;

  expect(evaluateTrack(TRACK, {activity: 0,    hazard: 0})).toEqual([1, 0, 0, 0]);
  expect(evaluateTrack(TRACK, {activity: 0.25, hazard: 0})).toEqual([sq(0.75), sq(0.25), 0, 0]);
  expect(evaluateTrack(TRACK, {activity: 0.5,  hazard: 0})).toEqual([sq(0.5), sq(0.5), 0, 0]);
  expect(evaluateTrack(TRACK, {activity: 0.75, hazard: 0})).toEqual([sq(0.5) * 0.5, sq(0.5) * 0.5, 0.5, 0]);
  expect(evaluateTrack(TRACK, {activity: 1.0,  hazard: 0})).toEqual([0, 0, 1.0, 0]);
  
  expect(evaluateTrack(TRACK, {activity: 0,    hazard: 0.6})).toEqual([1, 0, 0, 0.6]);
  expect(evaluateTrack(TRACK, {activity: 0.25, hazard: 0.6})).toEqual([sq(0.75), sq(0.25), 0, 0.6]);
  expect(evaluateTrack(TRACK, {activity: 0.5,  hazard: 0.6})).toEqual([sq(0.5), sq(0.5), 0, 0.6]);
  expect(evaluateTrack(TRACK, {activity: 0.75, hazard: 0.6})).toEqual([sq(0.5) * 0.5, sq(0.5) * 0.5, 0.5, 0.6]);
  expect(evaluateTrack(TRACK, {activity: 1.0,  hazard: 0.6})).toEqual([0, 0, 1.0, 0.6]);
});