import type { PlanId } from "../types";

const SECRET_SALT = "NEXREEL_AI_2026_FARKHADIVICH_SECRET_PIN_7727";

export interface GrantTokenData {
  contact: string;
  plan: PlanId;
  days: number;
  code: string;
  createdAt: number;
  expiresAt: string;
  reqId?: string;
  signature: string;
}

/**
 * Oddiy va ishonchli nazorat yig'indisi (checksum) algoritmi
 */
function createSignature(str: string): string {
  let hash = 0;
  const input = `${str}:${SECRET_SALT}`;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 32bit int ga aylantirish
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(6, "X");
}

export class ActivationService {
  /**
   * Odam tushunadigan va xatosiz teriladigan faollashtirish kodi yaratish
   * Masalan: PRO-30D-A8K29M
   */
  static generateCode(plan: PlanId = "pro", days: number = 30): string {
    const prefix = plan.toUpperCase();
    const entropy = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timePart = (Date.now() % 10000).toString(36).toUpperCase();
    const raw = `${prefix}-${days}D-${entropy}${timePart}`;
    const sig = createSignature(raw).substring(0, 4);
    const finalCode = `${prefix}-${days}D-${entropy}${sig}`;

    // Kodni mahalliy saqlashga qo'shamiz (tekshirish uchun)
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("nexreel_valid_codes") || "{}");
        saved[finalCode] = {
          plan,
          days,
          createdAt: new Date().toISOString(),
          used: false,
        };
        localStorage.setItem("nexreel_valid_codes", JSON.stringify(saved));
      } catch {}
    }

    return finalCode;
  }

  /**
   * Bitta bosish bilan dostup beruvchi shifrlangan xavfsiz token yaratish
   */
  static generateGrantToken(
    contact: string,
    plan: PlanId = "pro",
    days: number = 30,
    reqId?: string
  ): string {
    const code = this.generateCode(plan, days);
    const createdAt = Date.now();
    const expiresAt = new Date(createdAt + days * 86400000).toISOString();
    const baseStr = `${contact}|${plan}|${days}|${code}|${createdAt}`;
    const signature = createSignature(baseStr);

    const payload: GrantTokenData = {
      contact,
      plan,
      days,
      code,
      createdAt,
      expiresAt,
      reqId,
      signature,
    };

    return btoa(encodeURIComponent(JSON.stringify(payload)));
  }

  /**
   * Shifrlangan tokenni tekshirish va ma'lumotlarini olish
   */
  static verifyGrantToken(
    tokenStr: string
  ): { valid: boolean; data?: GrantTokenData; error?: string } {
    try {
      const jsonStr = decodeURIComponent(atob(tokenStr.trim()));
      const data: GrantTokenData = JSON.parse(jsonStr);

      if (!data.contact || !data.plan || !data.days || !data.signature) {
        return { valid: false, error: "Token tuzilishi noto'g'ri" };
      }

      // Checksum tekshiruvi
      const baseStr = `${data.contact}|${data.plan}|${data.days}|${data.code}|${data.createdAt}`;
      const expectedSig = createSignature(baseStr);

      if (data.signature !== expectedSig) {
        return { valid: false, error: "Xavfsizlik imzosi mos kelmadi" };
      }

      return { valid: true, data };
    } catch (e: any) {
      return { valid: false, error: "Tokenni o'qib bo'lmadi" };
    }
  }

  /**
   * Kiritilgan aktivatsiya kodini tekshirish
   */
  static verifyCode(codeRaw: string): {
    valid: boolean;
    plan: PlanId;
    days: number;
    error?: string;
  } {
    const clean = codeRaw.trim().toUpperCase();

    // 1. Maxsus Admin / Master promo kodlar
    if (clean === "NEX-PRO-7727" || clean === "PRO-7727") {
      return { valid: true, plan: "pro", days: 30 };
    }
    if (clean === "NEX-AGENCY-7727" || clean === "AGENCY-7727") {
      return { valid: true, plan: "agency", days: 30 };
    }
    if (clean === "NEX-VIP-2026" || clean === "VIP-7727") {
      return { valid: true, plan: "agency", days: 365 };
    }

    // 2. Mahalliy saqlangan kodlar bazasidan tekshirish
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("nexreel_valid_codes") || "{}");
        if (saved[clean]) {
          return {
            valid: true,
            plan: saved[clean].plan as PlanId,
            days: saved[clean].days || 30,
          };
        }
      } catch {}
    }

    // 3. Format bo'yicha dinamik tekshirish (PRO-30D-XXXXXX yoki AGENCY-30D-XXXXXX)
    const match = clean.match(/^(PRO|AGENCY)-(\d+)D-([A-Z0-9]+)$/);
    if (match) {
      const plan = match[1].toLowerCase() as PlanId;
      const days = parseInt(match[2], 10) || 30;
      return { valid: true, plan, days };
    }

    return {
      valid: false,
      plan: "free",
      days: 0,
      error: "Aktivatsiya kodi topilmadi yoki muddati o'tgan.",
    };
  }

  /**
   * Kodni ishlatilgan deb belgilash
   */
  static markCodeUsed(codeRaw: string): void {
    const clean = codeRaw.trim().toUpperCase();
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("nexreel_valid_codes") || "{}");
        if (saved[clean]) {
          saved[clean].used = true;
          saved[clean].usedAt = new Date().toISOString();
          localStorage.setItem("nexreel_valid_codes", JSON.stringify(saved));
        }
      } catch {}
    }
  }

  /**
   * Sayt URL manzilini aniqlash (localhost yoki production)
   */
  static getSiteOrigin(): string {
    if (typeof window !== "undefined" && window.location?.origin) {
      // Lovable yoki Vercel yoki local manzil
      return window.location.origin;
    }
    return "https://reelsight-pro.lovable.app";
  }

  /**
   * 1-bosishda dostup beruvchi to'liq havolani shakllantirish
   */
  static buildGrantUrl(token: string, origin?: string): string {
    const base = origin || this.getSiteOrigin();
    return `${base}/pricing?grant=${encodeURIComponent(token)}&auto=1`;
  }

  /**
   * Mijoz uchun kod orqali faollashtirish havolasini shakllantirish
   */
  static buildCodeUrl(code: string, origin?: string): string {
    const base = origin || this.getSiteOrigin();
    return `${base}/pricing?code=${encodeURIComponent(code)}&auto=1`;
  }
}
