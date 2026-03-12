s// ── Scam Patterns - grounded from FTC / FBI IC3 / GASA / MAS / ACCC ──
// NOTE: No specific brand names - use generic terms
export const SCAM_PATTERNS = [
  { id:1,  category:"Bank Impersonation",         severity:"critical", description:"Caller poses as fraud prevention from a financial institution, manufacturing panic about account security to extract credentials.",                      markers:["suspicious activity detected","account will be frozen","verify your identity","fraud alert"],          mechanism:"AUTHORITY + FEAR",             source:"FBI IC3 2024",  detected:false },
  { id:2,  category:"OTP / Credential Extraction",severity:"critical", description:"Solicits one-time passwords, PINs, passwords, or account numbers under false pretenses of verification or security.",                                    markers:["read me the code","verification number","confirm your PIN","security code"],                            mechanism:"AUTHORITY + COMPLIANCE",       source:"FTC Sentinel",  detected:false },
  { id:3,  category:"Artificial Urgency",          severity:"critical", description:"Creates false time pressure to prevent the victim from thinking clearly, consulting others, or recognizing the manipulation.",                              markers:["act now","expires in minutes","last chance","within the hour","immediately"],                             mechanism:"SCARCITY + PANIC",             source:"GASA 2024",     detected:false },
  { id:4,  category:"Safe Account Transfer",       severity:"critical", description:"Instructs victim to move funds to a 'secure' or 'protection' account secretly controlled by the scammer.",                                                markers:["safe account","protection account","transfer your funds","secure your money"],                            mechanism:"AUTHORITY + FEAR",             source:"FTC Sentinel",  detected:false },
  { id:5,  category:"Investment Fraud",            severity:"high",     description:"Promises guaranteed, unrealistic returns on investments with no risk - classic hallmarks of Ponzi and pyramid schemes.",                                    markers:["guaranteed returns","zero risk","300% profit","insider opportunity","limited positions"],                  mechanism:"GREED + SCARCITY",             source:"FBI IC3 2024",  detected:false },
  { id:6,  category:"Family Impersonation",        severity:"high",     description:"Impersonates a family member in distress to extract money or information through emotional manipulation.",                                                 markers:["I need your help","emergency situation","don't tell anyone","hospital","accident"],                        mechanism:"RECIPROCITY + FEAR",           source:"FTC Sentinel",  detected:false },
  { id:7,  category:"Tech Support Impersonation",  severity:"high",     description:"Poses as tech company support to gain remote access to the victim's device under the pretense of fixing a security issue.",                                markers:["virus detected","your computer is compromised","download this tool","remote access"],                      mechanism:"AUTHORITY + FEAR",             source:"FBI IC3 2024",  detected:false },
  { id:8,  category:"Isolation Tactic",            severity:"high",     description:"Instructs victim not to discuss the situation with family, friends, or authorities - a key control mechanism in prolonged scam operations.",               markers:["don't tell anyone","keep this confidential","your family won't understand","between us","top secret"],      mechanism:"ISOLATION + CONTROL",          source:"GASA 2024",     detected:false },
  { id:9,  category:"Gift Card Demand",            severity:"high",     description:"Requests payment via gift cards as an untraceable and irreversible transfer method.",                                                                      markers:["buy gift cards","prepaid cards","scratch the back","read me the numbers"],                                  mechanism:"AUTHORITY + URGENCY",          source:"FTC Sentinel",  detected:false },
  { id:10, category:"Government Impersonation",    severity:"critical", description:"Poses as tax authority, social services, or law enforcement to threaten arrest, deportation, or legal consequences.",                                      markers:["tax authority","arrest warrant","legal action","deportation","badge number"],                              mechanism:"AUTHORITY + FEAR",             source:"FBI IC3 2024",  detected:false },
  { id:11, category:"Crypto Transfer Scam",        severity:"critical", description:"Instructs victim to send cryptocurrency to an 'investment wallet', 'recovery account', or 'escrow' - all controlled by the scammer.",                      markers:["send Bitcoin","crypto wallet","blockchain recovery","USDT transfer","DeFi protocol"],                       mechanism:"AUTHORITY + GREED",            source:"FTC Sentinel",  detected:false },
  { id:12, category:"Fake Prize / Lottery",        severity:"medium",   description:"Claims the victim has won a prize, lottery, or sweepstakes that requires a processing fee, tax, or insurance payment to release.",                          markers:["you've been selected","claim your prize","processing fee","release your winnings","congratulations"],       mechanism:"GREED + RECIPROCITY",          source:"FTC Sentinel",  detected:false },
  { id:13, category:"Extortion / Blackmail",       severity:"critical", description:"Threatens to expose personal data, photos, or contact lists unless payment is made - common in illegal loan app scams.",                                    markers:["spread your data","contact your employer","share photos","expose to social media"],                         mechanism:"FEAR + ISOLATION",             source:"GASA 2024",     detected:false },
  { id:14, category:"Fake Giveaway / Celebrity",   severity:"medium",   description:"Impersonates celebrity or influencer account running fake giveaway requiring upfront payment to claim prize.",                                              markers:["giveaway winner","celebrity","influencer","claim fee","exclusive prize","DM us"],                            mechanism:"RECIPROCITY + SCARCITY",       source:"GASA 2024",     detected:false },
  { id:15, category:"Grandparent Scam",            severity:"critical", description:"Targets elderly victims by impersonating a grandchild in distress, demanding urgent bail money or hospital payments.",                                      markers:["grandma it's me","don't tell mom","I'm in trouble","I need bail money"],                                    mechanism:"FEAR + RECIPROCITY",           source:"FBI IC3 2024",  detected:false },
  { id:16, category:"Remote Access Takeover",      severity:"critical", description:"Tricks victim into installing remote desktop software, giving the scammer full control of the device and access to banking apps.",                          markers:["install AnyDesk","TeamViewer","let me access your screen","remote session"],                                mechanism:"AUTHORITY + COMPLIANCE",       source:"FBI IC3 2024",  detected:false },
  { id:17, category:"Shipping / Delivery Scam",    severity:"medium",   description:"Claims a package is held at customs or a delivery requires a fee, directing to a phishing page for payment details.",                                      markers:["package held at customs","delivery fee required","tracking suspended","pay to release"],                    mechanism:"CURIOSITY + URGENCY",          source:"FTC Sentinel",  detected:false },
  { id:18, category:"Fake Charity Solicitation",   severity:"medium",   description:"Exploits disaster events or emotional appeals to solicit donations to fraudulent organizations that pocket the funds.",                                     markers:["disaster relief","donate now","children in need","tax-deductible","matching donation"],                     mechanism:"RECIPROCITY + GUILT",          source:"FTC Sentinel",  detected:false },
  { id:19, category:"Employment / Job Offer Scam", severity:"high",     description:"Offers high-paying remote work with no experience required, then demands upfront fees for equipment, training, or background checks.",                     markers:["work from home","no experience needed","upfront equipment fee","guaranteed salary"],                        mechanism:"GREED + AUTHORITY",            source:"FBI IC3 2024",  detected:false },
  { id:20, category:"SIM Swap / Phone Takeover",   severity:"critical", description:"Social engineers the victim into confirming a SIM transfer or phone number port, giving the attacker control of 2FA codes.",                              markers:["verify SIM","phone upgrade required","transfer your number","carrier security check"],                      mechanism:"AUTHORITY + COMPLIANCE",       source:"FBI IC3 2024",  detected:false },
  { id:21, category:"Wire Transfer Instruction",   severity:"critical", description:"Directs the victim to send a wire transfer to a specific account under false pretenses of payment, refund, or investment.",                                markers:["wire transfer","send funds to this account","routing number","international transfer"],                     mechanism:"AUTHORITY + URGENCY",          source:"FBI IC3 2024",  detected:false },
  { id:22, category:"Advance Fee Fraud",           severity:"high",     description:"Promises a large payout (inheritance, grant, loan) after the victim pays a small upfront processing or release fee.",                                      markers:["pay processing fee first","unlock your funds","release payment","small fee to receive"],                    mechanism:"GREED + COMMITMENT",           source:"GASA 2024",     detected:false },
  { id:23, category:"Fake Insurance Claim",        severity:"high",     description:"Claims the victim's insurance has expired or a claim is pending, demanding immediate payment to reinstate coverage.",                                       markers:["insurance expired","coverage lapsed","immediate reinstatement","premium overdue"],                          mechanism:"AUTHORITY + FEAR",             source:"FTC Sentinel",  detected:false },
  { id:24, category:"Impersonation of Friend",     severity:"high",     description:"Poses as a known friend using a 'new number', claiming an emergency and requesting money transfers.",                                                      markers:["hey it's me","lost my phone","new number","can you lend me","I'll pay you back"],                           mechanism:"RECIPROCITY + FEAR",           source:"GASA 2024",     detected:false },
  { id:25, category:"Fake Refund Overpayment",     severity:"critical", description:"Claims to have accidentally refunded too much money to the victim's account, then asks the victim to return the 'excess'.",                                markers:["we refunded too much","send back the difference","overpayment error","return excess"],                      mechanism:"RECIPROCITY + COMPLIANCE",     source:"FTC Sentinel",  detected:false },
  { id:26, category:"Business Email Compromise",   severity:"critical", description:"Impersonates a CEO, vendor, or business partner to instruct urgent wire transfers or changes to payment details.",                                         markers:["CEO request","urgent payment needed","change bank details","wire to new account"],                          mechanism:"AUTHORITY + URGENCY",          source:"FBI IC3 2024",  detected:false },
  { id:27, category:"Fake Medical Alert",          severity:"high",     description:"Uses health scare tactics to trick victims into paying for fake medical devices, prescriptions, or insurance renewals.",                                    markers:["medical device recall","health warning","prescription renewal urgent","insurance denied"],                   mechanism:"FEAR + AUTHORITY",             source:"FTC Sentinel",  detected:false },
  { id:28, category:"Subscription Trap",           severity:"medium",   description:"Claims a paid subscription is about to auto-renew at a high price, directing the victim to a fake cancellation page.",                                     markers:["subscription renewing","auto-charge today","cancel now or pay","trial expired"],                            mechanism:"FEAR + COMMITMENT",            source:"ACCC ScamWatch", detected:false },
  { id:29, category:"Phishing Link Delivery",      severity:"high",     description:"Sends a link disguised as a legitimate service page to harvest login credentials, credit card numbers, or personal data.",                                 markers:["click this link","verify your account","update your details","session expired"],                            mechanism:"CURIOSITY + URGENCY",          source:"MAS ScamShield", detected:false },
  { id:30, category:"Fake Warrant / Legal Threat", severity:"critical", description:"Threatens the victim with a fabricated arrest warrant or court order, demanding immediate payment to avoid prosecution.",                                   markers:["warrant issued","police coming","settle immediately","contempt of court"],                                  mechanism:"AUTHORITY + FEAR",             source:"FBI IC3 2024",  detected:false },
  { id:31, category:"Social Media Account Recovery",severity:"medium",  description:"Claims the victim's social media account has been hacked and asks for a verification code or login credentials to 'fix' it.",                              markers:["account hacked","verify ownership","send reset code","confirm identity"],                                  mechanism:"FEAR + COMPLIANCE",            source:"GASA 2024",     detected:false },
  { id:32, category:"Fake Real Estate / Rental",   severity:"high",     description:"Advertises a property at below-market rates, demands a deposit before viewing, and disappears after payment.",                                             markers:["property available now","deposit before viewing","other buyers interested","wire deposit"],                  mechanism:"SCARCITY + GREED",             source:"FTC Sentinel",  detected:false },
  { id:33, category:"QR Code Payment Scam",        severity:"high",     description:"Presents a malicious QR code that redirects to a fake payment page or installs malware when scanned.",                                                    markers:["scan this QR code","pay via QR","QR payment link","scan to verify"],                                       mechanism:"AUTHORITY + COMPLIANCE",       source:"MAS ScamShield", detected:false },
  { id:34, category:"Pig Butchering (Long Con)",   severity:"critical", description:"Builds a relationship over weeks before introducing a 'guaranteed' investment platform that steals deposited funds.",                                      markers:["I know a platform","we can invest together","my uncle's system","guaranteed weekly profit"],                mechanism:"RECIPROCITY + GREED",          source:"FBI IC3 2024",  detected:false },
  { id:35, category:"Digital Arrest (IN/SEA)",     severity:"critical", description:"Forces the victim to stay on a video call with a fake police officer who threatens arrest if they disconnect or tell anyone.",                             markers:["digital arrest","stay on video call","do not disconnect","cyber crime branch"],                             mechanism:"AUTHORITY + ISOLATION",        source:"GASA 2024",     detected:false },
  { id:36, category:"Loan App Extortion",          severity:"critical", description:"Illegal loan apps that access the victim's contact list and photos, then threaten to distribute them unless additional payments are made.",                 markers:["contact list accessed","photos will be shared","repay immediately","social media exposure"],                mechanism:"FEAR + ISOLATION",             source:"GASA 2024",     detected:false },
  { id:37, category:"Fake Customs / Border Fee",   severity:"high",     description:"Claims a package from overseas is held at customs and requires an import duty or clearance fee before it can be released.",                                markers:["customs clearance fee","package seized","import duty required","border inspection hold"],                   mechanism:"AUTHORITY + FEAR",             source:"ACCC ScamWatch", detected:false },
  { id:38, category:"Pinjol Harassment (ID)",      severity:"high",     description:"Illegal online lending apps that harass borrowers and their contacts with threats to expose personal data if payments are late.",                           markers:["tunggakan","hubungi kontak","sebarkan data","KTP","foto pribadi"],                                          mechanism:"FEAR + ISOLATION",             source:"GASA 2024",     detected:false },
  { id:39, category:"Mama Minta Pulsa (ID)",       severity:"medium",   description:"Impersonates a parent in distress via phone, requesting mobile credit top-up or money transfer for a fabricated emergency.",                               markers:["ini mama","kirimkan pulsa","rumah sakit","darurat","jangan bilang"],                                        mechanism:"RECIPROCITY + FEAR",           source:"GASA 2024",     detected:false },
  { id:40, category:"Ore Ore Sagi (JP)",           severity:"critical", description:"Japanese variant where caller impersonates a son or grandson claiming workplace trouble, demanding urgent cash transfer.",                                  markers:["ore da yo","kaisha no okane","furikonde","dare ni mo iwanaide"],                                            mechanism:"FEAR + RECIPROCITY",           source:"GASA 2024",     detected:false },
  { id:41, category:"Voice Phishing (KR)",         severity:"critical", description:"Korean variant impersonating financial authorities, instructing victims to transfer funds to a 'safe account' for investigation.",                          markers:["geumyung-danggug","anjeongye-jwa","gyejwa dongyeol","susa gimilh"],                                        mechanism:"AUTHORITY + FEAR",             source:"GASA 2024",     detected:false },
  { id:42, category:"Police Impersonation (CN)",   severity:"critical", description:"Chinese variant where caller impersonates Public Security Bureau, claiming identity theft involvement in money laundering.",                                markers:["gong an ju","shen fen zheng","xi qian an","an quan jian guan zhang hu"],                                    mechanism:"AUTHORITY + ISOLATION",        source:"GASA 2024",     detected:false },
  { id:43, category:"Fake Tech Refund",            severity:"high",     description:"Claims to process a refund for a cancelled service but requests remote access to 'verify' the transaction, then steals funds.",                            markers:["refund for service","overpaid subscription","remote access for refund","bank login to process"],            mechanism:"RECIPROCITY + COMPLIANCE",     source:"FTC Sentinel",  detected:false },
  { id:44, category:"Student Loan Forgiveness",    severity:"medium",   description:"Promotes fake government student loan forgiveness programs that require upfront application fees or personal financial information.",                        markers:["loan forgiveness program","limited time","processing fee","government program"],                            mechanism:"GREED + URGENCY",             source:"FTC Sentinel",  detected:false },
  { id:45, category:"Fake Bank SMS Verification",  severity:"critical", description:"Sends fake bank SMS alerts about suspicious transactions, directing victims to call a scammer-controlled number or click a phishing link.",                markers:["SMS verification","click link to verify","account suspended","confirm via text"],                           mechanism:"AUTHORITY + COMPLIANCE",       source:"MAS ScamShield", detected:false },
  { id:46, category:"NFT / Token Scam",            severity:"high",     description:"Promotes exclusive NFT drops or token sales that require connecting a crypto wallet, which then drains all funds via malicious smart contract.",            markers:["exclusive NFT drop","connect wallet","approve transaction","limited mint","whitelist spot"],                mechanism:"GREED + SCARCITY",             source:"FBI IC3 2024",  detected:false },
  { id:47, category:"Boss / Manager Impersonation",severity:"critical", description:"Impersonates a direct supervisor or CEO via phone/text, urgently requesting gift card purchases or wire transfers for a 'client'.",                        markers:["this is your manager","urgent request","buy gift cards for client","handle discreetly"],                     mechanism:"AUTHORITY + URGENCY",          source:"FBI IC3 2024",  detected:false },
  { id:48, category:"Fake Visa / Immigration",     severity:"high",     description:"Threatens visa cancellation or deportation if the victim does not pay a fine immediately, targeting foreign workers and students.",                         markers:["visa cancelled","deportation order","immigration violation","pay fine immediately"],                         mechanism:"AUTHORITY + FEAR",             source:"GASA 2024",     detected:false },
  { id:49, category:"Deepfake Video Call",         severity:"critical", description:"Uses AI-generated face or voice during a video call to impersonate a known person, typically to authorize fraudulent transactions.",                        markers:["video call verification","face doesn't match voice","pre-recorded responses","AI-generated"],              mechanism:"RECIPROCITY + AUTHORITY",      source:"GASA 2024",     detected:false },
  { id:50, category:"Password Reset Phishing",     severity:"high",     description:"Sends fake password reset notifications claiming unauthorized access, directing victims to a credential-harvesting fake login page.",                      markers:["password reset request","account compromised","click to secure","unusual login detected"],                  mechanism:"FEAR + COMPLIANCE",            source:"FBI IC3 2024",  detected:false },
  { id:51, category:"Romance Scam / Sextortion",   severity:"critical", description:"Builds a romantic or intimate relationship online, then threatens to expose intimate photos/videos unless the victim pays money.",                          markers:["I have your photos","intimate video","send money or I share","your reputation","screenshot"],               mechanism:"FEAR + ISOLATION",             source:"FBI IC3 2024",  detected:false },
  { id:52, category:"Penipuan Asmara / Pemerasan (ID)", severity:"critical", description:"Membangun hubungan romantis online lalu mengancam menyebarkan foto/video intim korban kecuali korban membayar sejumlah uang.",                      markers:["foto intim","video pribadi","saya sebar","reputasi","screenshot","bayar atau saya kirim"],                  mechanism:"FEAR + ISOLATION",             source:"GASA 2024",     detected:false },
]

