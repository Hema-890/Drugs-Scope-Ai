export type SupportedLanguage = 'en' | 'te' | 'hi';

export interface LanguageOption {
  code: SupportedLanguage;
  locale: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', locale: 'en-IN', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'te', locale: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', locale: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' }
];

// Controlled Medical Terminology Glossary
export const MEDICAL_GLOSSARY: Record<
  string,
  {
    en: string;
    te: string;
    hi: string;
    definition: string;
  }
> = {
  drug_interaction: {
    en: 'Drug Interaction',
    te: 'ఔషధ పరస్పర చర్య',
    hi: 'दवा परस्पर क्रिया',
    definition: 'Alteration in the pharmacological effect of a drug caused by another drug.'
  },
  adverse_reaction: {
    en: 'Adverse Reaction',
    te: 'దుష్ప్రభావం',
    hi: 'प्रतिकूल प्रभाव / दुष्प्रभाव',
    definition: 'Harmful or unintended response to a medication.'
  },
  contraindication: {
    en: 'Contraindication',
    te: 'విరుద్ధ ఉపయోగం / నిషేధం',
    hi: 'निषेध / मतभेद',
    definition: 'Specific situation in which a drug should not be used because it is harmful.'
  },
  bleeding_risk: {
    en: 'Bleeding Risk',
    te: 'రక్తస్రావం ప్రమాదం',
    hi: 'रक्तस्राव का जोखिम',
    definition: 'Heightened hazard of internal or external hemorrhage.'
  },
  kidney_impairment: {
    en: 'Kidney Impairment',
    te: 'మూత్రపిండాల బలహీనత',
    hi: 'गुर्दे की दुर्बलता',
    definition: 'Reduced glomerular filtration or renal clearance.'
  },
  liver_impairment: {
    en: 'Liver Impairment',
    te: 'కాలేయ బలహీనత',
    hi: 'यकृत की दुर्बलता',
    definition: 'Reduced hepatic metabolic clearance or cirrhosis.'
  },
  drug_metabolism: {
    en: 'Drug Metabolism',
    te: 'ఔషధ జీవక్రియ',
    hi: 'दवा चयापचय',
    definition: 'Biochemical breakdown of drugs in the liver and organs.'
  },
  enzyme_inhibition: {
    en: 'Enzyme Inhibition',
    te: 'ఎంజైమ్ నిరోధం',
    hi: 'एंजाइम अवरोध',
    definition: 'Blockade of cytochrome P450 catalytic activity.'
  },
  pharmacokinetics: {
    en: 'Pharmacokinetics',
    te: 'ఫార్మకోకైనెటిక్స్ (శరీరంలో ఔషధ ప్రయాణం)',
    hi: 'फार्माकोकाइनेटिक्स (शरीर में दवा का प्रवाह)',
    definition: 'Absorption, distribution, metabolism, and excretion (ADME).'
  },
  pharmacodynamics: {
    en: 'Pharmacodynamics',
    te: 'ఫార్మకోడైనమిక్స్ (శరీరంపై ఔషధ ప్రభావం)',
    hi: 'फार्माकोडायनामिक्स (शरीर पर दवा का असर)',
    definition: 'Biochemical and physiological effects of drugs on receptors.'
  },
  lactic_acidosis: {
    en: 'Lactic Acidosis',
    te: 'లాక్టిక్ యాసిడోసిస్',
    hi: 'लैक्टिक एसिडोसिस',
    definition: 'Severe accumulation of lactic acid and metabolic acidosis.'
  },
  rhabdomyolysis: {
    en: 'Rhabdomyolysis',
    te: 'రాబ్డోమయోలిసిస్ (కండరాల కణాల విచ్ఛిన్నం)',
    hi: 'रबडोमायोलिसिस (मांसपेशियों का टूटना)',
    definition: 'Severe breakdown of skeletal muscle tissue with myoglobinuria.'
  },
  hyperkalemia: {
    en: 'Hyperkalemia',
    te: 'హైపర్‌కలేమియా (రక్తంలో పొటాషియం అధికం)',
    hi: 'हाइपरकेलेमिया (रक्त में पोटेशियम की अधिकता)',
    definition: 'Abnormally high potassium levels in circulating blood.'
  },
  boxed_warning: {
    en: 'FDA Boxed Warning',
    te: 'FDA బాక్స్‌డ్ తీవ్ర హెచ్చరిక',
    hi: 'FDA बॉक्स चेतावनी',
    definition: 'Strictest warning mandated by the FDA for serious safety hazards.'
  },
  clinical_consequences: {
    en: 'Clinical Consequences',
    te: 'వైద్యపరమైన పరిణామాలు',
    hi: 'नैदानिक परिणाम',
    definition: 'Observable medical complications and physiological outcomes.'
  },
  safety_considerations: {
    en: 'Safety Considerations & Monitoring',
    te: 'భద్రతా పరిగణనలు & పర్యవేక్షణ',
    hi: 'सुरक्षा विचार एवं निगरानी',
    definition: 'Required laboratory monitoring and clinical precautions.'
  }
};

