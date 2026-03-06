import { useState, useEffect, useRef, useCallback } from 'react'
import { PBox, PBtn, StatCard }  from '../components/Primitives'
import { WaveformVisualizer }    from '../components/WaveformVisualizer'
import { ThreatMeter }           from '../components/ThreatMeter'
import { AlertCard }             from '../components/AlertCard'
import { PF, MF }                from '../utils/constants'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VOICE CONFIG — natural voice selection per language
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const VOICE_PREFS = {
  en: { langPrefix: ['en-US','en-GB','en'], rate: 0.95, pitch: 0.92 },
  id: { langPrefix: ['id-ID','id'], rate: 0.93, pitch: 0.95 },
  zh: { langPrefix: ['zh-CN','zh-TW','zh'], rate: 0.88, pitch: 0.94 },
  ja: { langPrefix: ['ja-JP','ja'], rate: 0.90, pitch: 0.96 },
  ko: { langPrefix: ['ko-KR','ko'], rate: 0.90, pitch: 0.94 },
  es: { langPrefix: ['es-ES','es-MX','es'], rate: 0.93, pitch: 0.94 },
  fr: { langPrefix: ['fr-FR','fr'], rate: 0.92, pitch: 0.95 },
  de: { langPrefix: ['de-DE','de'], rate: 0.90, pitch: 0.90 },
  hi: { langPrefix: ['hi-IN','hi'], rate: 0.92, pitch: 0.94 },
  ar: { langPrefix: ['ar-SA','ar'], rate: 0.90, pitch: 0.92 },
  pt: { langPrefix: ['pt-BR','pt-PT','pt'], rate: 0.93, pitch: 0.94 },
  ru: { langPrefix: ['ru-RU','ru'], rate: 0.90, pitch: 0.88 },
  th: { langPrefix: ['th-TH','th'], rate: 0.90, pitch: 0.95 },
  vi: { langPrefix: ['vi-VN','vi'], rate: 0.92, pitch: 0.94 },
  ms: { langPrefix: ['ms-MY','ms'], rate: 0.93, pitch: 0.95 },
  tr: { langPrefix: ['tr-TR','tr'], rate: 0.92, pitch: 0.94 },
  it: { langPrefix: ['it-IT','it'], rate: 0.93, pitch: 0.95 },
  nl: { langPrefix: ['nl-NL','nl'], rate: 0.92, pitch: 0.92 },
  pl: { langPrefix: ['pl-PL','pl'], rate: 0.90, pitch: 0.92 },
  sv: { langPrefix: ['sv-SE','sv'], rate: 0.92, pitch: 0.93 },
}

