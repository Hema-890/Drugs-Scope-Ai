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

// Comprehensive Controlled Medical Terminology Glossary
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
  },
  hematoma: {
    en: 'Hematoma',
    te: 'రక్తపు గడ్డ (హెమటోమా)',
    hi: 'हेमटोमा (रक्त का थक्का)',
    definition: 'Localized collection of extravasated blood.'
  },
  epistaxis: {
    en: 'Epistaxis',
    te: 'ముక్కు నుండి రక్తస్రావం',
    hi: 'नकसीर / नाक से रक्त बहना',
    definition: 'Bleeding from the nose.'
  },
  skin_necrosis: {
    en: 'Skin Necrosis',
    te: 'చర్మ కణజాలం కుళ్లిపోవడం',
    hi: 'त्वचा का परिगलन (नेक्रोसिस)',
    definition: 'Localized tissue death of cutaneous structures.'
  },
  diarrhea: {
    en: 'Diarrhea',
    te: 'విరేచనాలు',
    hi: 'दस्त / डायरिया',
    definition: 'Frequent loose or watery bowel movements.'
  },
  nausea_vomiting: {
    en: 'Nausea and vomiting',
    te: 'వికారం మరియు వాంతులు',
    hi: 'मतली और उल्टी',
    definition: 'Gastrointestinal upset with emesis.'
  },
  flatulence: {
    en: 'Flatulence',
    te: 'కడుపులో గ్యాస్ / ఉబ్బరం',
    hi: 'गैस / पेट फूलना',
    definition: 'Accumulation of gas in the alimentary canal.'
  },
  abdominal_pain: {
    en: 'Abdominal discomfort',
    te: 'కడుపులో అసౌకర్యం',
    hi: 'पेट में असहजता',
    definition: 'Abdominal pain or cramp.'
  },
  thrombosis: {
    en: 'Stent thrombosis',
    te: 'స్టెంట్ గడ్డకట్టడం (థ్రాంబోసిస్)',
    hi: 'स्टेंट थ्रोम्बोसिस (थक्का जमना)',
    definition: 'Occlusion of intravascular stent by platelet thrombus.'
  },
  platelet_aggregation: {
    en: 'Platelet aggregation',
    te: 'ప్లేట్‌లెట్స్ గడ్డకట్టే ప్రక్రియ',
    hi: 'प्लेटलेट एकत्रीकरण (थक्का बनना)',
    definition: 'Clumping together of platelets in blood clotting.'
  }
};

