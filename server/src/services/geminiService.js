import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Difficulty requirements as specified in SPEC.md
export const DIFFICULTY_CONFIG = {
  easy: { suspects: 3, clues: 5, hints: 2, basePoints: 100 },
  medium: { suspects: 4, clues: 7, hints: 3, basePoints: 150 },
  hard: { suspects: 5, clues: 9, hints: 3, basePoints: 200 }
};

// Zod Schema to strictly validate the Gemini output
const MysteryZodSchema = z.object({
  title: z.string().min(3),
  story: z.string().min(20),
  suspects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      alibi: z.string(),
      motive: z.string(),
      demeanor: z.string()
    })
  ),
  clues: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string()
    })
  ),
  hints: z.array(
    z.object({
      id: z.string(),
      hintText: z.string()
    })
  ),
  culpritId: z.string(),
  culpritName: z.string(),
  solutionExplanation: z.string().min(20)
});

/**
 * Fallback curated mystery scenarios in case GEMINI_API_KEY is not provided or quota exceeded.
 */
function generateFallbackMystery(premise, difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const timestamp = Date.now();

  const suspects = [
    {
      id: "suspect_1",
      name: "Arthur Pendelton",
      role: "Head Butler",
      alibi: "Polishing silver in the pantry between 9:00 PM and 10:30 PM.",
      motive: "Recently discovered he was written out of the master's estate will.",
      demeanor: "Stern, unblinking, meticulously polite."
    },
    {
      id: "suspect_2",
      name: "Vivian Vance",
      role: "Heiress & Socialite",
      alibi: "Taking a call on the veranda with an overseas investor.",
      motive: "Deep in high-stakes gambling debts that must be settled immediately.",
      demeanor: "Nervously adjusting her diamond bracelet, avoiding direct eye contact."
    },
    {
      id: "suspect_3",
      name: "Dr. Julian Croft",
      role: "Family Physician",
      alibi: "Preparing evening medications in the private dispensary.",
      motive: "Fearing exposure of a fraudulent experimental drug research fund.",
      demeanor: "Calm, analytical, but his hands slightly tremble when questioned."
    },
    {
      id: "suspect_4",
      name: "Inspector Marcus Reed",
      role: "Private Security Consultant",
      alibi: "Patrolling the outer perimeter fence during the rainstorm.",
      motive: "Secretly working with a black-market syndicate to recover sensitive ledgers.",
      demeanor: "Defensive, quick to question the authority of others."
    },
    {
      id: "suspect_5",
      name: "Elena Rostova",
      role: "Art Conservator",
      alibi: "Examining oil paintings in the west gallery under magnifying loupes.",
      motive: "Desperate to replace an authentic masterpiece with a forgery she created.",
      demeanor: "Whispering, evasive, constantly wiping turpentine from her cuffs."
    }
  ].slice(0, config.suspects);

  const allClues = [
    {
      id: "clue_1",
      title: "Broken Wine Goblet & Amber Residue",
      description: "A crystal goblet found behind the heavy velvet curtains, coated with traces of a rare sedative."
    },
    {
      id: "clue_2",
      title: "Muddy Shoe Print (Size 8)",
      description: "A fresh footprint bearing an Italian leather sole pattern matching Vivian Vance's luxury footwear near the side exit."
    },
    {
      id: "clue_3",
      title: "Scorned Telegram Fragment",
      description: "Charred remains of a telegram in the fireplace demanding repayment of 500,000 francs by midnight."
    },
    {
      id: "clue_4",
      title: "Missing Keycard to Safe",
      description: "The digital safe was opened without physical force using an authorized override passcode."
    },
    {
      id: "clue_5",
      title: "Perfume of White Orchids",
      description: "A lingering scent of rare orchid perfume detected at the crime scene, favored exclusively by Vivian Vance."
    },
    {
      id: "clue_6",
      title: "Torn Silk Fabric",
      description: "A thread of emerald green silk snagged on the window latch, identical to the dress Vivian Vance wore to dinner."
    },
    {
      id: "clue_7",
      title: "Security Camera Glitch Log",
      description: "The surveillance feed was looped for precisely 4 minutes starting at 10:14 PM."
    },
    {
      id: "clue_8",
      title: "Dispensary Inventory Ledger",
      description: "Dr. Croft's logs show all medicinal bottles intact, but the digital lock recorded an unauthorized entry."
    },
    {
      id: "clue_9",
      title: "Cigarette Butt in Conservatory",
      description: "An expensive gold-leaf cigarette filter stamped with initials V.V."
    }
  ].slice(0, config.clues);

  const allHints = [
    {
      id: "hint_1",
      hintText: "Pay close attention to physical traces left at the point of exit, specifically footwear and fabric."
    },
    {
      id: "hint_2",
      hintText: "Financial desperation often leaves a paper trail. Check the motives relating to sudden debts."
    },
    {
      id: "hint_3",
      hintText: "The rare scent and matching dress fibers establish presence at the exact time of the crime."
    }
  ].slice(0, config.hints);

  const culprit = suspects[1]; // Vivian Vance

  return {
    title: `The Mystery of ${premise.slice(0, 30)}...`,
    premise,
    story: `On a tempestuous evening at the estate, the unthinkable occurred: ${premise}. Tension hangs thick in the air as guests and staff exchange suspicious glances. The local authorities are delayed by flooded roads, leaving it in your hands as the lead detective to uncover what really transpired.`,
    difficulty,
    suspects,
    clues: allClues.map(c => ({ ...c, isDiscovered: false })),
    hints: allHints.map(h => ({ ...h, isRevealed: false })),
    culpritId: culprit.id,
    culpritName: culprit.name,
    solutionExplanation: `Vivian Vance executed the crime to satisfy her impending debts. Under the guise of taking a phone call on the veranda, she slipped into the study using the override code, staged the theft, and exited through the french doors where she snagged her emerald gown on the latch and left behind her signature white orchid fragrance.`
  };
}

