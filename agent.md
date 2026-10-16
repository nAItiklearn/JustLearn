Markdown# 🧠 TenMinRabbitHole (Working Title)
> **Learn deeply for 10 minutes on paper. Summarize from memory. Get rated 1–10 by the community.**

---

## 1. Project Concept & Core Loop
Most people doomscroll information and forget 90% of it within an hour. **TenMinRabbitHole** combines the **Pomodoro Technique** with the **Feynman Technique** in a social, gamified web app:

1. **🎲 Roll a Topic:** The user clicks **"Generate Topic"** and receives a curated, high-curiosity topic (Tech, Psychology, Science, Game Theory, etc.) with a 1-sentence hook.
2. **⏳ 10-Minute Offline Research & Paper Phase:** A **10:00 countdown timer** starts immediately. During this 10-minute window, **the summary text box is locked/hidden**. The user must research the topic across the web and take notes on **physical paper**.
3. **✍️ Summarize & Synthesize (Unlocks at 00:00):** When the 10-minute timer hits `00:00` (with an audio chime), the writing editor unlocks. Looking only at their paper notes, the user writes a clear, engaging summary of what they learned and hits **Publish**.
4. **🌍 Explore Column & 1–10 Peer Review:** Published summaries appear live in the **Explore Column**. Other users can filter by topic or niche, read what others wrote, and award **marks strictly from 1 to 10** (`[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]`).

---

## 2. Curated Seed List: 32 "Fun Knowledge" Topics
*Sourced from top rabbit-hole threads on Reddit (`r/AskReddit`, `r/compsci`, `r/psychology`, `r/todayilearned`) and WaitButWhy.*

