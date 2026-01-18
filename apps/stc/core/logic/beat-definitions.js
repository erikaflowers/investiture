/**
 * Beat Definitions for Save the Cat
 *
 * Structure only - actual copy comes from content layer.
 * This defines the beats, their IDs, order, and relationships.
 */

export const beats = [
  {
    id: 'opening-image',
    number: 1,
    act: 1,
    subBeats: null
  },
  {
    id: 'theme-stated',
    number: 2,
    act: 1,
    subBeats: null
  },
  {
    id: 'setup',
    number: 3,
    act: 1,
    subBeats: null
  },
  {
    id: 'catalyst',
    number: 4,
    act: 1,
    subBeats: null
  },
  {
    id: 'debate',
    number: 5,
    act: 1,
    subBeats: null
  },
  {
    id: 'break-into-two',
    number: 6,
    act: 1,
    subBeats: null
  },
  {
    id: 'b-story',
    number: 7,
    act: 2,
    subBeats: null
  },
  {
    id: 'fun-and-games',
    number: 8,
    act: 2,
    subBeats: null
  },
  {
    id: 'midpoint',
    number: 9,
    act: 2,
    subBeats: null
  },
  {
    id: 'bad-guys-close-in',
    number: 10,
    act: 2,
    subBeats: null
  },
  {
    id: 'all-is-lost',
    number: 11,
    act: 2,
    subBeats: null
  },
  {
    id: 'dark-night-of-the-soul',
    number: 12,
    act: 2,
    subBeats: null
  },
  {
    id: 'break-into-three',
    number: 13,
    act: 2,
    subBeats: null
  },
  {
    id: 'finale',
    number: 14,
    act: 3,
    subBeats: [
      {
        id: 'finale-gathering',
        number: '14a',
        parentId: 'finale'
      },
      {
        id: 'finale-executing',
        number: '14b',
        parentId: 'finale'
      },
      {
        id: 'finale-high-tower',
        number: '14c',
        parentId: 'finale'
      },
      {
        id: 'finale-dig-deep',
        number: '14d',
        parentId: 'finale'
      },
      {
        id: 'finale-new-plan',
        number: '14e',
        parentId: 'finale'
      }
    ]
  },
  {
    id: 'final-image',
    number: 15,
    act: 3,
    subBeats: null
  }
];

/**
 * Get all beat IDs (including sub-beats) for iteration
 */
export function getAllBeatIds() {
  const ids = [];
  for (const beat of beats) {
    ids.push(beat.id);
    if (beat.subBeats) {
      for (const sub of beat.subBeats) {
        ids.push(sub.id);
      }
    }
  }
  return ids;
}

/**
 * Get total count of fillable beats (including sub-beats)
 */
export function getTotalBeatCount() {
  return getAllBeatIds().length;
}

/**
 * Get beat by ID
 */
export function getBeatById(id) {
  for (const beat of beats) {
    if (beat.id === id) return beat;
    if (beat.subBeats) {
      const sub = beat.subBeats.find(s => s.id === id);
      if (sub) return sub;
    }
  }
  return null;
}

/**
 * Get beats grouped by act
 */
export function getBeatsByAct() {
  return {
    1: beats.filter(b => b.act === 1),
    2: beats.filter(b => b.act === 2),
    3: beats.filter(b => b.act === 3)
  };
}
