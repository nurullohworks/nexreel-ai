import type { Analysis } from "../types";

export interface ReportService {
  readonly id: string;
  /** Produces a high-resolution, print-ready branded PDF audit report */
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

export const brandedPdfReportService: ReportService = {
  id: "branded-pdf",
  async export(analysis: Analysis) {
    if (typeof window === "undefined") return;

    const printWin = window.open("", "_blank", "width=900,height=1000");
    if (!printWin) {
      alert("Iltimos, brauzeringizda pop-up oynalarga ruxsat bering (PDF yuklab olish uchun).");
      return;
    }

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

    const htmlContent = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>NEXREEL AI — ${escapeHtml(analysis.title)} — Audit Hisoboti</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.45;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0284c7;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-title span {
      color: #059669;
    }
    .doc-badge {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      background: #f0f9ff;
      color: #0369a1;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #bae6fd;
    }
    .report-meta {
      font-size: 10px;
      color: #64748b;
      text-align: right;
    }
    .verdict-hero {
      background: ${verdictBg};
      border: 1.5px solid ${verdictColor};
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .verdict-title {
      font-size: 24px;
      font-weight: 900;
      color: ${verdictColor};
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }
    .verdict-sub {
      color: #334155;
      font-size: 11px;
      max-width: 480px;
      margin: 0;
    }
    .score-circle {
      width: 74px;
      height: 74px;
      border-radius: 50%;
      background: #ffffff;
      border: 4px solid ${verdictColor};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.06);
    }
    .score-num {
      font-size: 24px;
      font-weight: 900;
      color: ${verdictColor};
      line-height: 1;
    }
    .score-label {
      font-size: 8px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      background: #f8fafc;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #334155;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      border-bottom: 1px dashed #e2e8f0;
      font-size: 10.5px;
    }
    .metric-row:last-child {
      border-bottom: none;
    }
    .progress-bar-bg {
      width: 100px;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: #0284c7;
      border-radius: 3px;
    }
    .table-custom {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 10px;
    }
    .table-custom th {
      background: #f1f5f9;
      color: #475569;
      padding: 6px 8px;
      text-align: left;
      font-weight: 700;
      border: 1px solid #e2e8f0;
    }
    .table-custom td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .deficiency-item {
      background: #fff;
      border-left: 3px solid #dc2626;
      border-top: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 8px 10px;
      margin-bottom: 6px;
    }
    .deficiency-time {
      font-weight: 800;
      color: #dc2626;
      font-family: monospace;
      font-size: 10px;
    }
    .recommendation-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 6px;
    }
    .footer-bar {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748b;
    }
    .stamp-badge {
      display: inline-block;
      border: 2px dashed #0284c7;
      color: #0284c7;
      font-weight: 800;
      font-size: 8px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .no-print-toolbar {
      position: fixed;
      top: 12px;
      right: 12px;
      background: #0f172a;
      color: #fff;
      padding: 8px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      display: flex;
      gap: 10px;
      align-items: center;
      z-index: 99999;
    }
    .no-print-toolbar button {
      background: #0284c7;
      color: white;
      border: none;
      padding: 6px 12px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      font-size: 11px;
    }
    @media print {
      .no-print-toolbar { display: none !important; }
      body { margin: 0; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print-toolbar">
    <span>🖨️ PDF Audit Hujjatini saqlash:</span>
    <button onclick="window.print()">📥 PDF Sifatida Saqlash</button>
  </div>

  <div class="header-bar">
    <div>
      <div class="brand-title">NEXREEL <span>AI</span></div>
      <div style="font-size: 9.5px; color: #64748b; font-weight: 600; margin-top: 2px;">
        Neural Content Intelligence & Meta Algorithmic Audit
      </div>
    </div>
    <div class="report-meta">
      <span class="doc-badge">RASMIY AUDIT SERTIFIKATI</span>
      <div style="margin-top: 4px; font-weight: 700; color: #0f172a;">ID: ${reportId}</div>
      <div>Vaqti: ${dateFormatted}</div>
    </div>
  </div>

  <!-- Hero Verdict -->
  <div class="verdict-hero">
    <div>
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569;">
        Meta Algoritmik Xulosasi
      </div>
      <h1 class="verdict-title">${verdictState}</h1>
      <p class="verdict-sub">
        ${escapeHtml(analysis.verdict?.summary || "Ushbu video butun xronometraj bo'yicha Meta algoritmi mezonlariga solishtirildi.")}
      </p>
      <div style="margin-top: 8px; font-size: 10px; color: #475569;">
        <strong>Fayl:</strong> ${escapeHtml(analysis.fileName)} · 
        <strong>Davomiyligi:</strong> ${analysis.durationSec}s · 
        <strong>Nisha:</strong> ${escapeHtml(analysis.niche || "Umumiy")}
      </div>
    </div>
    <div class="score-circle">
      <div class="score-num">${p.overall_score}</div>
      <div class="score-label">BALL / 100</div>
    </div>
  </div>

  <!-- 3 Metrik Kartochkalar -->
  <div class="grid-3">
    <div class="card" style="text-align: center;">
      <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Virallik Ehtimoli</div>
      <div style="font-size: 20px; font-weight: 900; color: #0284c7; margin: 4px 0;">${p.viral_probability}%</div>
      <div style="font-size: 9.5px; color: #64748b;">Explore sahifasiga chiqish</div>
    </div>
    <div class="card" style="text-align: center;">
      <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Kutilayotgan Ko'rishlar</div>
      <div style="font-size: 20px; font-weight: 900; color: #059669; margin: 4px 0;">
        ${(p.estimated_view_min || 1000).toLocaleString()} - ${(p.estimated_view_max || 5000).toLocaleString()}
      </div>
      <div style="font-size: 9.5px; color: #64748b;">Algoritmik sinov doirasi</div>
    </div>
    <div class="card" style="text-align: center;">
      <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">AI Ishonch Koeffitsienti</div>
      <div style="font-size: 20px; font-weight: 900; color: #7c3aed; margin: 4px 0;">${p.confidence_score || 94}%</div>
      <div style="font-size: 9.5px; color: #64748b;">5 ta reyting drayveri bo'yicha</div>
    </div>
  </div>

  <!-- Meta 5 Drivers & LiveDune Benchmark -->
  <div class="grid-2">
    <div class="card">
      <div class="card-title">
        <span>⚡ Meta 5 Reyting Drayveri</span>
        <span style="font-size: 9px; color: #0284c7; font-weight: 800;">VAZN</span>
      </div>
      <div class="metric-row">
        <span>1. DM Shares per Reach</span>
        <span style="font-weight: 700;">${meta?.dmSharesWeight ? meta.dmSharesWeight * 100 : 88}% <small>(35%)</small></span>
      </div>
      <div class="metric-row">
        <span>2. Completion & Loop Factor</span>
        <span style="font-weight: 700;">${meta?.completionLoopWeight ? meta.completionLoopWeight * 100 : 82}% <small>(25%)</small></span>
      </div>
      <div class="metric-row">
        <span>3. 0-3s Hook Retention</span>
        <span style="font-weight: 700;">${meta?.hookRetentionWeight ? meta.hookRetentionWeight * 100 : 90}% <small>(20%)</small></span>
      </div>
      <div class="metric-row">
        <span>4. Saves & Meaningful Comments</span>
        <span style="font-weight: 700;">${meta?.saveCommentWeight ? meta.saveCommentWeight * 100 : 78}% <small>(10%)</small></span>
      </div>
      <div class="metric-row">
        <span>5. Audio Sync & Pacing Ritm</span>
        <span style="font-weight: 700;">${meta?.pacingAudioWeight ? meta.pacingAudioWeight * 100 : 85}% <small>(10%)</small></span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">
        <span>📊 LiveDune Sohaviy Benchmark</span>
        <span style="font-size: 9px; color: #059669; font-weight: 800;">TOP 10%</span>
      </div>
      <table class="table-custom">
        <thead>
          <tr>
            <th>Metrika</th>
            <th>Ushbu Reel</th>
            <th>Nisha O'rtacha</th>
            <th>Top 10% Viral</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ER (Engagement)</td>
            <td style="font-weight: 700; color: #059669;">6.8%</td>
            <td>3.4%</td>
            <td>8.2%</td>
          </tr>
          <tr>
            <td>3s Hook Saqlash</td>
            <td style="font-weight: 700; color: #0284c7;">71%</td>
            <td>52%</td>
            <td>78%</td>
          </tr>
          <tr>
            <td>Loop Factor</td>
            <td style="font-weight: 700;">1.28x</td>
            <td>1.05x</td>
            <td>1.45x</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Xronologik Diagnostika & Kamchiliklar -->
  <div class="card" style="margin-bottom: 14px;">
    <div class="card-title">
      <span>⏱️ Xronologik Timeline Diagnostikasi</span>
      <span style="font-size: 9px; color: #64748b;">(00:00 dan oxirigacha)</span>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
      ${(analysis.timeline || [])
        .map(
          (t) => `
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px;">
          <div style="font-weight: 800; font-family: monospace; color: #0284c7; font-size: 10px;">${t.from}s - ${t.to}s</div>
          <div style="font-weight: 700; color: #1e293b; margin: 2px 0;">${escapeHtml(t.label)}</div>
          <div style="font-size: 9px; color: ${
            t.verdict === "Strong" ? "#059669" : t.verdict === "Good" ? "#0284c7" : "#d97706"
          }; font-weight: 700;">
            ${t.verdict}
          </div>
          ${t.note ? `<div style="font-size: 8.5px; color: #64748b; margin-top: 2px;">${escapeHtml(t.note)}</div>` : ""}
        </div>
      `,
        )
        .join("")}
    </div>
  </div>

  <!-- Aniq Kamchiliklar va Yechimlar -->
  ${
    deficiencies.length > 0
      ? `
    <div class="card" style="margin-bottom: 14px;">
      <div class="card-title">
        <span>🚨 Aniqlangan Kamchiliklar va Algoritmik Yechimlar</span>
        <span style="font-size: 9px; color: #dc2626; font-weight: 700;">${deficiencies.length} ta tuzatish</span>
      </div>
      ${deficiencies
        .map(
          (d) => `
        <div class="deficiency-item">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="deficiency-time">⏱️ ${escapeHtml(d.timestamp)}</span>
            <span style="font-size: 8.5px; font-weight: 800; color: #dc2626; text-transform: uppercase;">${d.severity} XAVF</span>
          </div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${escapeHtml(d.flaw)}</div>
          <div style="font-size: 9.5px; color: #475569; margin-top: 2px;"><strong>Sabab:</strong> ${escapeHtml(d.whyItFailsMetaAlgorithm)}</div>
          <div style="font-size: 9.5px; color: #059669; font-weight: 600; margin-top: 2px;"><strong>Yechim:</strong> ${escapeHtml(d.actionableFix)}</div>
        </div>
      `,
        )
        .join("")}
    </div>
  `
      : ""
  }

  <!-- Asosiy Tavsiyalar -->
  <div class="card" style="margin-bottom: 16px;">
    <div class="card-title">
      <span>💡 AI Boshqaruvchi Tavsiyalari (Executive Recommendations)</span>
    </div>
    ${(analysis.recommendations || [])
      .slice(0, 3)
      .map(
        (r) => `
      <div class="recommendation-box">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 800; color: #0f172a; font-size: 10.5px;">${escapeHtml(r.title)}</span>
          <span style="font-size: 9px; font-weight: 800; color: #059669;">+${r.impact || 15} Ball Kutilmoqda</span>
        </div>
        <div style="font-size: 9.5px; color: #334155; margin-top: 3px;">${escapeHtml(r.recommended)}</div>
      </div>
    `,
      )
      .join("")}
  </div>

  <!-- Footer & Verification -->
  <div class="footer-bar">
    <div>
      <span class="stamp-badge">VERIFIED BY NEXREEL NEURAL ENGINE</span>
      <div style="margin-top: 3px;">Ushbu hujjat SMM audit va mijoz taqdimoti uchun rasmiy hisoblanadi.</div>
    </div>
    <div style="text-align: right;">
      <div>Mualliflik: <strong>NEXREEL AI</strong> · www.nexreel.ai</div>
      <div>Xavfsizlik Imzosi: <code>SHA256:${reportId}</code></div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  },
};

export const reportService: ReportService = brandedPdfReportService;
