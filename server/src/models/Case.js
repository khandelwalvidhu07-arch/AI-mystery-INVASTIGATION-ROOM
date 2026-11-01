import mongoose from 'mongoose';

const SuspectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  alibi: { type: String, required: true },
  motive: { type: String, required: true },
  demeanor: { type: String, default: 'Neutral' },
  avatarUrl: { type: String }
}, { _id: false });

const ClueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isDiscovered: { type: Boolean, default: false },
  discoveredAt: { type: Date }
}, { _id: false });

const HintSchema = new mongoose.Schema({
  id: { type: String, required: true },
  hintText: { type: String, required: true },
  isRevealed: { type: Boolean, default: false },
  revealedAt: { type: Date }
}, { _id: false });

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  premise: { type: String, required: true },
  story: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  suspects: [SuspectSchema],
  clues: [ClueSchema],
  hints: [HintSchema],

  // SENSITIVE FIELDS: Redacted until case completion
  culpritId: { type: String, required: true, select: true },
  culpritName: { type: String, required: true, select: true },
  solutionExplanation: { type: String, required: true, select: true },

  // Gameplay State
  status: {
    type: String,
    enum: ['investigating', 'completed'],
    default: 'investigating'
  },
  score: { type: Number, default: 0 },
  accusedSuspectId: { type: String },
  isAccusationCorrect: { type: Boolean },
  completedAt: { type: Date }
}, {
  timestamps: true
});

/**
 * Strips the culprit and solution from the case payload if investigation is still in progress.
 */
CaseSchema.methods.toClientJSON = function () {
  const obj = this.toObject();

  if (obj.status !== 'completed') {
    delete obj.culpritId;
    delete obj.culpritName;
    delete obj.solutionExplanation;

    // Also obscure clue descriptions if not discovered yet
    obj.clues = obj.clues.map(c => {
      if (!c.isDiscovered) {
        return {
          id: c.id,
          title: c.title,
          description: "Unexamined evidence. Click 'Examine Evidence' to investigate this lead.",
          isDiscovered: false
        };
      }
      return c;
    });

    // Also obscure hintText if not revealed yet
    obj.hints = obj.hints.map(h => {
      if (!h.isRevealed) {
        return {
          id: h.id,
          hintText: "Confidential lead locked. Request hint to uncover.",
          isRevealed: false
        };
      }
      return h;
    });
  }

  return obj;
};

export const Case = mongoose.model('Case', CaseSchema);

