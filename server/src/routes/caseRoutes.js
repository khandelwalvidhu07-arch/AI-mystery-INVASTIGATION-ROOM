import express from 'express';
import { Case } from '../models/Case.js';
import { generateMysteryWithGemini, DIFFICULTY_CONFIG } from '../services/geminiService.js';

const router = express.Router();

// 1. POST /api/cases — Generate and save a new mystery
router.post('/', async (req, res) => {
  try {
    const { premise, difficulty } = req.body;

    if (!premise || typeof premise !== 'string' || premise.trim().length === 0) {
      return res.status(400).json({ error: 'Premise is required to generate a mystery.' });
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    const chosenDifficulty = validDifficulties.includes(difficulty?.toLowerCase())
      ? difficulty.toLowerCase()
      : 'medium';

    console.log(`Generating mystery [${chosenDifficulty}] for premise: "${premise.slice(0, 50)}..."`);
    const mysteryData = await generateMysteryWithGemini(premise, chosenDifficulty);

    const newCase = new Case({
      title: mysteryData.title,
      premise: mysteryData.premise,
      story: mysteryData.story,
      difficulty: chosenDifficulty,
      suspects: mysteryData.suspects,
      clues: mysteryData.clues,
      hints: mysteryData.hints,
      culpritId: mysteryData.culpritId,
      culpritName: mysteryData.culpritName,
      solutionExplanation: mysteryData.solutionExplanation,
      status: 'investigating',
      score: 0
    });

    await newCase.save();

    res.status(201).json({
      success: true,
      case: newCase.toClientJSON()
    });
  } catch (error) {
    console.error('Error generating case:', error);
    res.status(500).json({ error: 'Failed to generate mystery case. ' + error.message });
  }
});

// 2. GET /api/cases — List recent cases (sanitized)
router.get('/', async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 }).limit(10);
    res.json({
      success: true,
      cases: cases.map(c => c.toClientJSON())
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list cases: ' + error.message });
  }
});