### 🧠 Psychology & Human Behavior
1. **The Call of the Void (*L'appel du vide*):** Why healthy brains briefly imagine jumping from high places—and how it's actually a survival signal.
2. **The McGurk Effect:** How what your eyes see can completely override what your ears hear, proving perception is a multisensory illusion.
3. **Cotard's Delusion (Walking Corpse Syndrome):** A rare neuropsychiatric condition where a person genuinely believes they are dead or do not exist.
4. **The Benjamin Franklin Effect:** Why asking someone to do you a small favor makes them like you *more* than if you did a favor for them.
5. **Childhood Amnesia:** Why humans cannot recall episodic memories from before age 2–4, and what happens in the hippocampus during that shift.
6. **The Dunning-Kruger Effect vs. Impostor Syndrome:** The cognitive mechanics of why beginners overestimate their skill while experts underestimate theirs.
7. **Inattentional Blindness (The Invisible Gorilla):** Why intense focus on one task makes your brain literally blind to obvious changes right in front of you.
8. **Split-Brain Experiments (Roger Sperry):** What happens when the corpus callosum is severed and the left and right hemispheres operate as two independent minds.

### 💻 Tech & Computer Science
9. **Evolvable Hardware (Adrian Thompson's FPGA Experiment):** When a genetic algorithm evolved a working circuit that exploited microscopic electromagnetic physics engineers couldn't explain.
10. **Byzantine Fault Tolerance (The Byzantine Generals Problem):** How distributed computer systems (and blockchains) reach consensus when some nodes are lying or broken.
11. **Zero-Knowledge Proofs (ZKPs):** How you can mathematically prove to someone that you know a secret password without revealing a single character of it.
12. **Quines (Self-Replicating Programs):** Programs that take zero input and output an exact copy of their own source code—and how they relate to biological DNA.
13. **Cosmic Rays & Single-Event Upsets (Bit Flips):** How subatomic particles from deep space strike RAM chips on Earth, flipping a `0` to a `1` and crashing planes or altering video game speedruns.
14. **The Halting Problem (Alan Turing, 1936):** Why it is mathematically impossible to write a computer program that can predict whether *any* other program will finish running or loop forever.
15. **Fast Inverse Square Root (`0x5f3759df`):** The legendary, black-magic C code hack from *Quake III Arena* that calculated 3D lighting 4x faster.
16. **Dead Internet Theory & Bot Traffic Economics:** How algorithmic traffic, scraper bots, and synthetic media interact across modern web infrastructure.

### 🔬 Science, Biology & Nature
17. **Slime Mold (*Physarum polycephalum*) Intelligence:** How a brainless, single-celled yellow blob recreated the exact layout of the Tokyo rail system in 26 hours.
18. **Tardigrades & Cryptobiosis:** How microscopic "water bears" survive the vacuum of space, boiling temperatures, and lethal radiation by turning their cells into glass.
19. **Dinosaur Pigmentation (Melanosomes):** How paleontologists discovered the actual colors and feather stripes of dinosaurs using scanning electron microscopes.
20. **The Wood Wide Web (Mycorrhizal Networks):** How trees in a forest use underground fungal networks to share carbon, water, and chemical warning signals.
21. **Sonoluminescence:** The baffling physics phenomenon where collapsing a tiny gas bubble in liquid with sound waves emits a flash of star-hot light.
22. **Kessler Syndrome:** How a single satellite collision in Low Earth Orbit could trigger a domino effect that traps humanity on Earth under a shell of shrapnel.

### 📈 Economics, Game Theory & Everyday Systems
23. **Braess's Paradox:** Why adding a brand-new, high-speed road to a congested city can actually make traffic *slower* for every single driver.
24. **The Tragedy of the Commons & Elinor Ostrom's Rules:** Why shared resources get destroyed, and how real-world communities solve it without privatization.
25. **Goodhart's Law ("When a measure becomes a target..."):** From the Cobra Effect in colonial India to modern corporate KPIs—why optimizing for a metric breaks the system.
26. **The Schelling Point (Focal Points):** How two strangers who cannot communicate at all manage to pick the exact same meeting place in New York City.
27. **Waffle House Index:** Why FEMA informally uses a 24/7 breakfast chain's menu status to measure the severity of hurricanes and supply chain collapse.

### 🏛️ History, Linguistics & Design Mysteries
28. **Nuclear Semiotics (Long-Term Nuclear Waste Warning Messages):** How linguists and architects try to design warning signs that humans 10,000 years from now won't mistake for treasure.
29. **The Antikythera Mechanism:** The 2,100-year-old Greek bronze gear computer found in a shipwreck that tracked eclipses and planetary orbits.
30. **Bouba/Kiki Effect:** Why 95% of humans across every language and culture agree that a jagged shape is named "Kiki" and a round blob is named "Bouba."
31. **Desire Paths:** How unpaid pedestrians wear dirt trails across manicured grass, and how smart urban planners wait for snow footprints before paving sidewalks.
32. **Phantom Islands (Bermeja & Sandy Island):** Islands that appeared on official nautical maps and Google Earth for centuries before explorers sailed through them and found open ocean.

---

## 3. Feature Specification

### A. Left/Main Panel: The Learning Workspace
* **Topic Generator Card:**
  * Displays **Topic Title**, **Category Pill** (e.g., `🧠 Psychology`), **1-Sentence Curiosity Hook**, and quick external search buttons (`Search on Wikipedia`, `Search on Reddit`, `Google It`).
  * **Re-roll Limit:** Users get **3 free re-rolls per session** so they don't endlessly skip topics.
* **10-Minute Focus Timer:**
  * Circular or digital countdown (`10:00` → `00:00`).
  * Displays an explicit prompt: *"Grab a pen and paper! Research this topic and jot down key points. The summary box will unlock when the timer hits 00:00."*
  * **Browser Tab Title Sync:** Shows `[07:42] Researching: Zero-Knowledge Proofs` in the browser tab so the user can see the time while reading articles in other tabs.
  * **Audio Notification:** Plays a subtle bell chime via the Web Audio API when 10 minutes are up.
* **Summary Writing Box (Unlocked State):**
  * Clean Markdown/Rich-Text textarea with a live **Word Count** (minimum 50 words to prevent spam).
  * Optional: **"Snap Paper Notes"** upload button (lets users attach a photo of their handwritten notes for bonus credibility).
  * **"Publish to Explore Feed"** CTA button.

### B. Right Panel / Drawer: The Explore Column & Community Rating
* **Live Community Feed:**
  * Displays cards of summaries written by other users.
  * Filter tabs: `🔥 Top Rated`, `🆕 Newest`, `🎲 By Current Topic`, `🏷️ By Category`.
* **1–10 Rating System:**
  * Inside each summary card, readers see an interactive 1–10 rating bar (`1` through `10` pill buttons).
  * **Strict Validation:** Only integers `1` to `10` are accepted. One rating per user per summary (clicking a new number updates their existing vote).
  * Cards display: **Average Score** (e.g., `⭐ 8.7 / 10`), **Total Votes** (`14 ratings`), and the **Author's Username & Streak**.

---

## 4. Infrastructure: Maximizing Your GitHub Student Developer Pack
Since you have the **GitHub Student Developer Pack** and budget for a domain, you can run this entire production stack for **$0/month in hosting/database costs**:

| Layer | Recommended Tool | GitHub Education Pack Perk / Cost | Why This Choice? |
| :--- | :--- | :--- | :--- |
| **Code & CI/CD** | **GitHub Pro + Actions** | **Free** via Student Pack | Unlimited private repos, automated deployments on `git push`. |
| **Database** | **MongoDB Atlas** *(or Azure PostgreSQL)* | **$50–$200 free credits** in Student Pack (plus permanent Free Tier M0 cluster) | JSON-like documents make storing topics, summaries, and ratings super fast; or use **Azure for Students ($100 credit)** if you prefer SQL. |
| **Authentication** | **Clerk** *(or GitHub OAuth)* | **Free Clerk Pro Tier** included in Student Pack | Drop-in login components (Google/GitHub login) so only real users can submit summaries and rate 1–10. |
| **Frontend & API Hosting** | **DigitalOcean App Platform** *(or Heroku / Vercel)* | **$200 DigitalOcean credit** OR **$13/mo for 24 mos ($312) on Heroku** in Student Pack | Easily hosts a Next.js / React + Node.js backend with zero cold starts. |
| **Custom Domain** | **Cloudflare Registrar / Porkbun** *(Paid)* OR **Namecheap / .TECH** *(Free)* | Student Pack gives **1 yr free `.me` (Namecheap)**, **`.tech`**, and **Name.com** domains. | Since you have budget for a `.com` or `.io` (e.g., `tenminlearn.com`), buy it on **Cloudflare Registrar** or **Porkbun** at wholesale cost (~$10/yr) and use **free Student Pack domains** for staging! |
| **IDE & AI Assistant** | **JetBrains WebStorm + GitHub Copilot** | **100% Free** in Student Pack | Speeds up writing components and database queries. |

---

## 5. Website Components Strategy ("Mix & Match" UI Libraries)
Instead of building UI widgets from scratch, combine copy-paste components from these top component websites (all compatible with **React + Tailwind CSS**):

1. **[Shadcn UI](https://ui.shadcn.com/) (Core Layout & Explore Feed):**
   * Use for the split-screen layout, `Card` (summary posts), `Dialog` (full post reader), `Badge` (niche tags), and `Tabs` (Explore filters).
2. **[Aceternity UI](https://ui.aceternity.com/) or [Magic UI](https://magicui.design/) (Hero & Topic Generator):**
   * Use **Magic UI's `NumberTicker` / `HyperText`** for the slot-machine effect when generating a random topic.
   * Use **Aceternity's `BentoGrid` or `SpotlightCard`** to make the active Topic Card look sleek and modern.
3. **[Uiverse.io](https://uiverse.io/) (Micro-interactions, Timer & Buttons):**
   * Grab a tactile, glowing **"Generate Topic"** button and custom CSS **1–10 rating buttons** directly from Uiverse's open-source HTML/Tailwind collection.
4. **[DaisyUI](https://daisyui.com/) (Countdown Timer):**
   * DaisyUI has a built-in `<span class="countdown">` component with smooth vertical rolling digits specifically designed for timers (`10:00` → `09:59`).

---

## 6. Database Schema Design

Whether you use **MongoDB Atlas** (via Student Pack credits) or **PostgreSQL**, here is the data structure:

### Collection / Table 1: `topics`
```json
{
  "_id": "topic_014",
  "title": "The Halting Problem (Alan Turing, 1936)",
  "category": "Tech & CS",
  "hook": "Why it is mathematically impossible to write a program that knows if any other program will run forever.",
  "difficulty": "Medium",
  "timesCompleted": 42
}
Collection / Table 2: summaries (User Submissions)JSON{
  "_id": "sum_9823",
  "topicId": "topic_014",
  "topicTitle": "The Halting Problem (Alan Turing, 1936)",
  "authorId": "user_clerk_123",
  "authorName": "arjun_dev",
  "content": "Here is what I learned in 10 minutes: Alan Turing proved by contradiction that if a program H existed that could decide whether program P halts...",
  "paperNoteImageUrl": "https://...", 
  "timerDurationSeconds": 600,
  "averageScore": 8.6,
  "ratingsCount": 15,
  "createdAt": "2026-10-16T14:00:00Z"
}
Collection / Table 3: ratings (Enforces 1–10 Marks & 1 Vote Per User)JSON{
  "_id": "rate_551",
  "summaryId": "sum_9823",
  "voterId": "user_clerk_999",
  "score": 9, // Strictly validated: Integer between 1 and 10 inclusive
  "createdAt": "2026-10-16T14:15:00Z"
}
Backend Validation Rule:score must be an integer where 1 <= score <= 10.Create a unique compound index on (summaryId, voterId) so a user can only rate a specific summary once (or update their existing 1–10 mark).Users cannot rate their own summary (voterId !== summary.authorId).7. API Endpoints PlanMethodEndpointDescriptionGET/api/topics/randomReturns 1 random topic from the 32+ seed topics (excludes topics the user already completed).POST/api/summariesSaves the user's summary after the 10-minute timer completes.GET/api/summaries?sort=top&category=allPopulates the Explore Column with community summaries.POST/api/summaries/:id/rateAccepts { "score": 8 } (validates 1–10), updates the rating & recalculates averageScore.8. Step-by-Step Build Roadmap[ ] Phase 1: Repo & Student Pack Setup (Day 1)Create private GitHub repository (ten-min-rabbithole).Claim MongoDB Atlas credits & DigitalOcean / Heroku credits from GitHub Student Developer Pack.Seed the database with the 32 topics listed above.[ ] Phase 2: Core Workspace & 10-Min Timer (Days 2–3)Scaffold Next.js (App Router) + Tailwind CSS + Shadcn UI.Build the Topic Generator Card + Web Worker / Date.now() delta 10-minute timer (using delta timestamps so the timer doesn't pause when the user switches browser tabs to research!).Build the locked-to-unlocked Summary Box transition.[ ] Phase 3: Explore Column & 1–10 Rating Engine (Days 4–5)Build the right-hand Explore Column feed.Add the 1–10 rating bar with optimistic UI updates and backend validation.[ ] Phase 4: Polish & Custom Domain Launch (Day 6)Connect your custom domain via DNS to DigitalOcean/Vercel.Add user streaks and a "Top Learners of the Week" leaderboard.
---

### 💡 Crucial Pro-Tip for the 10-Minute Timer
When users research a topic for 10 minutes, they will switch away from your tab to read Wikipedia, Reddit, or articles. Standard `setInterval` timers in JavaScript get throttled (slowed down) by Chrome and Safari when a tab is in the background. 
* **How we will solve this in code:** Instead of subtracting `1` every second, store `const endTime = Date.now() + 10 * 60 * 1000` in `localStorage` when the timer starts, and calculate `Math.max(0, Math.ceil((endTime - Date.now()) / 1000))` on every tick. That way, even if they spend 9 minutes in other browser tabs, the timer stays accurate to the millisecond and updates the browser tab title (`[04:12] Researching...`).

Would you like me to **build the interactive web app prototype** (with the 32 topics l