// Common clinical phrases translated with high scientific precision
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
    te: 'రక్తం గడ్డకట్టడాన్ని ఆపే సామర్థ్యం తగ్గి గుండె సంబంధిత తీవ్ర సమస్యలు (MACE) మరియు స్టెంట్ థ్రాంబోసిస్ వచ్చే ప్రమాదం ఉంది',
    hi: 'प्लेटलेट अवरोध प्रभावशीलता कम हो जाती है और हृदय संबंधी गंभीर घटनाओं (MACE) का खतरा बढ़ जाता है'
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
  },
  // Single-Drug Indications
  {
    pattern: /Temporary relief of mild-to-moderate pain.*reduction of fever/i,
    te: 'స్వల్ప నుండి మధ్యస్థ నొప్పి (తలనెప్పి, పంటినొప్పి, కండరాల నొప్పులు) ఉపశమనం మరియు జ్వరాన్ని తగ్గించడానికి ఉపయోగపడుతుంది',
    hi: 'हल्के से मध्यम दर्द (सिरदर्द, दांत दर्द, मांसपेशियों में दर्द) से राहत और बुखार कम करने के लिए उपयोग किया जाता है'
  },
  {
    pattern: /Adjunct to diet and exercise to improve glycemic control.*type 2 diabetes mellitus/i,
    te: 'టైప్ 2 డయాబెటిస్ మెల్లిటస్ ఉన్న రోగులలో రక్తంలో గ్లూకోజ్ స్థాయిలను నియంత్రించడానికి ఆహారం మరియు వ్యాయామంతో పాటు సహాయపడుతుంది',
    hi: 'टाइप 2 मधुमेह के रोगियों में रक्त शर्करा के स्तर को नियंत्रित करने के लिए आहार और व्यायाम के साथ सहायक दवा'
  },
  {
    pattern: /Prophylaxis and treatment of venous thromboembolism.*atrial fibrillation/i,
    te: 'రక్తనాళాలలో రక్తం గడ్డకట్టడం (DVT), పల్మనరీ ఎంబోలిజం మరియు ఏట్రియల్ ఫిబ్రిలేషన్ సంబంధిత రక్తపు గడ్డలను నివారించడానికి మరియు చికిత్సకు సూచించబడింది',
    hi: 'नसों में रक्त के थक्के (DVT), फुफ्फुसीय अन्त:शल्यता और आलिंद फिब्रिलेशन से संबंधित जटिलताओं की रोकथाम और उपचार के लिए'
  },
  {
    pattern: /Routine laboratory and clinical monitoring recommended during therapy/i,
    te: 'చికిత్స సమయంలో క్రమం తప్పకుండా ప్రయోగశాల పరీక్షలు మరియు వైద్య పర్యవేక్షణ అవసరం',
    hi: 'उपचार के दौरान नियमित प्रयोगशाला परीक्षण और नैदानिक निगरानी की सिफारिश की जाती है'
  },
  {
    pattern: /Indicated according to FDA approved therapeutic labeling/i,
    te: 'FDA ఆమోదించిన అధికారిక థెరప్యూటిక్ లేబులింగ్ ప్రకారం సూచించబడింది',
    hi: 'FDA द्वारा अनुमोदित आधिकारिक चिकित्सीय लेबलिंग के अनुसार संकेतित'
  },
  {
    pattern: /Consult full prescribing information for CYP450 and pharmacokinetic interactions/i,
    te: 'CYP450 ఎంజైమ్ మరియు ఫార్మకోకైనెటిక్ పరస్పర చర్యల కోసం పూర్తి సూచనల పత్రాన్ని సంప్రదించండి',
    hi: 'CYP450 एंजाइम और फार्माकोकाइनेटिक परस्पर क्रियाओं के लिए पूर्ण दवा विवरण देखें'
  },
  // Multi-Drug Evaluation Intro
  {
    pattern: /Evaluation across (\d+) concurrent medicines discovered a (MAJOR|CONTRAINDICATED|MODERATE|MINOR) severity interaction:\s*(.*)/i,
    te: '$1 ఏకకాల ఔషధాల పరిశీలనలో $2 తీవ్రతతో కూడిన పరస్పర చర్య గుర్తించబడింది: $3',
    hi: '$1 समवर्ती दवाओं के विश्लेषण में $2 गंभीरता की परस्पर क्रिया पाई गई: $3'
  },
  {
    pattern: /Evaluation across (\d+) concurrent medicines revealed no established severe or contraindicated interactions/i,
    te: '$1 ఏకకాల ఔషధాల పరిశీలనలో ప్రస్తుత FDA లేబులింగ్‌లో తీవ్రమైన లేదా విరుద్ధమైన పరస్పర చర్యలేవీ నమోదు కాలేదు',
    hi: '$1 समवर्ती दवाओं के विश्लेषण में वर्तमान FDA लेबलिंग में कोई गंभीर या निषिद्ध परस्पर क्रिया दर्ज नहीं है'
  },
  // Common Adverse Effects
  {
    pattern: /Major or fatal hemorrhage/i,
    te: 'తీవ్రమైన లేదా ప్రాణాంతక రక్తస్రావం',
    hi: 'गंभीर या घातक रक्तस्राव'
  },
  {
    pattern: /Bruising \/ Hematoma/i,
    te: 'చర్మంపై కమిలిన గాయాలు / రక్తపు గడ్డలు',
    hi: 'नील पड़ना / रक्त का थक्का जमना'
  },
  {
    pattern: /Skin necrosis/i,
    te: 'చర్మ కణజాలం నెక్రోసిస్ (చనిపోవడం)',
    hi: 'त्वचा का परिगलन (नेक्रोसिस)'
  },
  {
    pattern: /Hepatotoxicity \(at excessive cumulative doses > 4,000 mg\/day\)/i,
    te: 'కాలేయానికి విషపూరితం (రోజుకు 4,000 మి.గ్రా మించిన అధిక మోతాదులో)',
    hi: 'यकृत विषाक्तता (प्रतिदिन 4,000 मिलीग्राम से अधिक अत्यधिक खुराक पर)'
  },
  {
    pattern: /Rare hypersensitivity reactions/i,
    te: 'అరుదైన అలర్జీ మరియు తీవ్ర ప్రతిస్పందనలు',
    hi: 'दुर्लभ अतिसंवेदनशीलता प्रतिक्रियाएं'
  },
  {
    pattern: /Skin rash/i,
    te: 'చర్మంపై దద్దుర్లు',
    hi: 'त्वचा पर चकत्ते / रैश'
  },
  {
    pattern: /Lactic acidosis \(rare but severe\)/i,
    te: 'లాక్టిక్ యాసిడోసిస్ (అరుదైనప్పటికీ అత్యంత తీవ్రమైనది)',
    hi: 'लैक्टिक एसिडोसिस (दुर्लभ लेकिन अत्यंत गंभीर)'
  },
  {
    pattern: /Vitamin B12 deficiency/i,
    te: 'విటమిన్ B12 లోపం',
    hi: 'विटामिन बी12 की कमी'
  }
];

