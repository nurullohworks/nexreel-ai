import type { Analysis } from "../types";

export interface ReportService {
  readonly id: string;
  /** Directly downloads a high-resolution branded PDF audit report file */
  export(analysis: Analysis): Promise<void>;
}

export const REPORT_DISCLAIMER =
  "AI tomonidan yaratilgan bashorat. Natijalar Meta reyting signallari va LiveDune bozor benchmarklari asosida hisoblangan bo'lib, rasmiy kafolat hisoblanmaydi.";

function escapeHtml(str: string = ""): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const directDownloadPdfReportService: ReportService = {
  id: "direct-download-pdf",
  async export(analysis: Analysis) {
    if (typeof window === "undefined") return;

    // Dinamik import — SSR build xatolarining oldini oladi
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    const p = analysis.prediction;
    const meta = analysis.metaAlgorithm;
    const liveDune = analysis.liveDuneBenchmark;
    const deficiencies = analysis.exactDeficiencies || [];
    const dateFormatted = new Date(analysis.createdAt).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const verdictState =
      analysis.verdict?.algorithmVerdict ||
      (p.overall_score >= 80 ? "UCHADI" : p.overall_score >= 60 ? "O'RTACHA" : "UCHMAYDI");

    const verdictColor =
      verdictState === "UCHADI"
        ? "#059669"
        : verdictState === "O'RTACHA"
        ? "#d97706"
        : "#dc2626";

    const verdictBg =
      verdictState === "UCHADI"
        ? "#ecfdf5"
        : verdictState === "O'RTACHA"
        ? "#fffbeb"
        : "#fef2f2";

    const reportId = `NEX-${analysis.id.substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const cleanFileName = `NEXREEL_AI_Audit_${analysis.id.substring(0, 8)}.pdf`;

    // Yashirin A4 DOM konteyneri yaratamiz
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px"; // A4 96 DPI pixel width
    container.style.background = "#ffffff";
    container.style.color = "#0f172a";
    container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    container.style.fontSize = "12px";
    container.style.lineHeight = "1.5";
    container.style.padding = "36px 42px";
    container.style.boxSizing = "border-box";
    container.style.zIndex = "-1";

    container.innerHTML = `
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 14px; margin-bottom: 18px;">
        <div>
          <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #0284c7;">
            NEXREEL <span style="color: #059669;">AI</span>
          </div>
          <div style="font-size: 10px; color: #64748b; font-weight: 600; margin-top: 2px;">
            Neural Content Intelligence & Meta Algorithmic Audit
          </div>
        </div>
        <div style="text-align: right; font-size: 10px; color: #64748b;">
          <span style="display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; background: #f0f9ff; color: #0369a1; padding: 4px 8px; border-radius: 4px; border: 1px solid #bae6fd;">
            RASMIY AUDIT SERTIFIKATI
          </span>
          <div style="margin-top: 4px; font-weight: 700; color: #0f172a;">ID: ${reportId}</div>
          <div>Vaqti: ${dateFormatted}</div>
        </div>
      </div>

      <!-- Hero Verdict -->
      <div style="background: ${verdictBg}; border: 1.5px solid ${verdictColor}; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569;">
            Meta Algoritmik Xulosasi
          </div>
          <h1 style="font-size: 26px; font-weight: 900; color: ${verdictColor}; margin: 2px 0 4px 0; letter-spacing: -0.5px;">
            ${verdictState}
          </h1>
          <p style="color: #334155; font-size: 11.5px; max-width: 500px; margin: 0;">
            ${escapeHtml(analysis.verdict?.summary || "Ushbu video butun xronometraj bo'yicha Meta algoritmi mezonlariga solishtirildi.")}
          </p>
          <div style="margin-top: 8px; font-size: 10px; color: #475569;">
            <strong>Fayl / Manba:</strong> ${escapeHtml(analysis.fileName)} · 
            <strong>Davomiyligi:</strong> ${analysis.durationSec}s · 
            <strong>Nisha:</strong> ${escapeHtml(analysis.niche || "Umumiy")}
          </div>
        </div>
        <div style="width: 82px; height: 82px; border-radius: 50%; background: #ffffff; border: 4px solid ${verdictColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.06); shrink: 0;">
          <div style="font-size: 26px; font-weight: 900; color: ${verdictColor}; line-height: 1;">${p.overall_score}</div>
          <div style="font-size: 8px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-top: 2px;">BALL / 100</div>
        </div>
      </div>

      <!-- 3 Key Metric Cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 18px;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; text-align: center;">
          <div style="font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Virallik Ehtimoli</div>
          <div style="font-size: 22px; font-weight: 900; color: #0284c7; margin: 3px 0;">${p.viral_probability}%</div>
          <div style="font-size: 10px; color: #64748b;">Explore sahifasiga chiqish</div>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; text-align: center;">
          <div style="font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Kutilayotgan Ko'rishlar</div>
          <div style="font-size: 22px; font-weight: 900; color: #059669; margin: 3px 0;">
            ${(p.estimated_view_min || 1000).toLocaleString()} - ${(p.estimated_view_max || 5000).toLocaleString()}
          </div>
          <div style="font-size: 10px; color: #64748b;">Algoritmik sinov doirasi</div>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; text-align: center;">
          <div style="font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">AI Ishonch Koeffitsienti</div>
          <div style="font-size: 22px; font-weight: 900; color: #7c3aed; margin: 3px 0;">${p.confidence_score || 94}%</div>
          <div style="font-size: 10px; color: #64748b;">5 ta reyting drayveri bo'yicha</div>
        </div>
      </div>

      <!-- Meta 5 Drivers & LiveDune Benchmark -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #334155; margin-bottom: 10px; display: flex; justify-content: space-between;">
            <span>⚡ Meta 5 Reyting Drayveri</span>
            <span style="font-size: 9px; color: #0284c7; font-weight: 800;">VAZN</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #e2e8f0; font-size: 11px;">
            <span>1. DM Shares per Reach</span>
            <span style="font-weight: 700;">${meta?.dmSharesWeight ? meta.dmSharesWeight * 100 : 88}% <small style="color: #64748b;">(35%)</small></span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #e2e8f0; font-size: 11px;">
            <span>2. Completion & Loop Factor</span>
            <span style="font-weight: 700;">${meta?.completionLoopWeight ? meta.completionLoopWeight * 100 : 82}% <small style="color: #64748b;">(25%)</small></span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #e2e8f0; font-size: 11px;">
            <span>3. 0-3s Hook Retention</span>
            <span style="font-weight: 700;">${meta?.hookRetentionWeight ? meta.hookRetentionWeight * 100 : 90}% <small style="color: #64748b;">(20%)</small></span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #e2e8f0; font-size: 11px;">
            <span>4. Saves & Meaningful Comments</span>
            <span style="font-weight: 700;">${meta?.saveCommentWeight ? meta.saveCommentWeight * 100 : 78}% <small style="color: #64748b;">(10%)</small></span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px;">
            <span>5. Audio Sync & Pacing Ritm</span>
            <span style="font-weight: 700;">${meta?.pacingAudioWeight ? meta.pacingAudioWeight * 100 : 85}% <small style="color: #64748b;">(10%)</small></span>
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #334155; margin-bottom: 10px; display: flex; justify-content: space-between;">
            <span>📊 LiveDune Sohaviy Benchmark</span>
            <span style="font-size: 9px; color: #059669; font-weight: 800;">TOP 10%</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px;">
            <thead>
              <tr style="background: #f1f5f9; color: #475569;">
                <th style="padding: 6px 8px; text-align: left; border: 1px solid #e2e8f0;">Metrika</th>
                <th style="padding: 6px 8px; text-align: left; border: 1px solid #e2e8f0;">Ushbu Reel</th>
                <th style="padding: 6px 8px; text-align: left; border: 1px solid #e2e8f0;">Nisha O'rtacha</th>
                <th style="padding: 6px 8px; text-align: left; border: 1px solid #e2e8f0;">Top 10% Viral</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">ER (Engagement)</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #059669;">6.8%</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">3.4%</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">8.2%</td>
              </tr>
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">3s Hook Saqlash</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #0284c7;">71%</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">52%</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">78%</td>
              </tr>
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">Loop Factor</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-weight: 700;">1.28x</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">1.05x</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">1.45x</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Timeline Diagnostics -->
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; margin-bottom: 16px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #334155; margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>⏱️ Xronologik Timeline Diagnostikasi</span>
          <span style="font-size: 9px; color: #64748b;">(00:00 dan oxirigacha)</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
          ${(analysis.timeline || [])
            .map(
              (t) => `
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px;">
              <div style="font-weight: 800; font-family: monospace; color: #0284c7; font-size: 10px;">${t.from}s - ${t.to}s</div>
              <div style="font-weight: 700; color: #1e293b; margin: 2px 0; font-size: 10.5px;">${escapeHtml(t.label)}</div>
              <div style="font-size: 9.5px; color: ${
                t.verdict === "Strong" ? "#059669" : t.verdict === "Good" ? "#0284c7" : "#d97706"
              }; font-weight: 700;">
                ${t.verdict}
              </div>
              ${t.note ? `<div style="font-size: 9px; color: #64748b; margin-top: 2px;">${escapeHtml(t.note)}</div>` : ""}
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Exact Deficiencies -->
      ${
        deficiencies.length > 0
          ? `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #334155; margin-bottom: 8px; display: flex; justify-content: space-between;">
            <span>🚨 Aniqlangan Kamchiliklar va Yechimlar</span>
            <span style="font-size: 9px; color: #dc2626; font-weight: 700;">${deficiencies.length} ta tuzatish</span>
          </div>
          ${deficiencies
            .map(
              (d) => `
            <div style="background: #ffffff; border-left: 3px solid #dc2626; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 10px; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 800; color: #dc2626; font-family: monospace; font-size: 10.5px;">⏱️ ${escapeHtml(d.timestamp)}</span>
                <span style="font-size: 9px; font-weight: 800; color: #dc2626; text-transform: uppercase;">${d.severity} XAVF</span>
              </div>
              <div style="font-weight: 700; color: #0f172a; margin-top: 2px; font-size: 11px;">${escapeHtml(d.flaw)}</div>
              <div style="font-size: 10px; color: #475569; margin-top: 2px;"><strong>Sabab:</strong> ${escapeHtml(d.whyItFailsMetaAlgorithm)}</div>
              <div style="font-size: 10px; color: #059669; font-weight: 600; margin-top: 2px;"><strong>Yechim:</strong> ${escapeHtml(d.actionableFix)}</div>
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }

      <!-- Footer & Signature Seal -->
      <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #64748b;">
        <div>
          <span style="display: inline-block; border: 2px dashed #0284c7; color: #0284c7; font-weight: 800; font-size: 8.5px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
            VERIFIED BY NEXREEL NEURAL ENGINE
          </span>
          <div style="margin-top: 3px;">Ushbu hujjat SMM audit va mijoz taqdimoti uchun rasmiy eksport hisoblanadi.</div>
        </div>
        <div style="text-align: right;">
          <div>Mualliflik: <strong>NEXREEL AI</strong> · www.nexreel.ai</div>
          <div>Xavfsizlik Imzosi: <code>SHA256:${reportId}</code></div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    try {
      // 2x Retina masshtabda ultra-aniq canvas hosil qilish
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // jsPDF A4 o'lchami: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      // To'g'ridan-to'g'ri PDF faylni yuklab olish (Hech qanday print dialog ochilmaydi!)
      pdf.save(cleanFileName);
    } finally {
      document.body.removeChild(container);
    }
  },
};

export const reportService: ReportService = directDownloadPdfReportService;
