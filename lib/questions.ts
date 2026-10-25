export interface Question {
  id: number;
  prompt: string;
  answer: string;
  displayAnswer: string;
  funFact: string;
}

export const questions: Question[] = [
  // --- FOOD & FAMOUS BRANDS ---
  {
    id: 1,
    prompt: "Cotton candy was originally invented in 1897 by a ________.",
    answer: "dentist",
    displayAnswer: "Dentist",
    funFact: "Dr. William Morrison, a practicing dentist, co-invented the electric cotton candy machine and marketed it as 'Fairy Floss'."
  },
  {
    id: 2,
    prompt: "In an effort to persuade kids to eat healthier, McDonald's once test-marketed bubblegum-flavored ________.",
    answer: "broccoli",
    displayAnswer: "Broccoli",
    funFact: "McDonald's CEO Don Thompson admitted the experiment failed because kids found the sweet taste confusing."
  },
  {
    id: 3,
    prompt: "The toy company LEGO is officially the world's largest manufacturer of ________ by volume, beating Michelin and Goodyear.",
    answer: "tires",
    displayAnswer: "Tires (wheels)",
    funFact: "LEGO produces over 300 million tiny rubber tires every single year for their vehicle sets."
  },
  {
    id: 4,
    prompt: "The inventor of the Pringles can was so proud of his packaging design that his ashes were ________ in one when he died.",
    answer: "buried",
    displayAnswer: "Buried inside a Pringles can",
    funFact: "Fredric Baur's children bought an Original flavor red can at Walgreens to honor his last request."
  },
  {
    id: 5,
    prompt: "A single individual strand of spaghetti is grammatically called a ________ in Italian.",
    answer: "spaghetto",
    displayAnswer: "Spaghetto",
    funFact: "'Spaghetti' is plural in Italian; if you drop just one noodle on the floor, you dropped a spaghetto."
  },
  {
    id: 6,
    prompt: "Nutella was originally created during World War II when cocoa was scarce, so makers added ________ to stretch the chocolate.",
    answer: "hazelnuts",
    displayAnswer: "Hazelnuts",
    funFact: "Pietro Ferrero used abundant local hazelnuts to create 'Pasta Gianduja', which evolved into Nutella."
  },
  {
    id: 7,
    prompt: "The famous blue bird logo of Twitter was officially named 'Larry' in honor of NBA basketball legend Larry ________.",
    answer: "bird",
    displayAnswer: "Larry Bird",
    funFact: "Twitter co-founder Biz Stone grew up in Boston and named the logo bird after Celtics legend Larry Bird."
  },
  {
    id: 8,
    prompt: "Nintendo was originally founded back in 1889 as a small shop in Kyoto that sold handmade ________.",
    answer: "playing cards",
    displayAnswer: "Playing cards (Hanafuda)",
    funFact: "Long before Mario and Pokémon, Nintendo was founded by Fusajiro Yamauchi to produce traditional Japanese flower cards."
  },
  {
    id: 9,
    prompt: "Before settling on the name Google, founders Larry Page and Sergey Brin originally called their search engine '________'.",
    answer: "backrub",
    displayAnswer: "BackRub",
    funFact: "They named it BackRub because its system analyzed the underlying 'backlinks' pointing to web pages."
  },
  {
    id: 10,
    prompt: "Bubble wrap was originally invented in 1957 by two engineers who were trying to create textured ________.",
    answer: "wallpaper",
    displayAnswer: "Wallpaper",
    funFact: "Engineers Alfred Fielding and Marc Chavannes tried to make 3D plastic wallpaper before realizing it made ideal packaging."
  },
  {
    id: 11,
    prompt: "In Japan, KitKat bars are popular as good luck gifts for students because the name sounds like 'Kitto Katsu', which means '________'.",
    answer: "surely win",
    displayAnswer: "You will surely win",
    funFact: "Parents and friends give KitKats to exam-takers in Japan as a lucky charm for victory."
  },
  {
    id: 12,
    prompt: "The iconic shape of Doritos tortilla chips was invented by a restaurant at Disneyland that fried up leftover ________.",
    answer: "tortillas",
    displayAnswer: "Stale tortillas",
    funFact: "The Casa de Fudos restaurant in Disneyland seasoned leftover tortillas and fried them, creating Doritos."
  },
  {
    id: 13,
    prompt: "Coca-Cola was originally invented in 1886 by a pharmacist who was trying to create a medicine to cure ________.",
    answer: "headaches",
    displayAnswer: "Headaches",
    funFact: "Dr. John Pemberton created Coca-Cola syrup as a nerve tonic and headache remedy."
  },
  {
    id: 14,
    prompt: "The distinctive smell of old books is caused by the chemical breakdown of paper, which produces a scent similar to ________.",
    answer: "vanilla",
    displayAnswer: "Vanilla",
    funFact: "Lignin and cellulose in paper break down into aromatic vanillin over decades."
  },
  {
    id: 15,
    prompt: "Post-it Notes were invented by accident when a 3M scientist was trying to develop a super-strong ________.",
    answer: "glue",
    displayAnswer: "Glue / Adhesive",
    funFact: "Dr. Spencer Silver accidentally made a weak adhesive that stuck lightly without tearing paper."
  },

  // --- ANIMALS & NATURE ---
  {
    id: 16,
    prompt: "Sea otters famously hold ________ while sleeping so they don't drift away from each other in the ocean.",
    answer: "hands",
    displayAnswer: "Hands (paws)",
    funFact: "Rafts of sea otters hold paws while napping and wrap themselves in giant sea kelp so currents don't separate them."
  },
  {
    id: 17,
    prompt: "Scientific studies have shown that cows have best ________ and suffer from anxiety when separated from them.",
    answer: "friends",
    displayAnswer: "Friends (best buddies)",
    funFact: "Research showed cows paired with their preferred herd buddy have significantly lower heart rates and stress."
  },
  {
    id: 18,
    prompt: "A group of flamingos is officially called a 'flamboyance', but a group of owls is officially called a ________.",
    answer: "parliament",
    displayAnswer: "Parliament",
    funFact: "Because owls are traditionally associated with wisdom and solemn judgment, a gathering is called a parliament."
  },
  {
    id: 19,
    prompt: "Under Swiss animal welfare law, it is illegal to keep only one ________ as a pet because they get lonely without a companion.",
    answer: "guinea pig",
    displayAnswer: "Guinea pig",
    funFact: "Switzerland requires guinea pigs to be kept in pairs and even has pet-rental agencies if one dies."
  },
  {
    id: 20,
    prompt: "Bananas naturally curve upwards as they grow because they are reaching toward the ________ against gravity.",
    answer: "sun",
    displayAnswer: "Sun (sunlight)",
    funFact: "This plant phenomenon is called 'negative geotropism' — the fruit grows up toward the light."
  },
  {
    id: 21,
    prompt: "In 2008, the government of Norway knighted a king penguin named Nils Olav, granting him the military rank of ________.",
    answer: "major general",
    displayAnswer: "Major General",
    funFact: "Sir Nils Olav III lives in Edinburgh Zoo and waddles down the line to inspect the Norwegian King's Guard."
  },
  {
    id: 22,
    prompt: "Octopuses have three hearts and their blood is naturally ________ in color.",
    answer: "blue",
    displayAnswer: "Blue",
    funFact: "Octopus blood contains hemocyanin, a copper-rich protein that turns blue when carrying oxygen."
  },
  {
    id: 23,
    prompt: "Wombats are the only animals in the world that produce feces shaped like ________.",
    answer: "cubes",
    displayAnswer: "Cubes",
    funFact: "The cubic shape stops their droppings from rolling off rocks and slopes where they mark territory."
  },
  {
    id: 24,
    prompt: "Sloths can hold their breath underwater for up to 40 minutes, which is longer than ________ can.",
    answer: "dolphins",
    displayAnswer: "Dolphins",
    funFact: "By slowing their heart rate to a third of its normal pace, sloths can stay submerged longer than dolphins."
  },
  {
    id: 25,
    prompt: "A dog's sense of smell is so sharp that their nose prints are completely unique, just like human ________.",
    answer: "fingerprints",
    displayAnswer: "Fingerprints",
    funFact: "The Canadian Kennel Club has used dog nose prints to verify canine identity since 1938."
  },
  {
    id: 26,
    prompt: "Elephants are the only mammals that are physically incapable of ________.",
    answer: "jumping",
    displayAnswer: "Jumping",
    funFact: "Their leg bones are pointed downwards and their body weight makes jumping anatomically impossible."
  },
  {
    id: 27,
    prompt: "A group of pugs is officially known as a '________ of pugs'.",
    answer: "grumble",
    displayAnswer: "Grumble",
    funFact: "When multiple pugs gather together, the proper collective noun is a grumble of pugs."
  },
  {
    id: 28,
    prompt: "Sharks existed on Earth before trees did. Sharks have been around for 400 million years, while trees appeared about ________ million years ago.",
    answer: "350",
    displayAnswer: "350 million years ago",
    funFact: "Sharks swam in prehistoric oceans 50 million years before the earliest primitive trees took root."
  },
  {
    id: 29,
    prompt: "Butterflies taste their food using their ________.",
    answer: "feet",
    displayAnswer: "Feet",
    funFact: "Sensors on a butterfly's feet tell them if a plant is safe to eat or lay eggs on."
  },
  {
    id: 30,
    prompt: "Unlike almost all other birds, hummingbirds are the only birds that can fly ________.",
    answer: "backwards",
    displayAnswer: "Backwards",
    funFact: "Their ball-and-socket wing joints allow full 180-degree rotation, enabling them to hover and fly in reverse."
  },

  // --- POP CULTURE, CARTOONS & MOVIES ---
  {
    id: 31,
    prompt: "Before becoming a famous Hollywood action star, Vin Diesel worked as a professional ________.",
    answer: "breakdancer",
    displayAnswer: "Breakdancer",
    funFact: "A 1987 instructional video of a young Vin Diesel breakdancing in a track jacket went viral online."
  },
  {
    id: 32,
    prompt: "In the movie 'Shrek', the sound of Shrek's muddy footsteps was created by sound artists squishing ________ in a bowl.",
    answer: "macaroni",
    displayAnswer: "Macaroni and cheese",
    funFact: "Foley artists mashed warm pasta to get that perfect wet, squelching swamp footstep sound."
  },
  {
    id: 33,
    prompt: "The voice actors who played Mickey Mouse and Minnie Mouse in real life ended up ________.",
    answer: "married",
    displayAnswer: "Getting married to each other",
    funFact: "Wayne Allwine (Mickey) and Russi Taylor (Minnie) fell in love and were married for nearly 20 years."
  },
  {
    id: 34,
    prompt: "In the original 1985 movie 'Back to the Future', the time machine was originally planned to be a ________ before they chose a DeLorean car.",
    answer: "refrigerator",
    displayAnswer: "Refrigerator",
    funFact: "Director Robert Zemeckis changed it because he feared children might trap themselves inside refrigerators."
  },
  {
    id: 35,
    prompt: "The character of Barbie was named after creator Ruth Handler's real-life ________.",
    answer: "daughter",
    displayAnswer: "Daughter (Barbara)",
    funFact: "Ken was also named after Ruth Handler's real son, Kenneth!"
  },
  {
    id: 36,
    prompt: "In the video game 'Pac-Man', the yellow character's design was inspired by a pizza with ________.",
    answer: "one slice missing",
    displayAnswer: "A missing slice",
    funFact: "Game designer Toru Iwatani looked down at a pizza with one slice removed and instantly imagined Pac-Man."
  },
  {
    id: 37,
    prompt: "The sound of the roaring T-Rex in 'Jurassic Park' was made by combining the sounds of an elephant, a tiger, and a ________.",
    answer: "baby penguin",
    displayAnswer: "Baby penguin",
    funFact: "Sound designer Gary Rydstrom pitched down a baby penguin's squawk to add a terrifying high screech."
  },
  {
    id: 38,
    prompt: "The iconic Hollywood sign in Los Angeles originally read '________' when it was erected in 1923.",
    answer: "hollywoodland",
    displayAnswer: "Hollywoodland",
    funFact: "It was originally built as a temporary billboard to advertise an upscale housing development."
  },
  {
    id: 39,
    prompt: "In the 'Harry Potter' movies, Daniel Radcliffe went through an estimated 160 pairs of ________ during filming.",
    answer: "glasses",
    displayAnswer: "Glasses",
    funFact: "Between stunts, accidents, and outgrowing them, Radcliffe broke or replaced 160 pairs of round specs."
  },
  {
    id: 40,
    prompt: "The famous mustache-wearing mascot of the Monopoly board game is officially named 'Rich Uncle ________'.",
    answer: "pennybags",
    displayAnswer: "Pennybags",
    funFact: "His full official name is Rich Uncle Pennybags, though Hasbro also calls him Mr. Monopoly."
  },

  // --- EVERYDAY INVENTIONS & ODDITIES ---
  {
    id: 41,
    prompt: "The tiny pocket inside the front right pocket of your blue jeans was originally designed in the 1870s to hold a ________.",
    answer: "pocket watch",
    displayAnswer: "Pocket watch",
    funFact: "Levi Strauss added the small pocket specifically so cowboys and railroad workers wouldn't break their pocket watches."
  },
  {
    id: 42,
    prompt: "Astronauts on the International Space Station are not allowed to eat ________ because floating crumbs can ruin delicate equipment.",
    answer: "bread",
    displayAnswer: "Bread",
    funFact: "Crumbs in microgravity float into air filters and eyes, so NASA replaced bread with soft flour tortillas."
  },
  {
    id: 43,
    prompt: "During the Apollo 14 Moon mission, astronaut Alan Shepard famously pulled out a modified 6-iron club and hit two ________ on the lunar surface.",
    answer: "golf balls",
    displayAnswer: "Golf balls",
    funFact: "Because of the Moon's low gravity and lack of atmosphere, Shepard's second shot flew for miles."
  },
  {
    id: 44,
    prompt: "In Japan, it is considered polite and a sign that you are enjoying your meal to loudly ________ your soup noodles.",
    answer: "slurp",
    displayAnswer: "Slurp",
    funFact: "Slurping pulls in cool air with hot broth and noodles, enhancing aroma and complimenting the chef."
  },
  {
    id: 45,
    prompt: "The unicorn is the official national animal of ________.",
    answer: "scotland",
    displayAnswer: "Scotland",
    funFact: "In Celtic mythology, the proud and unconquerable unicorn was chosen as a royal symbol of Scottish strength."
  },
  {
    id: 46,
    prompt: "In a small town in Alaska, the residents famously elected a ________ named Stubbs as their honorary mayor for 20 years.",
    answer: "cat",
    displayAnswer: "Cat",
    funFact: "Mayor Stubbs the ginger cat served Talkeetna, Alaska from 1997 until his peaceful passing in 2017."
  },
  {
    id: 47,
    prompt: "Before alarm clocks were affordable, people in Victorian Britain hired 'Knocker-Uppers' who used blowpipes to shoot ________ at their bedroom windows.",
    answer: "peas",
    displayAnswer: "Dried peas",
    funFact: "They shot dried peas at second-story windows to wake factory workers up on time."
  },
  {
    id: 48,
    prompt: "The microwave oven was discovered when engineer Percy Spencer noticed that radar waves melted a ________ in his pocket.",
    answer: "chocolate bar",
    displayAnswer: "Chocolate candy bar",
    funFact: "Percy Spencer noticed his peanut candy bar turned to goo, tested popcorn next, and invented the microwave."
  },
  {
    id: 49,
    prompt: "In 2013, a museum in the Netherlands discovered that a famous modern painting had been hanging ________ for 75 years without anyone noticing.",
    answer: "upside down",
    displayAnswer: "Upside down",
    funFact: "Piet Mondrian's artwork 'New York City I' had been displayed upside down since its debut."
  },
  {
    id: 50,
    prompt: "At the 1904 St. Louis World's Fair, an ice cream seller ran out of bowls, so a nearby pastry vendor rolled up ________ to hold the ice cream, inventing the waffle cone.",
    answer: "waffles",
    displayAnswer: "Waffles (Zalabia pastries)",
    funFact: "Ernest Hamwi rolled crisp wafer-like pastries into cones, creating the modern ice cream cone on the spot."
  },

  // --- CELEBRITIES & CRAZY HUMAN FEATS ---
  {
    id: 51,
    prompt: "Legendary singer Dolly Parton once entered a celebrity Dolly Parton look-alike contest at a club and ________.",
    answer: "lost",
    displayAnswer: "Lost the contest",
    funFact: "She exaggerated her makeup and hair, but the judges thought she was an impersonator who wasn't convincing enough!"
  },
  {
    id: 52,
    prompt: "Before becoming a famous chef, Julia Child worked for the OSS (early CIA) during World War II helping to develop a repellent for ________.",
    answer: "sharks",
    displayAnswer: "Sharks",
    funFact: "She helped invent a shark repellent cake so hungry sharks wouldn't bump into underwater explosives."
  },
  {
    id: 53,
    prompt: "Basketball star Michael Jordan was famously fined $5,000 every game by the NBA in 1985 because his sneakers were ________.",
    answer: "too colorful",
    displayAnswer: "Too colorful (not enough white)",
    funFact: "The NBA uniform rules required shoes to be mostly white; Nike gladly paid the fine for the massive publicity."
  },
  {
    id: 54,
    prompt: "Albert Einstein never wore ________ as an adult because he found them uncomfortable and annoying when they got holes.",
    answer: "socks",
    displayAnswer: "Socks",
    funFact: "Einstein proudly bragged that he gave up socks since shoes do the job of protecting feet anyway."
  },
  {
    id: 55,
    prompt: "In 1999, the US government bought 1,100 Sony PlayStation 3 consoles to link them together into a supercomputer for the ________.",
    answer: "air force",
    displayAnswer: "Air Force",
    funFact: "The PS3's Cell processor was so fast and cheap that the US Air Force built the 33rd fastest supercomputer using them."
  },

  // --- MORE ACCESSIBLE & ENTERTAINING TRIVIA ---
  {
    id: 56,
    prompt: "The green code that rains down the screen in the movie 'The Matrix' was actually made from Japanese symbols taken from ________ recipes.",
    answer: "sushi",
    displayAnswer: "Sushi recipes",
    funFact: "Production designer Simon Whiteley scanned his wife's Japanese sushi cookbooks to generate the digital rain."
  },
  {
    id: 57,
    prompt: "The word 'karaoke' is a combination of two Japanese words that literally translates into English as 'empty ________'.",
    answer: "orchestra",
    displayAnswer: "Empty orchestra",
    funFact: "'Kara' means empty and 'oke' is short for okesutora (orchestra)."
  },
  {
    id: 58,
    prompt: "A dime has 118 ridges around its edge, which were originally added in the 1700s to stop criminals from ________ the silver edges.",
    answer: "shaving",
    displayAnswer: "Shaving off the precious metal",
    funFact: "People used to file down edges of silver coins to sell the shavings; ridges proved the coin was intact."
  },
  {
    id: 59,
    prompt: "The Statue of Liberty in New York was originally ________ in color before the copper weathered over time.",
    answer: "brown",
    displayAnswer: "Shiny brown (copper penny color)",
    funFact: "The statue was bright reddish-brown like a new penny until oxidation turned it green by 1906."
  },
  {
    id: 60,
    prompt: "The world record for the deepest underwater bicycle ride was set at a depth of ________ feet.",
    answer: "218",
    displayAnswer: "218 feet",
    funFact: "Italian diver Vittorio Innocente pedaled a modified mountain bike on the seabed of Santa Margherita."
  },
  {
    id: 61,
    prompt: "The average cloud that you see floating peacefully in the sky weighs approximately ________ pounds.",
    answer: "1 million",
    displayAnswer: "1.1 million pounds",
    funFact: "A typical cumulus cloud has a volume of 1 cubic km and contains 500,000 kg of water droplets."
  },
  {
    id: 62,
    prompt: "Flamingos are not born pink. They turn pink because their natural diet consists mostly of ________.",
    answer: "shrimp",
    displayAnswer: "Shrimp and algae",
    funFact: "Carotenoid pigments in brine shrimp and red algae dye their feathers pink as they grow."
  },
  {
    id: 63,
    prompt: "In 1974, the first product ever scanned with a supermarket barcode scanner was a pack of Wrigley's ________.",
    answer: "chewing gum",
    displayAnswer: "Chewing gum",
    funFact: "A 10-pack of Juicy Fruit gum was scanned at a supermarket in Ohio, and the scanner is in the Smithsonian."
  },
  {
    id: 64,
    prompt: "Apples float in water because 25% of their total volume is made up of ________.",
    answer: "air",
    displayAnswer: "Air",
    funFact: "Air pockets between cells make apples less dense than water, which is why apple bobbing works."
  },
  {
    id: 65,
    prompt: "The hashtag symbol (#) is formally called an 'octothorpe', named partly after Olympic athlete Jim ________.",
    answer: "thorpe",
    displayAnswer: "Jim Thorpe",
    funFact: "Bell Labs engineers invented the name 'octo' (eight points) and added 'thorpe' after athlete Jim Thorpe."
  },
  {
    id: 66,
    prompt: "Kangaroos cannot walk backwards because their large feet and muscular ________ prevent it.",
    answer: "tail",
    displayAnswer: "Tail",
    funFact: "Their long tail acts as a third leg for balance and makes moving in reverse anatomically impossible."
  },
  {
    id: 67,
    prompt: "The famous blue Jeans brand Levi's named their classic style '501' because it was originally the ________ number for the batch of denim.",
    answer: "lot",
    displayAnswer: "Warehouse lot number",
    funFact: "In 1890, Levi Strauss assigned simple lot numbers to their products, and Lot 501 was the highest quality."
  },
  {
    id: 68,
    prompt: "In Switzerland, it is illegal to name your baby child an object or a name that could harm their ________.",
    answer: "future",
    displayAnswer: "Well-being / future dignity",
    funFact: "Swiss civil registries must approve first names to protect children from ridicule."
  },
  {
    id: 69,
    prompt: "A sneeze travels out of your nose and mouth at a speed of up to ________ miles per hour.",
    answer: "100",
    displayAnswer: "100 miles per hour",
    funFact: "A sneeze can expel roughly 100,000 droplets at freeway speeds!"
  },
  {
    id: 70,
    prompt: "The original name for the search engine Yahoo! was 'Jerry and David's Guide to the ________'.",
    answer: "world wide web",
    displayAnswer: "World Wide Web",
    funFact: "Founders Jerry Yang and David Filo later changed the name to Yahoo! ('Yet Another Hierarchical Officious Oracle')."
  }
];

export const fallbackBluffs: string[] = [
  "A rubber chicken",
  "A gold coin",
  "A slice of pizza",
  "A pair of roller skates",
  "A microwave",
  "A velvet cape",
  "A selfie stick",
  "A lucky harmonica",
  "A pet parrot",
  "A disco ball",
  "A baseball bat",
  "A skateboard",
  "A detective hat",
  "A jar of honey",
  "A vintage alarm clock",
  "A bowling ball",
  "A pink flamingo",
  "A toaster oven",
  "A magic carpet"
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let recentlyUsedIds = new Set<number>();

export function getSevenFreshQuestions(): Question[] {
  let available = questions.filter(q => !recentlyUsedIds.has(q.id));

  if (available.length < 7) {
    recentlyUsedIds.clear();
    available = [...questions];
  }

  const shuffled = shuffleArray(available);
  const selected = shuffled.slice(0, 7);

  selected.forEach(q => recentlyUsedIds.add(q.id));
  return selected;
}
