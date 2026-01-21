/**
 * Save the Cat Beat Sheet - All 19 Beats
 *
 * The complete story structure across 4 acts.
 * Each beat has: id, name, act, description, question
 */

export const acts = [
  { id: 'act1', name: 'Act 1', subtitle: 'The Setup' },
  { id: 'act2a', name: 'Act 2A', subtitle: 'Fun and Games' },
  { id: 'act2b', name: 'Act 2B', subtitle: 'Bad Guys Close In' },
  { id: 'act3', name: 'Act 3', subtitle: 'Finale' }
];

export const beats = [
  // ========== ACT 1 - THE SETUP ==========
  {
    id: 'opening-image',
    name: 'Opening Image',
    act: 'act1',
    order: 1,
    description: "A snapshot of the protagonist's world BEFORE the journey begins. Sets tone, mood, and stakes. Often mirrors or contrasts with the Final Image.",
    question: "What does your protagonist's 'before' world look like?"
  },
  {
    id: 'theme-stated',
    name: 'Theme Stated',
    act: 'act1',
    order: 2,
    description: "Someone (not the protagonist) states the theme or lesson the protagonist will learn. They usually don't recognize it yet.",
    question: "What truth will your protagonist discover by the end?"
  },
  {
    id: 'setup',
    name: 'Setup',
    act: 'act1',
    order: 3,
    description: "Introduce the protagonist, their world, their wants, and what's missing in their life. Plant seeds that will pay off later.",
    question: "Who is your protagonist and what do they think they want?"
  },
  {
    id: 'catalyst',
    name: 'Catalyst',
    act: 'act1',
    order: 4,
    description: "The inciting incident. Something happens that disrupts the status quo and sets the story in motion. Life will never be the same.",
    question: "What event forces your protagonist out of their ordinary world?"
  },
  {
    id: 'debate',
    name: 'Debate',
    act: 'act1',
    order: 5,
    description: "The protagonist hesitates. Should they go? Can they do this? This is the last chance to turn back.",
    question: "What doubts or obstacles make your protagonist hesitate?"
  },
  {
    id: 'break-into-2',
    name: 'Break Into 2',
    act: 'act1',
    order: 6,
    description: "The protagonist makes a CHOICE to enter the new world. This must be active, not passive. They cross the threshold.",
    question: "What choice does your protagonist make to begin the adventure?"
  },

  // ========== ACT 2A - FUN AND GAMES ==========
  {
    id: 'b-story',
    name: 'B Story',
    act: 'act2a',
    order: 7,
    description: "A secondary story begins, often a love story or friendship. This relationship will help the protagonist learn the theme.",
    question: "Who does your protagonist meet who will help them grow?"
  },
  {
    id: 'fun-and-games',
    name: 'Fun and Games',
    act: 'act2a',
    order: 8,
    description: "The promise of the premise. This is why the audience came. The protagonist explores the new world, often with early successes.",
    question: "What scenes deliver on the promise of your concept?"
  },
  {
    id: 'midpoint',
    name: 'Midpoint',
    act: 'act2a',
    order: 9,
    description: "A false victory or false defeat. Stakes are raised. The protagonist shifts from 'wanting' to 'needing.' Often a party, celebration, or revelation.",
    question: "What event raises the stakes and shifts your protagonist's understanding?"
  },

  // ========== ACT 2B - BAD GUYS CLOSE IN ==========
  {
    id: 'bad-guys-close-in',
    name: 'Bad Guys Close In',
    act: 'act2b',
    order: 10,
    description: "External pressure mounts (villains, rivals, forces). Internal pressure too (doubt, team fractures, secrets revealed). Things fall apart.",
    question: "How do external and internal forces tighten the screws?"
  },
  {
    id: 'all-is-lost',
    name: 'All Is Lost',
    act: 'act2b',
    order: 11,
    description: "The lowest point. A major defeat, death, or loss. The opposite of the Midpoint. Often includes a 'whiff of death' - literal or symbolic.",
    question: "What is the worst thing that could happen to your protagonist?"
  },
  {
    id: 'dark-night-of-the-soul',
    name: 'Dark Night of the Soul',
    act: 'act2b',
    order: 12,
    description: "The protagonist processes the loss. Wallowing, mourning, ready to give up. But in this darkness, they find clarity.",
    question: "How does your protagonist sit with their failure before finding the answer?"
  },
  {
    id: 'break-into-3',
    name: 'Break Into 3',
    act: 'act2b',
    order: 13,
    description: "A new idea, inspiration, or information. The A and B stories combine. The protagonist knows what they must do.",
    question: "What revelation gives your protagonist the key to the finale?"
  },

  // ========== ACT 3 - FINALE ==========
  {
    id: 'gathering-the-team',
    name: 'Gathering the Team',
    act: 'act3',
    order: 14,
    description: "The protagonist prepares for the final battle. Allies are gathered, plans are made, tools are assembled.",
    question: "How does your protagonist prepare for the final confrontation?"
  },
  {
    id: 'executing-the-plan',
    name: 'Executing the Plan',
    act: 'act3',
    order: 15,
    description: "The plan is put into action. Initial progress, but something will go wrong.",
    question: "What's the plan, and how does it start to work?"
  },
  {
    id: 'high-tower-surprise',
    name: 'High Tower Surprise',
    act: 'act3',
    order: 16,
    description: "A twist. The plan fails, or a new threat emerges. The protagonist must adapt.",
    question: "What goes wrong that forces your protagonist to improvise?"
  },
  {
    id: 'dig-deep-down',
    name: 'Dig Deep Down',
    act: 'act3',
    order: 17,
    description: "The protagonist must use everything they've learned. This is where the theme is proven through action.",
    question: "How does your protagonist apply what they've learned to overcome the final obstacle?"
  },
  {
    id: 'execution-of-new-plan',
    name: 'Execution of the New Plan',
    act: 'act3',
    order: 18,
    description: "The new approach works. The antagonist is defeated, the goal is achieved (or meaningfully failed).",
    question: "How does your protagonist finally succeed (or fail)?"
  },
  {
    id: 'final-image',
    name: 'Final Image',
    act: 'act3',
    order: 19,
    description: "A snapshot of the protagonist's world AFTER. Mirrors or contrasts Opening Image. Proves transformation happened.",
    question: "What does your protagonist's 'after' world look like?"
  }
];

/**
 * Get beats organized by act
 */
export function getBeatsByAct() {
  return {
    act1: beats.filter(b => b.act === 'act1'),
    act2a: beats.filter(b => b.act === 'act2a'),
    act2b: beats.filter(b => b.act === 'act2b'),
    act3: beats.filter(b => b.act === 'act3')
  };
}

/**
 * Get a single beat by ID
 */
export function getBeatById(beatId) {
  return beats.find(b => b.id === beatId);
}

/**
 * Get act info by ID
 */
export function getActById(actId) {
  return acts.find(a => a.id === actId);
}
