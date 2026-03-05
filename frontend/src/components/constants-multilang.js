// ─────────────────────────────────────────────────────────────────
// VoxGuard — Multi-Language Scam Pattern Library
// 40 languages · Region-specific variants · Gemini Live API hints
// Sources: FBI IC3 2024, FTC, GASA, MAS ScamShield, ACCC, regional
// ─────────────────────────────────────────────────────────────────

export const PF = "'Press Start 2P', monospace"
export const MF = "'Share Tech Mono', 'Courier New', monospace"

// ── 40 Supported Languages ───────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  // Tier 1 — Highest scam loss / volume (GASA / FBI IC3 2024)
  { code:'en',    name:'English',            native:'English',        flag:'🇺🇸', tier:1 },
  { code:'zh-CN', name:'Chinese (Simplified)',native:'中文 (简体)',    flag:'🇨🇳', tier:1 },
  { code:'zh-TW', name:'Chinese (Traditional)',native:'中文 (繁體)',   flag:'🇹🇼', tier:1 },
  { code:'id',    name:'Indonesian',         native:'Bahasa Indonesia',flag:'🇮🇩', tier:1 },
  { code:'hi',    name:'Hindi',              native:'हिन्दी',          flag:'🇮🇳', tier:1 },
  { code:'es',    name:'Spanish',            native:'Español',         flag:'🇪🇸', tier:1 },
  { code:'pt-BR', name:'Portuguese (BR)',    native:'Português',       flag:'🇧🇷', tier:1 },
  { code:'ar',    name:'Arabic',             native:'العربية',         flag:'🇸🇦', tier:1 },
  { code:'ja',    name:'Japanese',           native:'日本語',          flag:'🇯🇵', tier:1 },
  { code:'ko',    name:'Korean',             native:'한국어',          flag:'🇰🇷', tier:1 },

  // Tier 2 — Active scam regions
  { code:'ms',    name:'Malay',              native:'Bahasa Melayu',  flag:'🇲🇾', tier:2 },
  { code:'tl',    name:'Filipino',           native:'Filipino',        flag:'🇵🇭', tier:2 },
  { code:'th',    name:'Thai',               native:'ภาษาไทย',        flag:'🇹🇭', tier:2 },
  { code:'vi',    name:'Vietnamese',         native:'Tiếng Việt',      flag:'🇻🇳', tier:2 },
  { code:'fr',    name:'French',             native:'Français',        flag:'🇫🇷', tier:2 },
  { code:'de',    name:'German',             native:'Deutsch',         flag:'🇩🇪', tier:2 },
  { code:'it',    name:'Italian',            native:'Italiano',        flag:'🇮🇹', tier:2 },
  { code:'nl',    name:'Dutch',              native:'Nederlands',      flag:'🇳🇱', tier:2 },
  { code:'tr',    name:'Turkish',            native:'Türkçe',          flag:'🇹🇷', tier:2 },
  { code:'pl',    name:'Polish',             native:'Polski',          flag:'🇵🇱', tier:2 },

  // Tier 3 — Extended coverage
  { code:'ru',    name:'Russian',            native:'Русский',         flag:'🇷🇺', tier:3 },
  { code:'uk',    name:'Ukrainian',          native:'Українська',      flag:'🇺🇦', tier:3 },
  { code:'ro',    name:'Romanian',           native:'Română',          flag:'🇷🇴', tier:3 },
  { code:'cs',    name:'Czech',              native:'Čeština',         flag:'🇨🇿', tier:3 },
  { code:'hu',    name:'Hungarian',          native:'Magyar',          flag:'🇭🇺', tier:3 },
  { code:'sv',    name:'Swedish',            native:'Svenska',         flag:'🇸🇪', tier:3 },
  { code:'da',    name:'Danish',             native:'Dansk',           flag:'🇩🇰', tier:3 },
  { code:'fi',    name:'Finnish',            native:'Suomi',           flag:'🇫🇮', tier:3 },
  { code:'el',    name:'Greek',              native:'Ελληνικά',        flag:'🇬🇷', tier:3 },
  { code:'he',    name:'Hebrew',             native:'עברית',           flag:'🇮🇱', tier:3 },
  { code:'fa',    name:'Persian',            native:'فارسی',           flag:'🇮🇷', tier:3 },
  { code:'bn',    name:'Bengali',            native:'বাংলা',           flag:'🇧🇩', tier:3 },
  { code:'ur',    name:'Urdu',               native:'اردو',            flag:'🇵🇰', tier:3 },
  { code:'ta',    name:'Tamil',              native:'தமிழ்',           flag:'🇱🇰', tier:3 },
  { code:'sw',    name:'Swahili',            native:'Kiswahili',       flag:'🇰🇪', tier:3 },
  { code:'am',    name:'Amharic',            native:'አማርኛ',           flag:'🇪🇹', tier:3 },
  { code:'yo',    name:'Yoruba',             native:'Yorùbá',          flag:'🇳🇬', tier:3 },
  { code:'ha',    name:'Hausa',              native:'Hausa',           flag:'🇳🇬', tier:3 },
  { code:'af',    name:'Afrikaans',          native:'Afrikaans',       flag:'🇿🇦', tier:3 },
  { code:'no',    name:'Norwegian',          native:'Norsk',           flag:'🇳🇴', tier:3 },
]

