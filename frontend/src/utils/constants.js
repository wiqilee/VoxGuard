// ── Scam Patterns — grounded from FTC / FBI IC3 / GASA / MAS / ACCC ──
export const SCAM_PATTERNS = [
  { id:1,  category:"Bank Impersonation",         severity:"critical", description:"Caller poses as fraud prevention from a financial institution, manufacturing panic about account security to extract credentials.",                      markers:["suspicious activity detected","account will be frozen","verify your identity","fraud alert"],          mechanism:"AUTHORITY + FEAR",             source:"FBI IC3 2024",  detected:false },
  { id:2,  category:"OTP / Credential Extraction",severity:"critical", description:"Solicits one-time passwords, PINs, passwords, or account numbers under false pretenses of verification or security.",                                    markers:["read me the code","verification number","confirm your PIN","security code"],                            mechanism:"AUTHORITY + COMPLIANCE",       source:"FTC Sentinel",  detected:false },
  { id:3,  category:"Artificial Urgency",          severity:"critical", description:"Creates false time pressure to prevent the victim from thinking clearly, consulting others, or recognizing the manipulation.",                              markers:["act now","expires in minutes","last chance","within the hour","immediately"],                             mechanism:"SCARCITY + PANIC",             source:"GASA 2024",     detected:false },
  { id:4,  category:"Safe Account Transfer",       severity:"critical", description:"Instructs victim to move funds to a 'secure' or 'protection' account secretly controlled by the scammer.",                                                markers:["safe account","protection account","transfer your funds","secure your money"],                            mechanism:"AUTHORITY + FEAR",             source:"FTC Sentinel",  detected:false },
  { id:5,  category:"Investment Fraud",            severity:"high",     description:"Promises guaranteed, unrealistic returns on investments with no risk — classic hallmarks of Ponzi and pyramid schemes.",                                    markers:["guaranteed returns","zero risk","300% profit","insider opportunity","limited positions"],                  mechanism:"GREED + SCARCITY",             source:"FBI IC3 2024",  detected:false },
  { id:6,  category:"Romance Manipulation",        severity:"high",     description:"Exploits an emotional connection built over time — often weeks or months — to extract money or sensitive information.",                                     markers:["I need your help","emergency situation","I thought you cared","just this once","please trust me"],          mechanism:"RECIPROCITY + EMOTIONAL BOND", source:"FTC Sentinel",  detected:false },
  { id:7,  category:"Tech Support Impersonation",  severity:"high",     description:"Poses as Microsoft, Apple, Google, or an ISP to gain remote access to the victim's device under the pretense of fixing a security issue.",                 markers:["virus detected","your computer is compromised","download this tool","remote access","TeamViewer"],          mechanism:"AUTHORITY + FEAR",             source:"FBI IC3 2024",  detected:false },
  { id:8,  category:"Isolation Tactic",            severity:"high",     description:"Instructs victim not to discuss the situation with family, friends, or authorities — a key control mechanism in prolonged scam operations.",               markers:["don't tell anyone","keep this confidential","your family won't understand","between us","top secret"],      mechanism:"ISOLATION + CONTROL",          source:"GASA 2024",     detected:false },
  { id:9,  category:"Gift Card Demand",            severity:"high",     description:"Requests payment via gift cards (Google Play, iTunes, Steam, Amazon) as an untraceable and irreversible transfer method.",                                  markers:["buy Google Play cards","iTunes gift card","Steam cards","scratch the back","read me the numbers"],          mechanism:"AUTHORITY + URGENCY",          source:"FTC Sentinel",  detected:false },
  { id:10, category:"Government Impersonation",    severity:"critical", description:"Poses as IRS, Social Security Administration, USCIS, or law enforcement to threaten arrest, deportation, or legal consequences.",                           markers:["IRS","Social Security","arrest warrant","legal action","deportation","badge number"],                      mechanism:"AUTHORITY + FEAR",             source:"FBI IC3 2024",  detected:false },
  { id:11, category:"Crypto Transfer Scam",        severity:"critical", description:"Instructs victim to send cryptocurrency to an 'investment wallet', 'recovery account', or 'escrow' — all controlled by the scammer.",                      markers:["send Bitcoin","crypto wallet","blockchain recovery","USDT transfer","DeFi protocol"],                       mechanism:"AUTHORITY + GREED",            source:"FTC Sentinel",  detected:false },
  { id:12, category:"Fake Prize / Lottery",        severity:"medium",   description:"Claims the victim has won a prize, lottery, or sweepstakes that requires a processing fee, tax, or insurance payment to release.",                          markers:["you've been selected","claim your prize","processing fee","release your winnings","congratulations"],       mechanism:"GREED + RECIPROCITY",          source:"FTC Sentinel",  detected:false },
]

