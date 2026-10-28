import type { PlanId } from "../types";

export interface PaymentProviderConfig {
  clickMerchantId?: string;
  clickServiceId?: string;
  paymeMerchantId?: string;
  stripePublishableKey?: string;
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

export const TELEGRAM_PAYMENT = {
  username: "pray_boy",
  phone: "+998937607727",
  displayPhone: "+998 93 760 77 27",
  telegramUrl: "https://t.me/pray_boy",
};

export class PaymentService {
  /**
   * Generates Telegram direct payment link with prefilled order details
   */
  static generateTelegramUrl(planId: PlanId, userEmail?: string): string {
    const plan = PLAN_PRICING[planId] || PLAN_PRICING.pro;
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
   * Generates a Click checkout redirect URL
   */
  static generateClickUrl(planId: PlanId, userId: string, returnUrl?: string): string {
    const plan = PLAN_PRICING[planId];
    const serviceId = import.meta.env.VITE_CLICK_SERVICE_ID || "12345";
    const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID || "67890";
    const amount = plan.priceUzSum;
    const transId = `sub_${planId}_${userId || "anon"}_${Date.now()}`;
    const ret = returnUrl || window.location.origin + "/billing?payment=success";

    return `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${transId}&return_url=${encodeURIComponent(ret)}`;
  }

  /**
   * Generates a Payme checkout redirect URL (base64 encoded params)
   */
  static generatePaymeUrl(planId: PlanId, userId: string, returnUrl?: string): string {
    const plan = PLAN_PRICING[planId];
    const merchantId = import.meta.env.VITE_PAYME_MERCHANT_ID || "654321";
    const amountInTiyin = plan.priceUzSum * 100;
    const orderId = `sub_${planId}_${userId || "anon"}_${Date.now()}`;
    const ret = returnUrl || window.location.origin + "/billing?payment=success";

    const payload = `m=${merchantId};ac.order_id=${orderId};a=${amountInTiyin};c=${ret}`;
    const base64 = btoa(payload);
    return `https://checkout.paycom.uz/${base64}`;
  }

  /**
   * Simulates/initiates Stripe checkout session
   */
  static async initiateStripeCheckout(planId: PlanId, userEmail?: string): Promise<{ url: string }> {
    const plan = PLAN_PRICING[planId];
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

    return { url: `/billing?payment=success&plan=${planId}` };
  }
}
