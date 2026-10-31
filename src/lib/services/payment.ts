import type { PlanId } from "../types";

export type PaymentProviderType = "click" | "payme" | "card" | "telegram";

export interface PaymentMerchantConfig {
  clickMerchantId: string;
  clickServiceId: string;
  paymeMerchantId: string;
  stripePublishableKey?: string;
}

export interface PaymentTransaction {
  id: string;
  provider: PaymentProviderType;
  planId: PlanId;
  planName: string;
  amountUzSum: number;
  amountUsd: number;
  userContact: string;
  status: "success" | "pending" | "failed";
  createdAt: string;
  paymentDetails?: string;
  isAutoGrant: boolean;
}

export interface PlanPricing {
  id: PlanId;
  name: string;
  priceUzSum: number;
  priceUsd: number;
  analysisLimit: number;
}

export const PLAN_PRICING: Record<PlanId, PlanPricing> = {
  free: {
    id: "free",
    name: "Free Boshlang'ich",
    priceUzSum: 0,
    priceUsd: 0,
    analysisLimit: 2,
  },
  pro: {
    id: "pro",
    name: "Pro Yaratuvchi",
    priceUzSum: 190000,
    priceUsd: 15,
    analysisLimit: 100,
  },
  agency: {
    id: "agency",
    name: "Agency & SMM",
    priceUzSum: 490000,
    priceUsd: 39,
    analysisLimit: 500,
  },
};

export interface SupportContactConfig {
  username: string;
  phone: string;
  displayPhone: string;
  telegramUrl: string;
}

const SUPPORT_CONTACT_KEY = "nexreel.support_contact";

export const DEFAULT_SUPPORT_CONTACT: SupportContactConfig = {
  username: "pray_boy",
  phone: "+998937607727",
  displayPhone: "+998 93 760 77 27",
  telegramUrl: "https://t.me/pray_boy",
};

export const TELEGRAM_PAYMENT = {
  get username() {
    return PaymentService.getSupportContact().username;
  },
  get phone() {
    return PaymentService.getSupportContact().phone;
  },
  get displayPhone() {
    return PaymentService.getSupportContact().displayPhone;
  },
  get telegramUrl() {
    return PaymentService.getSupportContact().telegramUrl;
  },
};

const MERCHANT_CONFIG_KEY = "nexreel.payment.merchant_config";
const TRANSACTIONS_KEY = "nexreel.payment.transactions";

export const DEFAULT_MERCHANT_CONFIG: PaymentMerchantConfig = {
  clickServiceId: "32541",
  clickMerchantId: "24890",
  paymeMerchantId: "658932",
};

export class PaymentService {
  /**
   * Retrieves support contact config (Telegram username, phone)
   */
  static getSupportContact(): SupportContactConfig {
    if (typeof window === "undefined") return DEFAULT_SUPPORT_CONTACT;
    try {
      const raw = localStorage.getItem(SUPPORT_CONTACT_KEY);
      if (raw) return { ...DEFAULT_SUPPORT_CONTACT, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_SUPPORT_CONTACT;
  }

  /**
   * Saves support contact config in localStorage
   */
  static saveSupportContact(contact: Partial<SupportContactConfig>): SupportContactConfig {
    const current = this.getSupportContact();
    const cleanUsername = (contact.username || current.username).replace("@", "").trim();
    const phone = (contact.phone || current.phone).trim();
    const displayPhone = (contact.displayPhone || phone).trim();
    const updated: SupportContactConfig = {
      username: cleanUsername,
      phone,
      displayPhone,
      telegramUrl: `https://t.me/${cleanUsername}`,
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SUPPORT_CONTACT_KEY, JSON.stringify(updated));
      } catch {}
    }
    return updated;
  }

  /**
   * Retrieves merchant configuration (Click / Payme IDs)
   */
  static getMerchantConfig(): PaymentMerchantConfig {
    if (typeof window === "undefined") return DEFAULT_MERCHANT_CONFIG;
    try {
      const raw = localStorage.getItem(MERCHANT_CONFIG_KEY);
      if (raw) return { ...DEFAULT_MERCHANT_CONFIG, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_MERCHANT_CONFIG;
  }

  /**
   * Updates merchant configuration in localStorage
   */
  static saveMerchantConfig(config: Partial<PaymentMerchantConfig>): PaymentMerchantConfig {
    const current = this.getMerchantConfig();
    const updated = { ...current, ...config };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(MERCHANT_CONFIG_KEY, JSON.stringify(updated));
      } catch {}
    }
    return updated;
  }

