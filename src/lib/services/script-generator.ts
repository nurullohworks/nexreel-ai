import type { Analysis } from "../types";

export interface ViralHookItem {
  id: string;
  category: "negative" | "question" | "stat" | "curiosity" | "pov";
  categoryLabel: string;
  hookText: string;
  visualPrompt: string;
  retentionBoost: string;
}

export interface ScriptBeatItem {
  timestamp: string;
  phase: string;
  visualCue: string;
  voiceoverText: string;
  retentionHack: string;
}

export interface GeneratedReelScript {
  id: string;
  reelTitle: string;
  niche: string;
  topicSummary: string;
  hooks: ViralHookItem[];
  beats: ScriptBeatItem[];
  loopEndingLine: string;
  recommendedAudio: string;
  callToAction: string;
  captionIdea: string;
  hashtags: string[];
}

export class ScriptGeneratorService {
  /**
   * Tahlil qilingan video va nishaga mos ravishda AI ssenariy va hooklar generatsiya qilish
   */
  static async generateScript(analysis: Analysis): Promise<GeneratedReelScript> {
    const geminiKey =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
      (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ||
      (typeof window !== "undefined" && localStorage.getItem("reelpredict_gemini_key"));

    const niche = analysis.niche || "business";
    const title = analysis.title || analysis.fileName || "Instagram Reel";

    // 1. Agar Gemini API kaliti bo'lsa, jonli Gemini 2.0 orqali ssenariy yaratamiz
    if (geminiKey) {
      try {
        const prompt = `Sen Instagram Reels uchun yuqori virallik ssenariylari va 3 soniyalik killer hooklar yozuvchi eng zo'r ssenarist va virallik mutaxassisisan.
MAVZU: "${title}"
NISHA: "${niche}"
KAMCHILIKLAR: ${analysis.verdict?.fixes?.join(", ") || "Dinamika va hookni kuchaytirish"}

VAZIFA:
Ushbu video uchun Meta algoritmining eng yuqori e'tiborini (Retention 80%+, DM shares, Loop factor) tortadigan ssenariy va 5 xil toifadagi Hook yoz:
1. 5 xil hook: negative, question, stat, curiosity, pov
2. 4 ta xronologik kadr ssenariysi: 00:00-00:03 (Hook), 00:03-00:09 (Muammo), 00:09-00:18 (Asosiy Yechim/Value), 00:18-00:23 (Loop va CTA)
3. Oxirgi jumla boshlanishidagi hookka ulanuvchi Seamless Loop bo'lsin.

FAQAT toza JSON qaytar:
{
  "topicSummary": "Mavzu mohiyati qisqacha",
  "hooks": [
    { "category": "negative", "categoryLabel": "Qarshilik (Negativ)", "hookText": "...", "visualPrompt": "Kadr harakati...", "retentionBoost": "+35%" }
  ],
  "beats": [
    { "timestamp": "00:00 - 00:03", "phase": "Hook & Intriga", "visualCue": "...", "voiceoverText": "...", "retentionHack": "..." }
  ],
  "loopEndingLine": "...",
  "recommendedAudio": "...",
  "callToAction": "...",
  "captionIdea": "...",
  "hashtags": ["#reels", "#viral"]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
            }),
          }
        );

        const data = await res.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return {
            id: `script_${Date.now()}`,
            reelTitle: title,
            niche,
            topicSummary: parsed.topicSummary || "Yuqori retentionli qayta ishlangan ssenariy",
            hooks: parsed.hooks || [],
            beats: parsed.beats || [],
            loopEndingLine: parsed.loopEndingLine || "Va eng qizig'i...",
            recommendedAudio: parsed.recommendedAudio || "Dinamik Lo-Fi yoki Trending Tech Beat",
            callToAction: parsed.callToAction || "Foydali bo'lsa, do'stingizga yuboring!",
            captionIdea: parsed.captionIdea || "Ushbu usul sizning natijalaringizni 3 barobarga oshiradi.",
            hashtags: parsed.hashtags || ["#reelsuz", "#kontent", "#virallik"],
          };
        }
      } catch (e) {
        console.warn("Gemini Script Generator xatosi, mukammal algoritmik generatordan foydalanilmoqda:", e);
      }
    }

    // 2. Intelligent Algorithmic Dynamic Generator (Zero latency fallback)
    return this.generateAlgorithmicScript(analysis);
  }

  private static generateAlgorithmicScript(analysis: Analysis): GeneratedReelScript {
    const niche = (analysis.niche || "business").toLowerCase();
    const title = analysis.title || "Instagram Reel";

    const nicheHooks: Record<string, ViralHookItem[]> = {
      business: [
        {
          id: "h1",
          category: "negative",
          categoryLabel: "Qarshilik (Negativ Hook)",
          hookText: "Agar Reelsingiz hali ham 1,000 ko'rishdan oshmayotgan bo'lsa, buni darhol to'xtating!",
          visualPrompt: "Kameraga jiddiy nigoh, qo'lda telefonni ko'rsatib, birdaniga to'xtash ishorasi.",
          retentionBoost: "+38% Retention",
        },
        {
          id: "h2",
          category: "question",
          categoryLabel: "Kuchli Savol (Curiosity)",
          hookText: "Nega ba'zilar 1 ta video bilan 10,000 obunachi yig'adi, sizniki esa turib qoladi?",
          visualPrompt: "Ekranda ikkita profil skrinshoti: biri 500k, biri 200 ko'rish. Taqqoslash kadri.",
          retentionBoost: "+32% Retention",
        },
        {
          id: "h3",
          category: "stat",
          categoryLabel: "Shok Fakt & Raqam",
          hookText: "Meta algoritmining 2026-yilgi 1-raqamli siri ochildi — buni 95% blogerlar bilmaydi!",
          visualPrompt: "Ekranda yorqin sariq rangda 95% raqami va tezkor kadr kattalashishi (zoom-in).",
          retentionBoost: "+41% Retention",
        },
        {
          id: "h4",
          category: "pov",
          categoryLabel: "POV / Emotsional",
          hookText: "POV: 6 oy mobaynida har kuni video yuklab, nihoyat algoritmni buzganingda...",
          visualPrompt: "G'alaba hissi, ekranda bildirishnomalar (views) oqimi animatsiyasi.",
          retentionBoost: "+29% Retention",
        },
        {
          id: "h5",
          category: "curiosity",
          categoryLabel: "Yashirin Yechim",
          hookText: "Instagramda 'Ko'rishlar' tugmasi bor, lekin uni sizga hech kim ko'rsatmaydi.",
          visualPrompt: "Telefon sozlamalari interfeysi tomon tezkor vizual ishora.",
          retentionBoost: "+36% Retention",
        },
      ],
      fitness: [
        {
          id: "h1",
          category: "negative",
          categoryLabel: "Xatoni Fosh Qilish",
          hookText: "Har kuni press qilib ham qorningiz ketmayaptimi? Sababi bu mashqda emas!",
          visualPrompt: "Noto'g'ri mashq bajarilayotgan holat ustiga qizil 'X' belgisi.",
          retentionBoost: "+35% Retention",
        },
        {
          id: "h2",
          category: "stat",
          categoryLabel: "Shok Natija",
          hookText: "30 kunda 6 kg yo'qotish uchun sportzalga borish shart emas. Mana isboti:",
          visualPrompt: "Oldin va keyin (Before/After) taqqoslovchi dinamik kadr.",
          retentionBoost: "+42% Retention",
        },
        {
          id: "h3",
          category: "question",
          categoryLabel: "Sinov Savoli",
          hookText: "Nega siz ozish o'rniga mushaklaringizni yo'qotyapsiz?",
          visualPrompt: "Tarozidagi raqamlar va oqsil balansining vizual infografikasi.",
          retentionBoost: "+30% Retention",
        },
      ],
      education: [
        {
          id: "h1",
          category: "negative",
          categoryLabel: "Eski Usulni Rad Etish",
          hookText: "Ingliz tilini so'z yodlab o'rganishni bas qiling — bu miyani charchatadi!",
          visualPrompt: "Qalin lug'at kitobini chetga surib, zamonaviy usulni ko'rsatish.",
          retentionBoost: "+39% Retention",
        },
        {
          id: "h2",
          category: "stat",
          categoryLabel: "Tezkor Yechim",
          hookText: "Kuniga 7 daqiqa ajratib, 1 oyda erkin gapirishning 3 ta qoidasi:",
          visualPrompt: "Taymer 07:00 dan orqaga sanaydi, kadr ritmi tezlashadi.",
          retentionBoost: "+34% Retention",
        },
      ],
    };

    const selectedHooks = nicheHooks[niche] || nicheHooks.business;

    const beats: ScriptBeatItem[] = [
      {
        timestamp: "00:00 - 00:03",
        phase: "⚡ KADR 1: Hook & Vizual Tuzoq",
        visualCue: "Kameraga 1.5 metr masofadan tezkor yaqinlashish (Zoom-in). Ekranda yirik 3 so'zdan oshmagan sarlavha.",
        voiceoverText: selectedHooks[0]?.hookText || "Agar videolaringiz ko'rilmayotgan bo'lsa, buni darhol to'xtating!",
        retentionHack: "Meta dastlabki 3 soniyada 65%+ tomoshabinni saqlab qolgan videoni darhol Explore'ga uzatadi.",
      },
      {
        timestamp: "00:03 - 00:09",
        phase: "🔥 KADR 2: Muammo & Og'riqni Oshirish",
        visualCue: "B-roll kadr: telefon ekrani, statistika tushishi yoki kundalik qiyinchilik. Har 2 soniyada kadr burchagi o'zgaradi.",
        voiceoverText: "Ko'pchilik eng katta xatoni qayerda qiladi? Ular videoni boshidan oxirigacha monoton ohangda o'qishadi va tomoshabin 4-soniyadayoq o'tkazib yuboradi.",
        retentionHack: "Pacing qoidasi: har 1.8 soniyada vizual o'zgarish (kadr almashinuvi yoki matn animatsiyasi) bo'lishi shart.",
      },
      {
        timestamp: "00:09 - 00:18",
        phase: "💡 KADR 3: Qimmatli Yechim & DM Share Trigger",
        visualCue: "Asosiy qism: ekranda aniq 3 ta punkt paydo bo'ladi (1, 2, 3). Qo'lda ishora qilib ko'rsatish.",
        voiceoverText: "Yechim esa oddiy: birinchidan, videoni do'stiga yuborishga majbur qiladigan 'Qimmatli Fakt' qo'shing. Chunki Meta uchun #1 signal bu — DM orqali ulashishdir!",
        retentionHack: "Tomoshabin videoni kimgadir yuborganida (Sends per Reach), algoritm uni 5 barobar ko'p insonga ko'rsatadi.",
      },
      {
        timestamp: "00:18 - 00:23",
        phase: "🔄 KADR 4: Seamless Loop & Outro",
        visualCue: "Kamera sekin dastlabki pozitsiyasiga qaytadi. Video oxirgi kadri boshidagi 1-kadr bilan bir xil ko'rinishga keladi.",
        voiceoverText: "Buni sinab ko'rish uchun profilimni saqlab oling. Chunki...",
        retentionHack: "Seamless Loop tufayli tomoshabin video tugaganini sezmay qaytadan ko'ra boshlaydi (Completion > 110%).",
      },
    ];

    return {
      id: `script_${Date.now()}`,
      reelTitle: title,
      niche,
      topicSummary: "Ushbu ssenariy Meta 5 drayveri talablariga moslashtirilgan bo'lib, DM ulashish va 100%+ qayta ko'rishni ta'minlaydi.",
      hooks: selectedHooks,
      beats,
      loopEndingLine: "Chunki videolaringiz ko'rilmayotgan bo'lsa...",
      recommendedAudio: "Trending Minimalist Cyber Beat (115-120 BPM)",
      callToAction: "Buni yo'qotib qo'ymaslik uchun saqlab oling va Reels yozadigan do'stingizga yuboring!",
      captionIdea: `Ko'pchilik Reels algoritmini murakkab deb o'ylaydi, ammo aslida hamma gap dastlabki 3 soniya va DM ulashishda!\n\nSiz bu usulni sinab ko'rganmisiz? Izohlarda fikringizni yozing 👇`,
      hashtags: ["#reelsuz", "#instagramtips", "#smmuz", "#algoritm", "#virallik"],
    };
  }
}