// ── Psychological manipulation vectors (Cialdini + FBI behavioral) ──
export const PSYCH_TACTICS = [
  { id:"SCARCITY",    label:"Scarcity",    icon:"⏱", desc:"Creates artificial time pressure or limited availability to force hasty decisions.",                 color:"#ff2d55" },
  { id:"AUTHORITY",   label:"Authority",   icon:"🏛", desc:"Impersonates trusted institutions (banks, government, tech companies) to bypass critical thinking.", color:"#ff9500" },
  { id:"FEAR",        label:"Fear",        icon:"⚡", desc:"Induces panic about account closure, arrest, device compromise, or family harm.",                     color:"#ff2d55" },
  { id:"RECIPROCITY", label:"Reciprocity", icon:"🔄", desc:"Creates false sense of obligation - 'we already helped you, now you must help us'.",                 color:"#ffd60a" },
  { id:"ISOLATION",   label:"Isolation",   icon:"🔒", desc:"Demands secrecy to cut off the victim from people who could identify the scam.",                      color:"#bf5af2" },
  { id:"COMMITMENT",  label:"Commitment",  icon:"📌", desc:"Traps victims in escalating compliance - each small agreement makes refusal harder.",                  color:"#30d158" },
]

// ── Lie Detection Metrics ───────────────────────────────
export const LIE_INDICATORS = [
  { id:"INCONSISTENCY",  label:"Statement Inconsistency", icon:"🔀", desc:"Contradictions between claims made at different points in the conversation.", color:"#ff2d55" },
  { id:"VAGUENESS",      label:"Strategic Vagueness",      icon:"🌫", desc:"Deliberately avoids specifics when challenged - a hallmark of fabricated stories.", color:"#ff9500" },
  { id:"OVERDETAIL",     label:"Excessive Detail",         icon:"📋", desc:"Unprompted flood of irrelevant details to appear credible - overcompensation.", color:"#ffd60a" },
  { id:"DEFLECTION",     label:"Question Deflection",      icon:"↩️", desc:"Responds to direct questions with new claims or changes subject entirely.", color:"#bf5af2" },
  { id:"PRESSURE",       label:"Pressure to Comply",       icon:"⏳", desc:"Uses urgency to prevent verification - liars need you to act before you think.", color:"#ff2d55" },
]

// ── Severity config with animation tokens ──────────────
export const SEV = {
  critical: { bg:"rgba(255,45,85,0.1)",  border:"#ff2d55", text:"#ff2d55", glow:"0 0 18px rgba(255,45,85,0.5)",  pulse:true,  glowAnim:'alert-glow-critical 3s ease-in-out infinite', dotAnim:'alert-dot-critical 1s ease-in-out infinite' },
  high:     { bg:"rgba(255,149,0,0.1)",  border:"#ff9500", text:"#ff9500", glow:"0 0 18px rgba(255,149,0,0.4)",  pulse:true,  glowAnim:'alert-glow-high 4s ease-in-out infinite',     dotAnim:'blink 1s step-end infinite' },
  medium:   { bg:"rgba(255,214,10,0.08)",border:"#ffd60a", text:"#ffd60a", glow:"0 0 14px rgba(255,214,10,0.3)", pulse:false, glowAnim:'none', dotAnim:'blink 1.5s step-end infinite' },
  low:      { bg:"rgba(48,209,88,0.08)", border:"#30d158", text:"#30d158", glow:"0 0 12px rgba(48,209,88,0.3)",  pulse:false, glowAnim:'none', dotAnim:'blink 2s step-end infinite' },
}

// ── Fonts ──────────────────────────────────────────────────────
export const PF = "'Press Start 2P', monospace"
export const MF = "'Share Tech Mono', 'Courier New', monospace"

// ══════════════════════════════════════════════════════════════════
// ── LIVE SCAM INTERVENTION SYSTEM ────────────────────────────────
// ══════════════════════════════════════════════════════════════════