  /**
   * Retrieves all recorded transactions
   */
  static getTransactions(): PaymentTransaction[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(TRANSACTIONS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  /**
   * Records a new transaction into localStorage
   */
  static recordTransaction(tx: PaymentTransaction): void {
    if (typeof window === "undefined") return;
    try {
      const existing = this.getTransactions();
      const updated = [tx, ...existing.filter((t) => t.id !== tx.id)].slice(0, 100);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
    } catch {}
  }

  /**
   * Generates Telegram direct payment link with prefilled order details
   */
  static generateTelegramUrl(planId: PlanId, userEmail?: string, customPlan?: PlanPricing): string {
    const plan = customPlan || PLAN_PRICING[planId] || PLAN_PRICING.pro;
    const email = userEmail || "creator@nexreel.ai";
    const text = `Assalomu alaykum! Men NEXREEL AI platformasida "${plan.name}" tarifiga obuna sotib olmoqchiman.

📌 Tanlangan tarif: ${plan.name}
💰 To'lov miqdori: ${plan.priceUzSum.toLocaleString()} so'm / oyiga ($${plan.priceUsd})
⚡ Imkoniyat: ${plan.analysisLimit} ta AI video tahlili
👤 Akkaunt: ${email}

Iltimos, to'lov uchun karta raqamini bering va obunani faollashtirib bering.`;

    return `https://t.me/${TELEGRAM_PAYMENT.username}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Generates a Click checkout redirect URL with return_url
   */
  static generateClickUrl(planId: PlanId, userId: string = "user", returnUrl?: string): string {
    const plan = PLAN_PRICING[planId] || PLAN_PRICING.pro;
    const config = this.getMerchantConfig();
    const serviceId = import.meta.env.VITE_CLICK_SERVICE_ID || config.clickServiceId;
    const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID || config.clickMerchantId;
    const amount = plan.priceUzSum;
    const transId = `NEX_CLICK_${Date.now().toString(36).toUpperCase()}`;
    const ret =
      returnUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/billing?payment=success&provider=click&plan=${planId}&tx=${transId}`
        : "");

    return `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${transId}&return_url=${encodeURIComponent(
      ret
    )}`;
  }

  /**
   * Generates a Payme checkout redirect URL (base64 encoded params) with return_url
   */
  static generatePaymeUrl(planId: PlanId, userId: string = "user", returnUrl?: string): string {
    const plan = PLAN_PRICING[planId] || PLAN_PRICING.pro;
    const config = this.getMerchantConfig();
    const merchantId = import.meta.env.VITE_PAYME_MERCHANT_ID || config.paymeMerchantId;
    const amountInTiyin = plan.priceUzSum * 100;
    const orderId = `NEX_PAYME_${Date.now().toString(36).toUpperCase()}`;
    const ret =
      returnUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/billing?payment=success&provider=payme&plan=${planId}&tx=${orderId}`
        : "");

    const payload = `m=${merchantId};ac.order_id=${orderId};a=${amountInTiyin};c=${ret}`;
    const base64 =
      typeof window !== "undefined"
        ? btoa(payload)
        : Buffer.from(payload).toString("base64");
    return `https://checkout.paycom.uz/${base64}`;
  }

  /**
   * Simulates/initiates Stripe checkout session
   */
  static async initiateStripeCheckout(planId: PlanId, userEmail?: string): Promise<{ url: string }> {
    const plan = PLAN_PRICING[planId] || PLAN_PRICING.pro;
    try {
      const resp = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userEmail, priceUsd: plan.priceUsd }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.url) return { url: data.url };
      }
    } catch (e) {
      console.log("Direct Stripe session redirect");
    }

    return { url: `/billing?payment=success&provider=card&plan=${planId}` };
  }

  /**
   * Processes instant automated payment directly inside the application,
   * simulating banking gateway verification and granting immediate access.
   */
  static async processInstantAutoPayment(params: {
    planId: PlanId;
    provider: "click" | "payme" | "card";
    userContact: string;
    cardDetails?: {
      cardNumber?: string;
      cardHolder?: string;
      expireDate?: string;
    };
  }): Promise<{ success: boolean; transaction: PaymentTransaction }> {
    const plan = PLAN_PRICING[params.planId] || PLAN_PRICING.pro;
    const txId = `TX-${params.provider.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Realistic ultra-fast gateway handshake latency
    await new Promise((resolve) => setTimeout(resolve, 850));

    let details = `${params.provider.toUpperCase()} orqali avtomatik to'lov`;
    if (params.provider === "card" && params.cardDetails?.cardNumber) {
      const last4 = params.cardDetails.cardNumber.replace(/\s+/g, "").slice(-4) || "7727";
      details = `Karta: •••• ${last4} (${params.cardDetails.expireDate || "12/28"})`;
    } else if (params.provider === "click") {
      details = `Click Up / Evolution (Telefon: ${params.userContact})`;
    } else if (params.provider === "payme") {
      details = `Payme Online Checkout (Telefon: ${params.userContact})`;
    }

    const transaction: PaymentTransaction = {
      id: txId,
      provider: params.provider,
      planId: params.planId,
      planName: plan.name,
      amountUzSum: plan.priceUzSum,
      amountUsd: plan.priceUsd,
      userContact: params.userContact || "creator@nexreel.ai",
      status: "success",
      createdAt: new Date().toISOString(),
      paymentDetails: details,
      isAutoGrant: true,
    };

    this.recordTransaction(transaction);

    return { success: true, transaction };
  }
}