/**
 * High-accuracy medical text translator
 * Preserves drug names, RxCUIs, PMIDs, DOIs, numbers, and scientific units without modification.
 */
export function translateMedicalText(text: string, lang: SupportedLanguage): string {
  if (lang === 'en' || !text) return text;

  let translated = text;

  // 1. Check matching clinical sentence patterns
  for (const item of TRANSLATION_PATTERNS) {
    if (item.pattern.test(translated)) {
      translated = translated.replace(item.pattern, lang === 'te' ? item.te : item.hi);
    }
  }

  // 2. Replace standard medical glossary keywords
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

  const DRUG_TRANSLITERATIONS: Record<string, { te: string; hi: string; phoneticTe: string; phoneticHi: string }> = {
    warfarin: {
      te: 'వార్ఫరిన్ (Warfarin)',
      hi: 'वारफेरिन (Warfarin)',
      phoneticTe: 'వార్ఫరిన్',
      phoneticHi: 'वारफेरिन'
    },
    aspirin: {
      te: 'ఆస్పిరిన్ (Aspirin)',
      hi: 'एस्पिरिन (Aspirin)',
      phoneticTe: 'ఆస్పిరిన్',
      phoneticHi: 'एस्पिरिन'
    },
    amiodarone: {
      te: 'అమియోడారోన్ (Amiodarone)',
      hi: 'एमियोडेरोन (Amiodarone)',
      phoneticTe: 'అమియోడారోన్',
      phoneticHi: 'एमियोडेरोन'
    },
    ibuprofen: {
      te: 'ఇబుప్రోఫెన్ (Ibuprofen)',
      hi: 'इबुप्रोफेन (Ibuprofen)',
      phoneticTe: 'ఇబుప్రోఫెన్',
      phoneticHi: 'इबुप्रोफेन'
    },
    acetaminophen: {
      te: 'పారాసిటమాల్ / ఎసిటమినోఫెన్ (Paracetamol)',
      hi: 'पैरासिटामोल / एसिटामिनोफेन (Paracetamol)',
      phoneticTe: 'పారాసిటమాల్',
      phoneticHi: 'पैरासिटामोल'
    },
    paracetamol: {
      te: 'పారాసిటమాల్ (Paracetamol)',
      hi: 'पैरासिटामोल (Paracetamol)',
      phoneticTe: 'పారాసిటమాల్',
      phoneticHi: 'पैरासिटामोल'
    },
    metformin: {
      te: 'మెట్‌ఫార్మిన్ (Metformin)',
      hi: 'मेटफॉर्मिन (Metformin)',
      phoneticTe: 'మెట్‌ఫార్మిన్',
      phoneticHi: 'मेटफॉर्मिन'
    },
    alcohol: {
      te: 'ఆల్కహాల్ (Alcohol)',
      hi: 'अल्कोहल / शराब (Alcohol)',
      phoneticTe: 'ఆల్కహాల్',
      phoneticHi: 'अल्कोहल'
    },
    ethanol: {
      te: 'ఇథనాల్ (Ethanol)',
      hi: 'इथेनॉल (Ethanol)',
      phoneticTe: 'ఇథనాల్',
      phoneticHi: 'इथेनॉल'
    },
    amoxicillin: {
      te: 'అమోక్సిసిలిన్ (Amoxicillin)',
      hi: 'एमोक्सिसिलिन (Amoxicillin)',
      phoneticTe: 'అమోక్సిసిలిన్',
      phoneticHi: 'एमोक्सिसिलिन'
    },
    clopidogrel: {
      te: 'క్లోపిడోగ్రెల్ (Clopidogrel)',
      hi: 'क्लोपिडोग्रेल (Clopidogrel)',
      phoneticTe: 'క్లోపిడోగ్రెల్',
      phoneticHi: 'क्लोपिडोग्रेल'
    },
    omeprazole: {
      te: 'ఒమెప్రజోల్ (Omeprazole)',
      hi: 'ओमेप्राजोल (Omeprazole)',
      phoneticTe: 'ఒమెప్రజోల్',
      phoneticHi: 'ओमेप्राजोल'
    },
    paxlovid: {
      te: 'పాక్స్లోవిడ్ (Paxlovid)',
      hi: 'पैक्सलोविड (Paxlovid)',
      phoneticTe: 'పాక్స్లోవిడ్',
      phoneticHi: 'पैक्सलोविड'
    },
    nirmatrelvir: {
      te: 'నిర్మట్రెల్విర్ (Nirmatrelvir)',
      hi: 'निर्मात्रेल्विर (Nirmatrelvir)',
      phoneticTe: 'నిర్మట్రెల్విర్',
      phoneticHi: 'निर्मात्रेल्विर'
    },
    ritonavir: {
      te: 'రిటోనవిర్ (Ritonavir)',
      hi: 'रिटोनावीर (Ritonavir)',
      phoneticTe: 'రిటోనవిర్',
      phoneticHi: 'रिटोनावीर'
    },
    simvastatin: {
      te: 'సిమ్వాస్టాటిన్ (Simvastatin)',
      hi: 'सिमवास्टैटिन (Simvastatin)',
      phoneticTe: 'సిమ్వాస్టాటిన్',
      phoneticHi: 'सिमवास्टैटिन'
    },
    atorvastatin: {
      te: 'అటార్వాస్టాటిన్ (Atorvastatin)',
      hi: 'एटोरवास्टेटिन (Atorvastatin)',
      phoneticTe: 'అటార్వాస్టాటిన్',
      phoneticHi: 'एटोरवास्टेटिन'
    },
    lisinopril: {
      te: 'లిసినోప్రిల్ (Lisinopril)',
      hi: 'लिसिनोप्रिल (Lisinopril)',
      phoneticTe: 'లిసినోప్రిల్',
      phoneticHi: 'लिसिनोप्रिल'
    },
    spironolactone: {
      te: 'స్పిరోనోలాక్టోన్ (Spironolactone)',
      hi: 'स्पिरोनोलैक्टोन (Spironolactone)',
      phoneticTe: 'స్పిరోనోలాక్టోన్',
      phoneticHi: 'स्पिरोनोलैक्टोन'
    },
    digoxin: {
      te: 'డిగోక్సిన్ (Digoxin)',
      hi: 'डिगोक्सिन (Digoxin)',
      phoneticTe: 'డిగోక్సిన్',
      phoneticHi: 'डिगोक्सिन'
    }
  };

  const lower = genericName.toLowerCase();
  const match = DRUG_TRANSLITERATIONS[lower];
  if (match) {
    return lang === 'te' ? match.te : match.hi;
  }

  return genericName;
}

