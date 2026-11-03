import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { generateMysteryWithGemini } from './src/services/geminiService.js';
import { Case } from './src/models/Case.js';

async function runTests() {
  console.log('🧪 Starting AI Mystery Room Diagnostic Test Suite...\n');
  console.log('Environment check:');
  console.log('  MONGODB_URI configured:', !!process.env.MONGODB_URI);
  console.log('  GEMINI_API_KEY configured:', !!process.env.GEMINI_API_KEY);

  try {
    // 1. Test Database Connection
    console.log('\n1️⃣ Testing Database Connection...');
    await connectDB();
    console.log('   ✅ MongoDB connection established.');

    // 2. Test Gemini Mystery Generation
    console.log('\n2️⃣ Testing Mystery Generation with Gemini...');
    const testPremise = 'A priceless antique pocket watch vanished during the gala dinner at midnight.';
    const mystery = await generateMysteryWithGemini(testPremise, 'easy');
    console.log('   ✅ Mystery generated successfully!');
    console.log(`      Title: "${mystery.title}"`);
    console.log(`      Suspects: ${mystery.suspects.length}`);
    console.log(`      Clues: ${mystery.clues.length}`);
    console.log(`      Hints: ${mystery.hints.length}`);
    console.log(`      Culprit: ${mystery.culpritName} (${mystery.culpritId})`);

    // 3. Test Case Persistence
    console.log('\n3️⃣ Testing Case Creation & Retrieval in Database...');
    const newCase = new Case({
      title: mystery.title,
      premise: mystery.premise,
      story: mystery.story,
      difficulty: 'easy',
      suspects: mystery.suspects,
      clues: mystery.clues,
      hints: mystery.hints,
      culpritId: mystery.culpritId,
      culpritName: mystery.culpritName,
      solutionExplanation: mystery.solutionExplanation,
      status: 'investigating',
      score: 0
    });
    await newCase.save();
    console.log(`   ✅ Saved test case to DB with ID: ${newCase._id}`);

    // Verify sanitization
    const clientPayload = newCase.toClientJSON();
    if (clientPayload.culpritId || clientPayload.solutionExplanation) {
      throw new Error('FAILED: Culprit or solution leaked in toClientJSON before completion!');
    }
    console.log('   ✅ Security check passed: Culprit and solution redacted during active investigation.');

    // Clean up test case
    await Case.findByIdAndDelete(newCase._id);
    console.log('   ✅ Cleaned up test case record.');

    console.log('\n🎉 ALL DIAGNOSTIC TESTS PASSED!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Diagnostic Test Failed:', error);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
}

runTests();