export const INTERVENTION_LEVELS = {
  WARN:     { threshold: 55, color: '#ff9500', label: 'WARNING',        icon: '⚠️',  pulse: false },
  BLOCK:    { threshold: 75, color: '#ff2d55', label: 'DANGER - BLOCK', icon: '🛑',  pulse: true  },
  LOCKDOWN: { threshold: 90, color: '#ff2d55', label: 'LOCKDOWN',       icon: '🚨',  pulse: true  },
}

// Which alert patterns trigger immediate intervention regardless of cumulative score
export const INSTANT_INTERVENTION_PATTERNS = [
  'OTP / Credential Extraction',
  'Safe Account Transfer',
  'Gift Card Demand',
  'Crypto Transfer Scam',
  'Pencurian OTP / Kredensial',
  'OTP チョリ',
  'OTP 도용',
  'سرقة بيانات',
  'OTP चोरी',
  'Robo de Credenciales',
]

// ══════════════════════════════════════════════════════════════════
// ── INTERVENTION RULES - determines what UI each scenario gets ──
// ══════════════════════════════════════════════════════════════════

// Patterns where the damage is immediate - NO challenge, safe exit ONLY
const FATAL_PATTERNS = new Set([
  'OTP / Credential Extraction',
  'Safe Account Transfer',
  'Gift Card Demand',
  'Crypto Transfer Scam',
  // Localized
  'Pencurian OTP / Kredensial',
  '安全账户转账',
  'OTP チョリ',
  'OTP 도용',
  'سرقة بيانات',
  'OTP चोरी',
  'Robo de Credenciales',
])

// Determines if Verification Challenge is available for a given intervention
export function isChallengeAvailable(interventionLevel, pattern) {
  // LOCKDOWN: always safe exit only - too dangerous for challenge
  if (interventionLevel === 'LOCKDOWN') return false
  // Fatal patterns: always safe exit only
  if (FATAL_PATTERNS.has(pattern)) return false
  // WARN and non-fatal BLOCK: challenge available
  return true
}

// ══════════════════════════════════════════════════════════════════
// ── SCENARIO-BASED VERIFICATION CHALLENGES ──────────────────────
// ══════════════════════════════════════════════════════════════════

// Scenario classifier - maps pattern names to scenario keys
const SCENARIO_MAP = {
  'Bank Impersonation': 'bank',
  'Government Impersonation': 'government',
  'Tech Support Impersonation': 'tech_support',
  'Investment Fraud': 'investment',
  'Family Impersonation': 'family',
  'Artificial Urgency': 'urgency',
  'Isolation Tactic': 'generic',
  'Fake Prize / Lottery': 'prize',
  'Extortion / Blackmail': 'generic',
  'Fake Giveaway / Celebrity': 'prize',
  'Romance Scam / Sextortion': 'romance',
  'Crypto Transfer Scam': 'crypto',
  // Localized - map to same scenarios
  'Penipuan Perbankan': 'bank',
  '冒充政府机关': 'government',
  '家族なりすまし': 'family',
  '정부기관 사칭': 'government',
  'Suplantación Bancaria': 'bank',
  'Usurpation gouvernementale': 'government',
  'सरकारी एजेंसी का रूप': 'government',
  'انتحال موظف بنكي': 'bank',
  'Pemerasan / Intimidasi': 'generic',
  'Ancaman Pemerasan': 'generic',
  'Penipuan Identitas Keluarga': 'family',
  'Penipuan Asmara / Pemerasan': 'romance',
  'Penipuan Asmara / Pemerasan (ID)': 'romance',
  'डिजिटल अरेस्ट': 'government',
}

function getScenarioKey(pattern) {
  return SCENARIO_MAP[pattern] || 'generic'
}

