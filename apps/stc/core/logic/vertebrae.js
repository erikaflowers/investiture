// /apps/stc/core/logic/vertebrae.js
// The 5 Vertebrae + Humor Modifier for Save the Cat Builder

export const genres = [
  { id: 'literary', name: 'Literary Fiction', description: 'Character-driven, explores human condition' },
  { id: 'fantasy', name: 'Fantasy', description: 'Magic, other worlds, supernatural elements' },
  { id: 'scifi', name: 'Science Fiction', description: 'Future tech, space, speculative science' },
  { id: 'horror', name: 'Horror', description: 'Fear, dread, the macabre' },
  { id: 'thriller', name: 'Thriller', description: 'Suspense, danger, high stakes' },
  { id: 'mystery', name: 'Mystery', description: 'Crime, investigation, whodunit' },
  { id: 'romance', name: 'Romance', description: 'Love story with emotionally satisfying ending' },
  { id: 'historical', name: 'Historical Fiction', description: 'Set in a specific past era' },
  { id: 'western', name: 'Western', description: 'American frontier, cowboys, lawlessness' },
  { id: 'gothic', name: 'Gothic', description: 'Dark romance, decay, atmosphere of dread' },
  { id: 'dystopian', name: 'Dystopian', description: 'Dark future societies, oppressive systems' },
  { id: 'adventure', name: 'Adventure', description: 'Action, exploration, physical challenges' }
];

export const archetypes = [
  { id: 'overcoming-monster', name: 'Overcoming the Monster', source: 'Christopher Booker', description: 'Hero confronts and defeats a threatening evil force', examples: 'Beowulf, Dracula, Jaws, Star Wars' },
  { id: 'rags-to-riches', name: 'Rags to Riches', source: 'Christopher Booker', description: 'Protagonist gains wealth/power/love, loses it, earns it back', examples: 'Cinderella, Great Expectations, Aladdin' },
  { id: 'quest', name: 'The Quest', source: 'Christopher Booker', description: 'Hero and companions journey to find something vital', examples: 'Lord of the Rings, Raiders of the Lost Ark' },
  { id: 'voyage-return', name: 'Voyage and Return', source: 'Christopher Booker', description: 'Protagonist travels to strange world, returns transformed', examples: 'Alice in Wonderland, The Wizard of Oz, Narnia' },
  { id: 'comedy', name: 'Comedy', source: 'Christopher Booker', description: 'Confusion and misunderstanding resolved through revelation', examples: 'A Midsummer Night\'s Dream, Bridget Jones' },
  { id: 'tragedy', name: 'Tragedy', source: 'Christopher Booker', description: 'Protagonist\'s flaw leads to their downfall', examples: 'Macbeth, Anna Karenina, Breaking Bad' },
  { id: 'rebirth', name: 'Rebirth', source: 'Christopher Booker', description: 'Protagonist transformed by redemption or second chance', examples: 'A Christmas Carol, Beauty and the Beast' }
];

export const themes = [
  { id: 'good-vs-evil', name: 'Good vs. Evil', description: 'The eternal moral battle' },
  { id: 'redemption', name: 'Redemption', description: 'Earning forgiveness, making amends' },
  { id: 'identity', name: 'Identity & Self-Discovery', description: 'Who am I? Finding oneself' },
  { id: 'power-corruption', name: 'Power & Corruption', description: 'How power changes people' },
  { id: 'love', name: 'Love & Sacrifice', description: 'What we give up for those we love' },
  { id: 'survival', name: 'Survival', description: 'The will to live against all odds' },
  { id: 'justice', name: 'Justice & Revenge', description: 'Righting wrongs, the cost of vengeance' },
  { id: 'loss-of-innocence', name: 'Loss of Innocence', description: 'Coming to terms with harsh reality' },
  { id: 'freedom', name: 'Freedom vs. Oppression', description: 'Fighting against control' },
  { id: 'belonging', name: 'Belonging & Isolation', description: 'The need for connection' },
  { id: 'mortality', name: 'Mortality & Legacy', description: 'Confronting death, what we leave behind' },
  { id: 'truth-vs-lies', name: 'Truth vs. Deception', description: 'Hidden truths, the cost of lies' },
  { id: 'nature-vs-nurture', name: 'Nature vs. Nurture', description: 'Are we born or made?' },
  { id: 'man-vs-nature', name: 'Man vs. Nature', description: 'Humanity against the wild' },
  { id: 'faith', name: 'Faith & Doubt', description: 'Belief tested, questions of meaning' }
];

export const tones = [
  { id: 'dark', name: 'Dark', description: 'Heavy, ominous, bleak' },
  { id: 'hopeful', name: 'Hopeful', description: 'Optimistic undercurrent, light at the end' },
  { id: 'gritty', name: 'Gritty', description: 'Raw, realistic, unflinching' },
  { id: 'whimsical', name: 'Whimsical', description: 'Playful, fanciful, lighthearted' },
  { id: 'melancholic', name: 'Melancholic', description: 'Sad, wistful, bittersweet' },
  { id: 'suspenseful', name: 'Suspenseful', description: 'Tense, anxious, edge-of-seat' },
  { id: 'romantic', name: 'Romantic', description: 'Emotional, passionate, idealized' },
  { id: 'epic', name: 'Epic', description: 'Grand, sweeping, larger than life' },
  { id: 'intimate', name: 'Intimate', description: 'Quiet, personal, introspective' },
  { id: 'dreamlike', name: 'Dreamlike', description: 'Surreal, hazy, otherworldly' },
  { id: 'nostalgic', name: 'Nostalgic', description: 'Longing for the past, warm remembrance' },
  { id: 'foreboding', name: 'Foreboding', description: 'Sense of impending doom' }
];

export const stakes = [
  { id: 'personal', name: 'Personal', description: 'One person\'s soul, sanity, identity, or life' },
  { id: 'relational', name: 'Relational', description: 'A relationship, family, friendship, or love' },
  { id: 'community', name: 'Community', description: 'A town, crew, tribe, or small group' },
  { id: 'societal', name: 'Societal', description: 'A nation, culture, or institution' },
  { id: 'existential', name: 'Existential', description: 'Humanity, the world, civilization' },
  { id: 'cosmic', name: 'Cosmic', description: 'Reality itself, the universe, existence' }
];

// Humor Modifier - orthogonal to tone
export const humorPresence = [
  { id: 'none', name: 'Played Straight', description: 'No intentional humor' },
  { id: 'accent', name: 'Accent', description: 'Humor seasons the story but isn\'t central' },
  { id: 'structural', name: 'Structural', description: 'Humor is load-bearing, shapes the experience' }
];

export const humorStyle = [
  { id: 'dry', name: 'Dry/Deadpan', description: 'Understated, subtle' },
  { id: 'sharp', name: 'Sharp/Banter', description: 'Quick wit, character-driven' },
  { id: 'dark', name: 'Dark Comedy', description: 'Humor drawn from grim situations' },
  { id: 'absurdist', name: 'Absurdist', description: 'Logic breaks, surreal humor' },
  { id: 'satirical', name: 'Satirical', description: 'Mocking institutions or norms' }
];

// Convenience export of all vertebrae
export const vertebrae = {
  genres,
  archetypes,
  themes,
  tones,
  stakes,
  humor: {
    presence: humorPresence,
    style: humorStyle
  }
};

export default vertebrae;