function getVoiceForLang(lang) {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const prefs = VOICE_PREFS[lang] || VOICE_PREFS['en']
  for (const prefix of prefs.langPrefix) {
    const match = voices.find(v => v.lang.startsWith(prefix))
    if (match) return match
  }
  return voices.find(v => v.lang.startsWith('en')) || voices[0]
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ENGLISH DEMO SCRIPTS — 8 scam scenarios
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SCRIPTS_EN = [
  {
    id: 'bank', label: '🏦 Bank Impersonation', category: 'critical',
    sentences: [
      { text: "Hello, this is the fraud prevention department from Chase Bank.", delay: 0 },
      { text: "We have detected suspicious activity on your checking account ending in four seven eight two.", delay: 4200 },
      { text: "Someone attempted to transfer three thousand two hundred dollars to an overseas account just minutes ago.", delay: 9200 },
      { text: "Your account will be permanently frozen within the next ten minutes unless you verify your identity immediately.", delay: 15000,
        alert: { id:'b1', severity:'critical', pattern:'Bank Impersonation', quote:'"Your account will be permanently frozen in 10 minutes unless you verify your identity."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'FTC Sentinel' }},
      { text: "I need you to confirm your full account number and the one time passcode we just sent to your phone.", delay: 23000,
        alert: { id:'b2', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"Confirm your full account number and the one-time passcode."', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'FBI IC3 2024' }},
      { text: "Please do not contact your branch directly. This is a confidential internal investigation.", delay: 30000,
        alert: { id:'b3', severity:'high', pattern:'Isolation Tactic', quote:'"Do not contact your branch. This is a confidential investigation."', confidence:91, tactics:['ISOLATION','AUTHORITY'], source:'GASA 2024' }},
      { text: "Time is running out. If you don't act now, we cannot protect your funds and your savings will be at risk.", delay: 37000,
        alert: { id:'b4', severity:'critical', pattern:'Artificial Urgency', quote:'"Time is running out. If you don\'t act now, we cannot protect your funds."', confidence:95, tactics:['SCARCITY','FEAR'], source:'FTC Sentinel' }},
    ]
  },
  {
    id: 'investment', label: '📈 Investment Scam', category: 'critical',
    sentences: [
      { text: "Good afternoon. I'm calling from Global Wealth Partners, an elite investment advisory firm.", delay: 0 },
      { text: "Congratulations. You've been pre-selected for an exclusive blockchain investment opportunity.", delay: 5000 },
      { text: "Our clients have seen guaranteed returns of three hundred percent in just thirty days, with absolutely zero risk.", delay: 10500,
        alert: { id:'i1', severity:'high', pattern:'Investment Fraud', quote:'"Guaranteed returns of 300% in 30 days, zero risk."', confidence:96, tactics:['SCARCITY','COMMITMENT'], source:'FBI IC3 2024' }},
      { text: "There are only five positions remaining and this window closes in exactly ten minutes.", delay: 17500,
        alert: { id:'i2', severity:'critical', pattern:'Artificial Urgency', quote:'"Only 5 positions remaining, window closes in 10 minutes."', confidence:94, tactics:['SCARCITY','FEAR'], source:'GASA 2024' }},
      { text: "To secure your position, I need you to transfer five hundred dollars in cryptocurrency to our escrow wallet right now.", delay: 23500,
        alert: { id:'i3', severity:'critical', pattern:'Crypto Transfer Scam', quote:'"Transfer $500 in cryptocurrency to our escrow wallet."', confidence:98, tactics:['AUTHORITY','COMMITMENT'], source:'FTC Sentinel' }},
      { text: "This is strictly confidential. Do not discuss this with your family or financial advisor. It could void your eligibility.", delay: 31000,
        alert: { id:'i4', severity:'high', pattern:'Isolation Tactic', quote:'"Do not discuss with your family — it could void your eligibility."', confidence:92, tactics:['ISOLATION','RECIPROCITY'], source:'GASA 2024' }},
    ]
  },
  {
    id: 'tech', label: '💻 Tech Support', category: 'high',
    sentences: [
      { text: "Hello, this is the Microsoft Windows Security Center calling about your computer.", delay: 0 },
      { text: "Our monitoring systems have detected that your device has been infected with a critical Trojan virus.", delay: 4800,
        alert: { id:'t1', severity:'high', pattern:'Tech Support Impersonation', quote:'"Microsoft Security Center — your device is infected with a Trojan."', confidence:93, tactics:['AUTHORITY','FEAR'], source:'FBI IC3 2024' }},
      { text: "Hackers currently have active access to your banking passwords and personal files as we speak.", delay: 11000 },
      { text: "You must install our certified remote access tool immediately so our engineers can remove the threat from your system.", delay: 16500,
        alert: { id:'t2', severity:'critical', pattern:'Tech Support Impersonation', quote:'"Install remote access tool immediately so we can remove the threat."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'FTC Sentinel' }},
      { text: "If you do not act within the next thirty minutes, your credit card information will be compromised permanently.", delay: 24000,
        alert: { id:'t3', severity:'critical', pattern:'Artificial Urgency', quote:'"Within 30 minutes your credit card information will be compromised."', confidence:95, tactics:['SCARCITY','FEAR'], source:'FBI IC3 2024' }},
      { text: "Our premium protection service costs two hundred and ninety nine dollars, payable by Google Play gift cards for secure processing.", delay: 31500,
        alert: { id:'t4', severity:'high', pattern:'Gift Card Demand', quote:'"$299 payable by Google Play gift cards."', confidence:98, tactics:['AUTHORITY','COMMITMENT'], source:'FTC Sentinel' }},
    ]
  },
  {
    id: 'gov', label: '🏛 Government / IRS', category: 'critical',
    sentences: [
      { text: "This is Officer Johnson, badge number eight four seven three, calling from the Internal Revenue Service enforcement division.", delay: 0,
        alert: { id:'g1', severity:'critical', pattern:'Government Impersonation', quote:'"Officer Johnson, badge 8473, IRS enforcement division."', confidence:96, tactics:['AUTHORITY'], source:'FBI IC3 2024' }},
      { text: "We have identified unpaid federal taxes under your Social Security number totaling twelve thousand four hundred dollars.", delay: 7000 },
      { text: "A warrant has already been issued for your arrest, and local law enforcement has been notified.", delay: 13000,
        alert: { id:'g2', severity:'critical', pattern:'Government Impersonation', quote:'"A warrant has been issued for your arrest."', confidence:98, tactics:['AUTHORITY','FEAR'], source:'FTC Sentinel' }},
      { text: "However, if you settle this outstanding balance right now over the phone, we can cancel the warrant.", delay: 20000,
        alert: { id:'g3', severity:'critical', pattern:'Artificial Urgency', quote:'"Settle this balance right now or face arrest."', confidence:95, tactics:['SCARCITY','FEAR'], source:'FBI IC3 2024' }},
      { text: "You will need to purchase prepaid debit cards and read me the card numbers.", delay: 28000,
        alert: { id:'g4', severity:'high', pattern:'Gift Card Demand', quote:'"Purchase prepaid debit cards and read me the numbers."', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'FTC Sentinel' }},
      { text: "Do not speak to anyone about this matter. Discussing an active federal investigation is a criminal offense.", delay: 35500,
        alert: { id:'g5', severity:'high', pattern:'Isolation Tactic', quote:'"Discussing a federal investigation is criminal."', confidence:93, tactics:['ISOLATION','FEAR'], source:'GASA 2024' }},
    ]
  },
  {
    id: 'romance', label: '💔 Romance Scam', category: 'high',
    sentences: [
      { text: "Hey baby, it's me. I've been thinking about you all day. You're the only person I can trust.", delay: 0 },
      { text: "Something terrible happened. I was in an accident overseas and the hospital won't release me until I pay.", delay: 6000 },
      { text: "My wallet and passport were stolen. I need two thousand dollars for the medical bill.", delay: 13000,
        alert: { id:'r1', severity:'high', pattern:'Romance Manipulation', quote:'"Hospital won\'t release me. I need $2,000."', confidence:88, tactics:['RECIPROCITY','FEAR'], source:'FTC Sentinel' }},
      { text: "If you really love me, you would help me. Just this once, I promise I'll pay you back.", delay: 20000,
        alert: { id:'r2', severity:'high', pattern:'Romance Manipulation', quote:'"If you really love me you would help me."', confidence:92, tactics:['RECIPROCITY','COMMITMENT'], source:'FBI IC3 2024' }},
      { text: "Don't tell your family about this. They wouldn't understand our relationship.", delay: 27500,
        alert: { id:'r3', severity:'high', pattern:'Isolation Tactic', quote:'"Don\'t tell your family."', confidence:91, tactics:['ISOLATION','RECIPROCITY'], source:'GASA 2024' }},
      { text: "Send the money through Western Union or Bitcoin. It's the fastest way to reach me here.", delay: 34000,
        alert: { id:'r4', severity:'critical', pattern:'Crypto Transfer Scam', quote:'"Send money through Western Union or Bitcoin."', confidence:95, tactics:['COMMITMENT','AUTHORITY'], source:'FTC Sentinel' }},
    ]
  },
  {
    id: 'lottery', label: '🎰 Prize / Lottery', category: 'medium',
    sentences: [
      { text: "Congratulations! Your phone number has been randomly selected as the grand prize winner of our international lottery.", delay: 0 },
      { text: "You have won five hundred thousand dollars in our annual promotional sweepstakes.", delay: 7500,
        alert: { id:'l1', severity:'medium', pattern:'Fake Prize / Lottery', quote:'"You won $500,000 in our international lottery."', confidence:94, tactics:['RECIPROCITY'], source:'FTC Sentinel' }},
      { text: "To release your winnings, there is a small processing fee of just nine hundred and ninety nine dollars.", delay: 14000,
        alert: { id:'l2', severity:'high', pattern:'Fake Prize / Lottery', quote:'"Processing fee of $999 to release winnings."', confidence:97, tactics:['RECIPROCITY','COMMITMENT'], source:'FBI IC3 2024' }},
      { text: "Claim within twenty four hours or it will be forfeited to someone else.", delay: 22000,
        alert: { id:'l3', severity:'high', pattern:'Artificial Urgency', quote:'"24 hours or prize forfeited."', confidence:93, tactics:['SCARCITY','FEAR'], source:'GASA 2024' }},
      { text: "Please provide your full name, date of birth, and bank account details for the deposit.", delay: 30000,
        alert: { id:'l4', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"Provide bank account details for deposit."', confidence:98, tactics:['AUTHORITY','COMMITMENT'], source:'FTC Sentinel' }},
    ]
  },
  {
    id: 'delivery', label: '📦 Package / Customs', category: 'high',
    sentences: [
      { text: "This is the customs and border protection agency regarding a package intercepted at the port addressed to your name.", delay: 0,
        alert: { id:'d1', severity:'high', pattern:'Government Impersonation', quote:'"Customs — package intercepted at the port."', confidence:90, tactics:['AUTHORITY'], source:'GASA 2024' }},
      { text: "The package contained illegal substances. A criminal case has been opened under your name.", delay: 7500 },
      { text: "If you do not cooperate immediately, officers will be dispatched to your residence.", delay: 14500,
        alert: { id:'d2', severity:'critical', pattern:'Government Impersonation', quote:'"Officers dispatched to your residence."', confidence:95, tactics:['AUTHORITY','FEAR'], source:'FBI IC3 2024' }},
      { text: "Pay a security clearance bond of three thousand dollars via wire transfer to resolve this.", delay: 22000,
        alert: { id:'d3', severity:'critical', pattern:'Safe Account Transfer', quote:'"Security bond of $3,000 via wire transfer."', confidence:96, tactics:['FEAR','COMMITMENT'], source:'FTC Sentinel' }},
      { text: "This is classified. Do not discuss it with anyone or you risk obstruction charges.", delay: 30000,
        alert: { id:'d4', severity:'high', pattern:'Isolation Tactic', quote:'"Classified — discussing risks obstruction charges."', confidence:92, tactics:['ISOLATION','FEAR'], source:'GASA 2024' }},
    ]
  },
  {
    id: 'crypto', label: '🪙 Crypto Pig Butchering', category: 'critical',
    sentences: [
      { text: "Hey! Remember me from the networking event? I've been meaning to reach out.", delay: 0 },
      { text: "I've been doing really well with this crypto trading platform. Made over fifty thousand in two weeks.", delay: 6500 },
      { text: "My mentor has insider trading signals with a perfect track record and zero losses.", delay: 13000,
        alert: { id:'c1', severity:'high', pattern:'Investment Fraud', quote:'"Insider signals, perfect track record, zero losses."', confidence:94, tactics:['AUTHORITY','RECIPROCITY'], source:'FBI IC3 2024' }},
      { text: "Only three spots left. Minimum investment is just one thousand dollars to start.", delay: 20000,
        alert: { id:'c2', severity:'critical', pattern:'Artificial Urgency', quote:'"Only 3 spots left, $1,000 minimum."', confidence:93, tactics:['SCARCITY','COMMITMENT'], source:'GASA 2024' }},
      { text: "Download this trading app and connect your wallet. I'll walk you through the deposit.", delay: 27500,
        alert: { id:'c3', severity:'critical', pattern:'Crypto Transfer Scam', quote:'"Download app and connect your wallet."', confidence:97, tactics:['AUTHORITY','COMMITMENT'], source:'FTC Sentinel' }},
      { text: "Don't mention this to friends. Too many people would reduce our profit margins.", delay: 34500,
        alert: { id:'c4', severity:'high', pattern:'Isolation Tactic', quote:'"Don\'t mention to friends — reduces profits."', confidence:90, tactics:['ISOLATION','SCARCITY'], source:'GASA 2024' }},
    ]
  },
]

/* ━━━ INDONESIAN ━━━ */
const SCRIPTS_ID = [
  {
    id: 'bri', label: '🏦 Penipuan Bank BRI', category: 'critical',
    sentences: [
      { text: "Halo selamat siang. Saya dari pusat keamanan Bank BRI. Kami mendeteksi aktivitas mencurigakan di rekening Anda.", delay: 0 },
      { text: "Ada transaksi sebesar lima belas juta rupiah yang tidak dikenal dari rekening Anda ke luar negeri.", delay: 6000 },
      { text: "Rekening Anda akan kami blokir permanen dalam sepuluh menit jika Anda tidak segera melakukan verifikasi identitas.", delay: 12500,
        alert: { id:'id1', severity:'critical', pattern:'Bank Impersonation', quote:'"Rekening akan diblokir permanen dalam 10 menit."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'GASA 2024' }},
      { text: "Tolong sebutkan nomor rekening lengkap dan kode OTP yang baru saja kami kirim ke nomor handphone Anda.", delay: 20000,
        alert: { id:'id2', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"Sebutkan nomor rekening dan kode OTP."', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'MAS ScamShield' }},
      { text: "Jangan menghubungi cabang bank. Ini investigasi internal yang bersifat rahasia.", delay: 27500,
        alert: { id:'id3', severity:'high', pattern:'Isolation Tactic', quote:'"Jangan hubungi cabang. Investigasi rahasia."', confidence:91, tactics:['ISOLATION','AUTHORITY'], source:'GASA 2024' }},
    ]
  },
  {
    id: 'pinjol', label: '💰 Pinjol Ilegal', category: 'high',
    sentences: [
      { text: "Selamat pagi. Bagian penagihan pinjaman. Anda punya tunggakan tiga juta rupiah yang harus dilunasi hari ini.", delay: 0,
        alert: { id:'id4', severity:'high', pattern:'Government Impersonation', quote:'"Tunggakan 3 juta harus dilunasi hari ini."', confidence:88, tactics:['AUTHORITY','FEAR'], source:'GASA 2024' }},
      { text: "Kalau tidak dibayar dalam satu jam, kami akan hubungi seluruh kontak di handphone Anda tentang hutang Anda.", delay: 7500,
        alert: { id:'id5', severity:'critical', pattern:'Artificial Urgency', quote:'"Hubungi seluruh kontak HP tentang hutang."', confidence:95, tactics:['FEAR','SCARCITY'], source:'MAS ScamShield' }},
      { text: "Foto KTP dan data pribadi Anda akan kami sebarkan ke media sosial jika pembayaran tidak diterima.", delay: 15000,
        alert: { id:'id6', severity:'critical', pattern:'Isolation Tactic', quote:'"KTP disebarkan ke media sosial."', confidence:96, tactics:['FEAR','ISOLATION'], source:'GASA 2024' }},
      { text: "Transfer sekarang ke rekening yang saya sebutkan. Ini satu-satunya cara menghentikan penagihan.", delay: 22500,
        alert: { id:'id7', severity:'high', pattern:'Safe Account Transfer', quote:'"Transfer sekarang ke rekening ini."', confidence:93, tactics:['COMMITMENT','SCARCITY'], source:'MAS ScamShield' }},
    ]
  },
  {
    id: 'mama', label: '📱 Mama Minta Pulsa', category: 'medium',
    sentences: [
      { text: "Halo nak, ini mama. Mama lagi di rumah sakit sekarang, butuh bantuan kamu.", delay: 0 },
      { text: "Handphone mama kehabisan pulsa. Tolong kirimkan pulsa seratus ribu ke nomor ini.", delay: 6500,
        alert: { id:'id8', severity:'medium', pattern:'Romance Manipulation', quote:'"Mama di rumah sakit, kirimkan pulsa 100 ribu."', confidence:85, tactics:['RECIPROCITY','FEAR'], source:'GASA 2024' }},
      { text: "Cepat ya nak, ini darurat. Jangan bilang papa dulu.", delay: 14000,
        alert: { id:'id9', severity:'high', pattern:'Isolation Tactic', quote:'"Jangan bilang papa dulu."', confidence:90, tactics:['ISOLATION','SCARCITY'], source:'MAS ScamShield' }},
    ]
  },
]

/* ━━━ CHINESE ━━━ */
const SCRIPTS_ZH = [
  {
    id: 'police_zh', label: '🚔 公安局诈骗', category: 'critical',
    sentences: [
      { text: "你好，这里是公安局刑侦大队。我们发现你的身份证涉及一起重大洗钱案件。", delay: 0,
        alert: { id:'zh1', severity:'critical', pattern:'Government Impersonation', quote:'"公安局 — 身份证涉及洗钱案。"', confidence:97, tactics:['AUTHORITY','FEAR'], source:'GASA 2024' }},
      { text: "你的银行账户已被列为嫌疑账户，不配合调查将立即冻结所有资产。", delay: 7500,
        alert: { id:'zh2', severity:'critical', pattern:'Artificial Urgency', quote:'"不配合将冻结所有资产。"', confidence:96, tactics:['FEAR','SCARCITY'], source:'GASA 2024' }},
      { text: "为证明清白，你需要将全部存款转入安全监管账户。", delay: 15000,
        alert: { id:'zh3', severity:'critical', pattern:'Safe Account Transfer', quote:'"存款转入安全监管账户。"', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'GASA 2024' }},
      { text: "这是国家机密案件，严禁向任何人透露。", delay: 22500,
        alert: { id:'zh4', severity:'high', pattern:'Isolation Tactic', quote:'"国家机密，严禁透露。"', confidence:94, tactics:['ISOLATION','FEAR'], source:'GASA 2024' }},
    ]
  },
]

/* ━━━ JAPANESE ━━━ */
const SCRIPTS_JA = [
  {
    id: 'oreore', label: '📞 オレオレ詐欺', category: 'critical',
    sentences: [
      { text: "もしもし、お母さん？俺だよ。大変なことになっちゃって。", delay: 0 },
      { text: "会社のお金を間違えて使っちゃって、今日中に三百万円返さないとクビになる。", delay: 6000,
        alert: { id:'ja1', severity:'high', pattern:'Romance Manipulation', quote:'"会社のお金、300万円必要。"', confidence:92, tactics:['RECIPROCITY','FEAR'], source:'GASA 2024' }},
      { text: "お願い、誰にも言わないで。特にお父さんには絶対言わないで。", delay: 13000,
        alert: { id:'ja2', severity:'high', pattern:'Isolation Tactic', quote:'"誰にも言わないで。"', confidence:94, tactics:['ISOLATION','RECIPROCITY'], source:'GASA 2024' }},
      { text: "今すぐATMに行って、この口座に振り込んでほしい。", delay: 19500,
        alert: { id:'ja3', severity:'critical', pattern:'Safe Account Transfer', quote:'"ATMからこの口座に振り込んで。"', confidence:97, tactics:['COMMITMENT','SCARCITY'], source:'GASA 2024' }},
    ]
  },
]

/* ━━━ KOREAN ━━━ */
const SCRIPTS_KO = [
  {
    id: 'vp_kr', label: '🏦 보이스피싱', category: 'critical',
    sentences: [
      { text: "안녕하세요. 금융감독원입니다. 고객님 계좌가 범죄에 연루된 것으로 확인되었습니다.", delay: 0,
        alert: { id:'ko1', severity:'critical', pattern:'Government Impersonation', quote:'"금융감독원 — 계좌 범죄 연루."', confidence:96, tactics:['AUTHORITY','FEAR'], source:'GASA 2024' }},
      { text: "안전계좌로 자금을 이체하지 않으면 계좌가 동결됩니다.", delay: 8000,
        alert: { id:'ko2', severity:'critical', pattern:'Safe Account Transfer', quote:'"안전계좌로 이체 안하면 동결."', confidence:98, tactics:['FEAR','SCARCITY'], source:'GASA 2024' }},
      { text: "수사 기밀이므로 가족이나 은행에 절대 말하면 안 됩니다.", delay: 16000,
        alert: { id:'ko3', severity:'high', pattern:'Isolation Tactic', quote:'"수사 기밀 — 말하면 안 됩니다."', confidence:93, tactics:['ISOLATION','AUTHORITY'], source:'GASA 2024' }},
    ]
  },
]

/* ━━━ SPANISH ━━━ */
const SCRIPTS_ES = [
  {
    id: 'banco_es', label: '🏦 Fraude Bancario', category: 'critical',
    sentences: [
      { text: "Buenas tardes. Departamento de seguridad de su banco. Hemos detectado movimientos sospechosos.", delay: 0 },
      { text: "Alguien intentó transferir cinco mil euros desde su cuenta al extranjero.", delay: 6500 },
      { text: "Su cuenta será bloqueada en diez minutos si no verifica su identidad ahora.", delay: 13000,
        alert: { id:'es1', severity:'critical', pattern:'Bank Impersonation', quote:'"Cuenta bloqueada en 10 minutos."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'GASA 2024' }},
      { text: "Confirme su número de cuenta y el código de verificación enviado a su teléfono.", delay: 21000,
        alert: { id:'es2', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"Confirme cuenta y código."', confidence:98, tactics:['AUTHORITY','COMMITMENT'], source:'GASA 2024' }},
      { text: "No contacte con su sucursal. Investigación confidencial.", delay: 28500,
        alert: { id:'es3', severity:'high', pattern:'Isolation Tactic', quote:'"No contacte sucursal."', confidence:91, tactics:['ISOLATION','AUTHORITY'], source:'GASA 2024' }},
    ]
  },
]

/* ━━━ FRENCH ━━━ */
const SCRIPTS_FR = [
  {
    id: 'cpf_fr', label: '🏛 Arnaque CPF', category: 'high',
    sentences: [
      { text: "Bonjour, service de formation professionnelle. Votre compte CPF arrive à expiration.", delay: 0,
        alert: { id:'fr1', severity:'high', pattern:'Government Impersonation', quote:'"CPF arrive à expiration."', confidence:92, tactics:['AUTHORITY','FEAR'], source:'GASA 2024' }},
      { text: "Deux mille quatre cents euros de crédit seront perdus à la fin du mois.", delay: 8000,
        alert: { id:'fr2', severity:'high', pattern:'Artificial Urgency', quote:'"2400€ perdus fin du mois."', confidence:90, tactics:['SCARCITY','FEAR'], source:'GASA 2024' }},
      { text: "J'ai besoin de votre numéro de sécurité sociale et identifiants de connexion.", delay: 16000,
        alert: { id:'fr3', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"Numéro sécurité sociale et identifiants."', confidence:97, tactics:['AUTHORITY','COMMITMENT'], source:'GASA 2024' }},
    ]
  },
]

/* ━━━ HINDI ━━━ */
const SCRIPTS_HI = [
  {
    id: 'aadh', label: '🏛 आधार कार्ड फ्रॉड', category: 'critical',
    sentences: [
      { text: "नमस्ते, TRAI से बोल रहा हूं। आपका नंबर अवैध गतिविधियों में इस्तेमाल हो रहा है।", delay: 0,
        alert: { id:'hi1', severity:'critical', pattern:'Government Impersonation', quote:'"TRAI — नंबर अवैध गतिविधियों में।"', confidence:95, tactics:['AUTHORITY','FEAR'], source:'GASA 2024' }},
      { text: "चौबीस घंटे में नंबर बंद हो जाएगा। आधार वेरिफाई करें।", delay: 9000,
        alert: { id:'hi2', severity:'critical', pattern:'Artificial Urgency', quote:'"24 घंटे में नंबर बंद।"', confidence:96, tactics:['SCARCITY','FEAR'], source:'GASA 2024' }},
      { text: "आधार नंबर और OTP बताइए।", delay: 17000,
        alert: { id:'hi3', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"आधार और OTP बताइए।"', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'GASA 2024' }},
    ]
  },
]

/* ━━━ Script selector ━━━ */
function getScriptsForLang(lang) {
  const map = { id:SCRIPTS_ID, zh:SCRIPTS_ZH, ja:SCRIPTS_JA, ko:SCRIPTS_KO, es:SCRIPTS_ES, fr:SCRIPTS_FR, hi:SCRIPTS_HI }
  return map[lang] || SCRIPTS_EN
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const TECH_ITEMS = [
  { icon:'🦀', name:'RUST WASM',   sub:'Audio Engine · Zero-copy',  c:'#ff9500' },
  { icon:'🐍', name:'PYTHON',      sub:'FastAPI · Cloud Run',        c:'#30d158' },
  { icon:'✦',  name:'GEMINI LIVE', sub:'Real-time AI Analysis',      c:'#00d4ff' },
  { icon:'☁',  name:'CLOUD RUN',   sub:'GCP · Auto-scale',           c:'#7b61ff' },
]

function getNow() {
  return new Date().toLocaleString('en-US',{ timeZone:'America/New_York',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false })+' EST'
}

function TechChip({ item }) {
  const [h,setH]=useState(false)
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 12px',marginBottom:3,borderLeft:`2px solid ${h?item.c:item.c+'35'}`,background:h?item.c+'0f':'rgba(255,255,255,0.01)',boxShadow:h?`0 0 16px ${item.c}22,inset 0 0 12px ${item.c}06`:'none',transition:'all 0.18s ease',cursor:'default' }}>
      <span style={{ fontSize:16,filter:h?`drop-shadow(0 0 6px ${item.c})`:'none',transition:'filter 0.2s' }}>{item.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:PF,fontSize:7,color:h?item.c:item.c+'cc',textShadow:h?`0 0 10px ${item.c}`:'none',transition:'all 0.2s' }}>{item.name}</div>
        <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.38)',marginTop:2 }}>{item.sub}</div>
      </div>
      {h&&<div style={{ width:4,height:4,background:item.c,boxShadow:`0 0 6px ${item.c}` }} />}
    </div>
  )
}

function LiveTranscript({ lines, speaking }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [lines])
  return (
    <div ref={ref} style={{ background:'rgba(0,0,0,0.6)',border:'1px solid rgba(0,212,255,0.12)',padding:'12px 16px',maxHeight:160,overflowY:'auto',marginBottom:16 }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
        <div style={{ fontFamily:PF,fontSize:6,color:'rgba(0,212,255,0.6)',letterSpacing:2 }}>LIVE TRANSCRIPT</div>
        {speaking && (
          <div style={{ display:'flex',gap:2,alignItems:'center' }}>
            {[0,1,2,3,4].map(i=><div key={i} style={{ width:2,background:'#ff2d55',animation:`vb 0.35s ease-in-out ${i*0.08}s infinite alternate`,height:4+Math.random()*8 }} />)}
            <style>{`@keyframes vb{0%{height:3px;opacity:0.4}100%{height:14px;opacity:1}}`}</style>
            <span style={{ fontFamily:MF,fontSize:8,color:'#ff2d55',marginLeft:4,animation:'blink 0.8s step-end infinite' }}>CALLER SPEAKING</span>
          </div>
        )}
      </div>
      {lines.length===0
        ? <div style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.2)',fontStyle:'italic' }}>Waiting for audio input...</div>
        : lines.map((l,i)=>(
          <div key={i} style={{ fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.75)',lineHeight:1.7,padding:'3px 0',borderLeft:l.flagged?'2px solid #ff2d55':'2px solid transparent',paddingLeft:8,background:l.flagged?'rgba(255,45,85,0.06)':'transparent',animation:i===lines.length-1?'fadeUp 0.3s ease':'none' }}>
            <span style={{ color:'rgba(0,212,255,0.4)',fontSize:9,marginRight:8 }}>[{l.time}]</span>
            {l.text}
            {l.flagged&&<span style={{ color:'#ff2d55',fontSize:8,marginLeft:8 }}>⚠ FLAGGED</span>}
          </div>
        ))}
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function MonitorTab({ monitoring,threatLevel,sessionTime,alerts,threatScore,audioLevel,screenOn,onStart,onStop,onToggleScreen,onDemoAlert,language='en' }) {
  const [script,setScript]=useState(null)
  const [now,setNow]=useState(getNow())
  const [speaking,setSpeaking]=useState(false)
  const [transcriptLines,setTranscriptLines]=useState([])
  const [voiceDemo,setVoiceDemo]=useState(false)
  const [demoProgress,setDemoProgress]=useState(0)
  const speechTimers=useRef([])
  const startTimeRef=useRef(null)
  const pendingCount=useRef(0)
  const finished=useRef(false)

  const availableScripts = getScriptsForLang(language)
  useEffect(() => { setScript(null) }, [language])
  useEffect(()=>{ const t=setInterval(()=>setNow(getNow()),1000); return ()=>clearInterval(t) },[])

  useEffect(() => {
    return () => { speechTimers.current.forEach(t=>clearTimeout(t)); window.speechSynthesis?.cancel() }
  }, [])

  useEffect(() => {
    if (!monitoring) {
      setTranscriptLines([]); setVoiceDemo(false); setSpeaking(false); setDemoProgress(0)
      finished.current=false; pendingCount.current=0
      speechTimers.current.forEach(t=>clearTimeout(t)); speechTimers.current=[]
      window.speechSynthesis?.cancel()
    }
  }, [monitoring])

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const avgConf=alerts.length>0?Math.round(alerts.reduce((a,b)=>a+b.confidence,0)/alerts.length):null
  const tColor=threatLevel==='critical'?'#ff2d55':threatLevel==='high'?'#ff9500':'#00d4ff'

  const startVoiceDemo = useCallback((sel) => {
    if (!sel||!window.speechSynthesis) return
    speechTimers.current.forEach(t=>clearTimeout(t)); speechTimers.current=[]
    window.speechSynthesis.cancel()
    setVoiceDemo(true); setTranscriptLines([]); setDemoProgress(0)
    finished.current=false; startTimeRef.current=Date.now()
    const sents=sel.sentences; const total=sents.length; pendingCount.current=total

    const go=()=>{
      const voice=getVoiceForLang(language)
      const prefs=VOICE_PREFS[language]||VOICE_PREFS['en']
      sents.forEach((s,idx)=>{
        const timer=setTimeout(()=>{
          const u=new SpeechSynthesisUtterance(s.text)
          if(voice) u.voice=voice
          u.rate=prefs.rate; u.pitch=prefs.pitch; u.volume=1.0
          const elapsed=Date.now()-startTimeRef.current
          const ts=fmt(Math.floor(elapsed/1000))
          u.onstart=()=>setSpeaking(true)
          u.onend=()=>{
            setSpeaking(false)
            setDemoProgress(Math.round(((idx+1)/total)*100))
            pendingCount.current-=1
            if(pendingCount.current<=0&&!finished.current){
              finished.current=true
              const st=setTimeout(()=>onStop(),3000)
              speechTimers.current.push(st)
            }
          }
          setTranscriptLines(prev=>[...prev,{text:s.text,time:ts,flagged:!!s.alert}])
          window.speechSynthesis.speak(u)
          if(s.alert){
            const at=setTimeout(()=>{if(onDemoAlert)onDemoAlert(s.alert)},1800)
            speechTimers.current.push(at)
          }
        },s.delay)
        speechTimers.current.push(timer)
      })
    }

    if(window.speechSynthesis.getVoices().length===0){
      window.speechSynthesis.addEventListener('voiceschanged',go,{once:true})
      setTimeout(go,300)
    } else go()
  },[onDemoAlert,onStop,fmt,language])

  const handleStartWithVoice=()=>{ onStart(); if(script) setTimeout(()=>startVoiceDemo(script),500) }
  const handleStop=()=>{ window.speechSynthesis?.cancel(); speechTimers.current.forEach(t=>clearTimeout(t)); onStop() }

  return (
    <div style={{ display:'grid',gridTemplateColumns:'1fr 296px',gap:20 }}>
      <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

        <PBox color={monitoring&&threatLevel==='critical'?'#ff2d55':'#00d4ff'} style={{ padding:24,background:'rgba(0,212,255,0.01)',transition:'all 0.5s' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:PF,fontSize:10,color:'#00d4ff',marginBottom:6,textShadow:'0 0 14px #00d4ff' }}>LIVE SESSION MONITOR</div>
              <div style={{ fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.48)' }}>
                {monitoring ? voiceDemo ? `► VOICE DEMO — ${fmt(sessionTime)} — ${demoProgress}%` : `► ANALYZING — ${fmt(sessionTime)}` : '■ READY — SELECT DEMO → START'}
              </div>
            </div>
            <div style={{ display:'flex',gap:10,flexWrap:'wrap',justifyContent:'flex-end' }}>
              <PBtn onClick={onToggleScreen} color={screenOn?'#ffd60a':'#7b61ff'}>{screenOn?'■ SCREEN OFF':'◈ SCREEN WATCH'}</PBtn>
              {!monitoring ? <PBtn onClick={handleStartWithVoice} color="#30d158">{script?'▶ START VOICE DEMO':'▶ START'}</PBtn> : <PBtn onClick={handleStop} danger>■ STOP</PBtn>}
            </div>
          </div>

          <div style={{ background:'rgba(0,0,0,0.5)',padding:'10px 14px',marginBottom:16,border:`1px solid ${tColor}18`,position:'relative',transition:'border-color 0.5s' }}>
            <div style={{ fontFamily:MF,fontSize:9,color:`${tColor}60`,marginBottom:8,letterSpacing:2 }}>
              {voiceDemo?'VOICE DEMO ── SPEECH SYNTHESIS ── REAL-TIME DETECTION':'AUDIO STREAM ── GEMINI LIVE API ── RUST WASM ENGINE'}
            </div>
            <WaveformVisualizer active={monitoring} threatLevel={threatLevel} audioLevel={speaking?0.7:audioLevel} />
            {screenOn&&<div style={{ position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#7b61ff',textShadow:'0 0 8px #7b61ff',animation:'blink 1.5s step-end infinite' }}>◈ SCREEN</div>}
            {speaking&&<div style={{ position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#ff2d55',textShadow:'0 0 8px #ff2d55',animation:'blink 0.6s step-end infinite' }}>🔊 VOICE</div>}
          </div>

          {voiceDemo && <LiveTranscript lines={transcriptLines} speaking={speaking} />}

          {voiceDemo && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                <span style={{ fontFamily:PF,fontSize:6,color:'rgba(0,212,255,0.5)',letterSpacing:1 }}>ANALYSIS</span>
                <span style={{ fontFamily:MF,fontSize:9,color:demoProgress>=100?'#30d158':'#00d4ff' }}>{demoProgress>=100?'✓ COMPLETE':demoProgress+'%'}</span>
              </div>
              <div style={{ height:3,background:'rgba(0,212,255,0.1)',overflow:'hidden' }}>
                <div style={{ height:'100%',width:`${demoProgress}%`,background:`linear-gradient(90deg,#00d4ff,${demoProgress>=100?'#30d158':tColor})`,boxShadow:`0 0 8px ${tColor}66`,transition:'width 0.5s ease' }} />
              </div>
            </div>
          )}

          <div style={{ display:'flex',gap:8 }}>
            <StatCard label="THREATS" value={alerts.length} color="#ff2d55" icon="⚠" />
            <StatCard label="PATTERNS" value="50+" color="#00d4ff" icon="◎" />
            <StatCard label="LATENCY" value="<80ms" color="#30d158" icon="⚡" />
            <StatCard label="CONFIDENCE" value={avgConf?`${avgConf}%`:'—'} color="#7b61ff" icon="◆" />
          </div>
        </PBox>

        <PBox color="rgba(255,214,10,0.2)" style={{ padding:16,background:'rgba(255,214,10,0.01)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4 }}>
            <div style={{ width:6,height:6,background:'#ffd60a',animation:'blink 1s step-end infinite' }} />
            <span style={{ fontFamily:PF,fontSize:7,color:'#ffd60a',letterSpacing:1 }}>VOICE DEMO SCRIPTS</span>
            <span style={{ fontFamily:MF,fontSize:9,color:'rgba(255,214,10,0.45)' }}>— {language.toUpperCase()} — select → START</span>
          </div>
          <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,214,10,0.35)',marginBottom:12,paddingLeft:14 }}>
            🔊 Voice simulation · Auto-stop on completion · Switch language above for regional scam demos
          </div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:script?12:0 }}>
            {availableScripts.map(s=>(
              <button key={s.id} onClick={()=>setScript(script?.id===s.id?null:s)}
                style={{ fontFamily:MF,fontSize:10,padding:'7px 14px',cursor:'pointer',border:`1px solid ${script?.id===s.id?'#ffd60a':'rgba(255,214,10,0.22)'}`,background:script?.id===s.id?'rgba(255,214,10,0.12)':'transparent',color:script?.id===s.id?'#ffd60a':'rgba(255,214,10,0.52)',transition:'all 0.15s',display:'flex',alignItems:'center',gap:6 }}>
                {s.label}{script?.id===s.id&&<span style={{ fontSize:8 }}>🔊</span>}
              </button>
            ))}
          </div>
          {script&&!voiceDemo&&(
            <div style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.55)',lineHeight:1.75,padding:'12px 14px',background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,214,10,0.1)' }}>
              <div style={{ fontFamily:PF,fontSize:6,color:'rgba(255,214,10,0.6)',marginBottom:8,letterSpacing:1 }}>
                PREVIEW — {script.sentences.length} SENTENCES · ~{Math.round(script.sentences[script.sentences.length-1].delay/1000+8)}s · AUTO-STOP
              </div>
              {script.sentences.map((s,i)=>(
                <div key={i} style={{ padding:'2px 0',borderLeft:s.alert?'2px solid #ff2d55':'2px solid transparent',paddingLeft:8,marginBottom:2 }}>
                  <span style={{ color:s.alert?'rgba(255,45,85,0.7)':'rgba(255,255,255,0.4)' }}>{s.text}</span>
                  {s.alert&&<span style={{ fontSize:8,color:'#ff2d55',marginLeft:6 }}>⚠ {s.alert.pattern}</span>}
                </div>
              ))}
            </div>
          )}
        </PBox>

        <PBox color={alerts.length>0?'#ff2d55':'rgba(0,212,255,0.15)'} style={{ padding:20,background:'rgba(0,0,0,0.2)',flex:1 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:PF,fontSize:9,color:'#00d4ff' }}>REAL-TIME ALERTS</div>
              <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:5 }}>{now}</div>
            </div>
            {alerts.length>0&&<div style={{ fontFamily:PF,fontSize:7,padding:'5px 12px',border:'2px solid #ff2d55',color:'#ff2d55',background:'rgba(255,45,85,0.08)',animation:'ppulse 1.5s infinite',flexShrink:0 }}>{alerts.length} DETECTED</div>}
          </div>
          {alerts.length===0 ? (
            <div style={{ textAlign:'center',padding:'52px 0' }}>
              <div style={{ fontSize:38,marginBottom:14,color:'rgba(0,212,255,0.15)' }}>🛡</div>
              <div style={{ fontFamily:PF,fontSize:7,color:'rgba(255,255,255,0.2)',lineHeight:2.5 }}>
                {monitoring?voiceDemo?'LISTENING...\nANALYZING':'MONITORING...':'SELECT DEMO\nTHEN START'}
              </div>
            </div>
          ) : (
            <div style={{ maxHeight:380,overflowY:'auto',paddingRight:4 }}>
              {alerts.map((a,i)=><AlertCard key={a.id} alert={a} index={i} />)}
            </div>
          )}
        </PBox>
      </div>

      <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
        <PBox color="#7b61ff" style={{ padding:20,background:'rgba(0,0,0,0.2)' }}>
          <div style={{ fontFamily:PF,fontSize:8,color:'#7b61ff',marginBottom:16,textShadow:'0 0 10px #7b61ff' }}>THREAT SCORE</div>
          <ThreatMeter score={threatScore} />
        </PBox>
        <PBox color="rgba(0,212,255,0.12)" style={{ padding:16,background:'rgba(0,0,0,0.1)' }}>
          <div style={{ fontFamily:PF,fontSize:7,color:'rgba(0,212,255,0.55)',marginBottom:12,letterSpacing:1 }}>TECH STACK</div>
          {TECH_ITEMS.map(item=><TechChip key={item.name} item={item} />)}
        </PBox>
      </div>
    </div>
  )
}