/**
 * Generate a complete mystery using Gemini API with Zod validation.
 */
export async function generateMysteryWithGemini(premise, difficulty = 'medium') {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key') {
    console.warn('⚠️ GEMINI_API_KEY is not set. Generating high-quality procedural case fallback.');
    return generateFallbackMystery(premise, difficulty);
  }

  const prompt = `
You are the master mystery architect for an interactive detective game.
Create a compelling, logically airtight whodunit mystery based on this premise:
"${premise}"

DIFFICULTY REQUIREMENTS:
- Difficulty Level: ${difficulty.toUpperCase()}
- Number of Suspects: EXACTLY ${config.suspects}
- Number of Clues: EXACTLY ${config.clues}
- Number of Hints: EXACTLY ${config.hints}

RULES FOR LOGICAL CONSISTENCY:
1. Designate EXACTLY one true culprit from the suspects list. Set "culpritId" to their suspect id (e.g., "suspect_1") and "culpritName" to their full name.
2. Give all suspects believable alibis and motives, but ensure only the true culprit's alibi falls apart when cross-referenced with the clues.
3. Every clue must provide genuine forensic value (timestamps, physical evidence, witness statements, contradictory alibis, murder weapon, or stolen item location). At least 3 clues must directly implicate the true culprit while exonerating others.
4. Hints must provide progressive detective nudges without giving away the answer directly.
5. Provide a detailed, gripping "solutionExplanation" detailing the chronology of how the crime was executed, the true motive, and why the clues prove the culprit's guilt.

You must respond ONLY with a valid JSON object matching this schema:
{
  "title": "A captivating noir or detective title",
  "story": "Engaging atmospheric synopsis describing the crime, scene, and background (2-4 paragraphs).",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Full Name",
      "role": "Occupation or relation",
      "alibi": "Where they claim they were",
      "motive": "Potential reason to commit the crime",
      "demeanor": "Body language / personality"
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "Short descriptive clue name",
      "description": "Forensic details and discovery notes revealed upon examination"
    }
  ],
  "hints": [
    {
      "id": "hint_1",
      "hintText": "Deductive guidance to point the investigator in the right direction"
    }
  ],
  "culpritId": "suspect_X",
  "culpritName": "Full Name of Culprit",
  "solutionExplanation": "Comprehensive explanation of how the crime was committed and how clues prove it."
}
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash or gemini-2.0-flash or gemini-1.5-pro
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      // If there's markdown fences, strip them
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    // Validate with Zod
    const validated = MysteryZodSchema.parse(parsedData);

    // Ensure suspect IDs and counts conform to rules
    const culpritExists = validated.suspects.some(s => s.id === validated.culpritId || s.name === validated.culpritName);
    if (!culpritExists) {
      validated.culpritId = validated.suspects[0].id;
      validated.culpritName = validated.suspects[0].name;
    }

    return {
      title: validated.title,
      premise,
      story: validated.story,
      difficulty,
      suspects: validated.suspects.slice(0, config.suspects),
      clues: validated.clues.slice(0, config.clues).map(c => ({
        ...c,
        isDiscovered: false
      })),
      hints: validated.hints.slice(0, config.hints).map(h => ({
        ...h,
        isRevealed: false
      })),
      culpritId: validated.culpritId,
      culpritName: validated.culpritName,
      solutionExplanation: validated.solutionExplanation
    };
  } catch (err) {
    console.error('❌ Gemini generation failed or schema validation error:', err.message);
    console.log('Falling back to high-fidelity procedural case generation.');
    return generateFallbackMystery(premise, difficulty);
  }
}

