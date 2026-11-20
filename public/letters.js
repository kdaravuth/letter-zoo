/* Letter Zoo: stroke paths for every letter, in stroke order.
   Grid: x 0-100. Top line y=20, middle line y=60, base line y=100, tail line y=130.
   Each string is one stroke (an SVG path), drawn in the direction kids should write it.
   "dot:x,y" is a dot to tap (i, j). */
window.LETTERS = {
  upper: {
    A: ['M50 20 L22 100', 'M50 20 L78 100', 'M32 72 H68'],
    B: ['M28 20 V100', 'M28 20 H52 C74 20 74 60 52 60 H28', 'M28 60 H54 C80 60 80 100 54 100 H28'],
    C: ['M75 32 A32 40 0 1 0 75 88'],
    D: ['M28 20 V100', 'M28 20 H44 C86 20 86 100 44 100 H28'],
    E: ['M30 20 V100', 'M30 20 H72', 'M30 60 H64', 'M30 100 H72'],
    F: ['M30 20 V100', 'M30 20 H72', 'M30 60 H64'],
    G: ['M75 32 A32 40 0 1 0 84 64 H62'],
    H: ['M28 20 V100', 'M72 20 V100', 'M28 60 H72'],
    I: ['M50 20 V100', 'M34 20 H66', 'M34 100 H66'],
    J: ['M62 20 V78 C62 106 28 104 26 84'],
    K: ['M30 20 V100', 'M72 20 L30 62', 'M30 62 L74 100'],
    L: ['M32 20 V100 H72'],
    M: ['M22 20 V100', 'M22 20 L50 72 L78 20', 'M78 20 V100'],
    N: ['M26 20 V100', 'M26 20 L74 100', 'M74 100 V20'],
    O: ['M50 20 A32 40 0 1 0 50 100 A32 40 0 1 0 50 20'],
    P: ['M30 20 V100', 'M30 20 H52 C76 20 76 62 52 62 H30'],
    Q: ['M50 20 A32 40 0 1 0 50 100 A32 40 0 1 0 50 20', 'M56 78 L80 104'],
    R: ['M30 20 V100', 'M30 20 H52 C76 20 76 60 52 60 H30', 'M48 60 L74 100'],
    S: ['M74 32 C68 18 36 14 30 32 C24 52 76 50 76 76 C76 100 34 104 26 86'],
    T: ['M50 20 V100', 'M24 20 H76'],
    U: ['M26 20 V70 C26 108 74 108 74 70 V20'],
    V: ['M22 20 L50 100 L78 20'],
    W: ['M14 20 L32 100 L50 40 L68 100 L86 20'],
    X: ['M24 20 L76 100', 'M76 20 L24 100'],
    Y: ['M24 20 L50 60', 'M76 20 L50 60', 'M50 60 V100'],
    Z: ['M26 20 H74 L26 100 H74']
  },
  lower: {
    a: ['M68 68 C60 56 34 56 32 80 C30 102 60 104 68 90', 'M68 60 V100'],
    b: ['M32 20 V100', 'M32 78 C38 58 70 56 70 80 C70 104 38 102 32 86'],
    c: ['M68 68 C60 56 34 58 32 80 C30 102 60 104 68 92'],
    d: ['M68 68 C60 56 34 56 32 80 C30 102 60 104 68 90', 'M68 20 V100'],
    e: ['M32 80 H68 C68 58 34 54 32 78 C30 102 60 104 68 92'],
    f: ['M66 26 C62 16 44 16 44 34 V100', 'M30 60 H60'],
    g: ['M68 68 C60 56 34 56 32 80 C30 102 60 104 68 90', 'M68 60 V118 C68 136 36 136 32 120'],
    h: ['M32 20 V100', 'M32 76 C38 56 68 56 68 76 V100'],
    i: ['M50 60 V100', 'dot:50,44'],
    j: ['M56 60 V118 C56 136 30 134 28 120', 'dot:56,44'],
    k: ['M32 20 V100', 'M66 58 L32 80', 'M32 80 L68 100'],
    l: ['M50 20 V100'],
    m: ['M24 60 V100', 'M24 74 C26 56 50 56 50 74 V100', 'M50 74 C52 56 76 56 76 74 V100'],
    n: ['M30 60 V100', 'M30 76 C34 56 70 56 70 76 V100'],
    o: ['M50 60 A20 20 0 1 0 50 100 A20 20 0 1 0 50 60'],
    p: ['M32 60 V130', 'M32 76 C38 58 70 56 70 80 C70 104 38 102 32 86'],
    q: ['M68 68 C60 56 34 56 32 80 C30 102 60 104 68 90', 'M68 60 V130'],
    r: ['M36 60 V100', 'M36 78 C40 58 60 56 68 64'],
    s: ['M66 66 C60 56 36 56 36 70 C36 82 66 78 66 90 C66 104 38 104 32 94'],
    t: ['M50 30 V100', 'M34 60 H66'],
    u: ['M30 60 V82 C30 104 70 104 70 82', 'M70 60 V100'],
    v: ['M30 60 L50 100 L70 60'],
    w: ['M18 60 L32 100 L50 66 L68 100 L82 60'],
    x: ['M30 60 L70 100', 'M70 60 L30 100'],
    y: ['M30 60 L50 100', 'M70 60 L42 130'],
    z: ['M32 60 H68 L32 100 H68']
  }
};

