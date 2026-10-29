#!/usr/bin/env python3
"""
========================================================
     NEXREEL AI - TELEGRAM BOT SERVER (1-KLIK DOSTUP)
========================================================
Ushbu skript Telegram bot (@nexreel_ai_bot) orqali kelgan
to'lov so'rovlariga Telegramning o'zida bitta tugma bosib
mijozga dostup berishni ta'minlaydi.
"""

import sys
import os
import json
import time
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime

BOT_TOKEN = "9223798428:AAF6LQXC_keybg0lUZ-fNXbEYiIz-JqNXRg"
ADMIN_CHAT_ID = "5126649501"

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
GRANTS_FILE = os.path.join(DATA_DIR, "nexreel_active_grants.json")

def api_call(method, payload=None):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    headers = {"Content-Type": "application/json"}
    data = json.dumps(payload).encode("utf-8") if payload else None
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"API Xatosi [{method}]: {e.code} - {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"Ulanish xatosi [{method}]: {e}")
        return None

def load_grants():
    if os.path.exists(GRANTS_FILE):
        try:
            with open(GRANTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_grant(contact, plan, days, code):
    grants = load_grants()
    clean_id = contact.strip().lower()
    grants[clean_id] = {
        "contact": contact,
        "plan": plan,
        "days": days,
        "code": code,
        "activatedAt": datetime.now().isoformat(),
        "expiresAt": datetime.fromtimestamp(time.time() + days * 86400).isoformat(),
    }
    with open(GRANTS_FILE, "w", encoding="utf-8") as f:
        json.dump(grants, f, indent=2, ensure_ascii=False)
    print(f"[*] Yangi dostup saqlandi: {contact} -> {plan.upper()} ({days} kun)")

def handle_callback_query(cq):
    cq_id = cq.get("id")
    data = cq.get("data", "")
    msg = cq.get("message", {})
    chat_id = msg.get("chat", {}).get("id")
    message_id = msg.get("message_id")
    original_text = msg.get("text", "") or ""

    print(f"[+] Tugma bosildi: {data} (Foydalanuvchi: {cq.get('from', {}).get('first_name')})")

    # approve_{reqId}_{days}
    if data.startswith("approve_"):
        parts = data.split("_")
        days = 30
        if len(parts) >= 3 and parts[2].isdigit():
            days = int(parts[2])

        # Asl xabardan mijoz ma'lumotlarini qidirish
        contact = "Mijoz"
        plan = "pro"
        code = f"PRO-{days}D-ACTIVATE"

        for line in original_text.split("\n"):
            if "Mijoz:" in line:
                contact = line.replace("Mijoz:", "").strip()
            elif "Tarif:" in line:
                if "agency" in line.lower():
                    plan = "agency"
            elif "Aktivatsiya Kodi:" in line:
                code = line.replace("Aktivatsiya Kodi:", "").strip()

        save_grant(contact, plan, days, code)

        # Telegram pop-up tasdig'i
        api_call("answerCallbackQuery", {
            "callback_query_id": cq_id,
            "text": f"✅ {contact} uchun {plan.upper()} tarifi ({days} kun) faollashtirildi!",
            "show_alert": True
        })

        # Xabarni yangilash (tasdiqlangan holatga keltirish)
        date_str = datetime.now().strftime("%d.%m.%Y, %H:%M")
        new_text = f"""✅ <b>TO'LOV TASDIQLANDI VA DOSTUP BERILDI!</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Mijoz:</b> <code>{contact}</code>
💳 <b>Tarif:</b> <b>{plan.upper()} ({days} kun)</b>
🕒 <b>Tasdiqlangan vaqt:</b> {date_str}
🔑 <b>Aktivatsiya Kodi:</b> <code>{code}</code>
━━━━━━━━━━━━━━━━━━━━
🎉 <i>Mijoz platformaga kirganda uning tarifi faol bo'ladi yoki ushbu kod orqali istalgan qurilmadan faollashtira oladi.</i>"""

        # Yangilangan tugmalar
        new_keyboard = []
        clean_contact = contact.replace("@", "").strip()
        if contact.startswith("@") or not contact.startswith("+"):
            tg_text = urllib.parse.quote(f"Assalomu alaykum! NEXREEL AI platformasidagi sizning {plan.upper()} obunangiz faollashtirildi! Kirish kodingiz: {code}\nSayt: https://reelsight-pro.lovable.app")
            new_keyboard.append([{
                "text": "💬 Mijozga xabar yuborish (Telegram)",
                "url": f"https://t.me/{clean_contact}?text={tg_text}"
            }])

        api_call("editMessageText", {
            "chat_id": chat_id,
            "message_id": message_id,
            "text": new_text,
            "parse_mode": "HTML",
            "reply_markup": {"inline_keyboard": new_keyboard} if new_keyboard else None
        })

    elif data.startswith("reject_"):
        api_call("answerCallbackQuery", {
            "callback_query_id": cq_id,
            "text": "❌ So'rov rad etildi.",
            "show_alert": False
        })
        api_call("editMessageText", {
            "chat_id": chat_id,
            "message_id": message_id,
            "text": original_text + "\n\n❌ <i>Ushbu to'lov so'rovi administrator tomonidan rad etildi.</i>",
            "parse_mode": "HTML",
            "reply_markup": None
        })

def main():
    print("=" * 60)
    print("       NEXREEL AI - TELEGRAM BOT SERVER ISHGA TUSHDI")
    print("=" * 60)
    bot_info = api_call("getMe")
    if not bot_info or not bot_info.get("ok"):
        print("[!] Botga ulanib bo'lmadi. Tokenni tekshiring.")
        return

    bot = bot_info["result"]
    print(f"[*] Bot nomi: @{bot.get('username')} ({bot.get('first_name')})")
    print(f"[*] Admin Chat ID: {ADMIN_CHAT_ID}")
    print("[*] To'lov so'rovlari va 1-bosishda dostup berish tugmalari tinglanmoqda...")
    print("=" * 60)

    offset = None
    while True:
        try:
            payload = {"timeout": 20}
            if offset:
                payload["offset"] = offset

            resp = api_call("getUpdates", payload)
            if resp and resp.get("ok"):
                for update in resp.get("result", []):
                    offset = update["update_id"] + 1

                    # Inline Callback tugmasi bosilgan bo'lsa
                    if "callback_query" in update:
                        handle_callback_query(update["callback_query"])

                    # Oddiy xabar kelgan bo'lsa (/start)
                    elif "message" in update:
                        msg = update["message"]
                        text = msg.get("text", "")
                        from_user = msg.get("from", {})
                        user_chat_id = msg.get("chat", {}).get("id")

                        if text == "/start":
                            welcome = """👋 <b>Assalomu alaykum!</b>

Men <b>NEXREEL AI</b> rasmiy to'lov va notifikatsiya botiman.
Saytda mijozlar to'lov so'rovi yuborganda, ushbu botga xabar keladi va siz bitta tugma bosish orqali ularga dostup bera olasiz!

🌐 Rasmiy platforma: <b>NEXREEL AI</b>"""
                            api_call("sendMessage", {
                                "chat_id": user_chat_id,
                                "text": welcome,
                                "parse_mode": "HTML"
                            })

        except KeyboardInterrupt:
            print("\n[!] Bot to'xtatildi.")
            break
        except Exception as e:
            print(f"[!] Kutilmagan xatolik: {e}")
            time.sleep(3)

if __name__ == "__main__":
    main()
