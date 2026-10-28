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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  }

  /**
   * Sends a payment alert notification to the admin Telegram Bot
   */
  static async sendPaymentAlert(
    payload: Omit<PaymentRequestPayload, "id" | "createdAt" | "status">,
    overrideConfig?: TelegramBotConfig
  ): Promise<{ success: boolean; error?: string }> {
    const config = overrideConfig || this.getConfig();

    // Agar token bo'lmasa, ogohlantirish beramiz
    if (!config.botToken || !config.chatId) {
      console.warn("Telegram Bot Token yoki Chat ID sozlanmagan.");
      return {
        success: false,
        error: "Telegram Bot Token yoki Chat ID kiritilmagan. Admin panelda sozlang.",
      };
    }

    const dateStr = new Date().toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const message = `🔔 <b>YANGI TO'LOV TASDIQLASH SO'ROVI!</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Mijoz:</b> <code>${payload.userContact}</code>
💳 <b>Tarif:</b> <b>${payload.planName}</b>
💰 <b>To'lov miqdori:</b> <b>${payload.priceUzSum.toLocaleString()} so'm</b> ($${payload.priceUsd})
⚡ <b>AI Tahlil limiti:</b> ${payload.analysisLimit} ta video
🕒 <b>Vaqti:</b> ${dateStr}
📝 <b>Izoh / Chek:</b> ${payload.note ? `<i>${payload.note}</i>` : "Mijoz to'lov chekini tashlaganini bildirdi."}
━━━━━━━━━━━━━━━━━━━━
👉 <i>Admin panelga kiring va to'lovni tekshirib, mijozga dostup bering!</i>`;

    try {
      const url = `https://api.telegram.org/bot${config.botToken.trim()}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId.trim(),
          text: message,
          parse_mode: "HTML",
        }),
      });

      const data = await response.json();
      if (data.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.description || "Telegram API xatoligi" };
      }
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

    const testText = `✅ <b>NEXREEL AI — Telegram Bot Ulandi!</b>\n\nBotingiz platforma bilan muvaffaqiyatli bog'landi. Endi saytda to'lov qilinganda barcha xabarlar shu yerga keladi.\n\n🕒 Vaqt: ${new Date().toLocaleString()}`;

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