// ── Regional Scam Patterns (on top of 50+ universal patterns) ────
// Format: { id, severity, category, description, markers[], source }
export const REGIONAL_PATTERNS = {

  'id': [ // Indonesia
    { id:'id-001', severity:'critical', category:'Pinjol Ilegal',
      description:'Fake online loan apps threatening contacts if repayment delayed.',
      markers:['pinjaman online','cicilan ringan','langsung cair','KTP cukup','daftar sekarang'],
      source:'OJK Indonesia 2024' },
    { id:'id-002', severity:'critical', category:'BRILink Palsu',
      description:'Caller claims accidental transfer, demands refund via BRILink agent.',
      markers:['salah transfer','kembalikan dana','BRILink','tolong dikembalikan'],
      source:'Bank BRI Advisory 2024' },
    { id:'id-003', severity:'high',     category:'"Mama Minta Pulsa"',
      description:'Caller impersonates family member with broken phone, requests prepaid credit.',
      markers:['ini anakmu','minta tolong','hp rusak','transfer pulsa','jangan bilang ayah'],
      source:'BSSN Indonesia 2023' },
    { id:'id-004', severity:'high',     category:'Undian Berhadiah Palsu',
      description:'Fake prize lottery requiring admin fee or tax payment to claim reward.',
      markers:['selamat anda menang','pajak hadiah','biaya administrasi','hadiah mobil','klaim sekarang'],
      source:'Kominfo 2024' },
    { id:'id-005', severity:'critical', category:'Impersonasi OJK/BI',
      description:'Caller poses as OJK or Bank Indonesia officer threatening account blocking.',
      markers:['OJK','Bank Indonesia','rekening diblokir','wajib lapor','investigasi'],
      source:'OJK Indonesia 2024' },
    { id:'id-006', severity:'high',     category:'Penipuan Jual Beli Online',
      description:'Fake buyer/seller claiming payment made or demanding COD cancellation fee.',
      markers:['sudah transfer','cek rekening','rekber','minta cancel','ongkir balik'],
      source:'Bareskrim Polri 2024' },
  ],

  'zh-CN': [ // Mainland China
    { id:'cn-001', severity:'critical', category:'公安局诈骗',
      description:'Caller impersonates police, claims victim implicated in money laundering, demands transfer to "safe account".',
      markers:['公安局','涉嫌洗钱','配合调查','安全账户','不得告诉家人'],
      source:'MPS China Advisory 2024' },
    { id:'cn-002', severity:'critical', category:'杀猪盘',
      description:'Romance-investment scam: builds emotional relationship then introduces fraudulent investment platform.',
      markers:['稳赚不赔','我的分析师','独家平台','提现困难','追加投资'],
      source:'GASA Asia Report 2024' },
    { id:'cn-003', severity:'high',     category:'贷款诈骗',
      description:'Fake loan approval requiring upfront "handling fee" or credit score top-up.',
      markers:['免息贷款','秒到账','刷流水','激活费','手续费'],
      source:'CBIRC China 2024' },
    { id:'cn-004', severity:'critical', category:'绑架诈骗 (海外留学生)',
      description:'Fake kidnapping of overseas student — calls parents demanding ransom.',
      markers:['你孩子出事了','不能报警','立即汇款','人质','赎金'],
      source:'MPS China Advisory 2024' },
  ],

  'zh-TW': [ // Taiwan
    { id:'tw-001', severity:'critical', category:'假檢警詐騙',
      description:'Impersonates prosecutor/police, claims victim linked to crime, demands asset transfer.',
      markers:['檢察官','涉嫌犯罪','配合偵查','轉帳保全','不得告知他人'],
      source:'TWJIB 2024' },
    { id:'tw-002', severity:'high',     category:'網購詐騙',
      description:'Fake refund or order cancellation requiring bank account re-verification.',
      markers:['操作錯誤','重新設定','ATM','解除分期','客服專線'],
      source:'TWJIB 2024' },
  ],

  'ms': [ // Malaysia
    { id:'my-001', severity:'critical', category:'Macau Scam',
      description:'Impersonates police/court/telecom, claims victim owes debt or is implicated in crime.',
      markers:['polis','mahkamah','akaun dibekukan','duit pampasan','jangan beritahu sesiapa'],
      source:'PDRM Malaysia 2024' },
    { id:'my-002', severity:'high',     category:'Pelaburan Haram',
      description:'Fake investment platform promising guaranteed returns, usually via Telegram.',
      markers:['untung besar','dijamin','platform berdaftar','SC Malaysia','duit boleh keluarkan bila-bila'],
      source:'SC Malaysia Advisory 2024' },
    { id:'my-003', severity:'high',     category:'Penipuan Akaun Bank',
      description:'Caller claims victim\'s bank account used for crime, instructs to transfer to "safe account".',
      markers:['akaun anda disyaki','kerjasama','akaun selamat','bank negara'],
      source:'BNM Malaysia 2024' },
  ],

  'tl': [ // Philippines
    { id:'ph-001', severity:'critical', category:'GCash/Maya Phishing',
      description:'Fake GCash/Maya support asking for OTP or account credentials.',
      markers:['GCash','nakatanggap ng pera','i-verify ang account','OTP','Maya'],
      source:'BSP Philippines 2024' },
    { id:'ph-002', severity:'high',     category:'Load Scam',
      description:'Caller impersonates family member needing emergency prepaid credit.',
      markers:['magpadala ng load','emergency','hindi maabot','patay na ang cp','Globe','Smart'],
      source:'NTC Philippines 2024' },
    { id:'ph-003', severity:'high',     category:'Love Scam / Budol-Budol',
      description:'Online romance leads to money request for emergency or investment.',
      markers:['padalahin mo lang','pag-uwi ko','mahal kita','mag-invest tayo'],
      source:'PNP ACG 2024' },
  ],

  'th': [ // Thailand
    { id:'th-001', severity:'critical', category:'แก๊งคอลเซ็นเตอร์',
      description:'Call centre gang impersonating police/DSI/Customs, demands wire transfer.',
      markers:['ตำรวจ','DSI','กรมศุลกากร','บัญชีถูกระงับ','โอนเงินทันที'],
      source:'TCSD Thailand 2024' },
    { id:'th-002', severity:'critical', category:'หมูเชือด (Pig Butchering)',
      description:'Romance-investment scam targeting victims via social media.',
      markers:['ลงทุนได้กำไร','แพลตฟอร์มพิเศษ','ถอนไม่ได้','ลงทุนเพิ่ม'],
      source:'GASA Asia Report 2024' },
    { id:'th-003', severity:'high',     category:'เงินกู้ผิดกฎหมาย',
      description:'Illegal loan shark using app with excessive fees and contact harassment.',
      markers:['กู้เงินด่วน','อนุมัติทันที','ไม่ต้องค้ำ','ดอกเบี้ยต่ำ'],
      source:'BOT Thailand 2024' },
  ],

  'vi': [ // Vietnam
    { id:'vn-001', severity:'critical', category:'Giả mạo công an',
      description:'Impersonates police/procuracy, claims account involved in crime, demands transfer.',
      markers:['Bộ Công an','tài khoản bị phong tỏa','chuyển tiền bảo lãnh','không được nói với ai'],
      source:'Bộ Công an VN 2024' },
    { id:'vn-002', severity:'high',     category:'Lừa đảo việc làm online',
      description:'Fake remote job requiring upfront deposit or completing paid tasks.',
      markers:['làm việc online','thu nhập cao','nạp tiền','hoàn thành nhiệm vụ','rút tiền'],
      source:'Bộ TTTT VN 2024' },
    { id:'vn-003', severity:'high',     category:'Vay tiền qua app',
      description:'Illegal loan app with hidden fees, threatening to expose contact list.',
      markers:['vay nhanh','không cần thế chấp','giải ngân ngay','danh bạ của bạn'],
      source:'NHNN Vietnam 2024' },
  ],

  'hi': [ // Hindi / India
    { id:'in-001', severity:'critical', category:'Digital Arrest Scam',
      description:'Caller claims victim is under "digital arrest" by CBI/ED/Narcotics, demands payment.',
      markers:['CBI','Enforcement Directorate','digital arrest','FIR','Aadhaar linked to drugs','Supreme Court'],
      source:'MHA India Cybercrime Advisory 2024' },
    { id:'in-002', severity:'high',     category:'Fake Customs/Parcel Scam',
      description:'Victim told illegal goods found in parcel; pay customs or face arrest.',
      markers:['parcel seized','customs department','illegal items','clear your name','DHL'],
      source:'PIB India Fact Check 2024' },
    { id:'in-003', severity:'high',     category:'Loan App Harassment',
      description:'Instant loan app accesses contacts, threatens to send fake debt messages if unpaid.',
      markers:['instant approval','Aadhaar only','contact list','we will inform your family'],
      source:'RBI India Advisory 2024' },
    { id:'in-004', severity:'high',     category:'OTP/UPI Scam',
      description:'Fake bank/NPCI call requesting OTP or UPI PIN for "verification".',
      markers:['UPI','NPCI','OTP','verify account','KYC pending','block karoge'],
      source:'RBI India 2024' },
  ],

  'ar': [ // Arabic
    { id:'ar-001', severity:'high',     category:'احتيال الجوائز',
      description:'Fake prize lottery requiring admin fees or taxes to claim award.',
      markers:['فزت بجائزة','رسوم إدارية','اتصل الآن','مبروك','سيارة أو مبلغ'],
      source:'CITC Saudi Arabia 2024' },
    { id:'ar-002', severity:'critical', category:'احتيال الاستثمار',
      description:'Fake investment platform offering guaranteed daily returns.',
      markers:['ضمان الربح','منصة معتمدة','أرباح يومية','مستشار مالي','لا تخبر أحد'],
      source:'CMA Saudi Arabia 2024' },
    { id:'ar-003', severity:'high',     category:'انتحال موظف بنكي',
      description:'Caller impersonates bank employee, requests OTP to "reverse suspicious transaction".',
      markers:['عملية مشبوهة','OTP','إيقاف العملية','رمز التحقق','نحن من البنك'],
      source:'SAMA Saudi Arabia 2024' },
  ],

  'ja': [ // Japanese
    { id:'jp-001', severity:'critical', category:'オレオレ詐欺',
      description:'Caller impersonates relative claiming emergency (accident, debt), requests cash.',
      markers:['おれだよおれ','事故を起こした','示談金','弁護士','内緒にして'],
      source:'NPA Japan 2024' },
    { id:'jp-002', severity:'critical', category:'架空請求詐欺',
      description:'Fake unpaid bill or subscription charges threatening legal action.',
      markers:['未払い','裁判','差し押さえ','今すぐ連絡','コンビニ払い'],
      source:'NPA Japan 2024' },
    { id:'jp-003', severity:'high',     category:'フィッシング詐欺',
      description:'Fake bank/government notification requesting account credential re-entry.',
      markers:['アカウント停止','確認が必要','ログイン','三井住友','マイナンバー'],
      source:'IPA Japan 2024' },
  ],

  'ko': [ // Korean
    { id:'kr-001', severity:'critical', category:'보이스피싱',
      description:'Caller impersonates police/prosecutor claiming account linked to crime.',
      markers:['검찰','경찰','명의도용','수사협조','안전계좌','가족에게 말하지 마세요'],
      source:'FSS Korea 2024' },
    { id:'kr-002', severity:'high',     category:'대출 사기',
      description:'Fake low-interest loan requiring upfront fee or insurance payment.',
      markers:['저금리 대출','선입금','보험료','정부지원','취소 불가'],
      source:'FSS Korea 2024' },
  ],

  'pt-BR': [ // Brazil
    { id:'br-001', severity:'critical', category:'Golpe do Pix',
      description:'Caller claims Pix sent by mistake or pretends to be bank, requests reversal.',
      markers:['Pix errado','estorno','conta bloqueada','Banco Central','confirmar CPF'],
      source:'FEBRABAN Brazil 2024' },
    { id:'br-002', severity:'high',     category:'Golpe do WhatsApp',
      description:'Clone of victim\'s WhatsApp number used to ask contacts for money.',
      markers:['chip novo','número novo','preciso de ajuda','urgente','me paga depois'],
      source:'Procon SP 2024' },
    { id:'br-003', severity:'high',     category:'Mão na Roda / Falso Motoboy',
      description:'Caller claims bank sent courier to collect card for "security reissue".',
      markers:['motoboy','buscar cartão','cancelar cartão','senha temporária'],
      source:'Banco do Brasil Advisory 2024' },
  ],

  'es': [ // Spanish
    { id:'es-001', severity:'high',     category:'Timo del Bizum',
      description:'Caller claims to have sent Bizum by mistake, asks for refund.',
      markers:['Bizum','transferencia errónea','devolver','he enviado por error'],
      source:'Guardia Civil Spain 2024' },
    { id:'es-002', severity:'high',     category:'Estafa del Hijo en Apuros',
      description:'Caller impersonates child in emergency, requests urgent transfer.',
      markers:['soy tu hijo','accidente','no llames a papá','necesito dinero ahora'],
      source:'Policía Nacional Spain 2024' },
    { id:'es-003', severity:'high',     category:'Vishing Bancario',
      description:'Fake bank call about "suspicious transaction", requests card details.',
      markers:['cargo sospechoso','bloquear tarjeta','confirmar datos','BBVA','Santander'],
      source:'Banco de España 2024' },
  ],

  'fr': [ // French
    { id:'fr-001', severity:'high',     category:'Arnaque au Faux Conseiller',
      description:'Fake bank advisor calls about fraud on account, requests credentials.',
      markers:['conseiller bancaire','opération frauduleuse','Crédit Agricole','BNP','confirmer code'],
      source:'Banque de France 2024' },
    { id:'fr-002', severity:'high',     category:'Arnaque aux Grands-Parents',
      description:'Impersonates grandchild in trouble needing urgent money via courier.',
      markers:['c\'est moi','j\'ai eu un accident','ne dis rien à maman','coursier'],
      source:'DGCCRF France 2024' },
  ],

  'de': [ // German
    { id:'de-001', severity:'critical', category:'Schockanruf',
      description:'Caller claims family member had accident or is in police custody, demands bail.',
      markers:['Ihr Sohn hatte Unfall','Kaution','Staatsanwalt','nichts sagen','Bote kommt'],
      source:'Bundeskriminalamt 2024' },
    { id:'de-002', severity:'high',     category:'Phishing Telefonbanking',
      description:'Fake bank call about suspicious transaction requesting TAN or account access.',
      markers:['verdächtige Buchung','TAN','sperren','Commerzbank','Sparkasse','verifizieren'],
      source:'BSI Germany 2024' },
  ],

  'ru': [ // Russian
    { id:'ru-001', severity:'critical', category:'Звонок из банка',
      description:'Fake bank security call claiming card compromised, requests CVV/OTP.',
      markers:['служба безопасности','подозрительная операция','CVV','подтвердите','Сбербанк'],
      source:'ЦБ РФ 2024' },
    { id:'ru-002', severity:'high',     category:'Инвестиционная афера',
      description:'Fake investment broker offering guaranteed returns on trading platform.',
      markers:['гарантированный доход','брокер','платформа','вывести нельзя','пополните счёт'],
      source:'ЦБ РФ 2024' },
  ],

  'tr': [ // Turkish
    { id:'tr-001', severity:'critical', category:'Sahte Banka Araması',
      description:'Fake bank security call requesting OTP to stop "suspicious transfer".',
      markers:['bankanızdan arıyorum','şüpheli işlem','OTP','kartınızı iptal edeceğiz','doğrulama'],
      source:'BDDK Turkey 2024' },
    { id:'tr-002', severity:'high',     category:'Akraba Acil Durumu',
      description:'Caller poses as relative in emergency, asks for urgent wire transfer.',
      markers:['benim oğlun','kaza yaptım','kimseye söyleme','kurye gelecek'],
      source:'Emniyet Genel Müdürlüğü 2024' },
  ],

  'sw': [ // Swahili / East Africa
    { id:'sw-001', severity:'critical', category:'M-Pesa Fraud',
      description:'Caller claims accidental M-Pesa transfer, requests refund.',
      markers:['M-Pesa','nimetuma kwa makosa','nirudishie','Safaricom','thibitisha akaunti'],
      source:'CBK Kenya 2024' },
    { id:'sw-002', severity:'high',     category:'Ulaghai wa Mkopo',
      description:'Fake mobile loan with hidden fees, threatens to contact employer.',
      markers:['mkopo wa haraka','hakuna dhamana','tutajulisha ofisini','lipa sasa'],
      source:'CBK Kenya 2024' },
  ],

  'tl': [ // Tagalog (already defined above as 'tl')
  ],

  'nl': [ // Dutch
    { id:'nl-001', severity:'critical', category:'Bankhelpdeskfraude',
      description:'Fake bank helpdesk about compromised account, requests remote access or OTP.',
      markers:['bankmedewerker','verdachte transactie','teamviewer','ING','Rabobank','pincode'],
      source:'Fraudehelpdesk NL 2024' },
  ],

  'it': [ // Italian
    { id:'it-001', severity:'high',     category:'Vishing Bancario',
      description:'Fake bank call about fraud, requests OTP or card data.',
      markers:['operazione sospetta','codice OTP','bloccare il conto','Intesa','UniCredit'],
      source:'Banca d\'Italia 2024' },
    { id:'it-002', severity:'high',     category:'Truffa del Finto Carabiniere',
      description:'Caller poses as Carabinieri, claims family member in trouble, requests cash.',
      markers:['carabinieri','suo figlio','incidente','non dica niente','verrà un incaricato'],
      source:'Polizia di Stato 2024' },
  ],

  'pl': [ // Polish
    { id:'pl-001', severity:'critical', category:'Oszustwo na Policjanta/Prokuratura',
      description:'Caller impersonates police/prosecutor, claims account used in crime, requests transfer.',
      markers:['policja','prokurator','konto przestępcze','przelej na bezpieczne','nikomu nie mów'],
      source:'CERT Polska 2024' },
  ],

  'fa': [ // Persian/Farsi
    { id:'fa-001', severity:'high',     category:'کلاهبرداری بانکی',
      description:'Fake bank security claiming account at risk, requests card info.',
      markers:['بانک','حساب مسدود','رمز یکبار مصرف','تأیید هویت','فوری'],
      source:'CBI Iran Advisory 2024' },
  ],

  'bn': [ // Bengali
    { id:'bd-001', severity:'high',     category:'bKash প্রতারণা',
      description:'Caller claims accidental bKash transfer, requests refund.',
      markers:['bKash','ভুলে পাঠিয়েছি','ফেরত দিন','OTP','একাউন্ট যাচাই'],
      source:'Bangladesh Bank 2024' },
  ],

  'yo': [ // Yoruba / Nigeria
    { id:'ng-001', severity:'critical', category:'Advance Fee (419) Scam',
      description:'Victim promised large sum requiring upfront payment to release funds.',
      markers:['inheritance','contract payment','I need your help','processing fee','confidential'],
      source:'EFCC Nigeria 2024' },
  ],

  'ha': [ // Hausa / Nigeria
    { id:'ng-002', severity:'high',     category:'SIM Swap Fraud',
      description:'Scammer ports victim\'s number to steal bank OTPs.',
      markers:['new SIM','lost phone','verify number','MTN','Airtel','your OTP'],
      source:'NCC Nigeria 2024' },
  ],

  'af': [ // Afrikaans / South Africa
    { id:'za-001', severity:'critical', category:'Vishing / Bank Fraud',
      description:'Fake FNB/ABSA/Standard Bank call about account compromise.',
      markers:['FNB','ABSA','verdagte transaksie','OTP','kaart geblokkeer','bevestig'],
      source:'SABRIC South Africa 2024' },
  ],

  'am': [ // Amharic / Ethiopia
    { id:'et-001', severity:'high',     category:'Telebirr Scam',
      description:'Fake Telebirr transfer claim requesting refund.',
      markers:['Telebirr','ስህተት ልኬ','ይመልሱልኝ','OTP','ማረጋገጫ'],
      source:'NBE Ethiopia 2024' },
  ],

  'he': [ // Hebrew
    { id:'il-001', severity:'high',     category:'הונאת בנק',
      description:'Fake bank security asking for OTP or account verification.',
      markers:['בנק לאומי','פעולה חשודה','קוד אימות','חסום חשבון','אמת זהות'],
      source:'BoI Israel 2024' },
  ],

  'el': [ // Greek
    { id:'gr-001', severity:'high',     category:'Τηλεφωνική Απάτη Τράπεζας',
      description:'Fake bank call about suspicious transaction requesting OTP.',
      markers:['Εθνική Τράπεζα','ύποπτη συναλλαγή','OTP','αποκλεισμός λογαριασμού'],
      source:'Bank of Greece 2024' },
  ],

  'ta': [ // Tamil
    { id:'ta-001', severity:'high',     category:'UPI மோசடி',
      description:'Fake bank/NPCI call requesting UPI PIN for "account verification".',
      markers:['UPI','OTP','KYC','கணக்கு தடுக்கப்பட்டது','இப்போதே சரிசெய்யுங்கள்'],
      source:'RBI India 2024' },
  ],

  'sv': [ // Swedish
    { id:'se-001', severity:'critical', category:'Bluff-samtal Bankman',
      description:'Fake bank employee calls about card misuse, requests BankID authentication.',
      markers:['BankID','Swedbank','Handelsbanken','misstänkt transaktion','verifiera nu'],
      source:'Polisen Sverige 2024' },
  ],

  'da': [ // Danish
    { id:'dk-001', severity:'high',     category:'Banksvindel',
      description:'Fake Danske Bank/Nordea call about fraud.',
      markers:['Danske Bank','Nordea','mistænkelig transaktion','MitID','bekræft'],
      source:'Politiet Danmark 2024' },
  ],

  'fi': [ // Finnish
    { id:'fi-001', severity:'high',     category:'Pankkipuhelu',
      description:'Fake bank (OP/Nordea) call about suspicious activity.',
      markers:['OP','Nordea','epäilyttävä tapahtuma','vahvista','pankkitunnus'],
      source:'FICORA Finland 2024' },
  ],

  'ro': [ // Romanian
    { id:'ro-001', severity:'high',     category:'Frauda Bancara',
      description:'Fake bank call about compromised card requesting OTP.',
      markers:['BRD','BCR','operatiune suspecta','cod SMS','blocam cardul'],
      source:'BNR Romania 2024' },
  ],

  'cs': [ // Czech
    { id:'cz-001', severity:'high',     category:'Telefonní Podvod',
      description:'Fake bank/police call about account misuse.',
      markers:['Česká spořitelna','podezřelá platba','potvrzovací kód','okamžitě zavolejte'],
      source:'ČNB Czech Republic 2024' },
  ],

  'hu': [ // Hungarian
    { id:'hu-001', severity:'high',     category:'Banki Vishing',
      description:'Fake OTP Bank/K&H call about suspicious transaction.',
      markers:['OTP Bank','K&H','gyanús tranzakció','megerősítő kód','zárolva'],
      source:'MNB Hungary 2024' },
  ],

  'uk': [ // Ukrainian
    { id:'ua-001', severity:'critical', category:'Банківське шахрайство',
      description:'Fake PrivatBank/monobank call requesting OTP or card details.',
      markers:['ПриватБанк','монобанк','підозріла операція','OTP','підтвердьте картку'],
      source:'NBU Ukraine 2024' },
  ],

  'ur': [ // Urdu / Pakistan
    { id:'pk-001', severity:'high',     category:'Easypaisa/JazzCash Fraud',
      description:'Fake transfer claim requesting refund via Easypaisa.',
      markers:['Easypaisa','JazzCash','غلطی سے بھیجا','واپس کریں','OTP','تصدیق کریں'],
      source:'SBP Pakistan 2024' },
  ],

  'no': [ // Norwegian
    { id:'no-001', severity:'high',     category:'Banksvindel',
      description:'Fake DNB/SpareBank call about compromised account.',
      markers:['DNB','SpareBank','mistenkelig transaksjon','BankID','bekreft'],
      source:'Finanstilsynet Norway 2024' },
  ],
}