// 3. GET /api/cases/:id — Retrieve active mystery (sanitized before accusation)
router.get('/:id', async (req, res) => {
  try {
    const foundCase = await Case.findById(req.params.id);
    if (!foundCase) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    res.json({
      success: true,
      case: foundCase.toClientJSON()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve case: ' + error.message });
  }
});

// 4. POST /api/cases/:id/clues/:clueId/discover — Discover a clue (+5 pts)
router.post('/:id/clues/:clueId/discover', async (req, res) => {
  try {
    const foundCase = await Case.findById(req.params.id);
    if (!foundCase) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    if (foundCase.status === 'completed') {
      return res.status(400).json({ error: 'Case is already closed.' });
    }

    const clue = foundCase.clues.find(c => c.id === req.params.clueId);
    if (!clue) {
      return res.status(404).json({ error: 'Clue not found in this case.' });
    }

    let pointsAwarded = 0;
    if (!clue.isDiscovered) {
      clue.isDiscovered = true;
      clue.discoveredAt = new Date();
      pointsAwarded = 5;
      foundCase.score = (foundCase.score || 0) + pointsAwarded;
      await foundCase.save();
    }

    res.json({
      success: true,
      clue,
      pointsAwarded,
      currentScore: foundCase.score
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to discover clue: ' + error.message });
  }
});

// 5. POST /api/cases/:id/hints — Request next hint (-10 pts)
router.post('/:id/hints', async (req, res) => {
  try {
    const foundCase = await Case.findById(req.params.id);
    if (!foundCase) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    if (foundCase.status === 'completed') {
      return res.status(400).json({ error: 'Case is already closed.' });
    }

    // Find first unrevealed hint
    const nextHint = foundCase.hints.find(h => !h.isRevealed);
    if (!nextHint) {
      return res.status(400).json({
        error: 'No more hints available for this case.',
        hintsRemaining: 0
      });
    }

    nextHint.isRevealed = true;
    nextHint.revealedAt = new Date();

    // Deduct 10 points (floor at 0)
    foundCase.score = Math.max(0, (foundCase.score || 0) - 10);
    await foundCase.save();

    const hintsRemaining = foundCase.hints.filter(h => !h.isRevealed).length;

    res.json({
      success: true,
      hint: nextHint,
      hintsRemaining,
      currentScore: foundCase.score
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to request hint: ' + error.message });
  }
});

// 6. POST /api/cases/:id/accuse — Submit an accusation & reveal verdict
router.post('/:id/accuse', async (req, res) => {
  try {
    const { suspectId } = req.body;
    if (!suspectId) {
      return res.status(400).json({ error: 'Please select a suspect to accuse.' });
    }

    const foundCase = await Case.findById(req.params.id);
    if (!foundCase) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    if (foundCase.status === 'completed') {
      return res.json({
        success: true,
        alreadyCompleted: true,
        isCorrect: foundCase.isAccusationCorrect,
        culpritId: foundCase.culpritId,
        culpritName: foundCase.culpritName,
        solutionExplanation: foundCase.solutionExplanation,
        score: foundCase.score
      });
    }

    // Evaluate accusation
    const isCorrect = (suspectId === foundCase.culpritId || suspectId === foundCase.culpritName);
    
    // Scoring rules:
    // Easy: 100, Medium: 150, Hard: 200 base points if correct.
    const config = DIFFICULTY_CONFIG[foundCase.difficulty] || DIFFICULTY_CONFIG.medium;
    const basePoints = isCorrect ? config.basePoints : 0;

    // Discovered clues (+5 pts)
    const discoveredCount = foundCase.clues.filter(c => c.isDiscovered).length;
    const cluesBonus = discoveredCount * 5;

    // Hints used (-10 pts)
    const hintsCount = foundCase.hints.filter(h => h.isRevealed).length;
    const hintsPenalty = hintsCount * 10;

    // Total Score (floor at 0)
    const finalScore = Math.max(0, basePoints + cluesBonus - hintsPenalty);

    foundCase.status = 'completed';
    foundCase.score = finalScore;
    foundCase.accusedSuspectId = suspectId;
    foundCase.isAccusationCorrect = isCorrect;
    foundCase.completedAt = new Date();

    await foundCase.save();

    res.json({
      success: true,
      isCorrect,
      accusedSuspectId: suspectId,
      culpritId: foundCase.culpritId,
      culpritName: foundCase.culpritName,
      solutionExplanation: foundCase.solutionExplanation,
      scoreBreakdown: {
        difficulty: foundCase.difficulty,
        basePoints,
        discoveredCount,
        cluesBonus,
        hintsCount,
        hintsPenalty,
        finalScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process accusation: ' + error.message });
  }
});

// 7. GET /api/cases/:id/result — Retrieve completed result
router.get('/:id/result', async (req, res) => {
  try {
    const foundCase = await Case.findById(req.params.id);
    if (!foundCase) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    if (foundCase.status !== 'completed') {
      return res.status(400).json({
        error: 'Case is still in progress. Accuse a suspect first to see the final debrief.'
      });
    }

    const config = DIFFICULTY_CONFIG[foundCase.difficulty] || DIFFICULTY_CONFIG.medium;
    const basePoints = foundCase.isAccusationCorrect ? config.basePoints : 0;
    const discoveredCount = foundCase.clues.filter(c => c.isDiscovered).length;
    const hintsCount = foundCase.hints.filter(h => h.isRevealed).length;

    res.json({
      success: true,
      case: foundCase.toObject(),
      scoreBreakdown: {
        difficulty: foundCase.difficulty,
        basePoints,
        discoveredCount,
        cluesBonus: discoveredCount * 5,
        hintsCount,
        hintsPenalty: hintsCount * 10,
        finalScore: foundCase.score
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve result: ' + error.message });
  }
});

export default router;

