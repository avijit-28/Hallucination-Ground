# 🌀 Hallucination Ground

> **Invent the Lie. Spot the Truth.**  
> A real-time multiplayer party game for **2–8 players** joining from their own phone or browser using a 4-letter room code. Styled with a high-stakes, broadcast **Late-Night Game Show** aesthetic!

---

## 🎮 How the Game Works

1. **Lobby & Joining:**
   - The host opens the game on a computer or TV screen and clicks **"Host on this Screen"** to generate a 4-letter Room Code with a scannable QR code.
   - Players join directly from their mobile phones by navigating to the room URL or typing the 4-letter code, entering a nickname, and picking an avatar.
   - **Host Authority:** Only the host can launch the game or add test bots.

2. **The Core Loop (7 Questions Across 3 Rounds):**
   - **Phase 1: The Prompt:** An obscure, hilarious, or surprising real-world fact is displayed with a blank `[ __________ ]`.
   - **Phase 2: Craft Your Bluff (35s):** Players secretly type believable fake answers on their phones. If someone accidentally types the real answer, the game catches it and asks for a lie!
   - **Phase 3: Fast Buzz & Vote (20s):** All submitted player bluffs plus the real truth are shuffled and displayed as stacked game show podium options (`[ A ]`, `[ B ]`, `[ C ]`, `[ D ]`...). Players race against the clock to spot the real fact. Quick votes earn speed bonuses! Your own lie is disabled.
   - **Phase 4: The Reveal (14s):** The game dramatically flips the cards to reveal who wrote each lie, who got fooled, and the historical backstory/fun fact.
   - **Scoring & Multipliers:**
     - **Round 1 (Questions 1–3):** Standard Stakes (1x points)
     - **Round 2 (Questions 4–6):** Double Stakes (2x points)
     - **Round 3: The Finale (Question 7):** Triple Stakes (3x points)
   - **Phase 5: The Podium:** The top 3 players take the championship podium, with special award badges (*Master Deceiver*, *Sharp Eye*, *Lightning Buzzer*).

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** Mobile-first responsive HTML5, CSS3, and modern JavaScript.
  * Late-Night Game Show theme with dark studio gradients, metallic bezels, gold spotlights, and an electric crimson buzzer button accent (`#ff1e56`).
  * Pure **Web Audio API** sound synthesizer (custom buzzers, correct bells, victory fanfares) with zero external audio dependencies.
* **Serverless Backend:** Standard **Netlify Function** (`netlify/functions/game.ts`) handling all game actions via REST (`/.netlify/functions/game`).
* **State Persistence:** **Netlify Blobs** with **strong consistency** (`{ consistency: 'strong' }`) and **conditional writes** (`{ onlyIfMatch: etag }`) to ensure optimistic locking and concurrency safety with zero database setup.
* **Content:** 70+ curated, funny, and accessible party trivia questions spanning pop culture, brands, movies, animals, and weird history, randomly sampled so every match has a different set of 7 questions.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)

### Installation
```bash
# Clone the repository
git clone https://github.com/avijit-28/Hallucination-Ground.git
cd Hallucination-Ground

# Install dependencies
npm install
```

### Running Tests
An automated end-to-end test simulates a full 3-round, 7-question game between two players:
```bash
npm test
```

### Building the Function
To bundle the Netlify Function for production:
```bash
npm run build
```

---

## 🌐 Deploy to Netlify

### Option 1: Netlify Git Continuous Deployment
1. Connect this GitHub repository on [Netlify](https://app.netlify.com/).
2. Netlify will automatically detect `netlify.toml` and build the project.

### Option 2: Drag & Drop Publishing
1. Run `npm run package` to create `netlify-ready-game.zip`.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop `netlify-ready-game.zip` onto the page.

---

## 📄 License
MIT