// ── Build Gemini language hint for a given language code ─────────
export function buildLanguageContext(langCode) {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode)
  const regional = REGIONAL_PATTERNS[langCode] || []
  return {
    language_code: langCode,
    language_name: lang?.name || 'English',
    native_name: lang?.native || 'English',
    regional_count: regional.length,
    regional_patterns: regional,
    system_suffix: regional.length > 0
      ? `\n\nREGIONAL PATTERNS for ${lang?.native}: Watch for these additional local scam types: ${regional.map(p=>`${p.category} (markers: ${p.markers.slice(0,3).join(', ')})`).join('; ')}.`
      : '',
  }
}

// ── Get all patterns for a language (universal + regional) ───────
export function getPatternsForLanguage(langCode, universalPatterns) {
  const regional = REGIONAL_PATTERNS[langCode] || []
  return [...(universalPatterns || []), ...regional]
}

// ── Language summary stats ────────────────────────────────────────
export const LANGUAGE_STATS = {
  total: SUPPORTED_LANGUAGES.length,
  tier1: SUPPORTED_LANGUAGES.filter(l=>l.tier===1).length,
  tier2: SUPPORTED_LANGUAGES.filter(l=>l.tier===2).length,
  tier3: SUPPORTED_LANGUAGES.filter(l=>l.tier===3).length,
  regionalVariants: Object.values(REGIONAL_PATTERNS).flat().length,
}
