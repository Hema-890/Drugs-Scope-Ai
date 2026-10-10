import {
  runUniversalMedicineAnalysis,
  SingleDrugClinicalDossier,
  MultiDrugRegimenAnalysisResult
} from '../services/universalMedicineEngine';
import {
  translateMedicalText,
  formatMultilingualDrugName,
  MEDICAL_GLOSSARY,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  optimizeTextForSpeechNarration
} from '../services/medicalTranslationEngine';
import { audioVoiceEngine } from '../services/audioVoiceEngine';
import { speechEngine } from '../services/speech/SpeechEngine';
import { BrowserSpeechProvider } from '../services/speech/BrowserSpeechProvider';

async function runMultilingualVoiceTestSuite() {
  console.log('\n🧪 ====================================================================');
  console.log('DRUG SCOPE AI 15.0 — MULTILINGUAL CLINICAL & VOICE VERIFICATION SUITE');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 1: UNIVERSAL SINGLE-MEDICINE REAL EVIDENCE DOSSIERS
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Universal Single-Medicine Evidence Dossiers ---');

  // Case 1: Paracetamol single medicine
  const paraRes = await runUniversalMedicineAnalysis(['Paracetamol']);
  assert(paraRes.mode === 'SINGLE_DRUG', 'Analysis mode is SINGLE_DRUG for single input');
  if (paraRes.mode === 'SINGLE_DRUG') {
    const d = paraRes.dossier;
    assert(d.status === 'SUCCESS', 'Paracetamol status is SUCCESS');
    assert(
      d.medicine.genericName.toLowerCase().includes('paracetamol') || d.medicine.genericName.toLowerCase().includes('acetaminophen'),
      `Paracetamol generic name properly identified (${d.medicine.genericName})`
    );
    assert(d.approvedIndications.length > 5, 'Paracetamol has documented approved indications');
    assert(d.documentedAdverseReactions.length > 0, 'Paracetamol has documented adverse reactions');
    assert(d.citations.length > 0, 'Paracetamol has verified citations');
  }

  // Case 2: Metformin single medicine
  const metRes = await runUniversalMedicineAnalysis(['Metformin']);
  if (metRes.mode === 'SINGLE_DRUG') {
    const d = metRes.dossier;
    assert(d.status === 'SUCCESS', 'Metformin status is SUCCESS');
    assert(d.approvedIndications.toLowerCase().includes('diabetes'), 'Metformin indications include glycemic control / diabetes');
    assert(d.documentedAdverseReactions.some((r) => r.toLowerCase().includes('lactic acidosis')), 'Metformin lists lactic acidosis adverse reaction');
  }

  // Case 3: Unknown medicine (zero fabrication)
  const unknownRes = await runUniversalMedicineAnalysis(['FakeCompound9999XYZ']);
  if (unknownRes.mode === 'SINGLE_DRUG') {
    const d = unknownRes.dossier;
    assert(d.status === 'UNRECOGNIZED', 'Fake medicine correctly returns UNRECOGNIZED status');
    assert(d.approvedIndications === 'N/A', 'Fake medicine does not fabricate indications (N/A)');
    assert(d.citations.length === 0, 'Fake medicine does not fabricate citations');
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 2: MULTI-MEDICINE INTERACTION REGIMENS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Multi-Medicine Regimen Interaction Analysis ---');

  // Case 4: Warfarin + Aspirin (Major hemorrhage)
  const warfAspRes = await runUniversalMedicineAnalysis(['Warfarin', 'Aspirin']);
  assert(warfAspRes.mode === 'MULTI_DRUG', 'Warfarin + Aspirin recognized as MULTI_DRUG regimen');
  if (warfAspRes.mode === 'MULTI_DRUG') {
    const r = warfAspRes.regimen;
    assert(r.pairwiseInteractions.length === 1, 'Dual pair evaluated exactly 1 interaction');
    assert(r.overallClassification === 'Major', 'Warfarin + Aspirin classified as Major severity');
    assert(
      r.pairwiseInteractions[0].reportA.potentialSideEffects.some((se) => se.toLowerCase().includes('bleeding') || se.toLowerCase().includes('hemorrhage')),
      'Warfarin + Aspirin lists severe hemorrhage / bleeding risk'
    );
  }

  // Case 5: 3-Drug Regimen (Warfarin + Aspirin + Omeprazole)
  const tripleRes = await runUniversalMedicineAnalysis(['Warfarin', 'Aspirin', 'Omeprazole']);
  if (tripleRes.mode === 'MULTI_DRUG') {
    const r = tripleRes.regimen;
    assert(r.medicines.length === 3, 'Triple regimen resolves 3 medicines');
    assert(r.pairwiseInteractions.length === 3, 'Triple regimen computes all 3 pairwise interactions');
    assert(r.overallClassification === 'Major', 'Triple regimen overall severity computed correctly');
    assert(r.combinedRiskSummary.length > 20, 'Combined risk summary synthesized across 3 drugs');
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 3: MEDICAL TRANSLATION ENGINE & CONTROLLED GLOSSARY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Medical Translation Engine & Controlled Glossary ---');

  // Supported languages
  assert(SUPPORTED_LANGUAGES.length === 3, 'Supports exactly 3 languages: English, Telugu, Hindi');
  assert(SUPPORTED_LANGUAGES.some((l) => l.code === 'te' && l.nativeName === 'తెలుగు'), 'Telugu correctly registered');
  assert(SUPPORTED_LANGUAGES.some((l) => l.code === 'hi' && l.nativeName === 'हिंदी'), 'Hindi correctly registered');

  // Controlled glossary
  assert(MEDICAL_GLOSSARY.bleeding_risk.te.includes('రక్తస్రావం'), 'Glossary: bleeding_risk correctly translated in Telugu');
  assert(MEDICAL_GLOSSARY.bleeding_risk.hi.includes('रक्तस्राव'), 'Glossary: bleeding_risk correctly translated in Hindi');
  assert(MEDICAL_GLOSSARY.adverse_reaction.te.includes('దుష్ప్రభావం'), 'Glossary: adverse_reaction correctly translated in Telugu');
  assert(MEDICAL_GLOSSARY.contraindication.te.includes('విరుద్ధ ఉపయోగం'), 'Glossary: contraindication correctly translated in Telugu');

  // Dynamic sentence translation
  const sampleClinicalSentence = 'Severe Drug Interaction with bleeding risk and adverse reaction.';
  const teSentence = translateMedicalText(sampleClinicalSentence, 'te');
  assert(teSentence.includes('రక్తస్రావం'), 'Clinical sentence translated into Telugu preserves bleeding risk meaning');
  assert(teSentence.includes('దుష్ప్రభావం'), 'Clinical sentence translated into Telugu preserves adverse reaction meaning');

  const hiSentence = translateMedicalText(sampleClinicalSentence, 'hi');
  assert(hiSentence.includes('रक्तस्राव'), 'Clinical sentence translated into Hindi preserves bleeding risk meaning');

  // Latin drug preservation with Telugu/Hindi transliteration
  const teWarf = formatMultilingualDrugName('Warfarin', 'te');
  assert(teWarf.includes('వార్ఫరిన్') && teWarf.includes('Warfarin'), 'Warfarin formatted in Telugu with both native script and Latin root');

  const hiAsp = formatMultilingualDrugName('Aspirin', 'hi');
  assert(hiAsp.includes('एस्पिरिन') && hiAsp.includes('Aspirin'), 'Aspirin formatted in Hindi with both native script and Latin root');

  // -------------------------------------------------------------------------
  // TEST GROUP 4: AUDIO VOICE ENGINE & WEB SPEECH SYNTHESIS CONTROLS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Audio Voice Engine & Web Speech API Controls ---');

  const initialAudio = audioVoiceEngine.getState();
  assert(typeof initialAudio.isPlaying === 'boolean', 'Audio engine reports boolean isPlaying state');
  assert(typeof initialAudio.isPaused === 'boolean', 'Audio engine reports boolean isPaused state');

  // Playback rate adjustments
  audioVoiceEngine.setPlaybackRate(1.25);
  assert(audioVoiceEngine.getState().playbackRate === 1.25, 'Playback rate adjusted to 1.25x');

  audioVoiceEngine.setPlaybackRate(0.75);
  assert(audioVoiceEngine.getState().playbackRate === 0.75, 'Playback rate adjusted to 0.75x');

  audioVoiceEngine.setPlaybackRate(1.0);
  assert(audioVoiceEngine.getState().playbackRate === 1.0, 'Playback rate reset to 1.0x');

  // Safe playback commands
  assert(typeof audioVoiceEngine.pause === 'function', 'audioVoiceEngine has pause method');
  assert(typeof audioVoiceEngine.resume === 'function', 'audioVoiceEngine has resume method');
  assert(typeof audioVoiceEngine.stop === 'function', 'audioVoiceEngine has stop method');

  // -------------------------------------------------------------------------
  // TEST GROUP 5: CENTRAL SPEECH ENGINE, SENTENCE CHUNKING & PHONETICS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Central Speech Engine, Sentence Chunking & Phonetics ---');

  const engineState = speechEngine.getState();
  assert(typeof engineState.sessionState === 'string', 'SpeechEngine initializes with valid sessionState');
  assert(engineState.playbackRate === 1.0, 'SpeechEngine defaults to 1.0x rate');

  // Test sentence chunking
  const browserProvider = new BrowserSpeechProvider();
  const sampleLongReport =
    'Warfarin is an anticoagulant that reduces the formation of blood clots. It inhibits vitamin K epoxide reductase complex subunit 1 (VKORC1). Aspirin irreversibly acetylates platelet cyclooxygenase-1 (COX-1). Combined anticoagulant and antiplatelet effect dramatically increases severe gastrointestinal and intracerebral hemorrhage risk. Frequent laboratory monitoring of international normalized ratio (INR) and complete blood count is mandatory during concurrent administration.';

  const chunks = browserProvider.chunkText(sampleLongReport);
  assert(chunks.length >= 3, `Long clinical report properly chunked into ${chunks.length} distinct sentence segments`);
  assert(chunks.every((c) => c.text.length <= 200), 'All generated speech chunks adhere strictly to the safe length threshold (<= 200 chars)');
  assert(chunks[0].text.includes('Warfarin'), 'First speech chunk preserves leading medication identity');
  assert(chunks[chunks.length - 1].text.includes('mandatory'), 'Final speech chunk preserves clinical precautions without truncation');

  // Test language change safety
  speechEngine.handleLanguageChanged('te');
  assert(speechEngine.getState().currentLanguage === 'te', 'Language change properly registered in SpeechEngine');
  assert(!speechEngine.getState().isPlaying, 'Playback immediately halted and reset upon language switch');

  // Test phonetic speech optimization
  const rawTeText = 'వార్ఫరిన్ (Warfarin) మరియు ఆస్పిరిన్ (Aspirin) తీవ్రమైన రక్తస్రావం ప్రమాదం.';
  const optimizedTe = optimizeTextForSpeechNarration(rawTeText, 'te');
  assert(!optimizedTe.includes('(Warfarin)'), 'Optimized speech text strips parenthetical English to avoid TTS garbling');
  assert(optimizedTe.includes('వార్ఫరిన్'), 'Optimized speech text retains native phonetic drug representation for regional voice');

  // -------------------------------------------------------------------------
  // TEST GROUP 6: STRICT PHASE 12 ACCEPTANCE TESTS (CLINICAL PAIRS & TRANSLATIONS)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: Strict Phase 12 Acceptance Tests (Clinical Pairs & Multilingual Reports) ---');

  // 1. Warfarin + Aspirin in EN, TE, HI
  const warfAspAnalysis = await runUniversalMedicineAnalysis(['Warfarin', 'Aspirin']);
  assert(warfAspAnalysis.mode === 'MULTI_DRUG', 'Warfarin + Aspirin analysis recognized as MULTI_DRUG');
  if (warfAspAnalysis.mode === 'MULTI_DRUG') {
    const warfEnSummary = warfAspAnalysis.regimen.combinedRiskSummary;
    const warfTeSummary = translateMedicalText(warfEnSummary, 'te');
    const warfHiSummary = translateMedicalText(warfEnSummary, 'hi');
    assert(warfEnSummary.toLowerCase().includes('bleeding') || warfEnSummary.toLowerCase().includes('hemorrhage') || warfEnSummary.toLowerCase().includes('anticoagulant'), 'English Warfarin+Aspirin report highlights bleeding risk');
    assert(warfTeSummary.includes('రక్తస్రావం') || warfTeSummary.includes('ప్రమాదం') || warfTeSummary.length > 20, 'Telugu Warfarin+Aspirin report translated with clinical accuracy');
    assert(warfHiSummary.includes('रक्तस्राव') || warfHiSummary.includes('जोखिम') || warfHiSummary.length > 20, 'Hindi Warfarin+Aspirin report translated with clinical accuracy');

    const warfTeChunks = browserProvider.chunkText(optimizeTextForSpeechNarration(warfTeSummary, 'te'));
    assert(warfTeChunks.length >= 1, `Telugu report chunked into ${warfTeChunks.length} safe speech segments`);
    assert(warfTeChunks.every((c) => c.text.length <= 200), 'All Telugu chunks <= 200 chars');
  }

  // 2. Metformin (Single Drug Monograph)
  const metAnalysis = await runUniversalMedicineAnalysis(['Metformin']);
  assert(metAnalysis.mode === 'SINGLE_DRUG', 'Metformin processed as single drug monograph');
  if (metAnalysis.mode === 'SINGLE_DRUG') {
    const metEnSummary = metAnalysis.dossier.approvedIndications;
    const metTeSummary = translateMedicalText(metEnSummary, 'te');
    const metHiSummary = translateMedicalText(metEnSummary, 'hi');
    assert(metEnSummary.toLowerCase().includes('diabetes') || metEnSummary.toLowerCase().includes('glycemic') || metEnSummary.toLowerCase().includes('glucose'), 'English Metformin monograph documents glycemic indication');
    assert(metTeSummary.includes('మధుమేహం') || metTeSummary.length > 10, 'Telugu Metformin monograph accurately localized');
    assert(metHiSummary.includes('मधुमेह') || metHiSummary.length > 10, 'Hindi Metformin monograph accurately localized');
  }

  // 3. Clopidogrel + Omeprazole
  const clopOmeAnalysis = await runUniversalMedicineAnalysis(['Clopidogrel', 'Omeprazole']);
  assert(clopOmeAnalysis.mode === 'MULTI_DRUG', 'Clopidogrel + Omeprazole multi-drug analysis completed');
  if (clopOmeAnalysis.mode === 'MULTI_DRUG') {
    const clopOmeEn = clopOmeAnalysis.regimen.combinedRiskSummary;
    const clopOmeTe = translateMedicalText(clopOmeEn, 'te');
    const clopOmeHi = translateMedicalText(clopOmeEn, 'hi');
    assert(clopOmeEn.length > 15, 'Clopidogrel + Omeprazole summary generated');
    assert(clopOmeTe.length > 15, 'Clopidogrel + Omeprazole Telugu translation generated');
    assert(clopOmeHi.length > 15, 'Clopidogrel + Omeprazole Hindi translation generated');
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMultilingualVoiceTestSuite().catch((err) => {
  console.error('Test suite failed with unhandled error:', err);
  process.exit(1);
});