// Common clinical phrases translated with scientific accuracy
const TRANSLATION_PATTERNS: Array<{
  pattern: RegExp;
  te: string;
  hi: string;
}> = [
  {
    pattern: /synergistic, severe gastrointestinal and systemic hemorrhage risk/i,
    te: 'తీవ్రమైన జీర్ణకోశ మరియు అంతర్గత రక్తస్రావం ప్రమాదం గణనీయంగా పెరగవచ్చు',
    hi: 'गंभीर गैस्ट्रोइंटेस्टाइनल और प्रणालीगत रक्तस्राव का जोखिम काफी बढ़ सकता है'
  },
  {
    pattern: /potentiates INR elevation and bleeding risk/i,
    te: 'INR స్థాయిలు అకస్మాత్తుగా పెరిగి తీవ్ర రక్తస్రావం ముప్పు కలుగుతుంది',
    hi: 'INR स्तर में तीव्र वृद्धि और रक्तस्राव का गंभीर खतरा उत्पन्न होता है'
  },
  {
    pattern: /compatible multimodal analgesic combination/i,
    te: 'అనుకూలమైన మల్టీమోడల్ నొప్పి నివారణ సమ్మేళనం, సిఫార్సు చేసిన పరిమితులలో సురక్షితం',
    hi: 'अनुकूल मल्टीमॉडल दर्द निवारक संयोजन, अनुशंसित खुराक में सुरक्षित'
  },
  {
    pattern: /potentiation of lactate accumulation and suppression of hepatic gluconeogenesis/i,
    te: 'రక్తంలో లాక్టిక్ యాసిడ్ పేరుకుపోయి ప్రాణాంతక లాక్టిక్ యాసిడోసిస్ (MALA) ప్రమాదం ఏర్పడుతుంది',
    hi: 'रक्त में लैक्टिक एसिड का संचय और घातक लैक्टिक एसिडोसिस (MALA) का उच्च जोखिम'
  },
  {
    pattern: /no clinically significant pharmacokinetic or pharmacodynamic interaction documented/i,
    te: 'నిరూపితమైన తీవ్రమైన పరస్పర చర్య ఏదీ అధికారిక లేబులింగ్‌లో నమోదు కాలేదు',
    hi: 'आधिकारिक लेबलिंग में कोई गंभीर प्रतिकूल परस्पर क्रिया दर्ज नहीं है'
  },
  {
    pattern: /diminished antiplatelet efficacy; increased incidence of Major Adverse Cardiovascular Events/i,
    te: 'రక్తం గడ్డకట్టడాన్ని ఆపే సామర్థ్యం తగ్గి గుండె సంబంధిత తీవ్ర సమస్యలు (MACE) వచ్చే ప్రమాదం ఉంది',
    hi: 'प्लेटलेट अवरोध प्रभावशीलता कम हो जाती है और हृदय संबंधी गंभीर घटनाओं का खतरा बढ़ जाता है'
  },
  {
    pattern: /dual distal nephron aldosterone and ACE suppression.*hyperkalemia/i,
    te: 'మూత్రపిండాలలో పొటాషియం విసర్జన తగ్గి ప్రాణాంతక హైపర్‌కలేమియా (రక్తంలో అధిక పొటాషియం) ప్రమాదం కలుగుతుంది',
    hi: 'गुर्दे से पोटेशियम उत्सर्जन रुक जाता है और घातक हाइपरकेलेमिया का खतरा उत्पन्न होता है'
  },
  {
    pattern: /severe, irreversible CYP3A4 suicide inhibition.*rhabdomyolysis/i,
    te: 'CYP3A4 ఎంజైమ్ నిరోధం వల్ల స్టాటిన్ రక్తం స్థాయిలు పెరిగి తీవ్ర రాబ్డోమయోలిసిస్ (కండరాల నష్టం) మరియు కిడ్నీ వైఫల్యం రావచ్చు',
    hi: 'CYP3A4 अवरोध के कारण स्टेटिन का स्तर अत्यधिक बढ़ जाता है, जिससे रबडोमायोलिसिस और गुर्दे की विफलता हो सकती है'
  }
];