// Per-language, per-scenario verification challenges
const SCENARIO_CHALLENGES = {
  en: {
    bank: {
      title: 'VERIFY THIS CALLER',
      subtitle: 'This caller claims to be from your bank.',
      questions: [
        { q: 'Did this caller contact you first, or did you call them?', scam_indicator: 'They contacted me', safe_indicator: 'I called them' },
        { q: 'Are they asking you to share your OTP, PIN, or password?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Did they tell you NOT to call your bank directly?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'This matches confirmed bank impersonation tactics. Real banks NEVER ask for your OTP or password by phone.',
      result_caution: 'Some red flags detected. Do not share any credentials until you verify independently.',
      verify_action: 'Call the number on the BACK of your bank card',
    },
    government: {
      title: 'VERIFY THIS CALLER',
      subtitle: 'This caller claims to be from a government agency.',
      questions: [
        { q: 'Is this caller threatening arrest or legal action if you don\'t pay now?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they demanding payment via gift cards, crypto, or wire transfer?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'Government agencies NEVER threaten arrest by phone or demand gift card payments. This is a scam.',
      result_caution: 'Be cautious. Verify by calling the agency\'s official public number.',
      verify_action: 'Look up the agency\'s official number independently',
    },
    tech_support: {
      title: 'VERIFY THIS CALLER',
      subtitle: 'This caller claims your device is compromised.',
      questions: [
        { q: 'Did this caller contact you first about a "virus" or "security issue"?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they asking you to install remote access software?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they rushing you to act immediately?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'Legitimate tech companies NEVER cold-call about viruses. Do NOT install any software they suggest.',
      result_caution: 'Do not grant remote access. Contact the company through their official website.',
      verify_action: 'Visit the official company website for real support',
    },
    investment: {
      title: 'VERIFY THIS OPPORTUNITY',
      subtitle: 'This caller is promoting an investment.',
      questions: [
        { q: 'Are they promising guaranteed returns with zero risk?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they pressuring you to invest before a deadline?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'No legitimate investment guarantees returns. This matches classic investment fraud patterns.',
      result_caution: 'High-pressure tactics are a red flag. Research independently before investing.',
      verify_action: 'Check with your financial advisor or regulatory body',
    },
    family: {
      title: 'VERIFY THIS CALLER',
      subtitle: 'This caller claims to be a family member in trouble.',
      questions: [
        { q: 'Can you verify their identity by asking something only they would know?', scam_indicator: 'They can\'t answer', safe_indicator: 'They answered correctly' },
        { q: 'Are they telling you not to contact other family members?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'This matches family impersonation tactics. Scammers use panic to prevent you from verifying.',
      result_caution: 'Hang up and call this family member directly on their known number.',
      verify_action: 'Call this person back on their real phone number',
    },
    prize: {
      title: 'VERIFY THIS CLAIM',
      subtitle: 'This caller says you\'ve won a prize.',
      questions: [
        { q: 'Did you enter any contest or lottery to win this?', scam_indicator: 'No', safe_indicator: 'Yes' },
        { q: 'Are they asking you to pay a fee to claim your prize?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'You cannot win a contest you didn\'t enter. Legitimate prizes NEVER require upfront payment.',
      result_caution: 'Be skeptical. Verify the contest through official channels before paying anything.',
      verify_action: 'Search for the contest name online to verify it exists',
    },
    urgency: {
      title: 'PAUSE AND THINK',
      subtitle: 'This caller is creating extreme time pressure.',
      questions: [
        { q: 'Is the caller saying you must act within minutes or face consequences?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they preventing you from hanging up to verify their claims?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'Artificial urgency is the #1 manipulation tactic. Legitimate organizations give you time to verify.',
      result_caution: 'Take a breath. No legitimate situation requires instant action by phone.',
      verify_action: 'Hang up and call back through an official number',
    },
    romance: {
      title: 'VERIFY THIS PERSON',
      subtitle: 'This caller may be using a romantic relationship to manipulate you.',
      questions: [
        { q: 'Have you ever met this person in real life?', scam_indicator: 'No', safe_indicator: 'Yes' },
        { q: 'Are they threatening to share intimate photos or videos if you don\'t pay?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Did they ask you for money, gift cards, or crypto at any point?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'This matches romance scam / sextortion tactics. Do NOT send any money. Report to authorities immediately.',
      result_caution: 'Be very cautious. Never send money to someone you have not met in person.',
      verify_action: 'Report to FBI IC3 (ic3.gov) or local police cyber unit',
    },
    crypto: {
      title: 'VERIFY THIS TRANSACTION',
      subtitle: 'This caller is asking you to send cryptocurrency.',
      questions: [
        { q: 'Are they asking you to send crypto to a wallet address they provided?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they promising guaranteed returns or claiming to recover lost funds?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'Legitimate organizations NEVER ask you to send cryptocurrency by phone. Crypto transfers are irreversible.',
      result_caution: 'Do not send crypto to unknown wallets. Verify through official channels.',
      verify_action: 'Consult your financial advisor before any crypto transaction',
    },
    generic: {
      title: 'VERIFY THIS CALLER',
      subtitle: 'VoxGuard detected manipulation patterns in this call.',
      questions: [
        { q: 'Did this caller contact you first, or did you initiate contact?', scam_indicator: 'They contacted me', safe_indicator: 'I contacted them' },
        { q: 'Are they pressuring you to act immediately without verifying?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'Multiple scam indicators detected. Do NOT proceed with any requests from this caller.',
      result_caution: 'Exercise caution. Verify the caller\'s identity through independent channels.',
      verify_action: 'Verify through an official channel before taking any action',
    },
  },
  id: {
    bank: {
      title: 'VERIFIKASI PENELEPON',
      subtitle: 'Penelepon mengaku dari bank Anda.',
      questions: [
        { q: 'Apakah penelepon yang menghubungi Anda duluan?', scam_indicator: 'Ya, mereka duluan', safe_indicator: 'Saya yang menelepon' },
        { q: 'Apakah mereka meminta OTP, PIN, atau password?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
        { q: 'Apakah mereka bilang jangan hubungi bank langsung?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
      ],
      result_scam: 'Ini sesuai pola penipuan perbankan. Bank TIDAK PERNAH minta OTP atau password via telepon.',
      result_caution: 'Ada tanda mencurigakan. Jangan bagikan data apapun sebelum verifikasi.',
      verify_action: 'Hubungi nomor resmi bank di BELAKANG kartu ATM',
    },
    government: {
      title: 'VERIFIKASI PENELEPON',
      subtitle: 'Penelepon mengaku dari instansi pemerintah.',
      questions: [
        { q: 'Apakah penelepon mengancam penangkapan jika tidak bayar sekarang?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
        { q: 'Apakah mereka minta pembayaran via pulsa, kripto, atau transfer?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
      ],
      result_scam: 'Instansi pemerintah TIDAK PERNAH mengancam via telepon. Ini penipuan.',
      result_caution: 'Hati-hati. Verifikasi dengan menghubungi kantor resmi.',
      verify_action: 'Cari nomor resmi instansi di website resmi',
    },
    romance: {
      title: 'VERIFIKASI ORANG INI',
      subtitle: 'Orang ini mungkin menggunakan hubungan romantis untuk memanipulasi Anda.',
      questions: [
        { q: 'Apakah Anda pernah bertemu orang ini secara langsung?', scam_indicator: 'Belum pernah', safe_indicator: 'Sudah pernah' },
        { q: 'Apakah mereka mengancam menyebarkan foto/video intim jika Anda tidak bayar?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
        { q: 'Apakah mereka pernah meminta uang, pulsa, atau kripto?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
      ],
      result_scam: 'Ini sesuai pola penipuan asmara / pemerasan. JANGAN kirim uang apapun. Laporkan ke polisi segera.',
      result_caution: 'Sangat hati-hati. Jangan pernah kirim uang ke orang yang belum pernah Anda temui langsung.',
      verify_action: 'Laporkan ke Bareskrim: patrolisiber.id atau hubungi 110',
    },
    family: {
      title: 'VERIFIKASI PENELEPON',
      subtitle: 'Penelepon mengaku sebagai anggota keluarga yang kesulitan.',
      questions: [
        { q: 'Bisakah Anda verifikasi identitas mereka dengan pertanyaan pribadi?', scam_indicator: 'Mereka tidak bisa jawab', safe_indicator: 'Mereka jawab benar' },
        { q: 'Apakah mereka bilang jangan hubungi anggota keluarga lain?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
      ],
      result_scam: 'Ini sesuai pola penipuan identitas keluarga. Penipu menggunakan kepanikan agar Anda tidak verifikasi.',
      result_caution: 'Tutup telepon dan hubungi langsung anggota keluarga di nomor yang Anda kenal.',
      verify_action: 'Hubungi keluarga tersebut di nomor asli mereka',
    },
    generic: {
      title: 'VERIFIKASI PENELEPON',
      subtitle: 'VoxGuard mendeteksi pola manipulasi.',
      questions: [
        { q: 'Apakah penelepon yang menghubungi Anda duluan?', scam_indicator: 'Ya, mereka duluan', safe_indicator: 'Saya yang menelepon' },
        { q: 'Apakah mereka menekan Anda untuk bertindak segera?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
      ],
      result_scam: 'Beberapa indikator penipuan terdeteksi. JANGAN lanjutkan permintaan penelepon.',
      result_caution: 'Berhati-hati. Verifikasi identitas penelepon secara mandiri.',
      verify_action: 'Verifikasi melalui saluran resmi sebelum bertindak',
    },
  },
  zh: {
    bank: { title:'验证来电者', subtitle:'来电者自称是您的银行。', questions:[{q:'是对方先联系您的吗？',scam_indicator:'是',safe_indicator:'不是'},{q:'对方是否要求您提供验证码或密码？',scam_indicator:'是',safe_indicator:'否'}], result_scam:'银行绝不会通过电话要求密码。这是诈骗。', result_caution:'请通过官方渠道验证。', verify_action:'拨打银行卡背面的官方电话' },
    generic: { title:'验证来电者', subtitle:'检测到操纵模式。', questions:[{q:'是对方先联系您的吗？',scam_indicator:'是',safe_indicator:'不是'},{q:'对方是否催促您立即行动？',scam_indicator:'是',safe_indicator:'否'}], result_scam:'检测到多个诈骗指标。', result_caution:'请保持警惕。', verify_action:'通过官方渠道验证' },
  },
  ja: {
    bank: { title:'発信者を確認', subtitle:'発信者は銀行を名乗っています。', questions:[{q:'相手から電話がかかってきましたか？',scam_indicator:'はい',safe_indicator:'自分からかけました'},{q:'暗証番号やパスワードを聞かれましたか？',scam_indicator:'はい',safe_indicator:'いいえ'}], result_scam:'銀行が電話でパスワードを聞くことはありません。', result_caution:'公式窓口で確認してください。', verify_action:'カード裏面の公式番号に電話' },
    generic: { title:'発信者を確認', subtitle:'操作パターンを検出。', questions:[{q:'相手から電話がかかってきましたか？',scam_indicator:'はい',safe_indicator:'自分から'},{q:'すぐに行動するよう迫られていますか？',scam_indicator:'はい',safe_indicator:'いいえ'}], result_scam:'複数の詐欺指標を検出。', result_caution:'慎重に進めてください。', verify_action:'公式チャネルで確認' },
  },
  ko: {
    bank: { title:'발신자 확인', subtitle:'발신자가 은행이라고 합니다.', questions:[{q:'상대방이 먼저 전화했습니까?',scam_indicator:'예',safe_indicator:'제가 전화했습니다'},{q:'OTP나 비밀번호를 요구했습니까?',scam_indicator:'예',safe_indicator:'아니오'}], result_scam:'은행은 절대 전화로 비밀번호를 묻지 않습니다.', result_caution:'공식 채널로 확인하세요.', verify_action:'카드 뒷면 공식 번호로 전화' },
    generic: { title:'발신자 확인', subtitle:'조작 패턴 감지.', questions:[{q:'상대방이 먼저 전화했습니까?',scam_indicator:'예',safe_indicator:'제가'},{q:'즉시 행동하라고 압박합니까?',scam_indicator:'예',safe_indicator:'아니오'}], result_scam:'사기 지표 감지.', result_caution:'주의하세요.', verify_action:'공식 채널로 확인' },
  },
  es: {
    bank: { title:'VERIFICAR LLAMANTE', subtitle:'El llamante dice ser de su banco.', questions:[{q:'¿Le contactaron ellos primero?',scam_indicator:'Sí',safe_indicator:'Yo llamé'},{q:'¿Le pidieron OTP, PIN o contraseña?',scam_indicator:'Sí',safe_indicator:'No'}], result_scam:'Los bancos NUNCA piden contraseñas por teléfono.', result_caution:'Verifique por canales oficiales.', verify_action:'Llame al número oficial en su tarjeta' },
    generic: { title:'VERIFICAR LLAMANTE', subtitle:'Patrones de manipulación detectados.', questions:[{q:'¿Le contactaron ellos primero?',scam_indicator:'Sí',safe_indicator:'Yo llamé'},{q:'¿Le presionan para actuar de inmediato?',scam_indicator:'Sí',safe_indicator:'No'}], result_scam:'Indicadores de fraude detectados.', result_caution:'Proceda con precaución.', verify_action:'Verifique por canal oficial' },
  },
  fr: {
    bank: { title:'VÉRIFIER L\'APPELANT', subtitle:'L\'appelant prétend être de votre banque.', questions:[{q:'Est-ce l\'appelant qui vous a contacté en premier ?',scam_indicator:'Oui',safe_indicator:'J\'ai appelé'},{q:'Vous a-t-on demandé OTP, PIN ou mot de passe ?',scam_indicator:'Oui',safe_indicator:'Non'}], result_scam:'Les banques ne demandent JAMAIS de mot de passe par téléphone.', result_caution:'Vérifiez par les canaux officiels.', verify_action:'Appelez le numéro officiel sur votre carte' },
    generic: { title:'VÉRIFIER L\'APPELANT', subtitle:'Modèles de manipulation détectés.', questions:[{q:'L\'appelant vous a-t-il contacté en premier ?',scam_indicator:'Oui',safe_indicator:'J\'ai appelé'},{q:'Vous presse-t-on d\'agir maintenant ?',scam_indicator:'Oui',safe_indicator:'Non'}], result_scam:'Indicateurs de fraude détectés.', result_caution:'Soyez prudent.', verify_action:'Vérifiez par canal officiel' },
  },
  hi: {
    bank: { title:'कॉलर की पुष्टि करें', subtitle:'कॉलर बैंक से होने का दावा कर रहा है।', questions:[{q:'क्या कॉलर ने आपको पहले संपर्क किया?',scam_indicator:'हाँ',safe_indicator:'मैंने कॉल किया'},{q:'क्या OTP, PIN या पासवर्ड माँगा?',scam_indicator:'हाँ',safe_indicator:'नहीं'}], result_scam:'बैंक कभी फोन पर पासवर्ड नहीं माँगता।', result_caution:'आधिकारिक चैनल से सत्यापित करें।', verify_action:'कार्ड के पीछे का आधिकारिक नंबर डायल करें' },
    generic: { title:'कॉलर की पुष्टि करें', subtitle:'मैनिपुलेशन पैटर्न पाया गया।', questions:[{q:'क्या कॉलर ने पहले संपर्क किया?',scam_indicator:'हाँ',safe_indicator:'मैंने'},{q:'क्या तुरंत कार्रवाई का दबाव है?',scam_indicator:'हाँ',safe_indicator:'नहीं'}], result_scam:'धोखाधड़ी संकेतक पाए गए।', result_caution:'सावधान रहें।', verify_action:'आधिकारिक चैनल से सत्यापित करें' },
  },
  ar: {
    bank: { title:'تحقق من المتصل', subtitle:'المتصل يدعي أنه من البنك.', questions:[{q:'هل المتصل اتصل بك أولاً؟',scam_indicator:'نعم',safe_indicator:'أنا اتصلت'},{q:'هل طلبوا رمز OTP أو كلمة المرور؟',scam_indicator:'نعم',safe_indicator:'لا'}], result_scam:'البنوك لا تطلب كلمات المرور عبر الهاتف أبداً.', result_caution:'تحقق عبر القنوات الرسمية.', verify_action:'اتصل بالرقم الرسمي على بطاقتك' },
    generic: { title:'تحقق من المتصل', subtitle:'تم اكتشاف أنماط تلاعب.', questions:[{q:'هل المتصل اتصل بك أولاً؟',scam_indicator:'نعم',safe_indicator:'أنا'},{q:'هل يضغطون للتصرف فوراً؟',scam_indicator:'نعم',safe_indicator:'لا'}], result_scam:'تم اكتشاف مؤشرات احتيال.', result_caution:'كن حذراً.', verify_action:'تحقق عبر القناة الرسمية' },
  },
}

// Get scenario-based challenge for a pattern + language
export function getChallengeForScenario(pattern, langCode) {
  const lang = langCode?.split('-')[0] || 'en'
  const scenario = getScenarioKey(pattern)
  const langChallenges = SCENARIO_CHALLENGES[lang] || SCENARIO_CHALLENGES['en']
  return langChallenges[scenario] || langChallenges['generic'] || SCENARIO_CHALLENGES['en']['generic']
}

// Sensitive action keywords that trigger intervention in transcript
export const SENSITIVE_ACTION_KEYWORDS = {
  en: ['transfer','wire','send money','gift card','OTP','passcode','PIN','password','account number','routing number','social security','crypto','bitcoin','remote access','download','install'],
  id: ['transfer','kirim uang','pulsa','OTP','PIN','password','rekening','kartu','kripto','download'],
  zh: ['转账','汇款','验证码','密码','银行卡','比特币','下载','安装'],
  ja: ['振込','送金','暗証番号','パスワード','ビットコイン','ダウンロード'],
  ko: ['송금','이체','비밀번호','인증번호','비트코인','다운로드'],
  es: ['transferir','enviar dinero','contraseña','código','tarjeta','cripto','descargar'],
  fr: ['transférer','envoyer','mot de passe','code','carte','crypto','télécharger'],
  hi: ['ट्रांसफर','भेजें','OTP','पासवर्ड','बिटकॉइन','डाउनलोड'],
  ar: ['تحويل','إرسال','كلمة المرور','رمز','بيتكوين','تحميل'],
}

// Safe exit actions - what to show when intervention fires
export const SAFE_EXIT_ACTIONS = {
  en: [
    { icon: '📵', text: 'HANG UP NOW', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'Call your bank\'s REAL number (on back of card)', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'Call a trusted family member before doing anything', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'NEVER share OTP / PIN / password on a call', action: 'never_share', priority: 'critical' },
  ],
  id: [
    { icon: '📵', text: 'TUTUP TELEPON SEKARANG', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'Hubungi nomor RESMI bank (di belakang kartu)', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'Hubungi keluarga sebelum melakukan apapun', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'JANGAN PERNAH bagi OTP / PIN / password di telepon', action: 'never_share', priority: 'critical' },
  ],
  zh: [
    { icon: '📵', text: '立即挂断电话', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: '拨打银行卡背面的官方电话', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: '先联系家人再做任何决定', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: '绝不在电话中透露验证码/密码', action: 'never_share', priority: 'critical' },
  ],
  ja: [
    { icon: '📵', text: '今すぐ電話を切ってください', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'カード裏面の公式番号に電話', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: '何かする前に家族に相談', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: '電話で暗証番号を絶対に教えない', action: 'never_share', priority: 'critical' },
  ],
  ko: [
    { icon: '📵', text: '지금 당장 전화를 끊으세요', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: '카드 뒷면의 공식 번호로 전화', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: '행동 전 가족에게 먼저 연락', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: '전화로 비밀번호를 절대 알려주지 마세요', action: 'never_share', priority: 'critical' },
  ],
  es: [
    { icon: '📵', text: 'CUELGUE AHORA', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'Llame al número REAL de su banco', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'Llame a un familiar antes de hacer algo', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'NUNCA comparta OTP / PIN por teléfono', action: 'never_share', priority: 'critical' },
  ],
  fr: [
    { icon: '📵', text: 'RACCROCHEZ MAINTENANT', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'Appelez le VRAI numéro de votre banque', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'Appelez un proche avant toute action', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'Ne JAMAIS partager OTP / PIN par téléphone', action: 'never_share', priority: 'critical' },
  ],
  hi: [
    { icon: '📵', text: 'अभी फोन काटें', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'बैंक का असली नंबर (कार्ड पर) पर कॉल करें', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'कुछ भी करने से पहले परिवार को कॉल करें', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'कॉल पर OTP / PIN कभी न बताएं', action: 'never_share', priority: 'critical' },
  ],
  ar: [
    { icon: '📵', text: 'أغلق المكالمة الآن', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'اتصل بالرقم الرسمي لبنكك', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'اتصل بفرد من العائلة قبل أي إجراء', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'لا تشارك أبداً كلمة المرور عبر الهاتف', action: 'never_share', priority: 'critical' },
  ],
}

// Helper to get safe exit actions for a language
export function getSafeExitForLang(langCode) {
  const base = langCode?.split('-')[0] || 'en'
  return SAFE_EXIT_ACTIONS[base] || SAFE_EXIT_ACTIONS['en']
}

// Check if a pattern name should trigger instant intervention
export function isInstantInterventionPattern(patternName) {
  return INSTANT_INTERVENTION_PATTERNS.some(p =>
    patternName?.toLowerCase().includes(p.toLowerCase())
  )
}

// Get intervention level from threat score
export function getInterventionLevel(threatScore, latestAlert) {
  if (latestAlert && isInstantInterventionPattern(latestAlert.pattern)) {
    return INTERVENTION_LEVELS.BLOCK
  }
  if (threatScore >= INTERVENTION_LEVELS.LOCKDOWN.threshold) return INTERVENTION_LEVELS.LOCKDOWN
  if (threatScore >= INTERVENTION_LEVELS.BLOCK.threshold) return INTERVENTION_LEVELS.BLOCK
  if (threatScore >= INTERVENTION_LEVELS.WARN.threshold) return INTERVENTION_LEVELS.WARN
  return null
}

// ── LEGACY COMPAT - keep old exports working ──
export function getInterventionForLang(langCode) {
  return {
    challenges: getChallengeForScenario('generic', langCode),
    safeExits: getSafeExitForLang(langCode),
  }
}

// ── Recommended Actions per Language/Country ──
// [FIX] Added emergency phone numbers for ALL countries
export const RECOMMENDED_ACTIONS = {
  en: { country:'United States', emergency:'911', actions:[{icon:'🚫',text:'Do NOT transfer money, gift cards, or cryptocurrency to anyone',priority:'critical'},{icon:'📞',text:'Hang up immediately - do not engage further with the caller',priority:'critical'},{icon:'🏦',text:'Contact your bank\'s official fraud hotline (number on back of your card)',priority:'high'},{icon:'📋',text:'Report to FTC: reportfraud.ftc.gov',link:'https://reportfraud.ftc.gov',priority:'high'},{icon:'🔍',text:'File FBI IC3 complaint: ic3.gov',link:'https://ic3.gov',priority:'high'},{icon:'📱',text:'Enable two-factor authentication on all financial accounts',priority:'medium'},{icon:'🔒',text:'Change passwords on any accounts you may have disclosed',priority:'high'},{icon:'📝',text:'Document everything: save call logs, screenshots, messages',priority:'medium'},{icon:'👥',text:'Alert family members - scammers often target multiple people',priority:'medium'},{icon:'⚖️',text:'Contact your state Attorney General\'s consumer protection office',priority:'low'}] },
  id: { country:'Indonesia', emergency:'110', actions:[{icon:'🚫',text:'JANGAN transfer uang, pulsa, atau kripto ke siapapun',priority:'critical'},{icon:'📞',text:'Putuskan panggilan segera',priority:'critical'},{icon:'🏦',text:'Hubungi hotline resmi bank (cek di belakang kartu ATM)',priority:'high'},{icon:'📋',text:'Lapor ke OJK: 157',link:'https://ojk.go.id',priority:'high'},{icon:'🔍',text:'Lapor ke Kominfo: aduankonten.id',link:'https://aduankonten.id',priority:'high'},{icon:'👮',text:'Lapor ke Bareskrim: patrolisiber.id',link:'https://patrolisiber.id',priority:'high'},{icon:'📱',text:'Aktifkan verifikasi 2 langkah',priority:'medium'},{icon:'🔒',text:'Ganti PIN dan password mobile banking',priority:'high'},{icon:'📝',text:'Simpan semua bukti',priority:'medium'},{icon:'👥',text:'Peringatkan keluarga',priority:'medium'}] },
  zh: { country:'中国', emergency:'110', actions:[{icon:'🚫',text:'切勿转账或提供银行信息',priority:'critical'},{icon:'📞',text:'立即挂断电话',priority:'critical'},{icon:'📋',text:'拨打反诈热线 96110',priority:'high'},{icon:'🔍',text:'下载国家反诈中心APP',priority:'high'},{icon:'👮',text:'向当地公安局报案',priority:'high'},{icon:'🔒',text:'修改网银密码',priority:'high'}] },
  ja: { country:'日本', emergency:'110', actions:[{icon:'🚫',text:'絶対にお金を振り込まない',priority:'critical'},{icon:'📞',text:'すぐに電話を切る',priority:'critical'},{icon:'🏦',text:'銀行の公式窓口に連絡',priority:'high'},{icon:'📋',text:'警察相談 #9110',priority:'high'},{icon:'🔍',text:'消費者ホットライン 188',priority:'high'},{icon:'👮',text:'最寄りの警察署に届出',priority:'high'},{icon:'📱',text:'二段階認証を有効化',priority:'medium'},{icon:'🔒',text:'暗証番号を変更',priority:'high'}] },
  ko: { country:'대한민국', emergency:'112', actions:[{icon:'🚫',text:'절대 송금하지 마세요',priority:'critical'},{icon:'📞',text:'즉시 전화를 끊으세요',priority:'critical'},{icon:'🏦',text:'은행 공식 콜센터에 연락',priority:'high'},{icon:'📋',text:'금융감독원 1332 신고',priority:'high'},{icon:'🔍',text:'경찰청 182 신고',priority:'high'},{icon:'📱',text:'2단계 인증 활성화',priority:'medium'},{icon:'🔒',text:'비밀번호 변경',priority:'high'}] },
  es: { country:'España', emergency:'112', actions:[{icon:'🚫',text:'NO transfiera dinero ni datos personales',priority:'critical'},{icon:'📞',text:'Cuelgue inmediatamente',priority:'critical'},{icon:'🏦',text:'Contacte la línea de fraude de su banco',priority:'high'},{icon:'📋',text:'Denuncie: Policía Nacional 091',priority:'high'},{icon:'🔍',text:'Reporte en INCIBE: incibe.es',link:'https://incibe.es',priority:'high'},{icon:'📱',text:'Active verificación en dos pasos',priority:'medium'},{icon:'🔒',text:'Cambie contraseñas',priority:'high'}] },
  fr: { country:'France', emergency:'17', actions:[{icon:'🚫',text:'Ne transférez PAS d\'argent',priority:'critical'},{icon:'📞',text:'Raccrochez immédiatement',priority:'critical'},{icon:'🏦',text:'Contactez votre banque via le numéro officiel',priority:'high'},{icon:'📋',text:'Signalez sur Pharos',priority:'high'},{icon:'🔍',text:'Info Escroqueries: 0 805 805 817',priority:'high'},{icon:'📱',text:'Activez l\'authentification 2FA',priority:'medium'},{icon:'🔒',text:'Changez vos mots de passe',priority:'high'}] },
  hi: { country:'भारत', emergency:'112', actions:[{icon:'🚫',text:'पैसे ट्रांसफर न करें या OTP न बताएं',priority:'critical'},{icon:'📞',text:'तुरंत कॉल काटें',priority:'critical'},{icon:'🏦',text:'बैंक की आधिकारिक हेल्पलाइन पर कॉल करें',priority:'high'},{icon:'📋',text:'साइबर क्राइम हेल्पलाइन 1930',priority:'high'},{icon:'🔍',text:'cybercrime.gov.in पर शिकायत',link:'https://cybercrime.gov.in',priority:'high'},{icon:'📱',text:'2FA सक्रिय करें',priority:'medium'},{icon:'🔒',text:'UPI PIN और पासवर्ड बदलें',priority:'high'}] },
  ar: { country:'المملكة العربية السعودية', emergency:'911', actions:[{icon:'🚫',text:'لا تحول أي أموال',priority:'critical'},{icon:'📞',text:'أغلق المكالمة فوراً',priority:'critical'},{icon:'🏦',text:'اتصل بالخط الساخن لبنكك',priority:'high'},{icon:'📋',text:'أبلغ عبر تطبيق كلنا أمن',priority:'high'},{icon:'🔍',text:'تواصل مع مؤسسة النقد (SAMA): 800-125-6666',priority:'high'},{icon:'📱',text:'فعّل التحقق بخطوتين',priority:'medium'},{icon:'🔒',text:'غيّر كلمات المرور',priority:'high'},{icon:'📝',text:'احتفظ بالأدلة',priority:'medium'}] },
}

export function getActionsForLang(langCode) {
  if (RECOMMENDED_ACTIONS[langCode]) return RECOMMENDED_ACTIONS[langCode]
  const base = langCode.split('-')[0]
  if (RECOMMENDED_ACTIONS[base]) return RECOMMENDED_ACTIONS[base]
  return RECOMMENDED_ACTIONS['en']
}

// ══════════════════════════════════════════════════════════════════
// ── VOICE DEMO SCRIPTS ──────────────────────────────────────────
// [FIX] Longer dialog before lockdown. More scripts for EN & ID.
// [FIX] Pinjol: "Halo Pak/Ibu" instead of "Selamat pagi"
// [FIX] Lockdown triggers later after more conversation buildup
// ══════════════════════════════════════════════════════════════════

export const DEMO_SCRIPTS = {
  en: [
    {
      id: 'en_bank',
      title: 'Bank Impersonation',
      severity: 'critical',
      callerNumber: '+1 (XXX) XXX-XX42',
      description: 'Caller poses as fraud prevention from a bank.',
      dialog: [
        { speaker:'caller', text:'Hello, am I speaking with the account holder? This is the fraud prevention department at your bank.', time:'00:03', delay:0 },
        { speaker:'me', text:'Yes, this is me. What\'s going on?', time:'00:08', delay:5000 },
        { speaker:'caller', text:'We have detected several suspicious transactions on your account. Someone attempted to make a large purchase from an overseas IP address.', time:'00:14', delay:6000 },
        { speaker:'me', text:'Oh no, really? I haven\'t made any overseas purchases.', time:'00:20', delay:6000 },
        { speaker:'caller', text:'That confirms our concern. For your protection, we need to verify your identity before we can block these unauthorized charges. We are running out of time — the transaction is still pending.', time:'00:28', delay:8000 },
        { speaker:'me', text:'Okay, what do you need from me?', time:'00:33', delay:5000 },
        { speaker:'caller', text:'First, can you confirm your full account number for verification purposes? This is standard procedure.', time:'00:39', delay:6000 },
        { speaker:'me', text:'Um, it\'s... let me check...', time:'00:43', delay:4000 },
        { speaker:'caller', text:'Please hurry — the fraudulent transaction will be completed within 10 minutes and your account will be permanently frozen. I need your account number and the 6-digit verification code that was just sent to your phone.', time:'00:52', delay:9000, flagged:true },
        { speaker:'me', text:'I just got a code... it says 847291...', time:'00:58', delay:6000 },
        { speaker:'caller', text:'Do NOT share this with anyone except our verified department. Read me the code now — this is your last chance before we freeze your account.', time:'01:06', delay:8000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:14', severity:'critical', pattern:'Bank Impersonation', quote:'"This is the fraud prevention department at your bank."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'FTC Sentinel' },
        { id:2, time:'00:28', severity:'high', pattern:'Artificial Urgency', quote:'"We are running out of time — the transaction is still pending."', confidence:88, tactics:['SCARCITY','FEAR'], source:'FBI IC3 2024' },
        { id:3, time:'00:52', severity:'critical', pattern:'Artificial Urgency', quote:'"Your account will be permanently frozen in 10 minutes."', confidence:94, tactics:['SCARCITY','FEAR'], source:'FBI IC3 2024' },
        { id:4, time:'00:52', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"I need your account number and the 6-digit verification code."', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'GASA 2024' },
        { id:5, time:'01:06', severity:'high', pattern:'Isolation Tactic', quote:'"Do NOT share this with anyone except our verified department."', confidence:91, tactics:['ISOLATION','AUTHORITY'], source:'FTC Sentinel' },
      ],
    },
    {
      id: 'en_tech',
      callerNumber: '+1 (XXX) XXX-XX87',
      title: 'Tech Support Scam',
      severity: 'high',
      description: 'Caller claims your device is compromised.',
      dialog: [
        { speaker:'caller', text:'Hello, this is the Security Operations Center. We are calling because our system has flagged your computer for a critical security breach.', time:'00:03', delay:0 },
        { speaker:'me', text:'What? What kind of breach?', time:'00:08', delay:5000 },
        { speaker:'caller', text:'Our monitoring detected that your IP address has been compromised. Hackers are actively accessing your personal files and your online banking credentials as we speak.', time:'00:16', delay:8000 },
        { speaker:'me', text:'That sounds really serious. What should I do?', time:'00:21', delay:5000 },
        { speaker:'caller', text:'Don\'t worry, I\'m here to help you. But we need to act quickly before the hackers do more damage. First, I need you to install a remote access tool so I can secure your system.', time:'00:30', delay:9000 },
        { speaker:'me', text:'Remote access? Is that safe?', time:'00:35', delay:5000 },
        { speaker:'caller', text:'Absolutely, this is industry standard procedure. All major companies use this. I will need you to download the software from the link I\'m about to give you and grant me access to scan your system.', time:'00:44', delay:9000, flagged:true },
        { speaker:'caller', text:'If we don\'t act immediately, your credit cards and bank accounts will be drained. You must install this now — we cannot protect you otherwise.', time:'00:53', delay:9000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:03', severity:'high', pattern:'Tech Support Impersonation', quote:'"This is the Security Operations Center."', confidence:92, tactics:['AUTHORITY'], source:'FBI IC3 2024' },
        { id:2, time:'00:16', severity:'high', pattern:'Artificial Urgency', quote:'"Hackers are actively accessing your credentials as we speak."', confidence:85, tactics:['FEAR','SCARCITY'], source:'GASA 2024' },
        { id:3, time:'00:44', severity:'critical', pattern:'Remote Access Takeover', quote:'"I need you to install a remote access tool."', confidence:96, tactics:['AUTHORITY','COMPLIANCE'], source:'FBI IC3 2024' },
        { id:4, time:'00:53', severity:'critical', pattern:'Artificial Urgency', quote:'"Your credit cards and bank accounts will be drained."', confidence:94, tactics:['FEAR','SCARCITY'], source:'FTC Sentinel' },
      ],
    },
    {
      id: 'en_gov',
      callerNumber: '+1 (XXX) XXX-XX15',
      title: 'Government / Tax Scam',
      severity: 'critical',
      description: 'Caller threatens arrest from fake government agency.',
      dialog: [
        { speaker:'caller', text:'This is an enforcement officer from the Federal Tax Division. Am I speaking to the registered taxpayer at this number?', time:'00:03', delay:0 },
        { speaker:'me', text:'Yes, that\'s me. What is this about?', time:'00:08', delay:5000 },
        { speaker:'caller', text:'I\'m calling to inform you that there is a serious discrepancy in your tax filings. Our investigation has found that you owe a significant amount in back taxes and penalties.', time:'00:17', delay:9000 },
        { speaker:'me', text:'I don\'t think that\'s right. I filed my taxes correctly.', time:'00:22', delay:5000 },
        { speaker:'caller', text:'Our records indicate otherwise. I need to inform you that an arrest warrant has been issued in your name. However, you have a chance to resolve this right now by settling the outstanding balance.', time:'00:33', delay:11000 },
        { speaker:'me', text:'An arrest warrant? That can\'t be right.', time:'00:37', delay:4000 },
        { speaker:'caller', text:'I understand this is alarming. But if you do not settle today, officers will be dispatched to your residence. The only way to stop this is to purchase prepaid debit cards totaling $3,000 and read me the card numbers immediately.', time:'00:48', delay:11000, flagged:true },
        { speaker:'caller', text:'Do not tell anyone about this call. This is a federal matter and disclosure could result in additional charges against you.', time:'00:57', delay:9000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:03', severity:'critical', pattern:'Government Impersonation', quote:'"This is an enforcement officer from the Federal Tax Division."', confidence:96, tactics:['AUTHORITY'], source:'FBI IC3 2024' },
        { id:2, time:'00:33', severity:'critical', pattern:'Fake Warrant / Legal Threat', quote:'"An arrest warrant has been issued in your name."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'FBI IC3 2024' },
        { id:3, time:'00:48', severity:'critical', pattern:'Gift Card Demand', quote:'"Purchase prepaid debit cards and read me the card numbers."', confidence:99, tactics:['AUTHORITY','URGENCY'], source:'FTC Sentinel' },
        { id:4, time:'00:57', severity:'high', pattern:'Isolation Tactic', quote:'"Do not tell anyone about this call."', confidence:93, tactics:['ISOLATION','AUTHORITY'], source:'GASA 2024' },
      ],
    },
    {
      id: 'en_romance',
      callerNumber: '+1 (XXX) XXX-XX63',
      title: 'Romance Scam / Sextortion',
      severity: 'critical',
      description: 'Threatens to expose intimate content unless victim pays.',
      dialog: [
        { speaker:'caller', text:'Hey, it\'s me. We need to talk about something important. I know this is awkward.', time:'00:03', delay:0 },
        { speaker:'me', text:'What do you mean? Who is this?', time:'00:07', delay:4000 },
        { speaker:'caller', text:'Don\'t pretend you don\'t know me. We\'ve been chatting for months. I have all of our conversations saved — including the private photos and videos you sent me.', time:'00:16', delay:9000 },
        { speaker:'me', text:'What photos? What are you talking about?', time:'00:20', delay:4000 },
        { speaker:'caller', text:'You know exactly what I\'m talking about. The intimate content you shared with me. I have screenshots of everything — your face is clearly visible in all of them.', time:'00:29', delay:9000 },
        { speaker:'me', text:'This has to be some kind of mistake...', time:'00:33', delay:4000 },
        { speaker:'caller', text:'It\'s not a mistake. Here\'s what\'s going to happen. If you don\'t send me $2,000 in Bitcoin within the next hour, I will share all of these photos with your entire contact list — your friends, family, coworkers, everyone.', time:'00:44', delay:11000, flagged:true },
        { speaker:'caller', text:'I already have your social media contacts downloaded. Don\'t test me. Send the Bitcoin to this wallet address now, or your reputation is finished.', time:'00:54', delay:10000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:16', severity:'high', pattern:'Isolation Tactic', quote:'"I have all of our conversations saved including private photos."', confidence:85, tactics:['FEAR','ISOLATION'], source:'GASA 2024' },
        { id:2, time:'00:29', severity:'critical', pattern:'Extortion / Blackmail', quote:'"Intimate content... your face is clearly visible."', confidence:94, tactics:['FEAR','ISOLATION'], source:'FBI IC3 2024' },
        { id:3, time:'00:44', severity:'critical', pattern:'Romance Scam / Sextortion', quote:'"Send me $2,000 in Bitcoin or I share photos with everyone."', confidence:98, tactics:['FEAR','ISOLATION'], source:'FBI IC3 2024' },
        { id:4, time:'00:54', severity:'critical', pattern:'Crypto Transfer Scam', quote:'"Send the Bitcoin to this wallet address now."', confidence:97, tactics:['FEAR','URGENCY'], source:'FTC Sentinel' },
      ],
    },
    {
      id: 'en_crypto',
      callerNumber: '+1 (XXX) XXX-XX29',
      title: 'Crypto Investment Scam',
      severity: 'critical',
      description: 'Promises guaranteed crypto returns to steal funds.',
      dialog: [
        { speaker:'caller', text:'Hi there! I got your number from a mutual friend. I\'ve been helping people earn passive income through a crypto investment group and I thought you might be interested.', time:'00:04', delay:0 },
        { speaker:'me', text:'Oh really? I\'ve heard about crypto but I don\'t know much about it.', time:'00:10', delay:6000 },
        { speaker:'caller', text:'That\'s totally fine. You don\'t need to know anything — our platform does everything automatically. Members are making 300% returns in just 30 days. I can show you proof.', time:'00:20', delay:10000 },
        { speaker:'me', text:'300%? That sounds too good to be true.', time:'00:25', delay:5000 },
        { speaker:'caller', text:'I know it sounds unbelievable, but this is powered by a proprietary AI trading algorithm. Zero risk, guaranteed profits. There are only 5 spots left in this round — once they\'re full, registration closes.', time:'00:36', delay:11000, flagged:true },
        { speaker:'me', text:'How much would I need to start?', time:'00:40', delay:4000 },
        { speaker:'caller', text:'Just $500 in USDT to start. I\'ll send you the wallet address right now. You need to transfer within the next 30 minutes before the round closes. Your first withdrawal will be available in 48 hours.', time:'00:51', delay:11000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:20', severity:'high', pattern:'Investment Fraud', quote:'"Members are making 300% returns in just 30 days."', confidence:94, tactics:['GREED','SCARCITY'], source:'FBI IC3 2024' },
        { id:2, time:'00:36', severity:'critical', pattern:'Investment Fraud', quote:'"Zero risk, guaranteed profits. Only 5 spots left."', confidence:97, tactics:['GREED','SCARCITY'], source:'FBI IC3 2024' },
        { id:3, time:'00:51', severity:'critical', pattern:'Crypto Transfer Scam', quote:'"Transfer $500 in USDT to this wallet address."', confidence:98, tactics:['URGENCY','GREED'], source:'FTC Sentinel' },
      ],
    },
    {
      id: 'en_family',
      callerNumber: '+1 (XXX) XXX-XX71',
      title: 'Family Emergency Scam',
      severity: 'high',
      description: 'Caller impersonates a family member in distress.',
      dialog: [
        { speaker:'caller', text:'Mom? Mom, is that you? Please, I need help.', time:'00:02', delay:0 },
        { speaker:'me', text:'Who is this? What happened?', time:'00:06', delay:4000 },
        { speaker:'caller', text:'It\'s me, your son! I was in a car accident and I\'m at the hospital right now. They won\'t treat me until I pay the medical deposit.', time:'00:14', delay:8000 },
        { speaker:'me', text:'Oh my God! Are you okay? Which hospital?', time:'00:18', delay:4000 },
        { speaker:'caller', text:'I\'m okay but I\'m in a lot of pain. Please don\'t call Dad — he\'ll be so upset with me. The doctor says I need surgery but they need $5,000 for the deposit. Can you send it right away?', time:'00:29', delay:11000, flagged:true },
        { speaker:'me', text:'$5,000? Let me think about this...', time:'00:33', delay:4000 },
        { speaker:'caller', text:'Mom please, there\'s no time! The doctor says if I don\'t get surgery within the hour, my condition could get much worse. I need you to wire transfer the money right now. Please don\'t tell anyone — I\'m so embarrassed about this.', time:'00:44', delay:11000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:14', severity:'high', pattern:'Family Impersonation', quote:'"It\'s me, your son! I was in a car accident."', confidence:89, tactics:['FEAR','RECIPROCITY'], source:'FTC Sentinel' },
        { id:2, time:'00:29', severity:'high', pattern:'Isolation Tactic', quote:'"Please don\'t call Dad — he\'ll be so upset."', confidence:91, tactics:['ISOLATION','FEAR'], source:'GASA 2024' },
        { id:3, time:'00:44', severity:'critical', pattern:'Artificial Urgency', quote:'"Surgery within the hour or condition gets worse."', confidence:95, tactics:['FEAR','SCARCITY'], source:'FBI IC3 2024' },
        { id:4, time:'00:44', severity:'critical', pattern:'Wire Transfer Instruction', quote:'"Wire transfer the money right now."', confidence:96, tactics:['AUTHORITY','URGENCY'], source:'FBI IC3 2024' },
      ],
    },
  ],
  id: [
    {
      id: 'id_bank',
      callerNumber: '+62 XXX-XXXX-XX38',
      title: 'Penipuan Bank',
      severity: 'critical',
      description: 'Penelepon mengaku dari divisi keamanan bank.',
      dialog: [
        { speaker:'caller', text:'Halo, selamat siang. Saya dari divisi keamanan rekening bank. Apakah benar ini dengan pemegang rekening?', time:'00:03', delay:0 },
        { speaker:'me', text:'Iya benar, ada apa ya?', time:'00:08', delay:5000 },
        { speaker:'caller', text:'Kami mendeteksi adanya transaksi mencurigakan di rekening Bapak/Ibu. Ada percobaan penarikan dari lokasi yang tidak biasa.', time:'00:15', delay:7000 },
        { speaker:'me', text:'Wah serius? Saya tidak merasa melakukan transaksi itu.', time:'00:20', delay:5000 },
        { speaker:'caller', text:'Benar, maka dari itu kami perlu segera memverifikasi identitas Anda untuk memblokir transaksi yang tidak sah ini. Prosedur standar keamanan kami.', time:'00:29', delay:9000 },
        { speaker:'me', text:'Oh baik, apa yang perlu saya lakukan?', time:'00:33', delay:4000 },
        { speaker:'caller', text:'Pertama, bisakah Anda mengkonfirmasi nomor rekening Anda? Ini standar prosedur verifikasi kami.', time:'00:40', delay:7000 },
        { speaker:'me', text:'Nomor rekening saya... 1234...', time:'00:45', delay:5000 },
        { speaker:'caller', text:'Baik. Sekarang untuk verifikasi terakhir, kami telah mengirimkan kode OTP ke nomor handphone Anda. Tolong bacakan kode 6 digit tersebut. Jika tidak segera diverifikasi, rekening akan dibekukan otomatis dalam 5 menit.', time:'00:55', delay:10000, flagged:true },
        { speaker:'caller', text:'Ingat, jangan beritahukan kode ini kepada siapapun selain petugas resmi kami. Ini demi keamanan rekening Anda.', time:'01:04', delay:9000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:03', severity:'critical', pattern:'Bank Impersonation', quote:'"Saya dari divisi keamanan rekening bank."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'FTC Sentinel' },
        { id:2, time:'00:29', severity:'high', pattern:'Artificial Urgency', quote:'"Kami perlu segera memverifikasi identitas Anda."', confidence:88, tactics:['SCARCITY','AUTHORITY'], source:'GASA 2024' },
        { id:3, time:'00:55', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"Bacakan kode 6 digit OTP tersebut."', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'GASA 2024' },
        { id:4, time:'01:04', severity:'high', pattern:'Isolation Tactic', quote:'"Jangan beritahukan kode ini kepada siapapun."', confidence:91, tactics:['ISOLATION','AUTHORITY'], source:'FTC Sentinel' },
      ],
    },
    {
      id: 'id_pinjol',
      callerNumber: '+62 XXX-XXXX-XX54',
      title: 'Penipuan Pinjaman Online (Pinjol)',
      severity: 'high',
      description: 'Debt collector pinjol ilegal mengancam sebarkan data.',
      dialog: [
        { speaker:'caller', text:'Halo Pak/Ibu, saya dari bagian penagihan. Saya ingin menginformasikan bahwa Anda memiliki tunggakan pinjaman yang sudah jatuh tempo.', time:'00:03', delay:0 },
        { speaker:'me', text:'Pinjaman apa? Saya tidak merasa punya pinjaman.', time:'00:08', delay:5000 },
        { speaker:'caller', text:'Menurut data kami, Anda terdaftar sebagai peminjam. Tunggakan Anda sudah sangat besar dan terus bertambah setiap hari. Anda harus segera melunasi agar tidak ada masalah.', time:'00:18', delay:10000 },
        { speaker:'me', text:'Saya benar-benar tidak pernah mengajukan pinjaman.', time:'00:23', delay:5000 },
        { speaker:'caller', text:'Pak/Ibu, data kami sudah jelas. KTP Anda terdaftar di sistem kami. Jika Anda tidak melunasi hari ini, kami akan menghubungi semua kontak di handphone Anda.', time:'00:33', delay:10000, flagged:true },
        { speaker:'me', text:'Apa? Menghubungi kontak saya? Itu tidak boleh!', time:'00:37', delay:4000 },
        { speaker:'caller', text:'Kami sudah memiliki akses ke daftar kontak Anda, foto-foto pribadi, dan data KTP Anda. Jika tidak bayar dalam 2 jam, kami akan sebarkan semua data ini ke media sosial dan ke semua kontak di HP Anda. Transfer sekarang ke rekening ini.', time:'00:49', delay:12000, flagged:true },
        { speaker:'caller', text:'Jangan lapor ke polisi — ini urusan utang Anda sendiri. Polisi tidak akan membantu soal utang. Bayar sekarang atau malu sendiri.', time:'00:59', delay:10000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:18', severity:'high', pattern:'Artificial Urgency', quote:'"Tunggakan bertambah setiap hari."', confidence:82, tactics:['FEAR','SCARCITY'], source:'GASA 2024' },
        { id:2, time:'00:33', severity:'high', pattern:'Pinjol Harassment (ID)', quote:'"Kami akan menghubungi semua kontak di handphone Anda."', confidence:94, tactics:['FEAR','ISOLATION'], source:'GASA 2024' },
        { id:3, time:'00:49', severity:'critical', pattern:'Extortion / Blackmail', quote:'"Sebarkan data dan foto ke media sosial."', confidence:97, tactics:['FEAR','ISOLATION'], source:'GASA 2024' },
        { id:4, time:'00:59', severity:'high', pattern:'Isolation Tactic', quote:'"Jangan lapor ke polisi."', confidence:91, tactics:['ISOLATION','FEAR'], source:'GASA 2024' },
      ],
    },
    {
      id: 'id_mama',
      callerNumber: '+62 XXX-XXXX-XX76',
      title: 'Mama Minta Pulsa',
      severity: 'medium',
      description: 'Mengaku keluarga minta pulsa atau transfer darurat.',
      dialog: [
        { speaker:'caller', text:'Halo nak, ini mama. Mama lagi di rumah sakit mendampingi tante kamu yang sakit.', time:'00:03', delay:0 },
        { speaker:'me', text:'Hah? Tante sakit? Tante siapa Ma?', time:'00:08', delay:5000 },
        { speaker:'caller', text:'Tante Sri. Dia masuk UGD tadi siang. Kondisinya gawat dan dokter bilang harus segera operasi. Mama panik sekali nak.', time:'00:17', delay:9000 },
        { speaker:'me', text:'Ya ampun, semoga cepat sembuh. Ada yang bisa saya bantu?', time:'00:22', delay:5000 },
        { speaker:'caller', text:'Nak, mama butuh bantuan. Handphone mama kehabisan pulsa dan mama tidak bisa hubungi siapa-siapa. Bisakah kamu kirimkan pulsa atau transfer sedikit uang ke nomor ini? Darurat sekali nak.', time:'00:33', delay:11000, flagged:true },
        { speaker:'me', text:'Berapa Ma? Dan ini nomor siapa?', time:'00:37', delay:4000 },
        { speaker:'caller', text:'Kirimkan 500 ribu dulu nak ke nomor ini. Mama juga butuh untuk bayar deposit rumah sakit. Jangan bilang papa dulu ya, nanti mama yang ceritain. Cepat ya nak, mama sangat butuh sekarang.', time:'00:48', delay:11000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:03', severity:'medium', pattern:'Mama Minta Pulsa (ID)', quote:'"Ini mama, mama lagi di rumah sakit."', confidence:82, tactics:['RECIPROCITY','FEAR'], source:'GASA 2024' },
        { id:2, time:'00:33', severity:'high', pattern:'Family Impersonation', quote:'"Kirimkan pulsa atau transfer uang ke nomor ini."', confidence:88, tactics:['RECIPROCITY','FEAR'], source:'GASA 2024' },
        { id:3, time:'00:48', severity:'high', pattern:'Isolation Tactic', quote:'"Jangan bilang papa dulu."', confidence:90, tactics:['ISOLATION','RECIPROCITY'], source:'GASA 2024' },
      ],
    },
    {
      id: 'id_giveaway',
      callerNumber: '+62 XXX-XXXX-XX91',
      title: 'Giveaway Palsu / Undian Berhadiah',
      severity: 'medium',
      description: 'Mengaku dari program giveaway dengan hadiah jutaan.',
      dialog: [
        { speaker:'caller', text:'Selamat! Saya menghubungi Anda karena nomor Anda terpilih sebagai pemenang program undian berhadiah nasional. Anda memenangkan 50 juta rupiah!', time:'00:04', delay:0 },
        { speaker:'me', text:'Wah serius? Saya tidak pernah ikut undian apa-apa.', time:'00:09', delay:5000 },
        { speaker:'caller', text:'Undian ini otomatis untuk semua pengguna provider seluler Anda. Nomor Anda terpilih secara acak oleh sistem komputer kami. Ini resmi dari perusahaan.', time:'00:19', delay:10000 },
        { speaker:'me', text:'Hmm, tapi saya benar-benar tidak pernah mendaftar.', time:'00:24', delay:5000 },
        { speaker:'caller', text:'Tidak perlu mendaftar, ini program loyalitas pelanggan. Untuk mencairkan hadiah Anda, cukup bayar pajak hadiah sebesar 1.5 juta ke rekening perusahaan kami. Setelah itu, 50 juta langsung masuk ke rekening Anda.', time:'00:36', delay:12000, flagged:true },
        { speaker:'caller', text:'Tapi ini harus dilakukan hari ini karena batas waktu pencairan hanya sampai jam 5 sore. Lewat dari itu, hadiah akan hangus dan dialihkan ke pemenang cadangan.', time:'00:46', delay:10000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:04', severity:'medium', pattern:'Fake Prize / Lottery', quote:'"Anda memenangkan 50 juta rupiah!"', confidence:92, tactics:['GREED','RECIPROCITY'], source:'FTC Sentinel' },
        { id:2, time:'00:36', severity:'high', pattern:'Advance Fee Fraud', quote:'"Bayar pajak hadiah sebesar 1.5 juta."', confidence:96, tactics:['GREED','COMMITMENT'], source:'GASA 2024' },
        { id:3, time:'00:46', severity:'high', pattern:'Artificial Urgency', quote:'"Batas waktu pencairan hanya sampai jam 5 sore."', confidence:90, tactics:['SCARCITY','URGENCY'], source:'GASA 2024' },
      ],
    },
    {
      id: 'id_romance',
      callerNumber: '+62 XXX-XXXX-XX17',
      title: 'Penipuan Asmara / Pemerasan',
      severity: 'critical',
      description: 'Mengancam sebarkan foto/video intim korban.',
      dialog: [
        { speaker:'caller', text:'Halo sayang, aku mau bicara serius sama kamu. Kita sudah saling kenal cukup lama kan.', time:'00:03', delay:0 },
        { speaker:'me', text:'Ya, ada apa? Kenapa serius?', time:'00:07', delay:4000 },
        { speaker:'caller', text:'Kamu ingat kan semua percakapan kita? Foto-foto dan video yang kamu kirim ke aku? Aku simpan semuanya.', time:'00:15', delay:8000 },
        { speaker:'me', text:'Apa maksudmu?', time:'00:18', delay:3000 },
        { speaker:'caller', text:'Aku sudah punya semua screenshot percakapan dan foto-foto intim kamu. Wajah kamu jelas terlihat di semuanya. Aku juga sudah punya daftar kontak kamu — keluarga, teman kantor, semuanya.', time:'00:29', delay:11000, flagged:true },
        { speaker:'me', text:'Kamu mau apa sebenarnya?', time:'00:33', delay:4000 },
        { speaker:'caller', text:'Begini, kalau kamu tidak mau malu, transfer 5 juta ke rekening ini dalam waktu 1 jam. Kalau tidak, semua foto dan video kamu akan aku sebarkan ke semua kontak, media sosial, bahkan atasan kamu di kantor.', time:'00:45', delay:12000, flagged:true },
        { speaker:'caller', text:'Jangan coba-coba lapor polisi. Kalau aku tahu kamu lapor, aku langsung sebarkan semuanya. Transfer sekarang atau menyesal selamanya.', time:'00:55', delay:10000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:29', severity:'critical', pattern:'Extortion / Blackmail', quote:'"Foto-foto intim kamu, wajah kamu jelas terlihat."', confidence:96, tactics:['FEAR','ISOLATION'], source:'GASA 2024' },
        { id:2, time:'00:45', severity:'critical', pattern:'Penipuan Asmara / Pemerasan (ID)', quote:'"Transfer 5 juta atau foto disebarkan ke semua kontak."', confidence:98, tactics:['FEAR','ISOLATION'], source:'GASA 2024' },
        { id:3, time:'00:55', severity:'high', pattern:'Isolation Tactic', quote:'"Jangan coba-coba lapor polisi."', confidence:93, tactics:['ISOLATION','FEAR'], source:'GASA 2024' },
      ],
    },
    {
      id: 'id_crypto',
      callerNumber: '+62 XXX-XXXX-XX43',
      title: 'Penipuan Kripto / Investasi Bodong',
      severity: 'critical',
      description: 'Menjanjikan keuntungan kripto yang tidak realistis.',
      dialog: [
        { speaker:'caller', text:'Halo! Saya dapat nomor Anda dari grup investasi. Saya mau sharing peluang yang sangat menguntungkan — banyak member kami sudah profit besar.', time:'00:04', delay:0 },
        { speaker:'me', text:'Peluang apa ini?', time:'00:08', delay:4000 },
        { speaker:'caller', text:'Ini platform trading crypto dengan AI otomatis. Member kami rata-rata profit 200-300% dalam sebulan. Tanpa risiko karena sistemnya sudah dioptimalkan oleh ahli.', time:'00:19', delay:11000 },
        { speaker:'me', text:'300% dalam sebulan? Itu sangat besar.', time:'00:24', delay:5000 },
        { speaker:'caller', text:'Memang luar biasa! Ini karena teknologi AI trading kami yang eksklusif. Tapi slot terbatas — hanya tersisa 3 tempat lagi untuk round ini. Kalau penuh, harus tunggu bulan depan.', time:'00:36', delay:12000, flagged:true },
        { speaker:'me', text:'Berapa modalnya?', time:'00:39', delay:3000 },
        { speaker:'caller', text:'Cukup mulai dari 5 juta rupiah dalam bentuk USDT. Saya kirimkan alamat wallet sekarang. Harus transfer dalam 30 menit sebelum round ditutup. Penarikan pertama bisa dilakukan dalam 48 jam.', time:'00:51', delay:12000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:19', severity:'high', pattern:'Investment Fraud', quote:'"Profit 200-300% dalam sebulan, tanpa risiko."', confidence:94, tactics:['GREED','SCARCITY'], source:'FBI IC3 2024' },
        { id:2, time:'00:36', severity:'critical', pattern:'Investment Fraud', quote:'"Slot terbatas, hanya tersisa 3 tempat."', confidence:96, tactics:['SCARCITY','GREED'], source:'GASA 2024' },
        { id:3, time:'00:51', severity:'critical', pattern:'Crypto Transfer Scam', quote:'"Transfer 5 juta USDT ke alamat wallet ini."', confidence:98, tactics:['URGENCY','GREED'], source:'FTC Sentinel' },
      ],
    },
    {
      id: 'id_family',
      callerNumber: '+62 XXX-XXXX-XX82',
      title: 'Penipuan Identitas Keluarga',
      severity: 'high',
      description: 'Mengaku anggota keluarga yang kecelakaan atau sakit.',
      dialog: [
        { speaker:'caller', text:'Halo kak, ini adikmu. Kak tolong, aku lagi dalam masalah besar.', time:'00:02', delay:0 },
        { speaker:'me', text:'Adik? Adik yang mana?', time:'00:06', delay:4000 },
        { speaker:'caller', text:'Ini aku kak, adikmu! Aku habis kecelakaan motor di jalan, sekarang di rumah sakit. Tangan aku patah dan dokter bilang harus segera operasi.', time:'00:15', delay:9000 },
        { speaker:'me', text:'Ya ampun! Kamu di rumah sakit mana?', time:'00:19', delay:4000 },
        { speaker:'caller', text:'Aku di UGD sekarang kak. Tapi masalahnya, rumah sakit minta deposit 3 juta dulu sebelum operasi. Aku tidak bawa dompet dan HP aku hampir mati. Tolong kak, transfer ke nomor perawat ini.', time:'00:31', delay:12000, flagged:true },
        { speaker:'me', text:'Tunggu, 3 juta? Ke nomor perawat?', time:'00:35', delay:4000 },
        { speaker:'caller', text:'Iya kak, cepat ya. Dokternya bilang kalau tidak segera dioperasi bisa infeksi. Jangan bilang mama dulu, nanti mama panik. Aku yang cerita sendiri nanti setelah operasi. Transfer sekarang ya kak, aku kesakitan.', time:'00:47', delay:12000, flagged:true },
      ],
      alerts: [
        { id:1, time:'00:15', severity:'high', pattern:'Family Impersonation', quote:'"Ini adikmu, aku habis kecelakaan motor."', confidence:89, tactics:['FEAR','RECIPROCITY'], source:'FTC Sentinel' },
        { id:2, time:'00:31', severity:'high', pattern:'Wire Transfer Instruction', quote:'"Transfer ke nomor perawat ini."', confidence:90, tactics:['AUTHORITY','URGENCY'], source:'GASA 2024' },
        { id:3, time:'00:47', severity:'high', pattern:'Isolation Tactic', quote:'"Jangan bilang mama dulu."', confidence:92, tactics:['ISOLATION','RECIPROCITY'], source:'GASA 2024' },
      ],
    },
  ],
}

// ── Demo/mock alerts (legacy compat) ─────────────────────────────────────────
export const MOCK_ALERTS = [
  { id:1, time:"00:23", severity:"critical", pattern:"Bank Impersonation",         quote:'"I am calling from your bank fraud prevention - we detected suspicious activity on your account."',  confidence:97, tactics:["AUTHORITY","FEAR"],        source:"FTC Sentinel"  },
  { id:2, time:"01:07", severity:"critical", pattern:"Artificial Urgency",         quote:'"Your account will be permanently frozen in 10 minutes if you do not act right now."',                confidence:94, tactics:["SCARCITY","FEAR"],        source:"FBI IC3 2024"  },
  { id:3, time:"01:52", severity:"critical", pattern:"OTP / Credential Extraction",quote:'"Please read me the 6-digit verification code that was just sent to your phone."',                    confidence:99, tactics:["AUTHORITY","COMMITMENT"],  source:"GASA 2024"     },
  { id:4, time:"02:31", severity:"high",     pattern:"Isolation Tactic",           quote:'"Do not discuss this with your family - this is a confidential fraud investigation."',                confidence:91, tactics:["ISOLATION","AUTHORITY"],   source:"FTC Sentinel"  },
]

// ── Caller Number Display ────────────────────────────────
// Shows masked caller number in caller HUD based on country code
export const CALLER_NUMBER_PREFIX = {
  en: '+1',
  id: '+62',
  zh: '+86',
  ja: '+81',
  ko: '+82',
  es: '+34',
  fr: '+33',
  hi: '+91',
  ar: '+966',
  ms: '+60',
  pt: '+55',
  de: '+49',
  ru: '+7',
  th: '+66',
  vi: '+84',
  tr: '+90',
}

// Generate a masked caller number for display
export function getCallerNumber(langCode, scriptCallerNumber) {
  // If script provides a specific number, use it
  if (scriptCallerNumber) return scriptCallerNumber
  // Otherwise generate masked number from country code
  const base = langCode?.split('-')[0] || 'en'
  const prefix = CALLER_NUMBER_PREFIX[base] || '+1'
  const lastTwo = String(Math.floor(Math.random() * 99)).padStart(2, '0')
  if (prefix === '+1') return `${prefix} (XXX) XXX-XX${lastTwo}`
  if (prefix === '+62') return `${prefix} XXX-XXXX-XX${lastTwo}`
  if (prefix === '+86') return `${prefix} XXX-XXXX-XX${lastTwo}`
  if (prefix === '+81') return `${prefix} XX-XXXX-XX${lastTwo}`
  if (prefix === '+82') return `${prefix} XX-XXXX-XX${lastTwo}`
  return `${prefix} XXXXXXXX${lastTwo}`
}
