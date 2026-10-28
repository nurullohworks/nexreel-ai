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

export const TRANSLATIONS = {
  uz: {
    // Nav & Header
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
    nav_logout: "Chiqish",

    // Hero Section
    hero_badge: "100% MATEMATIK TAHLIL",
    hero_engine: "NEXREEL NEURAL ENGINE v3.4",
    hero_title_1: "Taxminlarni unuting.",
    hero_title_2: "Aniq Algoritmik",
    hero_title_3: "Tahlil Natijasi.",
    hero_desc: "Instagram Reels videongizni joylashdan oldin to'liq neyron tekshiruvdan o'tkazing. Meta reyting drayverlari va LiveDune bozor benchmarklari asosida soniyalar bo'yicha kamchiliklarni aniqlang.",
    hero_cta_analyze: "Videoni Tahlil Qilish",
    hero_cta_connect: "Akkaunt Kalibratsiyasi",
    hero_spec_size: "Video Sig'imi (4K/60fps)",
    hero_spec_drivers: "Meta Rasmiy Signallari",
    hero_spec_benchmark: "LiveDune Benchmark Bazasi",

    // Terminal Preview
    diag_core_title: "AUDIT-CORE // reel_diagnostika_pro.mp4",
    diag_verdict_fly: "UCHADI (94/100)",
    diag_overall_score: "Umumiy Ball",
    diag_explore_chance: "Explore Imkoniyati",
    diag_reach_result: "Qamrov Natijasi",
    diag_confidence: "Tahlil Ishonchi",
    diag_drivers_title: "Meta Algoritm Drayverlari Ko'rsatkichi",
    diag_rec_title: "Neyron Tavsiya (00:04):",
    diag_rec_desc: "Dinamika 1.4 soniyaga sekinlashgan. Ovoz effektini (SFX) kuchaytirish orqali tomoshabin ushlab qolish darajasini yana +14% ga oshirish mumkin.",
    diag_status_done: "STATUS: DIAGNOSTIKA TO'LIQ YAKUNLANDI",
    diag_check_own: "O'z videongizni tekshiring",

    // Quick Dropzone
    drop_badge: "TEZKOR ISHGA TUSHIRISH",
    drop_title: "Reels Videongizni Hozir Tekshirib Ko'ring",
    drop_desc: "Hech qanday murakkab ro'yxatdan o'tishlarsiz, 500MB gacha bo'lgan faylingizni tashlang va bir zumda aniq tahlil natijasiga ega bo'ling.",
    drop_box_title: "Videoni bu yerga tashlang yoki tanlang",
    drop_box_sub: "MP4, MOV, WebM · 500MB gacha · 100% Maxfiy va Xavfsiz",
    drop_btn_scan: "Aniq Algoritmik Skanerlashni Boshlash",

    // Comparison Section
    comp_badge: "FARQNI KO'RING",
    comp_title: "Eski Usuldagi Taxminlar vs NEXREEL AI",
    comp_desc: "Nimaga muvaffaqiyatli rilskreytorlar va yirik agentliklar tavakkal qilmasdan, aniq matematik tahlilga tayanadi?",
    comp_col_feature: "MEZON / XUSUSIYAT",
    comp_col_old: "❌ Eski Usul (Noaniq Taxminlar)",
    comp_col_nexreel: "⚡ NEXREEL AI (Aniq Tahlil Natijasi)",
    comp_row1_feat: "Tahlil Asosi",
    comp_row1_old: "Subyektiv fikr va noaniq taxminlar",
    comp_row1_new: "Meta rasmiy drayverlari & LiveDune bazasi",
    comp_row2_feat: "Xatolik Qidirish",
    comp_row2_old: "Umumiy 'videongiz yaxshi chiqmabdi'",
    comp_row2_new: "Aniq soniya va kadr skrinshoti bilan",
    comp_row3_feat: "Qamrov Bashorati",
    comp_row3_old: "Tavakkal va tasodifiy omad",
    comp_row3_new: "Akkaunt statistikasi bilan 95%+ aniqlik",
    comp_row4_feat: "Tuzatish Rejasi",
    comp_row4_old: "Nima qilishni o'zingiz o'ylaysiz",
    comp_row4_new: "Kadr-ba-kadr professional montaj ssenariysi",

    // 5 Drivers Bento
    drivers_badge: "TEXNOLOGIYA & METODIKA",
    drivers_title: "Har Bir Soniyani Tahlil Qiluvchi 5 Ta Reyting Drayveri",
    driver_sig1_name: "0-3s Hook Neyron Kuchi",
    driver_sig1_desc: "Ilk 3 soniyadagi dinamik harakat, ovoz balandligi va matn kontrasti tahlili.",
    driver_sig2_name: "DM Shares per Reach (Meta #1)",
    driver_sig2_desc: "Tomoshabin videoni do'stiga yuborish ehtimoli va rezonans darajasi.",
    driver_sig3_name: "Qayta Ko'rish (Loop Faktor)",
    driver_sig3_desc: "Video oxiri va boshi uzluksiz ulanishi hamda to'liq ko'rish indeksi.",
    driver_sig4_name: "Visual Pacing & B-Roll Dinamikasi",
    driver_sig4_desc: "Har 1.8-2.2 soniyada kadrlar almashinuvi va tomoshabin diqqatini ushlab turish.",
    driver_sig5_name: "LiveDune Bozor Benchmarki",
    driver_sig5_desc: "O'zbekiston va MDH hududidagi 250,000+ muvaffaqiyatli reelslar bilan solishtirish.",
    drivers_guarantee_badge: "KAFOLAT",
    drivers_guarantee_title: "Joylashdan Oldin 100% Aniq Natija",
    drivers_guarantee_desc: "NEXREEL AI tahlilidan o'tgan videolar o'rtacha 3.8x ko'proq qamrov va 4.2x ko'proq DM ulashishlar hosil qiladi.",
    drivers_guarantee_btn: "Hozir Tekshirish",

    // Use Cases (Kimlar uchun)
    target_badge: "Platforma Kimlar Uchun Mo'ljallangan?",
    target_u1_title: "Ekspertlar & Shaxsiy Brendlar",
    target_u1_desc: "O'z sohangizda ishonchli auditoriya yig'ish va har bir videodan mijozlar oqimini jalb qilish.",
    target_u2_title: "Mobilograflar & Montajchilar",
    target_u2_desc: "Mijozlarga 'menimcha yaxshi' emas, 100% matematik dalillar bilan tahlil taqdim etish.",
    target_u3_title: "SMM Agentliklari & Media",
    target_u3_desc: "Barcha loyihalar uchun qat'iy sifat nazorati va kafolatlangan yuqori ko'rishlar soni.",
    target_u4_title: "Biznes & Mahsulot Egalari",
    target_u4_desc: "Katta reklama byudjetlarisiz organik qamrov orqali sotuvlarni bir necha barobarga oshirish.",

    // Bottom CTA
    bottom_cta_title: "Videolaringizni professional darajaga olib chiqing.",
    bottom_cta_desc: "Instagram Reels algoritmining barcha talablarini joylashdan oldin to'liq qondiring.",
    bottom_cta_btn1: "Birinchi Videoni Tahlil Qilish",
    bottom_cta_btn2: "Tariflar & To'lov",

    // Footer
    footer_desc: "NEXREEL AI — Instagram Reels reyting signallari, LiveDune benchmarklari va video tahlili asosida ishlovchi sun'iy intellekt platformasi.",
    footer_col_product: "Mahsulot",
    footer_col_algo: "Algoritmlar",
    footer_col_legal: "Huquqiy & Aloqa",
    footer_privacy: "Maxfiylik siyosati",
    footer_terms: "Foydalanish shartlari",
    footer_contact_tg: "Aloqa: @pray_boy",
    footer_rights: "Barcha huquqlar himoyalangan.",

    // Analyze Page
    analyze_title: "Algoritmik Video Diagnostikasi",
    analyze_desc: "Reels-ingizni nashr etishdan oldin tekshiring: Meta algoritmi uni Explore-ga chiqaradimi yoki bloklaydimi?",
    analyze_engine_badge: "Meta Reels Algoritmi & LiveDune Dvigateli",
    analyze_acc_connected: "Ulangan Akkaunt:",
    analyze_acc_not_connected: "Instagram akkaunt ulanmagan",
    analyze_acc_sub_connected: "Bashorat sizning o'rtacha ko'rishlaringizga moslashtirilgan.",
    analyze_acc_sub_not: "Natija aniqroq bo'lishi uchun akkauntingizni ulab qo'ying.",
    analyze_acc_btn_adjust: "Moslash",
    analyze_acc_btn_connect: "Akkauntni Ulash",
    analyze_niche_label: "Sohangizni (Nishani) tanlang (LiveDune bozor benchmarki uchun):",
    analyze_drop_title: "Reels videongizni shu yerga tashlang",
    analyze_drop_supported: "Qo'llab-quvvatlanadi: MP4, MOV, WebM · Maksimal: 500MB",
    analyze_watermark_q: "Videoda TikTok yoki CapCut suv belgisi (watermark) bormi?",
    analyze_watermark_yes: "Ha (jazolanadi)",
    analyze_watermark_no: "Yo'q (toza)",
    analyze_btn_run: "Virallikni Tahlil Qilish (Meta 5 Drayveri)",
    analyze_disclaimer: "Tahlil Meta Reels ranking signallari (Sends/Reach, 3s Hook retention, Loop factor) va sizning akkauntingiz ko'rsatkichlari asosida hisoblanadi.",
    analyze_progress_text: "Meta algoritmi va akkauntingiz benchmarklari tahlil qilinmoqda...",

    // Pricing Page
    pricing_title: "Tariflar & Narxlar",
    pricing_desc: "Instagram Reels auditoriyasi va qamrovini kengaytirish uchun professional vositalar.",
    pricing_plan_free: "Bepul",
    pricing_plan_pro: "Pro Yaratuvchi",
    pricing_plan_agency: "Agency & SMM",
    pricing_cta_free: "Bepul Boshlash",
    pricing_cta_pro: "Pro'ga O'tish",
    pricing_cta_agency: "Agency'ni Boshlash",
    pricing_popular_badge: "ENG KO'P TANLANGAN",
    pricing_month_unit: "so'm / oy",

    // Accounts Page
    accounts_title: "Instagram Akkaunt Kalibratsiyasi",
    accounts_desc: "Akkauntingizni bog'lang va AI bashoratlari aniqligini 95%+ gacha yetkazing.",
    accounts_form_title: "Akkaunt ma'lumotlarini kiritish",
    accounts_handle_label: "Instagram foydalanuvchi nomi (@handle):",
    accounts_followers_label: "Obunachilar soni:",
    accounts_views_label: "Reels-larning o'rtacha ko'rishi (baseline):",
    accounts_niche_label: "Asosiy soha (nisha):",
    accounts_save_btn: "Ma'lumotlarni Saqlash",

    // Dashboard Page
    dash_title: "Boshqaruv Paneli",
    dash_desc: "Barcha tahlillar, auditlar va video samaradorligi ko'rsatkichlari.",
    dash_total_audits: "Jami Tahlillar",
    dash_avg_score: "O'rtacha Ball",
    dash_viral_rate: "Virallik Darajasi",
    dash_reach_growth: "Qamrov O'sishi",
    dash_recent_videos: "Oxirgi Tahlil Qilingan Reelslar",

    // History Page
    hist_title: "Tahlillar Tarixi",
    hist_desc: "Ilgari o'tkazilgan barcha neyron diagnostikalar va hisobotlar arxivi.",
    hist_search: "Video nomi bo'yicha qidirish...",
    hist_empty: "Hozircha hech qanday tahlil o'tkazilmagan.",
    hist_view_btn: "Hisobotni Ko'rish",

    // Reports Page
    rep_title: "Algoritmik Hisobot",
    rep_export_pdf: "PDF yuklab olish",
    rep_back_btn: "Tarixga qaytish",
    rep_overall: "Umumiy Baho",
    rep_drivers_title: "Meta 5 Algoritm Drayverlari",
    rep_deficiencies_title: "Soniyalar Bo'yicha Kamchiliklar",
    rep_recommendations: "Tuzatish Rejasi va Tavsiyalar",

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

    // Payment Modal
    payment_upgrade: "Obunani Oshirish",
    payment_confirm_btn: "To'lov qildim (Faollashtirish)",
    payment_contact_label: "Sizning telefon raqamingiz yoki Telegram username:",
    payment_note_label: "To'lov haqida izoh (ixtiyoriy):",
    payment_success_title: "To'lov so'rovi adminga yuborildi!",
    payment_success_desc: "Administrator to'lovni tasdiqlashi bilan hisobingizga obuna ulanadi.",

    // General Actions
    copy: "Nusxa olish",
    copied: "Nusxalandi!",
    save: "Saqlash",
    cancel: "Bekor qilish",
    delete: "O'chirish",
    loading: "Yuklanmoqda...",
    back: "Orqaga",
    status: "Holat",
    close: "Yopish",
  },

  ru: {
    // Nav & Header
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
    nav_logout: "Выйти",

    // Hero Section
    hero_badge: "100% МАТЕМАТИЧЕСКИЙ АНАЛИЗ",
    hero_engine: "НЕЙРОННЫЙ ДВИЖОК NEXREEL v3.4",
    hero_title_1: "Забудьте догадки.",
    hero_title_2: "Точный алгоритмический",
    hero_title_3: "результат анализа.",
    hero_desc: "Проведите полный нейронный аудит вашего видео Instagram Reels до публикации. Выявите покадровые ошибки на основе официальных факторов Meta и базы LiveDune.",
    hero_cta_analyze: "Анализировать видео",
    hero_cta_connect: "Калибровка аккаунта",
    hero_spec_size: "Объем видео (до 4K/60fps)",
    hero_spec_drivers: "Факторы ранжирования Meta",
    hero_spec_benchmark: "База бенчмарков LiveDune",

    // Terminal Preview
    diag_core_title: "AUDIT-CORE // reel_diagnostika_pro.mp4",
    diag_verdict_fly: "ЗАЛЕТИТ (94/100)",
    diag_overall_score: "Общий балл",
    diag_explore_chance: "Шанс в Explore",
    diag_reach_result: "Прогноз охвата",
    diag_confidence: "Точность прогноза",
    diag_drivers_title: "Показатели драйверов алгоритма Meta",
    diag_rec_title: "Нейро-рекомендация (00:04):",
    diag_rec_desc: "Динамика замедлилась на 1.4 секунды. Усиление звукового эффекта (SFX) повысит удержание зрителя еще на +14%.",
    diag_status_done: "СТАТУС: ДИАГНОСТИКА ПОЛНОСТЬЮ ЗАВЕРШЕНА",
    diag_check_own: "Проверьте свое видео",

    // Quick Dropzone
    drop_badge: "БЫСТРЫЙ СТАРТ",
    drop_title: "Проверьте ваше видео Reels прямо сейчас",
    drop_desc: "Без сложных регистраций, загрузите файл размером до 500 МБ и моментально получите точный результат анализа.",
    drop_box_title: "Перетащите видео сюда или выберите файл",
    drop_box_sub: "MP4, MOV, WebM · до 500 МБ · 100% конфиденциально и безопасно",
    drop_btn_scan: "Запустить алгоритмическое сканирование",

    // Comparison Section
    comp_badge: "ПОЧУВСТВУЙТЕ РАЗНИЦУ",
    comp_title: "Старые догадки vs NEXREEL AI",
    comp_desc: "Почему успешные рилсмейкеры и крупные агентства не рискуют, а доверяют точным математическим вычислениям?",
    comp_col_feature: "КРИТЕРИЙ / ПАРАМЕТР",
    comp_col_old: "❌ Старый метод (Субъективные догадки)",
    comp_col_nexreel: "⚡ NEXREEL AI (Точный результат анализа)",
    comp_row1_feat: "Основа анализа",
    comp_row1_old: "Субъективное мнение и случайные советы",
    comp_row1_new: "Официальные факторы Meta и база LiveDune",
    comp_row2_feat: "Поиск ошибок",
    comp_row2_old: "Размытое 'видео не зашло'",
    comp_row2_new: "Точные секунды и скриншоты проблемных кадров",
    comp_row3_feat: "Прогноз охватов",
    comp_row3_old: "Удача и случайность",
    comp_row3_new: "Точность более 95% с учетом истории аккаунта",
    comp_row4_feat: "План исправлений",
    comp_row4_old: "Думаете сами, что исправить",
    comp_row4_new: "Покадровый профессиональный сценарий правок",

    // 5 Drivers Bento
    drivers_badge: "ТЕХНОЛОГИЯ И МЕТОДОЛОГИЯ",
    drivers_title: "5 факторов ранжирования, анализирующие каждую секунду",
    driver_sig1_name: "Сила 0-3с хука",
    driver_sig1_desc: "Динамика в первые 3 секунды, громкость и контраст субтитров.",
    driver_sig2_name: "DM Shares per Reach (Топ #1 в Meta)",
    driver_sig2_desc: "Вероятность отправки видео другу в директ и резонанс темы.",
    driver_sig3_name: "Фактор повторного просмотра (Loop)",
    driver_sig3_desc: "Бесшовность склейки конца и начала видео, глубина просмотра.",
    driver_sig4_name: "Visual Pacing и динамика B-Roll",
    driver_sig4_desc: "Смена планов каждые 1.8-2.2 секунды для удержания фокуса зрителя.",
    driver_sig5_name: "Рыночный бенчмарк LiveDune",
    driver_sig5_desc: "Сравнение с базой из 250,000+ успешных видео в вашем регионе.",
    drivers_guarantee_badge: "ГАРАНТИЯ",
    drivers_guarantee_title: "100% точный результат до публикации",
    drivers_guarantee_desc: "Видео, прошедшие оптимизацию в NEXREEL AI, получают в среднем в 3.8 раза больше охвата и в 4.2 раза больше репостов в DM.",
    drivers_guarantee_btn: "Проверить сейчас",

    // Use Cases
    target_badge: "Для кого создана платформа?",
    target_u1_title: "Эксперты и Личные Бренды",
    target_u1_desc: "Набор лояльной аудитории и постоянный поток клиентов с каждого ролика.",
    target_u2_title: "Мобилографы и Видеомонтажеры",
    target_u2_desc: "Защита правок перед клиентом на основе цифр и графиков, а не споров.",
    target_u3_title: "SMM-агентства и Продакшн",
    target_u3_desc: "Контроль качества всех проектов и гарантированно высокие охваты клиентам.",
    target_u4_title: "Бизнес и E-commerce",
    target_u4_desc: "Масштабирование органических продаж без гигантских бюджетов на таргетинг.",

    // Bottom CTA
    bottom_cta_title: "Выведите свои видео на профессиональный уровень.",
    bottom_cta_desc: "Удовлетворите все технические требования алгоритма Reels до публикации.",
    bottom_cta_btn1: "Анализировать первое видео",
    bottom_cta_btn2: "Тарифы и Оплата",

    // Footer
    footer_desc: "NEXREEL AI — платформа искусственного интеллекта для точного аудита Instagram Reels на основе факторов Meta и бенчмарков LiveDune.",
    footer_col_product: "Продукт",
    footer_col_algo: "Алгоритмы",
    footer_col_legal: "Информация и Контакты",
    footer_privacy: "Политика конфиденциальности",
    footer_terms: "Условия использования",
    footer_contact_tg: "Связь: @pray_boy",
    footer_rights: "Все права защищены.",

    // Analyze Page
    analyze_title: "Алгоритмическая диагностика видео",
    analyze_desc: "Проверьте ваш Reels до публикации: выведет ли его алгоритм Meta в Explore или заблокирует охваты?",
    analyze_engine_badge: "Алгоритм Meta Reels и движок LiveDune",
    analyze_acc_connected: "Подключенный аккаунт:",
    analyze_acc_not_connected: "Instagram аккаунт не подключен",
    analyze_acc_sub_connected: "Прогноз скорректирован под средние охваты вашего аккаунта.",
    analyze_acc_sub_not: "Подключите аккаунт для максимальной точности анализа.",
    analyze_acc_btn_adjust: "Настроить",
    analyze_acc_btn_connect: "Подключить аккаунт",
    analyze_niche_label: "Выберите вашу нишу (для бенчмарков LiveDune):",
    analyze_drop_title: "Перетащите ваше видео Reels сюда",
    analyze_drop_supported: "Поддерживается: MP4, MOV, WebM · Максимально: 500 МБ",
    analyze_watermark_q: "Есть ли водяной знак TikTok или CapCut?",
    analyze_watermark_yes: "Да (пессимизируется)",
    analyze_watermark_no: "Нет (чистое видео)",
    analyze_btn_run: "Анализировать виральность (5 факторов Meta)",
    analyze_disclaimer: "Анализ рассчитывается на основе сигналов ранжирования Meta (Sends/Reach, 3s Hook retention, Loop factor) и истории вашего аккаунта.",
    analyze_progress_text: "Анализируются факторы алгоритма Meta и бенчмарки вашего аккаунта...",

    // Pricing Page
    pricing_title: "Тарифы и Цены",
    pricing_desc: "Профессиональные инструменты для роста охватов и аудитории в Instagram Reels.",
    pricing_plan_free: "Бесплатный",
    pricing_plan_pro: "Pro Автор",
    pricing_plan_agency: "Агентство и SMM",
    pricing_cta_free: "Начать бесплатно",
    pricing_cta_pro: "Перейти на Pro",
    pricing_cta_agency: "Выбрать Agency",
    pricing_popular_badge: "САМЫЙ ПОПУЛЯРНЫЙ",
    pricing_month_unit: "сум / месяц",

    // Accounts Page
    accounts_title: "Калибровка Instagram Аккаунта",
    accounts_desc: "Подключите ваш аккаунт и повысьте точность прогнозов ИИ до 95%+.",
    accounts_form_title: "Ввод данных аккаунта",
    accounts_handle_label: "Имя пользователя Instagram (@handle):",
    accounts_followers_label: "Количество подписчиков:",
    accounts_views_label: "Средние просмотры Reels (базовые):",
    accounts_niche_label: "Основная ниша:",
    accounts_save_btn: "Сохранить данные",

    // Dashboard Page
    dash_title: "Панель управления",
    dash_desc: "Сводка всех проверок, аудитов и показателей эффективности видео.",
    dash_total_audits: "Всего анализов",
    dash_avg_score: "Средний балл",
    dash_viral_rate: "Уровень виральности",
    dash_reach_growth: "Рост охватов",
    dash_recent_videos: "Последние проверенные видео",

    // History Page
    hist_title: "История анализов",
    hist_desc: "Архив всех ранее выполненных нейронных аудитов и отчетов.",
    hist_search: "Поиск по названию видео...",
    hist_empty: "Пока не проведено ни одного анализа.",
    hist_view_btn: "Посмотреть отчет",

    // Reports Page
    rep_title: "Алгоритмический отчет",
    rep_export_pdf: "Скачать PDF",
    rep_back_btn: "Назад в историю",
    rep_overall: "Общая оценка",
    rep_drivers_title: "5 факторов алгоритма Meta",
    rep_deficiencies_title: "Посекундный список недочетов",
    rep_recommendations: "План исправлений и рекомендации",

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

    // Payment Modal
    payment_upgrade: "Повысить тариф",
    payment_confirm_btn: "Я оплатил (Активировать)",
    payment_contact_label: "Ваш номер телефона или юзернейм в Telegram:",
    payment_note_label: "Примечание к оплате (необязательно):",
    payment_success_title: "Заявка на оплату отправлена!",
    payment_success_desc: "Как только администратор подтвердит перевод, подписка активируется.",

    // General Actions
    copy: "Копировать",
    copied: "Скопировано!",
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    loading: "Загрузка...",
    back: "Назад",
    status: "Статус",
    close: "Закрыть",
  },

  en: {
    // Nav & Header
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
    nav_logout: "Log Out",

    // Hero Section
    hero_badge: "100% MATHEMATICAL AUDIT",
    hero_engine: "NEXREEL NEURAL ENGINE v3.4",
    hero_title_1: "Eliminate the guesswork.",
    hero_title_2: "Algorithmic Precision",
    hero_title_3: "Audit Results.",
    hero_desc: "Perform a comprehensive neural pre-flight audit of your Instagram Reels before publishing. Pinpoint drop-off moments using Meta ranking drivers and LiveDune benchmarks.",
    hero_cta_analyze: "Analyze Video",
    hero_cta_connect: "Calibrate Account",
    hero_spec_size: "Video Capacity (4K/60fps)",
    hero_spec_drivers: "Meta Official Drivers",
    hero_spec_benchmark: "LiveDune Benchmark Database",

    // Terminal Preview
    diag_core_title: "AUDIT-CORE // reel_diagnostics_pro.mp4",
    diag_verdict_fly: "VIRAL (94/100)",
    diag_overall_score: "Overall Score",
    diag_explore_chance: "Explore Probability",
    diag_reach_result: "Reach Forecast",
    diag_confidence: "Prediction Confidence",
    diag_drivers_title: "Meta Algorithm Driver Indicators",
    diag_rec_title: "Neural Recommendation (00:04):",
    diag_rec_desc: "Visual pacing dropped for 1.4s. Boosting sound effects (SFX) will recover viewer retention by +14%.",
    diag_status_done: "STATUS: DIAGNOSTICS COMPLETED",
    diag_check_own: "Test your video",

    // Quick Dropzone
    drop_badge: "INSTANT LAUNCH",
    drop_title: "Audit Your Reels Video Right Now",
    drop_desc: "No complicated signups required. Drop files up to 500MB and receive instant, mathematically rigorous diagnostic results.",
    drop_box_title: "Drag and drop your video here or select a file",
    drop_box_sub: "MP4, MOV, WebM · up to 500MB · 100% Private & Secure",
    drop_btn_scan: "Start Algorithmic Scan",

    // Comparison Section
    comp_badge: "SEE THE DIFFERENCE",
    comp_title: "Old Guesswork vs NEXREEL AI",
    comp_desc: "Why top creators and leading creative agencies abandon guesswork and rely on mathematical audits.",
    comp_col_feature: "CRITERIA / CAPABILITY",
    comp_col_old: "❌ Old Method (Subjective Guesswork)",
    comp_col_nexreel: "⚡ NEXREEL AI (Precision Diagnostics)",
    comp_row1_feat: "Analysis Foundation",
    comp_row1_old: "Subjective opinions and fuzzy advice",
    comp_row1_new: "Official Meta drivers & LiveDune database",
    comp_row2_feat: "Error Detection",
    comp_row2_old: "Vague feedback like 'content feels weak'",
    comp_row2_new: "Exact frame screenshots and drop-off timestamps",
    comp_row3_feat: "Reach Prediction",
    comp_row3_old: "Pure luck and coin flips",
    comp_row3_new: "95%+ accuracy calibrated against account history",
    comp_row4_feat: "Actionable Fix Plan",
    comp_row4_old: "Guess what to edit yourself",
    comp_row4_new: "Step-by-step frame-by-frame editing directives",

    // 5 Drivers Bento
    drivers_badge: "TECHNOLOGY & METHODOLOGY",
    drivers_title: "5 Ranking Drivers Inspecting Every Second",
    driver_sig1_name: "0-3s Hook Neural Strength",
    driver_sig1_desc: "First 3 seconds dynamic motion, audio impact, and caption contrast ratio.",
    driver_sig2_name: "DM Shares per Reach (Meta #1 Signal)",
    driver_sig2_desc: "Likelihood of peer-to-peer direct message forwarding and topic resonance.",
    driver_sig3_name: "Loop Factor & Re-watch Velocity",
    driver_sig3_desc: "Seamless ending-to-beginning audio/visual loop and completion rate.",
    driver_sig4_name: "Visual Pacing & B-Roll Dynamics",
    driver_sig4_desc: "Frame transitions every 1.8-2.2 seconds to maintain high viewer attention.",
    driver_sig5_name: "LiveDune Industry Benchmarks",
    driver_sig5_desc: "Benchmarking against 250,000+ top-performing videos in your regional niche.",
    drivers_guarantee_badge: "GUARANTEE",
    drivers_guarantee_title: "100% Pre-Flight Confidence",
    drivers_guarantee_desc: "Videos audited and revised with NEXREEL AI gain an average of 3.8x more reach and 4.2x more DM shares.",
    drivers_guarantee_btn: "Audit Video Now",

    // Use Cases
    target_badge: "Who Is This Built For?",
    target_u1_title: "Creators & Personal Brands",
    target_u1_desc: "Build highly engaged followings and turn every reel into a client acquisition machine.",
    target_u2_title: "Videographers & Video Editors",
    target_u2_desc: "Defend your edits with concrete algorithmic data rather than subjective client debates.",
    target_u3_title: "SMM Agencies & Production Houses",
    target_u3_desc: "Standardize quality control across all client channels with guaranteed high reach.",
    target_u4_title: "Business & E-Commerce Owners",
    target_u4_desc: "Scale organic customer acquisition without relying solely on high ad budgets.",

    // Bottom CTA
    bottom_cta_title: "Elevate your Reels to professional mastery.",
    bottom_cta_desc: "Fulfill all Meta algorithm requirements before hitting the publish button.",
    bottom_cta_btn1: "Audit First Video",
    bottom_cta_btn2: "Plans & Pricing",

    // Footer
    footer_desc: "NEXREEL AI — Neural artificial intelligence platform for precision Instagram Reels audits powered by Meta signals and LiveDune benchmarks.",
    footer_col_product: "Product",
    footer_col_algo: "Algorithms",
    footer_col_legal: "Legal & Contacts",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
    footer_contact_tg: "Contact: @pray_boy",
    footer_rights: "All rights reserved.",

    // Analyze Page
    analyze_title: "Algorithmic Video Diagnostics",
    analyze_desc: "Pre-flight audit your Reels before publishing: will Meta push it to Explore or suppress its reach?",
    analyze_engine_badge: "Meta Reels Algorithm & LiveDune Engine",
    analyze_acc_connected: "Connected Account:",
    analyze_acc_not_connected: "Instagram account not connected",
    analyze_acc_sub_connected: "Predictions calibrated against your historical average view velocity.",
    analyze_acc_sub_not: "Connect your account for enhanced prediction accuracy.",
    analyze_acc_btn_adjust: "Configure",
    analyze_acc_btn_connect: "Connect Account",
    analyze_niche_label: "Select your niche (for LiveDune regional benchmarks):",
    analyze_drop_title: "Drop your Reels video file here",
    analyze_drop_supported: "Supported formats: MP4, MOV, WebM · Max file size: 500MB",
    analyze_watermark_q: "Does this video have a TikTok or CapCut watermark?",
    analyze_watermark_yes: "Yes (Will be penalized)",
    analyze_watermark_no: "No (Clean footage)",
    analyze_btn_run: "Analyze Virality (5 Meta Drivers)",
    analyze_disclaimer: "Calculated using official Meta ranking signals (Sends/Reach, 3s Hook retention, Loop factor) and account historical averages.",
    analyze_progress_text: "Evaluating Meta algorithm signals and account benchmark metrics...",

    // Pricing Page
    pricing_title: "Plans & Pricing",
    pricing_desc: "Professional AI tooling designed to scale your Instagram Reels presence and audience reach.",
    pricing_plan_free: "Free",
    pricing_plan_pro: "Pro Creator",
    pricing_plan_agency: "Agency & SMM",
    pricing_cta_free: "Start Free",
    pricing_cta_pro: "Upgrade to Pro",
    pricing_cta_agency: "Start Agency",
    pricing_popular_badge: "MOST POPULAR",
    pricing_month_unit: "UZS / month",

    // Accounts Page
    accounts_title: "Instagram Account Calibration",
    accounts_desc: "Calibrate your account metrics to increase AI prediction accuracy to 95%+.",
    accounts_form_title: "Account Credentials & Parameters",
    accounts_handle_label: "Instagram username (@handle):",
    accounts_followers_label: "Followers count:",
    accounts_views_label: "Average baseline reel views:",
    accounts_niche_label: "Primary content niche:",
    accounts_save_btn: "Save Account Settings",

    // Dashboard Page
    dash_title: "Dashboard Overview",
    dash_desc: "Aggregated metrics, past audits, and video performance trends.",
    dash_total_audits: "Total Audits",
    dash_avg_score: "Average Score",
    dash_viral_rate: "Virality Ratio",
    dash_reach_growth: "Reach Growth",
    dash_recent_videos: "Recently Audited Reels",

    // History Page
    hist_title: "Audit History",
    hist_desc: "Historical archive of all previous video diagnostics and reports.",
    hist_search: "Search by video filename...",
    hist_empty: "No video audits found in history yet.",
    hist_view_btn: "View Report",

    // Reports Page
    rep_title: "Diagnostic Report",
    rep_export_pdf: "Download PDF",
    rep_back_btn: "Back to History",
    rep_overall: "Overall Score",
    rep_drivers_title: "5 Meta Algorithm Drivers",
    rep_deficiencies_title: "Second-by-Second Deficiencies",
    rep_recommendations: "Actionable Fix Checklist",

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

    // Payment Modal
    payment_upgrade: "Upgrade Plan",
    payment_confirm_btn: "I Have Paid (Activate)",
    payment_contact_label: "Your Phone number or Telegram username:",
    payment_note_label: "Payment comment or reference (optional):",
    payment_success_title: "Payment request sent to admin!",
    payment_success_desc: "As soon as administrator approves the transfer, your plan will activate.",

    // General Actions
    copy: "Copy",
    copied: "Copied!",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    loading: "Loading...",
    back: "Back",
    status: "Status",
    close: "Close",
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS.uz;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string, fallback?: string) => string;
  currentOption: LanguageOption;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_LANG_KEY = "nexreel_language";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_LANG_KEY) as Language | null;
        if (saved && (saved === "uz" || saved === "ru" || saved === "en")) {
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

  const t = (key: TranslationKey | string, fallback?: string): string => {
    const dict = (TRANSLATIONS as any)[language] || TRANSLATIONS.uz;
    return dict[key] || (TRANSLATIONS.uz as any)[key] || fallback || key;
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
    return {
      language: "uz" as Language,
      setLanguage: () => {},
      t: (key: TranslationKey | string, fallback?: string) =>
        (TRANSLATIONS.uz as any)[key] || fallback || key,
      currentOption: LANGUAGES[0],
    };
  }
  return ctx;
}