/**
 * High-accuracy medical text translator
 * Preserves drug names, RxCUIs, PMIDs, DOIs, and scientific units without modification.
 */
export function translateMedicalText(text: string, lang: SupportedLanguage): string {
  if (lang === 'en' || !text) return text;

  let translated = text;

  // Check matching clinical patterns
  for (const item of TRANSLATION_PATTERNS) {
    if (item.pattern.test(translated)) {
      translated = translated.replace(item.pattern, lang === 'te' ? item.te : item.hi);
    }
  }

  // Replace standard keywords using the glossary
  for (const entry of Object.values(MEDICAL_GLOSSARY)) {
    const regex = new RegExp(`\\b${entry.en}\\b`, 'gi');
    if (regex.test(translated)) {
      translated = translated.replace(regex, lang === 'te' ? entry.te : entry.hi);
    }
  }

  return translated;
}

/**
 * Phonetic transliteration helper for drug names
 * Example: Warfarin -> వార్ఫరిన్ (Warfarin), Aspirin -> ఆస్పిరిన్ (Aspirin)
 */
export function formatMultilingualDrugName(genericName: string, lang: SupportedLanguage): string {
  if (lang === 'en' || !genericName) return genericName;

  const DRUG_TRANSLITERATIONS: Record<string, { te: string; hi: string }> = {
    warfarin: { te: 'వార్ఫరిన్ (Warfarin)', hi: 'वारफेरिन (Warfarin)' },
    aspirin: { te: 'ఆస్పిరిన్ (Aspirin)', hi: 'एस्पिरिन (Aspirin)' },
    amiodarone: { te: 'అమియోడారోన్ (Amiodarone)', hi: 'एमियोडेरोन (Amiodarone)' },
    ibuprofen: { te: 'ఇబుప్రోఫెన్ (Ibuprofen)', hi: 'इबुप्रोफेन (Ibuprofen)' },
    acetaminophen: { te: 'పారాసిటమాల్ / ఎసిటమినోఫెన్ (Paracetamol)', hi: 'पैरासिटामोल / एसिटामिनोफेन (Paracetamol)' },
    paracetamol: { te: 'పారాసిటమాల్ (Paracetamol)', hi: 'पैरासिटामोल (Paracetamol)' },
    metformin: { te: 'మెట్‌ఫార్మిన్ (Metformin)', hi: 'मेटफॉर्मिन (Metformin)' },
    alcohol: { te: 'ఆల్కహాల్ (Alcohol)', hi: 'अल्कोहल / शराब (Alcohol)' },
    ethanol: { te: 'ఇథనాల్ (Ethanol)', hi: 'इथेनॉल (Ethanol)' },
    amoxicillin: { te: 'అమోక్సిసిలిన్ (Amoxicillin)', hi: 'एमोक्सिसिलिन (Amoxicillin)' },
    clopidogrel: { te: 'క్లోపిడోగ్రెల్ (Clopidogrel)', hi: 'क्लोपिडोग्रेल (Clopidogrel)' },
    omeprazole: { te: 'ఒమెప్రజోల్ (Omeprazole)', hi: 'ओमेप्राजोल (Omeprazole)' },
    paxlovid: { te: 'పాక్స్లోవిడ్ (Paxlovid)', hi: 'पैक्सलोविड (Paxlovid)' },
    nirmatrelvir: { te: 'నిర్మట్రెల్విర్ (Nirmatrelvir)', hi: 'निर्मात्रेल्विर (Nirmatrelvir)' },
    ritonavir: { te: 'రిటోనవిర్ (Ritonavir)', hi: 'रिटोनावीर (Ritonavir)' },
    simvastatin: { te: 'సిమ్వాస్టాటిన్ (Simvastatin)', hi: 'सिमवास्टैटिन (Simvastatin)' },
    atorvastatin: { te: 'అటార్వాస్టాటిన్ (Atorvastatin)', hi: 'एटोरवास्टेटिन (Atorvastatin)' },
    lisinopril: { te: 'లిసినోప్రిల్ (Lisinopril)', hi: 'लिसिनोप्रिल (Lisinopril)' },
    spironolactone: { te: 'స్పిరోనోలాక్టోన్ (Spironolactone)', hi: 'स्पिरोनोलैक्टोन (Spironolactone)' },
    digoxin: { te: 'డిగోక్సిన్ (Digoxin)', hi: 'डिगोक्सिन (Digoxin)' }
  };

  const lower = genericName.toLowerCase();
  const match = DRUG_TRANSLITERATIONS[lower];
  if (match) {
    return lang === 'te' ? match.te : match.hi;
  }

  return genericName;
}
