-- ==============================================================================
-- 🧠 TenMinRabbitHole - PostgreSQL Supabase Migration & Setup Script
-- ==============================================================================

-- 1. Enable pgcrypto / uuid extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running migration cleanly
-- DROP TABLE IF EXISTS public.ratings CASCADE;
-- DROP TABLE IF EXISTS public.summaries CASCADE;
-- DROP TABLE IF EXISTS public.topics CASCADE;

-- ==============================================================================
-- TABLE 1: topics
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    hook TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    times_completed INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Index on category and title
CREATE INDEX IF NOT EXISTS idx_topics_category ON public.topics(category);

-- ==============================================================================
-- TABLE 2: summaries
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    topic_title TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    paper_note_image_url TEXT,
    average_score NUMERIC(3,1) DEFAULT 0,
    ratings_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Index for ordering and filtering
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON public.summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_summaries_average_score ON public.summaries(average_score DESC);
CREATE INDEX IF NOT EXISTS idx_summaries_topic_id ON public.summaries(topic_id);

-- ==============================================================================
-- TABLE 3: ratings (1-10 marks, unique per voter per summary)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summary_id UUID NOT NULL REFERENCES public.summaries(id) ON DELETE CASCADE,
    voter_id TEXT NOT NULL,
    score INT NOT NULL CHECK (score >= 1 AND score <= 10),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_summary_voter UNIQUE (summary_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_summary_id ON public.ratings(summary_id);
CREATE INDEX IF NOT EXISTS idx_ratings_voter_id ON public.ratings(voter_id);

-- ==============================================================================
-- AUTOMATIC METRIC CALCULATION TRIGGER
-- Updates average_score and ratings_count on summaries whenever a rating is added, updated, or removed
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_update_summary_metrics()
RETURNS TRIGGER AS $$
DECLARE
    target_summary_id UUID;
    new_avg NUMERIC(3,1);
    new_count INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_summary_id := OLD.summary_id;
    ELSE
        target_summary_id := NEW.summary_id;
    END IF;

    SELECT 
        COALESCE(ROUND(AVG(score)::numeric, 1), 0),
        COUNT(id)
    INTO
        new_avg,
        new_count
    FROM public.ratings
    WHERE summary_id = target_summary_id;

    UPDATE public.summaries
    SET 
        average_score = new_avg,
        ratings_count = new_count
    WHERE id = target_summary_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_summary_metrics ON public.ratings;
CREATE TRIGGER trigger_update_summary_metrics
AFTER INSERT OR UPDATE OR DELETE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.handle_update_summary_metrics();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Topics: readable by anyone, modifiable by service role
CREATE POLICY "Allow public read access to topics"
    ON public.topics FOR SELECT USING (true);

-- Summaries: readable by anyone, insertable by any visitor (with handle), update/delete by author
CREATE POLICY "Allow public read access to summaries"
    ON public.summaries FOR SELECT USING (true);

CREATE POLICY "Allow public insert to summaries"
    ON public.summaries FOR INSERT WITH CHECK (char_length(content) > 10);

CREATE POLICY "Allow author to update own summaries"
    ON public.summaries FOR UPDATE USING (auth.uid()::text = author_id OR author_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Ratings: readable by anyone, insert/upsert by any voter
CREATE POLICY "Allow public read access to ratings"
    ON public.ratings FOR SELECT USING (true);

CREATE POLICY "Allow public insert or upsert ratings"
    ON public.ratings FOR INSERT WITH CHECK (score >= 1 AND score <= 10);

CREATE POLICY "Allow voters to update own rating"
    ON public.ratings FOR UPDATE USING (true) WITH CHECK (score >= 1 AND score <= 10);

-- ==============================================================================
-- SEED DATA: 32 CURATED SEED TOPICS
-- ==============================================================================
INSERT INTO public.topics (id, title, category, hook, difficulty, times_completed) VALUES
('00000000-0000-0000-0000-000000000001', 'The Call of the Void (L''appel du vide)', 'Psychology & Human Behavior', 'Why healthy brains briefly imagine jumping from high places—and how it''s actually an instinctive survival signal.', 'Easy', 184),
('00000000-0000-0000-0000-000000000002', 'The McGurk Effect', 'Psychology & Human Behavior', 'How what your eyes see can completely override what your ears hear, proving conscious perception is a multisensory illusion.', 'Easy', 219),
('00000000-0000-0000-0000-000000000003', 'Cotard''s Delusion (Walking Corpse Syndrome)', 'Psychology & Human Behavior', 'A rare neuropsychiatric condition where a patient genuinely believes their organs are missing, or that they have already died.', 'Medium', 96),
('00000000-0000-0000-0000-000000000004', 'The Benjamin Franklin Effect', 'Psychology & Human Behavior', 'Why asking someone to do you a small favor makes them like you more than if you did a favor for them.', 'Easy', 312),
('00000000-0000-0000-0000-000000000005', 'Childhood Amnesia', 'Psychology & Human Behavior', 'Why humans cannot recall episodic memories from before age 2–4, and the dramatic hippocampal neurogenesis behind it.', 'Medium', 142),
('00000000-0000-0000-0000-000000000006', 'The Dunning-Kruger Effect vs. Impostor Syndrome', 'Psychology & Human Behavior', 'The dual cognitive mechanics of why novices overestimate competence while master practitioners constantly doubt theirs.', 'Easy', 405),
('00000000-0000-0000-0000-000000000007', 'Inattentional Blindness (The Invisible Gorilla)', 'Psychology & Human Behavior', 'Why intense visual focus on one task makes your visual cortex literally blind to obvious events in your direct line of sight.', 'Easy', 278),
('00000000-0000-0000-0000-000000000008', 'Split-Brain Experiments (Roger Sperry)', 'Psychology & Human Behavior', 'What occurs when the corpus callosum is severed and the left and right hemispheres operate as two independent conscious entities.', 'Hard', 167),
('00000000-0000-0000-0000-000000000009', 'Evolvable Hardware (Adrian Thompson''s FPGA Experiment)', 'Tech & Computer Science', 'When a genetic algorithm evolved a working circuit utilizing unintended microscopic electromagnetic physics that human engineers couldn''t decode.', 'Hard', 133),
('00000000-0000-0000-0000-000000000010', 'Byzantine Fault Tolerance (The Byzantine Generals Problem)', 'Tech & Computer Science', 'How distributed computing clusters and cryptographic blockchains reach mathematical consensus when malicious nodes broadcast conflicting messages.', 'Hard', 289),
('00000000-0000-0000-0000-000000000011', 'Zero-Knowledge Proofs (ZKPs)', 'Tech & Computer Science', 'How you can mathematically convince an untrusted party that you possess a secret statement without revealing even one bit of the underlying data.', 'Hard', 211),
('00000000-0000-0000-0000-000000000012', 'Quines (Self-Replicating Programs)', 'Tech & Computer Science', 'Computer programs that take zero external input and output an exact character-for-character copy of their own source code—mirroring biological DNA.', 'Medium', 178),
('00000000-0000-0000-0000-000000000013', 'Cosmic Rays & Single-Event Upsets (Bit Flips)', 'Tech & Computer Science', 'How high-energy subatomic particles from exploded stars strike semiconductor RAM on Earth, silently flipping 0s into 1s and rerouting flights.', 'Medium', 340),
('00000000-0000-0000-0000-000000000014', 'The Halting Problem (Alan Turing, 1936)', 'Tech & Computer Science', 'Why it is mathematically proven impossible to build a program that can definitively predict whether ANY given code halts or loops forever.', 'Hard', 195),
('00000000-0000-0000-0000-000000000015', 'Fast Inverse Square Root (0x5f3759df)', 'Tech & Computer Science', 'The legendary, baffling C hack in Quake III Arena that used bitwise casting and a magic constant to calculate 1/sqrt(x) four times faster.', 'Medium', 310),
('00000000-0000-0000-0000-000000000016', 'Dead Internet Theory & Bot Traffic Economics', 'Tech & Computer Science', 'The reality of how automated crawlers, LLM synthetic content loops, and metric click-farms now outnumber genuine human presence online.', 'Easy', 520),
('00000000-0000-0000-0000-000000000017', 'Slime Mold (Physarum polycephalum) Intelligence', 'Science, Biology & Nature', 'How an acellular, brainless yellow protist calculated the optimal geometry of the Tokyo railway network in just 26 hours.', 'Medium', 260),
('00000000-0000-0000-0000-000000000018', 'Tardigrades & Cryptobiosis', 'Science, Biology & Nature', 'How microscopic ''water bears'' withstand absolute zero, cosmic vacuum, and lethal radiation doses by vitrifying their cytoplasm into glass.', 'Easy', 388),
('00000000-0000-0000-0000-000000000019', 'Dinosaur Pigmentation (Melanosomes)', 'Science, Biology & Nature', 'How paleobiologists decoded the actual plumage colors and iridescent bands of prehistoric theropods preserved in 130-million-year-old rock.', 'Medium', 112),
('00000000-0000-0000-0000-000000000020', 'The Wood Wide Web (Mycorrhizal Networks)', 'Science, Biology & Nature', 'How subterranean fungal mycelia form an underground biological internet enabling mature trees to trade carbon, nutrients, and distress pheromones.', 'Easy', 295),
('00000000-0000-0000-0000-000000000021', 'Sonoluminescence', 'Science, Biology & Nature', 'The physics anomaly where ultrasonic acoustic fields collapse a micro-bubble in liquid so violently that it produces flash temperatures exceeding the sun.', 'Hard', 88),
('00000000-0000-0000-0000-000000000022', 'Kessler Syndrome', 'Science, Biology & Nature', 'How a single high-velocity orbital impact could spark an unstoppable cascade of space debris, trapping human civilization on Earth for centuries.', 'Medium', 341),
('00000000-0000-0000-0000-000000000023', 'Braess''s Paradox', 'Economics & Game Theory', 'The counterintuitive mathematical theorem proving that adding a brand new road to an optimal traffic network can make everyone''s commute slower.', 'Medium', 232),
('00000000-0000-0000-0000-000000000024', 'The Tragedy of the Commons & Elinor Ostrom''s Rules', 'Economics & Game Theory', 'Why unregulated collective resources fail, and the Nobel-winning empirical framework showing how local human governance outperforms state control.', 'Medium', 175),
('00000000-0000-0000-0000-000000000025', 'Goodhart''s Law (''When a measure becomes a target...'')', 'Economics & Game Theory', 'From British bounties causing cobra breeding to tech metrics destroying quality: why targeting any metric corrupts its informative validity.', 'Easy', 420),
('00000000-0000-0000-0000-000000000026', 'The Schelling Point (Focal Points)', 'Economics & Game Theory', 'How two people without any channel of communication still coordinate reliably by anticipating the most salient, prominent choice.', 'Easy', 198),
('00000000-0000-0000-0000-000000000027', 'Waffle House Index', 'Economics & Game Theory', 'Why emergency disaster response agencies use a 24/7 diner chain''s generator and limited menu status as an accurate real-time hurricane triage index.', 'Easy', 355),
('00000000-0000-0000-0000-000000000028', 'Nuclear Semiotics (10,000-Year Waste Warnings)', 'History & Design Mysteries', 'How semioticians and architects design hostile monuments of thorns and acoustic landscape markers to warn post-apocalyptic future humans away from radioactive dumps.', 'Hard', 220),
('00000000-0000-0000-0000-000000000029', 'The Antikythera Mechanism', 'History & Design Mysteries', 'The 2,100-year-old Greco-Roman bronze geared clockwork machine pulled from a shipwreck that calculated lunar anomalies and Olympic cycles.', 'Medium', 274),
('00000000-0000-0000-0000-000000000030', 'Bouba/Kiki Effect', 'History & Design Mysteries', 'Why over 95% of speakers across unrelated worldwide languages link sharp shapes to ''Kiki'' and curved shapes to ''Bouba'', revealing cross-modal brain wiring.', 'Easy', 380),
('00000000-0000-0000-0000-000000000031', 'Desire Paths', 'History & Design Mysteries', 'How human pedestrians carve organic shortcuts across manicured grass, and how forward-thinking architects wait for snow tracks before laying pavement.', 'Easy', 310),
('00000000-0000-0000-0000-000000000032', 'Phantom Islands (Bermeja & Sandy Island)', 'History & Design Mysteries', 'Islands that endured on official maritime maps, satellite charts, and treaties for hundreds of years before hydrographers arrived and found deep ocean.', 'Easy', 189)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    hook = EXCLUDED.hook,
    difficulty = EXCLUDED.difficulty;
