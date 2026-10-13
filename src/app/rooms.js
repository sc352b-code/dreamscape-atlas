export const ROOMS = Object.freeze([
  { id: 'statistics', name: 'STATISTICAL ANALYSIS', title: 'The celestial observatory', cue: 'See the patterns written in your dreams', symbol: '◎' },
  { id: 'podcast', name: 'PODCAST OVERVIEW', title: 'The listening chamber', cue: 'Listen to the story unfolding within', symbol: '≋' },
  { id: 'oracle', name: 'ORACLE CARDS', title: 'A thread through your dreams', cue: 'Receive a reflection. Discover its sources.', symbol: '✧' },
  { id: 'dream-journal', name: 'DREAM JOURNAL', title: 'Before the dream fades', cue: 'Give a fleeting world a place to stay', symbol: '☾' },
  { id: 'waking-journal', name: 'WAKING JOURNAL', title: 'The waking pages', cue: 'Keep the moments that meet your dreams', symbol: '☼' },
  { id: 'collections', name: 'MY COLLECTIONS/ MY FAVE COLLECTIONS', title: 'Your cabinet of treasures', cue: 'Keep what feels close to your heart', symbol: '❋' },
  { id: 'luminous', name: 'LUMINOUS MESSAGES', title: 'The luminous chamber', cue: 'Return to dreams you find significant', symbol: '✦' },
  { id: 'world', name: 'DREAM WORLD', title: 'Worlds within your dreams', cue: 'Follow a planet into an illustrated world', symbol: '◉' },
  { id: 'insights', name: 'DREAM INSIGHTS/ COLLECTIVE DREAM INSIGHTS', title: 'The illuminated manuscript', cue: 'Read your dreams as an unfolding story', symbol: '⌘' },
]);
export const roomById = id => ROOMS.find(room => room.id === id);
