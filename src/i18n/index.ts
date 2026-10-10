import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'Drug Scope AI',
      subtitle: 'Universal Medicine Input, Multilingual Reports & Voice Engine',
      nav: {
        home: 'Home',
        analyze: 'Analyze Medicines',
        interactions: 'Interaction Analysis',
        molecularLab: '3D Molecular Lab',
        literature: 'Literature Intelligence',
        reports: 'Reports & Dossiers'
      },
      analyzer: {
        title: 'Drug Interaction Analyzer',
        description: 'Enter any single medicine for an individual safety profile, or multiple medicines for comprehensive interaction analysis.',
        singleDrugPrompt: 'Enter medicine name (Brand, Generic, or Substance)...',
        addDrug: '+ Add Medicine',
        removeDrug: 'Remove',
        analyzeBtn: 'Analyze Medicine(s)',
        evaluating: 'Evaluating scientific evidence...',
        testQueries: 'Test Queries:',
        searchAgain: 'Search Again',
        exportPdf: 'Export PDF Dossier',
        listenReport: 'Listen to Report',
        audioPlaying: 'Playing Audio...',
        audioPaused: 'Audio Paused',
        audioSpeed: 'Speed',
        language: 'Language',
        verifiedPill: 'AUTHENTIC SCIENTIFIC EVIDENCE'
      },
      reportA: {
        title: 'REPORT 1 — WHAT HAPPENS?',
        badge: 'CLINICAL FINDINGS',
        identifiedEntities: 'Identified Entities:',
        summary: 'Interaction Summary:',
        sideEffects: 'Potential Side Effects When Used Together:',
        consequences: 'Clinical Consequences:',
        fdaWarning: 'FDA Structured Product Label Warning:',
        citations: 'Supporting Research Citations'
      },
      reportB: {
        title: 'REPORT 2 — DETAILED RISKS & MECHANISMS',
        badge: 'PHARMACOLOGICAL RATIONALE',
        whyItOccurs: 'Why This Interaction Occurs:',
        established: 'Established Effects:',
        theoretical: 'Theoretical / Variable Risks:',
        factors: 'Patient Factors That May Influence Risk:',
        contraindications: 'Contraindications & Warnings:',
        safety: 'Appropriate Safety Considerations:',
        sources: 'Verified Source Links'
      },
      singleReport: {
        title: 'SINGLE-MEDICINE CLINICAL DOSSIER',
        badge: 'EVIDENCE-BASED MONOGRAPH',
        indications: 'Approved Indications & Clinical Use:',
        adverseReactions: 'Documented Adverse Reactions:',
        contraindications: 'Contraindications & Precautions:',
        labelInteractions: 'Reported Label Interactions:',
        pharmacology: 'Clinical Pharmacology & Class:'
      },
      disclaimer: {
        safety: 'Clinical Safety Notice: Drug Scope AI provides research and decision-support intelligence synthesized exclusively from verified biomedical repositories (openFDA, RxNorm, OpenAlex). Do not adjust dosages, discontinue medications, or alter therapy without professional clinical consultation.'
      }
    }
  },
  te: {
    translation: {
      appName: 'డ్రగ్ స్కోప్ AI',
      subtitle: 'సార్వత్రిక ఔషధ శోధన, బహుభాషా నివేదికలు మరియు వాయిస్ ఇంజిన్',
      nav: {
        home: 'హోమ్',
        analyze: 'మందుల విశ్లేషణ',
        interactions: 'పరస్పర చర్యల విశ్లేషణ',
        molecularLab: '3D మాలిక్యులర్ ల్యాబ్',
        literature: 'పరిశోధనా సాహిత్యం',
        reports: 'నివేదికలు'
      },
      analyzer: {
        title: 'ఔషధ పరస్పర చర్యల విశ్లేషకం',
        description: 'ఒకే మందు వివరాల కోసం ఒకటి నమోదు చేయండి, లేదా రెండు మరియు అంతకంటే ఎక్కువ మందుల పరస్పర ప్రభావాలను విశ్లేషించండి.',
        singleDrugPrompt: 'మందు పేరు నమోదు చేయండి (బ్రాండ్ లేదా జెనరిక్ పేరు)...',
        addDrug: '+ మరొక మందు జోడించండి',
        removeDrug: 'తొలగించండి',
        analyzeBtn: 'మందులను విశ్లేషించండి',
        evaluating: 'శాస్త్రీయ ఆధారాలను సేకరిస్తోంది...',
        testQueries: 'నమూనా శోధనలు:',
        searchAgain: 'మళ్లీ శోధించండి',
        exportPdf: 'PDF నివేదిక డౌన్‌లోడ్',
        listenReport: 'నివేదిక వినండి (ఆడియో)',
        audioPlaying: 'ఆడియో ప్లే అవుతోంది...',
        audioPaused: 'ఆడియో నిలిపివేయబడింది',
        audioSpeed: 'వేగం',
        language: 'భాష',
        verifiedPill: 'నిజమైన శాస్త్రీయ ఆధారాలు'
      },
      reportA: {
        title: 'నివేదిక 1 — ఏమి జరుగుతుంది?',
        badge: 'వైద్య పరిశీలనలు',
        identifiedEntities: 'గుర్తించబడిన మందులు:',
        summary: 'పరస్పర చర్య సారాంశం:',
        sideEffects: 'కలిసి వాడినప్పుడు సంభవించే దుష్ప్రభావాలు:',
        consequences: 'వైద్యపరమైన పరిణామాలు:',
        fdaWarning: 'FDA అధికారిక హెచ్చరిక (బాక్స్‌డ్ వార్నింగ్):',
        citations: 'సహాయక పరిశోధనా పత్రాలు'
      },
      reportB: {
        title: 'నివేదిక 2 — వివరణాత్మక నష్టాలు & విధానాలు',
        badge: 'ఫార్మకోలాజికల్ హేతువు',
        whyItOccurs: 'ఈ చర్య ఎందుకు జరుగుతుంది:',
        established: 'నిరూపితమైన ప్రభావాలు:',
        theoretical: 'సిద్ధాంతపరమైన / వేరియబుల్ ప్రమాదాలు:',
        factors: 'ప్రమాదాన్ని ప్రభావితం చేసే రోగి అంశాలు:',
        contraindications: 'నిషేధాలు మరియు హెచ్చరికలు:',
        safety: 'భద్రతా పరిగణనలు మరియు పర్యవేక్షణ:',
        sources: 'ధృవీకరించబడిన మూలాల లింకులు'
      },
      singleReport: {
        title: 'వ్యక్తిగత ఔషధ క్లినికల్ నివేదిక',
        badge: 'ఆధారిత మోనోగ్రాఫ్',
        indications: 'ఆమోదించబడిన ఉపయోగాలు & లక్షణాలు:',
        adverseReactions: 'నమోదిత దుష్ప్రభావాలు:',
        contraindications: 'నిషేధాలు మరియు జాగ్రత్తలు:',
        labelInteractions: 'లేబుల్‌లో పేర్కొన్న పరస్పర చర్యలు:',
        pharmacology: 'క్లినికల్ ఫార్మకాలజీ & తరగతి:'
      },
      disclaimer: {
        safety: 'వైద్య భద్రతా నోటీసు: డ్రగ్ స్కోప్ AI అధికారిక బయోమెడికల్ రిపోజిటరీల (openFDA, RxNorm, OpenAlex) నుండి పరిశోధన సమాచారాన్ని అందిస్తుంది. వైద్య నిపుణుడి సంప్రదింపు లేకుండా మందుల మోతాదులను మార్చవద్దు లేదా మందులను ఆపవద్దు.'
      }
    }
  },
  hi: {
    translation: {
      appName: 'ड्रग स्कोप AI',
      subtitle: 'सार्वभौमिक दवा इनपुट, बहुभाषी रिपोर्ट और वॉयस इंजन',
      nav: {
        home: 'होम',
        analyze: 'दवा विश्लेषण',
        interactions: 'परस्पर क्रिया विश्लेषण',
        molecularLab: '3D आणविक लैब',
        literature: 'शोध साहित्य',
        reports: 'दस्तावेज़'
      },
      analyzer: {
        title: 'दवा परस्पर क्रिया विश्लेषक',
        description: 'एकल दवा सुरक्षा प्रोफ़ाइल के लिए एक दवा दर्ज करें, या व्यापक परस्पर क्रिया विश्लेषण के लिए दो या अधिक दवाएं दर्ज करें।',
        singleDrugPrompt: 'दवा का नाम दर्ज करें (ब्रांड या जेनेरिक नाम)...',
        addDrug: '+ एक और दवा जोड़ें',
        removeDrug: 'हटाएं',
        analyzeBtn: 'दवाओं का विश्लेषण करें',
        evaluating: 'वैज्ञानिक साक्ष्यों का मूल्यांकन हो रहा है...',
        testQueries: 'परीक्षण प्रश्न:',
        searchAgain: 'फिर से खोजें',
        exportPdf: 'PDF रिपोर्ट डाउनलोड करें',
        listenReport: 'रिपोर्ट सुनें (ऑडियो)',
        audioPlaying: 'ऑडियो चल रहा है...',
        audioPaused: 'ऑडियो रुका हुआ है',
        audioSpeed: 'गति',
        language: 'भाषा',
        verifiedPill: 'प्रमाणित वैज्ञानिक साक्ष्य'
      },
      reportA: {
        title: 'रिपोर्ट 1 — क्या होता है?',
        badge: 'नैदानिक निष्कर्ष',
        identifiedEntities: 'पहचानी गई दवाएं:',
        summary: 'परस्पर क्रिया सारांश:',
        sideEffects: 'एक साथ लेने पर संभावित दुष्प्रभाव:',
        consequences: 'नैदानिक परिणाम:',
        fdaWarning: 'FDA आधिकारिक चेतावनी (बॉक्स चेतावनी):',
        citations: 'सहायक अनुसंधान संदर्भ'
      },
      reportB: {
        title: 'रिपोर्ट 2 — विस्तृत जोखिम और तंत्र',
        badge: 'फार्माकोलॉजिकल तर्क',
        whyItOccurs: 'यह परस्पर क्रिया क्यों होती है:',
        established: 'स्थापित प्रभाव:',
        theoretical: 'सैद्धांतिक / परिवर्तनशील जोखिम:',
        factors: 'जोखिम को प्रभावित करने वाले रोगी कारक:',
        contraindications: 'निषेध और चेतावनियां:',
        safety: 'उचित सुरक्षा विचार और निगरानी:',
        sources: 'सत्यापित स्रोत लिंक'
      },
      singleReport: {
        title: 'एकल दवा नैदानिक प्रोफ़ाइल',
        badge: 'साक्ष्य-आधारित मोनोग्राफ',
        indications: 'स्वीकृत संकेत और नैदानिक उपयोग:',
        adverseReactions: 'प्रलेखित प्रतिकूल प्रतिक्रियाएं:',
        contraindications: 'निषेध और सावधानियां:',
        labelInteractions: 'लेबल में प्रलेखित परस्पर क्रियाएं:',
        pharmacology: 'नैदानिक औषध विज्ञान और वर्ग:'
      },
      disclaimer: {
        safety: 'नैदानिक सुरक्षा सूचना: ड्रग स्कोप AI केवल सत्यापित बायोमेडिकल डेटाबेस (openFDA, RxNorm, OpenAlex) से शोध और निर्णय सहायता जानकारी प्रदान करता है। योग्य चिकित्सक के परामर्श के बिना दवाओं की खुराक में परिवर्तन या बंद न करें।'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