/**
 * Phonetic speech optimizer:
 * When sending spoken text to Regional Speech Synthesis (Telugu or Hindi),
 * replaces Latin drug names with pure native phonetic characters so that
 * regional TTS engines pronounce the medicine names naturally without garbling.
 */
export function optimizeTextForSpeechNarration(text: string, lang: SupportedLanguage): string {
  if (lang === 'en' || !text) return text;

  let spoken = text;

  const PHONETIC_MAP: Record<string, { te: string; hi: string }> = {
    warfarin: { te: 'వార్ఫరిన్', hi: 'वारफेरिन' },
    aspirin: { te: 'ఆస్పిరిన్', hi: 'एस्पिरिन' },
    paracetamol: { te: 'పారాసిటమాల్', hi: 'पैरासिटामोल' },
    acetaminophen: { te: 'పారాసిటమాల్', hi: 'पैरासिटामोल' },
    metformin: { te: 'మెట్‌ఫార్మిన్', hi: 'मेटफॉर्मिन' },
    amiodarone: { te: 'అమియోడారోన్', hi: 'एमियोडेरोन' },
    clopidogrel: { te: 'క్లోపిడోగ్రెల్', hi: 'क्लोपिडोग्रेल' },
    omeprazole: { te: 'ఒమెప్రజోల్', hi: 'ओमेप्राजोल' },
    paxlovid: { te: 'పాక్స్లోవిడ్', hi: 'पैक्सलोविड' },
    simvastatin: { te: 'సిమ్వాస్టాటిన్', hi: 'सिमवास्टैटिन' },
    ibuprofen: { te: 'ఇబుప్రోఫెన్', hi: 'इबुप्रोफेन' }
  };

  // Strip parenthetical English roots if already present e.g. "వార్ఫరిన్ (Warfarin)" -> "వార్ఫరిన్" for speech audio
  spoken = spoken.replace(/([^\s]+)\s*\([A-Za-z0-9\s-]+\)/g, '$1');

  // Replace any standalone Latin drug words with phonetic equivalents
  for (const [drug, phonetics] of Object.entries(PHONETIC_MAP)) {
    const regex = new RegExp(`\\b${drug}\\b`, 'gi');
    spoken = spoken.replace(regex, lang === 'te' ? phonetics.te : phonetics.hi);
  }

  return spoken;
}