/* The animal hiding in each letter's egg. */
window.ANIMALS = {
  A: { name: 'Alligator', emoji: '🐊' },
  B: { name: 'Bear', emoji: '🐻' },
  C: { name: 'Cat', emoji: '🐱' },
  D: { name: 'Dog', emoji: '🐶' },
  E: { name: 'Elephant', emoji: '🐘' },
  F: { name: 'Frog', emoji: '🐸' },
  G: { name: 'Giraffe', emoji: '🦒' },
  H: { name: 'Horse', emoji: '🐴' },
  I: { name: 'Inchworm', emoji: '🐛' },
  J: { name: 'Jaguar', emoji: '🐆' },
  K: { name: 'Kangaroo', emoji: '🦘' },
  L: { name: 'Lion', emoji: '🦁' },
  M: { name: 'Monkey', emoji: '🐵' },
  N: { name: 'Newt', emoji: '🦎' },
  O: { name: 'Octopus', emoji: '🐙' },
  P: { name: 'Penguin', emoji: '🐧' },
  Q: { name: 'Queen bee', emoji: '🐝' },
  R: { name: 'Rabbit', emoji: '🐰' },
  S: { name: 'Sloth', emoji: '🦥' },
  T: { name: 'Tiger', emoji: '🐯' },
  U: { name: 'Unicorn', emoji: '🦄' },
  V: { name: 'Vole', emoji: '🐭' },
  W: { name: 'Whale', emoji: '🐳' },
  X: { name: 'X-ray fish', emoji: '🐟' },
  Y: { name: 'Yak', emoji: '🐃' },
  Z: { name: 'Zebra', emoji: '🦓' }
};

/* Champions board player names: a fun word + an animal buddy + a number, never a real name.
   Keep these lists the same as ADJ and BUDDY in server.js. */
window.PLAYER_WORDS = ['Sunny', 'Happy', 'Brave', 'Speedy', 'Sparkly', 'Jolly', 'Clever', 'Bouncy', 'Cozy', 'Lucky', 'Giggly', 'Mighty'];
window.PLAYER_BUDDY = { A: 'Alligator', B: 'Bear', C: 'Cat', D: 'Dog', E: 'Elephant', F: 'Frog', G: 'Giraffe', H: 'Horse', I: 'Inchworm', J: 'Jaguar', K: 'Kangaroo', L: 'Lion', M: 'Monkey', N: 'Newt', O: 'Octopus', P: 'Penguin', Q: 'Bee', R: 'Rabbit', S: 'Sloth', T: 'Tiger', U: 'Unicorn', V: 'Vole', W: 'Whale', X: 'Fish', Y: 'Yak', Z: 'Zebra' };

/* Treat Time: the treat each animal gets after its letter is traced (emoji, how it is said). */
window.ANIMAL_TREATS = {
  A: ['🍗', 'some chicken'], B: ['🍯', 'some honey'], C: ['🥛', 'some milk'], D: ['🦴', 'a bone'],
  E: ['🥜', 'some peanuts'], F: ['🪰', 'a fly'], G: ['🌿', 'some leaves'], H: ['🍎', 'an apple'],
  I: ['🍃', 'a leaf'], J: ['🍖', 'some meat'], K: ['🌱', 'some sprouts'], L: ['🥩', 'a steak'],
  M: ['🍌', 'a banana'], N: ['🐜', 'an ant'], O: ['🦐', 'a shrimp'], P: ['🐟', 'a fish'],
  Q: ['🌻', 'a sunflower'], R: ['🥕', 'a carrot'], S: ['🌺', 'a flower'], T: ['🍉', 'some watermelon'],
  U: ['🍰', 'some cake'], V: ['🧀', 'some cheese'], W: ['🦑', 'a squid'], X: ['🍤', 'a shrimp'],
  Y: ['🌾', 'some hay'], Z: ['🍏', 'a green apple']
};

/* Living zoo: where each animal lives in the park, what it says, and how fast it moves. */
window.ANIMAL_EXTRA = {
  A: { home: 'water', sound: 'Snap snap!', speed: 0.7 },
  B: { home: 'land', sound: 'Grrr!', speed: 0.8 },
  C: { home: 'land', sound: 'Meow!', speed: 1.2 },
  D: { home: 'land', sound: 'Woof woof!', speed: 1.4 },
  E: { home: 'land', sound: 'Pawoo!', speed: 0.6 },
  F: { home: 'land', sound: 'Ribbit!', speed: 1.3, hop: true },
  G: { home: 'land', sound: 'Munch munch!', speed: 0.8 },
  H: { home: 'land', sound: 'Neigh!', speed: 1.6 },
  I: { home: 'land', sound: 'Wiggle wiggle!', speed: 0.35 },
  J: { home: 'land', sound: 'Rawr!', speed: 1.7 },
  K: { home: 'land', sound: 'Boing boing!', speed: 1.5, hop: true },
  L: { home: 'land', sound: 'Roar!', speed: 1.1 },
  M: { home: 'land', sound: 'Ooh ooh ah ah!', speed: 1.4, hop: true },
  N: { home: 'water', sound: 'Splish splash!', speed: 0.9 },
  O: { home: 'water', sound: 'Blub blub!', speed: 0.7 },
  P: { home: 'land', sound: 'Squawk!', speed: 0.7 },
  Q: { home: 'sky', sound: 'Bzzzz!', speed: 1.6 },
  R: { home: 'land', sound: 'Hop hop!', speed: 1.5, hop: true },
  S: { home: 'land', sound: 'Yaaawn...', speed: 0.25 },
  T: { home: 'land', sound: 'Grrraw!', speed: 1.3 },
  U: { home: 'sky', sound: 'Sparkle sparkle!', speed: 1.2 },
  V: { home: 'land', sound: 'Squeak squeak!', speed: 1.5 },
  W: { home: 'water', sound: 'Whoosh!', speed: 0.5 },
  X: { home: 'water', sound: 'Bloop!', speed: 1.2 },
  Y: { home: 'land', sound: 'Moo!', speed: 0.7 },
  Z: { home: 'land', sound: 'Hee haw!', speed: 1.5 }
};
