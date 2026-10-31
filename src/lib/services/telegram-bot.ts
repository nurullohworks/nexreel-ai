import type { PlanId } from "../types";
import { ActivationService } from "./activation";

export interface TelegramBotConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export interface PaymentRequestPayload {
  id: string;
  userContact: string;
  planId: string;
  planName: string;
  priceUzSum: number;
  priceUsd: number;
  analysisLimit: number;
  note?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  activationCode?: string;
}

const STORAGE_KEY = "nexreel.telegram.bot_config";

export const DEFAULT_BOT_CONFIG: TelegramBotConfig = {
  botToken: "9223798428:AAF6LQXC_keybg0lUZ-fNXbEYiIz-JqNXRg",
  chatId: "5126649501",
  enabled: true,
};

export class TelegramBotService {
  /**
   * Retrieves saved bot configuration from localStorage
   */
  static getConfig(): TelegramBotConfig {
    if (typeof window === "undefined") return DEFAULT_BOT_CONFIG;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_BOT_CONFIG, ...JSON.parse(raw) };
      }
    } catch {}
    return DEFAULT_BOT_CONFIG;
  }

  /**
   * Saves bot configuration to localStorage
   */
  static saveConfig(config: Partial<TelegramBotConfig>): TelegramBotConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
    return updated;
  }

  /**
   * Sends an interactive payment alert notification with 1-click access buttons to Admin Telegram Bot
   */
  static async sendPaymentAlert(
    payload: Omit<PaymentRequestPayload, "id" | "createdAt" | "status"> & { id?: string },
    overrideConfig?: TelegramBotConfig
  ): Promise<{ success: boolean; error?: string; activationCode?: string }> {
    const config = overrideConfig || this.getConfig();

    if (!config.botToken || !config.chatId) {
      console.warn("Telegram Bot Token yoki Chat ID sozlanmagan.");
      return {
        success: false,
        error: "Telegram Bot Token yoki Chat ID kiritilmagan. Admin panelda sozlang.",
      };
    }

    const reqId = payload.id || `req_${Date.now()}`;
    const plan = (payload.planId as PlanId) || "pro";

    // 1. Aktivatsiya kodi va 1-bosishda dostup beruvchi tokenlar
    const activationCode = ActivationService.generateCode(plan, 30);
    const grantToken30 = ActivationService.generateGrantToken(payload.userContact, plan, 30, reqId);
    const grantToken365 = ActivationService.generateGrantToken(payload.userContact, plan, 365, reqId);

    const grantUrl30 = ActivationService.buildGrantUrl(grantToken30);
    const grantUrl365 = ActivationService.buildGrantUrl(grantToken365);
    const codeUrl = ActivationService.buildCodeUrl(activationCode);

    const dateStr = new Date().toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const isTgHandle =
      payload.userContact.startsWith("@") ||
      (!payload.userContact.includes("@") && payload.userContact.length > 3 && !payload.userContact.startsWith("+"));
    const cleanTgHandle = payload.userContact.replace("@", "").trim();

    // Telegram uchun boyitilgan chiroyli xabar
    const message = `🔔 <b>YANGI TO'LOV & DOSTUP SO'ROVI!</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Mijoz:</b> <code>${payload.userContact}</code>
💳 <b>Tarif:</b> <b>${payload.planName}</b>
💰 <b>To'lov miqdori:</b> <b>${payload.priceUzSum.toLocaleString()} so'm</b> ($${payload.priceUsd})
⚡ <b>AI Tahlil limiti:</b> ${payload.analysisLimit} ta video
🕒 <b>Vaqti:</b> ${dateStr}
📝 <b>Izoh / Chek:</b> ${payload.note ? `<i>${payload.note}</i>` : "To'lov chekini tashlaganini bildirdi."}
━━━━━━━━━━━━━━━━━━━━
🔑 <b>Aktivatsiya Kodi:</b> <code>${activationCode}</code>
🔗 <b>Mijoz uchun havola:</b>
${codeUrl}
━━━━━━━━━━━━━━━━━━━━
👇 <b>DOSTUP BERISH UCHUN BITTA TUGMANI BOSING:</b>`;

    // 1-bosishda dostup berish tugmalari (Inline Keyboard)
    const inlineKeyboard: any[][] = [
      [
        {
          text: `✅ 1-BOSISHDA DOSTUP BERISH (30 KUN)`,
          url: grantUrl30,
        },
      ],
      [
        {
          text: `⚡ 1 YILLIK VIP DOSTUP BERISH`,
          url: grantUrl365,
        },
      ],
    ];

    if (isTgHandle) {
      const tgMsg = encodeURIComponent(
        `Assalomu alaykum! NEXREEL AI platformasida sizning ${payload.planName} obunangiz 30 kunga faollashtirildi!\n\nSizning shaxsiy aktivatsiya kodingiz: ${activationCode}\n\nKirish havolasi: ${codeUrl}`
      );
      inlineKeyboard.push([
        {
          text: `💬 Mijozga Telegramdan yozish (@${cleanTgHandle})`,
          url: `https://t.me/${cleanTgHandle}?text=${tgMsg}`,
        },
      ]);
    }

    // Telegram bot callback tugmasi (bot serveri ishlayotgan bo'lsa)
    inlineKeyboard.push([
      {
        text: `⚡ Telegramda tasdiqlash`,
        callback_data: `approve_${reqId}_30`,
      },
      {
        text: `❌ Rad etish`,
        callback_data: `reject_${reqId}`,
      },
    ]);

    try {
      const url = `https://api.telegram.org/bot${config.botToken.trim()}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId.trim(),
          text: message,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        }),
      });

      const data = await response.json();
      if (data.ok) {
        return { success: true, activationCode };
      } else {
        return { success: false, error: data.description || "Telegram API xatoligi", activationCode };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Internet ulanishida xatolik", activationCode };
    }
  }

  /**
   * Sends an instant notification when a payment is automatically completed via Click or Payme
   */
  static async sendAutoPaymentNotification(
    params: {
      transactionId: string;
      provider: "click" | "payme" | "card" | string;
      planId: PlanId;
      planName: string;
      priceUzSum: number;
      priceUsd: number;
      userContact: string;
      analysisLimit: number;
    },
    overrideConfig?: TelegramBotConfig
  ): Promise<{ success: boolean; error?: string }> {
    const config = overrideConfig || this.getConfig();
    if (!config.botToken || !config.chatId) {
      return { success: false, error: "Telegram Bot sozlanmagan" };
    }

    const providerNames: Record<string, string> = {
      click: "🔵 CLICK (Avtomatik to'lov)",
      payme: "🟢 PAYME (Avtomatik to'lov)",
      card: "💳 KARTA / UZCARD-HUMO (Avto-to'lov)",
    };

    const dateStr = new Date().toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const isTgHandle =
      params.userContact.startsWith("@") ||
      (!params.userContact.includes("@") && params.userContact.length > 3 && !params.userContact.startsWith("+"));
    const cleanTgHandle = params.userContact.replace("@", "").trim();

    const message = `⚡ <b>YANGI AVTOMATIK TO'LOV MUVAFFAQIYATLI O'TDI!</b>
━━━━━━━━━━━━━━━━━━━━
💳 <b>To'lov Tizimi:</b> <b>${providerNames[params.provider] || params.provider.toUpperCase()}</b>
👤 <b>Mijoz:</b> <code>${params.userContact}</code>
🏷️ <b>Tarif:</b> <b>${params.planName}</b>
💰 <b>Summa:</b> <b>${params.priceUzSum.toLocaleString()} so'm</b> ($${params.priceUsd})
⚡ <b>AI Tahlil Limiti:</b> ${params.analysisLimit} ta video
🆔 <b>Tranzaksiya ID:</b> <code>${params.transactionId}</code>
🕒 <b>Vaqti:</b> ${dateStr}
━━━━━━━━━━━━━━━━━━━━
✅ <b>STATUS: DOSTUP AVTOMATIK TARZDA YOQILDI!</b>
<i>Mijoz tizimdan darhol foydalanishni boshladi. Qo'lda tasdiqlash talab etilmaydi.</i>`;

    const inlineKeyboard: any[][] = [];
    if (isTgHandle) {
      inlineKeyboard.push([
        {
          text: `💬 Mijozga Telegramdan yozish (@${cleanTgHandle})`,
          url: `https://t.me/${cleanTgHandle}`,
        },
      ]);
    }

    try {
      const url = `https://api.telegram.org/bot${config.botToken.trim()}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId.trim(),
          text: message,
          parse_mode: "HTML",
          reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
        }),
      });

      const data = await response.json();
      return { success: data.ok };
    } catch (err: any) {
      return { success: false, error: err.message || "Internet ulanishida xatolik" };
    }
  }

  /**
   * Sends a test message to verify the bot token and chat ID
   */
  static async sendTestMessage(config: TelegramBotConfig): Promise<{ success: boolean; error?: string }> {
    if (!config.botToken || !config.chatId) {
      return { success: false, error: "Bot Token va Chat ID to'ldirilishi shart!" };
    }

    const testText = `✅ <b>NEXREEL AI — Telegram Bot Ulandi!</b>\n\nBotingiz platforma bilan muvaffaqiyatli bog'landi. Endi saytda to'lov qilinganda barcha xabarlar shu yerga keladi va siz bitta tugma bosish bilan dostup bera olasiz.\n\n🕒 Vaqt: ${new Date().toLocaleString()}`;

    try {
      const url = `https://api.telegram.org/bot${config.botToken.trim()}/sendMessage`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId.trim(),
          text: testText,
          parse_mode: "HTML",
        }),
      });
      const data = await resp.json();
      if (data.ok) {
        return { success: true };
      }
      return { success: false, error: data.description || "Telegram API xatosi" };
    } catch (err: any) {
      return { success: false, error: err.message || "Ulanishda xatolik" };
    }
  }
}
