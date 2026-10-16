# JustLearn

A focused cognitive sprint that pairs the Pomodoro protocol with the Feynman learning technique.

---

## Why JustLearn?

The modern internet encourages endless passive skimming. We bookmark articles we never read, scroll through technical threads without retaining core concepts, and mistake recognition for understanding.

JustLearn creates an intentional constraint to counter digital distraction:
- **10-Minute Hard Stop**: A dedicated countdown that forces focus. There is no time to get lost in infinite tabs.
- **Physical Paper Synthesis**: You are encouraged to close digital editors and write or sketch your notes on physical paper or a notebook. Handwriting activates deeper motor memory and forces immediate distillation.
- **The Feynman Technique**: When the 10-minute timer expires, the digital summary box unlocks. Looking only at your paper notes, you must explain the concept simply from memory. If you cannot explain it simply, you do not understand it well enough.
- **1 to 10 Peer Consensus**: The community reads your memory synthesis and awards marks from 1 to 10 based on clarity, intuition, and depth.
- **Point-Based Leaderboard**: Earn points for publishing syntheses, uploading photos of physical paper notes, and receiving high marks from fellow learners.

---

## How It Works

1. **Roll the Dice**: Launch the mystery curiosity wheel. The system locks in an unseen topic across Science, Computer Science, History, Philosophy, or Economics.
2. **10-Minute Research Sprint**: The 10:00 timer counts down with tab title synchronization. Disconnect, follow the provided research launchpad links, and write your key thoughts on paper.
3. **Feynman Synthesis**: At 00:00, the editor unlocks. Write a concise explanation from memory and optionally attach a photo of your paper notes.
4. **Community Evaluation & Leaderboard**: Your synthesis appears in the public feed where peers review and score your clarity from 1 to 10.

---

## Core Features

- **32 Curated Seed Topics**: Spanning Psychology, Tech & CS, Biology & Nature, Game Theory, and Design Mysteries.
- **Interactive 3D Dice**: An analog, touch-responsive 3D dice with physical pips built using CSS 3D transforms.
- **High-Density Classical Statue ASCII Art**: Interactive ASCII visual canvas rendered in real-time.
- **Light & Night Themes**: Minimalist light theme with a warm corner gradient, and an obsidian night theme with a white moonlight gradient.
- **Community Feed & Real-Time Voting**: Browse syntheses, filter by category or newest/top-rated, and vote 1 to 10 with duplicate vote prevention.
- **Physical Paper Note Inspection**: Upload and inspect handwritten notes via an inline lightbox viewer.
- **Competitive Leaderboard**: Tracks total points, syntheses count, paper note uploads, and peer scores.
- **Deep Dive Guide**: In-depth explanation of the cognitive protocol and the Feynman method.
- **Hybrid Data Layer**: Seamlessly connects to Supabase PostgreSQL when credentials are provided, or operates zero-config via local storage offline.

---

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nAItiklearn/JustLearn.git
   cd JustLearn
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (Optional for global database sync):
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   *Note: If left empty, the application runs automatically in offline local-storage mode with all 32 seed topics ready.*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build

To create an optimized production build:

```bash
npm run build
npm run start
```

---

## Database Setup (Supabase)

If using Supabase PostgreSQL:
1. Create a new project on [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the entire contents of `supabase/schema.sql` and run it.
4. This script sets up tables (`topics`, `summaries`, `ratings`), Row Level Security (RLS) policies, indexes, the automatic metric recalculation trigger, and all 32 seed topics.

---

## License

Released under the [MIT License](LICENSE).

---

## Contact & Feedback

Created by Naitik Sahu.
- Email: [naiitik1526@gmail.com](mailto:naiitik1526@gmail.com)
- GitHub: [github.com/nAItiklearn](https://github.com/nAItiklearn)