// ── Psychological manipulation vectors (Cialdini + FBI behavioral) ──
export const PSYCH_TACTICS = [
  { id:"SCARCITY",    label:"Scarcity",    icon:"⏱", desc:"Creates artificial time pressure or limited availability to force hasty decisions.",                 color:"#ff2d55" },
  { id:"AUTHORITY",   label:"Authority",   icon:"🏛", desc:"Impersonates trusted institutions (banks, government, tech companies) to bypass critical thinking.", color:"#ff9500" },
  { id:"FEAR",        label:"Fear",        icon:"⚡", desc:"Induces panic about account closure, arrest, device compromise, or family harm.",                     color:"#ff2d55" },
  { id:"RECIPROCITY", label:"Reciprocity", icon:"🔄", desc:"Creates false sense of obligation — 'we already helped you, now you must help us'.",                 color:"#ffd60a" },
  { id:"ISOLATION",   label:"Isolation",   icon:"🔒", desc:"Demands secrecy to cut off the victim from people who could identify the scam.",                      color:"#bf5af2" },
  { id:"COMMITMENT",  label:"Commitment",  icon:"📌", desc:"Traps victims in escalating compliance — each small agreement makes refusal harder.",                  color:"#30d158" },
]

// ── Severity config ────────────────────────────────────────────
export const SEV = {
  critical: { bg:"rgba(255,45,85,0.1)",  border:"#ff2d55", text:"#ff2d55", glow:"0 0 18px rgba(255,45,85,0.5)"  },
  high:     { bg:"rgba(255,149,0,0.1)",  border:"#ff9500", text:"#ff9500", glow:"0 0 18px rgba(255,149,0,0.4)"  },
  medium:   { bg:"rgba(255,214,10,0.08)",border:"#ffd60a", text:"#ffd60a", glow:"0 0 14px rgba(255,214,10,0.3)" },
  low:      { bg:"rgba(48,209,88,0.08)", border:"#30d158", text:"#30d158", glow:"0 0 12px rgba(48,209,88,0.3)"  },
}

// ── Demo/mock alerts for Vercel demo mode ─────────────────────
export const MOCK_ALERTS = [
  { id:1, time:"00:23", severity:"critical", pattern:"Bank Impersonation",         quote:'"I am calling from Chase Bank fraud prevention — we detected suspicious activity on your account."',  confidence:97, tactics:["AUTHORITY","FEAR"],        source:"FTC Sentinel"  },
  { id:2, time:"01:07", severity:"critical", pattern:"Artificial Urgency",         quote:'"Your account will be permanently frozen in 10 minutes if you do not act right now."',                confidence:94, tactics:["SCARCITY","FEAR"],        source:"FBI IC3 2024"  },
  { id:3, time:"01:52", severity:"critical", pattern:"OTP / Credential Extraction",quote:'"Please read me the 6-digit verification code that was just sent to your phone."',                    confidence:99, tactics:["AUTHORITY","COMMITMENT"],  source:"GASA 2024"     },
  { id:4, time:"02:31", severity:"high",     pattern:"Isolation Tactic",           quote:'"Do not discuss this with your family — this is a confidential fraud investigation."',                confidence:91, tactics:["ISOLATION","AUTHORITY"],   source:"FTC Sentinel"  },
]

// ── Fonts ──────────────────────────────────────────────────────
export const PF = "'Press Start 2P', monospace"  // pixel display
export const MF = "'Share Tech Mono', 'Courier New', monospace"  // mono body
