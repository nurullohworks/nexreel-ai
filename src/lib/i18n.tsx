import React, { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";

export type Language = "uz" | "ru" | "en";

export interface LanguageOption {
  code: Language;
  shortLabel: string;
  label: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "uz", shortLabel: "UZB", label: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", shortLabel: "РУС", label: "Русский", flag: "🇷🇺" },
  { code: "en", shortLabel: "ENG", label: "English", flag: "🇬🇧" },
];

const TRANSLATIONS = {
  uz: {
    // Nav
    nav_analyze: "Tahlil qilish",
    nav_pricing: "Tariflar",
    nav_accounts: "Instagram Akkaunt",
    nav_dashboard: "Boshqaruv",
    nav_reports: "Hisobotlar",
    nav_history: "Tarix",
    nav_admin: "Admin",
    nav_admin_panel: "Admin Panel",
    nav_login: "Kirish",
    nav_signup: "Bepul Boshlash",
    nav_panel_btn: "Tahlil Paneli",

    // Hero
    hero_badge: "NEYRON KADR-BA-KADR AUDIT DASTURI",
    hero_title_1: "Reels xatolarini",
    hero_title_2: "soniyalar va kadrlar",
    hero_title_3: "bo'yicha aniq ko'ring.",
    hero_desc: "Videongiz nima sababdan to'xtab qolishini joylashdan oldin biling. Algoritm aynan qaysi soniyada jazolayotganini kadr skrinshoti va to'liq yechimi bilan oling.",
    hero_cta_analyze: "Videoni Tekshirish (500MB)",
    hero_cta_connect: "Akkaunt Ulash",

    // Features
    feat_screenshot: "Kadr-ba-Kadr Skrinshot",
    feat_screenshot_desc: "Aynan qaysi soniya va kadrda xatolik borligini vizual ko'rsatadi.",
    feat_drivers: "Meta 5-Drayver Formulalari",
    feat_drivers_desc: "DM Shares, Loop, Hook va Pacing bo'yicha 100% aniq algoritmik tahlil.",
    feat_fix: "Aniq Tuzatish Rejasi",
    feat_fix_desc: "Har bir kamchilik uchun aniq va amaliy tavsiyalar beriladi.",

    // Expiry banner
    banner_expired_title: "Obuna muddati tugadi:",
    banner_expired_desc: "Tahlillarni cheklovsiz davom ettirish uchun obunani yangilang!",
    banner_expiring_title: "Obuna ogohlantirishi:",
    banner_expiring_left: "kun qoldi!",
    banner_renew: "Uzaytirish",

    // Admin & Auth
    admin_console_title: "NEXREEL AI Admin Console",
    admin_console_desc: "Boshqaruv paneliga kirish uchun xavfsizlik PIN-kodini kiriting",
    admin_pin_label: "Maxfiy PIN-kod:",
    admin_enter_btn: "Panelga Kirish",
    admin_tab_pricing: "Tariflar & Narxlar",
    admin_tab_users: "Obuna Berish",
    admin_tab_announcements: "Yangiliklar & E'lonlar",
    admin_tab_telegram: "Telegram Bot & So'rovlar",
    admin_tab_security: "Xavfsizlik & PIN",
    admin_logout: "Chiqish",

    // Payment
    payment_upgrade: "Obunani Oshirish",
    payment_confirm_btn: "To'lov qildim (Faollashtirish)",
    payment_contact_label: "Sizning telefon raqamingiz yoki Telegram username:",
    payment_note_label: "To'lov haqida izoh (ixtiyoriy):",
    payment_success_title: "To'lov so'rovi adminga yuborildi!",
    payment_success_desc: "Administrator to'lovni tasdiqlashi bilan hisobingizga obuna ulanadi.",

    // General
    copy: "Nusxa olish",
    copied: "Nusxalandi!",
    save: "Saqlash",
    cancel: "Bekor qilish",
    delete: "O'chirish",
    loading: "Yuklanmoqda...",
  },

  ru: {
    // Nav
    nav_analyze: "Анализ видео",
    nav_pricing: "Тарифы",
    nav_accounts: "Instagram Аккаунт",
    nav_dashboard: "Дашборд",
    nav_reports: "Отчёты",
    nav_history: "История",
    nav_admin: "Админ",
    nav_admin_panel: "Панель админа",
    nav_login: "Войти",
    nav_signup: "Начать бесплатно",
    nav_panel_btn: "Панель анализа",

    // Hero
    hero_badge: "НЕЙРОННЫЙ ПОКАДРОВЫЙ АУДИТ REELS",
    hero_title_1: "Видьте ошибки Reels",
    hero_title_2: "по секундам и кадрам",
    hero_title_3: "с абсолютной точностью.",
    hero_desc: "Узнайте, почему охваты вашего видео остановятся до его публикации. Получите точные секунды пессимизации алгоритмом с скриншотом кадра и готовым решением.",
    hero_cta_analyze: "Проверить видео (500MB)",
    hero_cta_connect: "Подключить аккаунт",

    // Features
    feat_screenshot: "Покадровые скриншоты",
    feat_screenshot_desc: "Наглядно показывает, на какой именно секунде и кадре допущена ошибка.",
    feat_drivers: "5 драйверов алгоритма Meta",
    feat_drivers_desc: "100% точный алгоритмический анализ по DM Shares, Loop, Hook и Pacing.",
    feat_fix: "Чёткий план правок",
    feat_fix_desc: "Практические рекомендации по исправлению для каждого недочёта.",

    // Expiry banner
    banner_expired_title: "Подписка истекла:",
    banner_expired_desc: "Обновите тариф, чтобы продолжить безлимитный анализ!",
    banner_expiring_title: "Предупреждение подписки:",
    banner_expiring_left: "дней осталось!",
    banner_renew: "Продлить",

    // Admin & Auth
    admin_console_title: "Консоль админа NEXREEL AI",
    admin_console_desc: "Введите защитный PIN-код для входа в панель управления",
    admin_pin_label: "Секретный PIN-код:",
    admin_enter_btn: "Войти в панель",
    admin_tab_pricing: "Тарифы и цены",
    admin_tab_users: "Выдача подписок",
    admin_tab_announcements: "Новости и анонсы",
    admin_tab_telegram: "Telegram-бот и заявки",
    admin_tab_security: "Безопасность и PIN",
    admin_logout: "Выйти",

    // Payment
    payment_upgrade: "Повысить тариф",
    payment_confirm_btn: "Я оплатил (Активировать)",
    payment_contact_label: "Ваш номер телефона или юзернейм в Telegram:",
    payment_note_label: "Примечание к оплате (необязательно):",
    payment_success_title: "Заявка на оплату отправлена!",
    payment_success_desc: "Как только администратор подтвердит перевод, подписка активируется.",

    // General
    copy: "Копировать",
    copied: "Скопировано!",
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    loading: "Загрузка...",
  },

  en: {
    // Nav
    nav_analyze: "Video Analysis",
    nav_pricing: "Pricing",
    nav_accounts: "Instagram Account",
    nav_dashboard: "Dashboard",
    nav_reports: "Reports",
    nav_history: "History",
    nav_admin: "Admin",
    nav_admin_panel: "Admin Panel",
    nav_login: "Log In",
    nav_signup: "Start Free",
    nav_panel_btn: "Analyze Panel",

    // Hero
    hero_badge: "NEURAL FRAME-BY-FRAME AUDIT ENGINE",
    hero_title_1: "See Reels bottlenecks",
    hero_title_2: "second by second, frame by frame",
    hero_title_3: "with complete precision.",
    hero_desc: "Discover why your video will drop off before you post it. Pinpoint exact algorithmic drop-off moments with frame screenshots and Meta-compliant solutions.",
    hero_cta_analyze: "Audit Video (500MB)",
    hero_cta_connect: "Connect Account",

    // Features
    feat_screenshot: "Frame-by-Frame Snapshots",
    feat_screenshot_desc: "Visually pinpoint the exact second and frame causing algorithmic drop-off.",
    feat_drivers: "Meta 5-Driver Formulas",
    feat_drivers_desc: "100% rigorous evaluation across DM Shares, Retention, Hook, and Visual Pacing.",
    feat_fix: "Actionable Fix Plan",
    feat_fix_desc: "Concrete, step-by-step editing instructions for every discovered bottleneck.",

    // Expiry banner
    banner_expired_title: "Subscription expired:",
    banner_expired_desc: "Renew your plan to continue limitless AI analysis!",
    banner_expiring_title: "Subscription Alert:",
    banner_expiring_left: "days remaining!",
    banner_renew: "Renew",

    // Admin & Auth
    admin_console_title: "NEXREEL AI Admin Console",
    admin_console_desc: "Enter your secret PIN code to access the management console",
    admin_pin_label: "Secret PIN code:",
    admin_enter_btn: "Enter Console",
    admin_tab_pricing: "Plans & Pricing",
    admin_tab_users: "User Grants",
    admin_tab_announcements: "Announcements",
    admin_tab_telegram: "Telegram Bot & Requests",
    admin_tab_security: "Security & PIN",
    admin_logout: "Log Out",

    // Payment
    payment_upgrade: "Upgrade Plan",
    payment_confirm_btn: "I Have Paid (Activate)",
    payment_contact_label: "Your Phone number or Telegram username:",
    payment_note_label: "Payment note / transaction id (optional):",
    payment_success_title: "Payment request sent to admin!",
    payment_success_desc: "Your subscription will activate as soon as the admin verifies payment.",

    // General
    copy: "Copy",
    copied: "Copied!",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    loading: "Loading...",
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS["uz"];

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  currentOption: LanguageOption;
}

const STORAGE_LANG_KEY = "nexreel_language";

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_LANG_KEY);
        if (saved === "uz" || saved === "ru" || saved === "en") {
          return saved;
        }
      } catch {}
    }
    return "uz";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_LANG_KEY, lang);
      } catch {}
    }
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.uz;
    return dict[key] || fallback || key;
  };

  const currentOption = useMemo(
    () => LANGUAGES.find((l) => l.code === language) || LANGUAGES[0],
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, currentOption }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    return {
      language: "uz" as Language,
      setLanguage: () => {},
      t: (key: TranslationKey, fallback?: string) => TRANSLATIONS.uz[key] || fallback || key,
      currentOption: LANGUAGES[0],
    };
  }
  return ctx;
}
