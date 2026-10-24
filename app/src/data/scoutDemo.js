// A SIMULATED Partner Scout run with FICTIONAL companies (.example domains), so the agent
// can be demonstrated without API keys or network. Same shape as a recorded live run.

const site = (lines) => lines.join('\n')

export const SCOUT_DEMO = {
  simulated: true,
  goal: 'We make coordinate measuring machines (CMM) for automotive parts plants. We cannot install or service them ourselves in India, our budget is limited, and we want a paying pilot customer within six months.',
  plan: {
    product: 'Coordinate measuring machines for automotive parts',
    requirements: { industry: 'auto', budget: 'limited', localInstall: true, ownService: false, timing: '6m' },
    queries: ['CMM installation calibration service company Pune automotive', 'metrology system integrator Chennai automotive plants', 'industrial inspection equipment distributor Gurugram Manesar'],
    reasoning: 'The SME needs a partner that can install and service CMMs, so I search for metrology integrators and calibration firms in the three largest automotive clusters.',
    reasoning_ja: 'CMMの据付と保守ができるパートナーが必要なため、三大自動車クラスターで計測システムのインテグレーターと校正会社を探します。',
    model: 'simulated', provider: 'simulated', ms: 1400,
  },
  search: {
    candidates: [
      { url: 'https://www.sahyadri-metrology.example/', domain: 'sahyadri-metrology.example', title: 'Sahyadri Metrology Systems — CMM installation & calibration, Pune', snippet: '', query: '' },
      { url: 'https://www.coastline-calibration.example/', domain: 'coastline-calibration.example', title: 'Coastline Calibration Services, Chennai', snippet: '', query: '' },
      { url: 'https://www.northstar-industrial.example/', domain: 'northstar-industrial.example', title: 'NorthStar Industrial Traders — Gurugram', snippet: '', query: '' },
      { url: 'https://www.pune-autoparts-news.example/', domain: 'pune-autoparts-news.example', title: 'Pune auto parts industry news', snippet: '', query: '' },
    ],
    skipped: [{ domain: 'indiamart.com', reason: 'directory' }, { domain: 'justdial.com', reason: 'directory' }],
    ms: 1100,
  },
  reads: [
    {
      url: 'https://www.sahyadri-metrology.example/', readable: true, relevant: true,
      reason: 'Installs and calibrates CMMs for automotive plants around Pune.',
      text: site([
        'Sahyadri Metrology Systems',
        'Since 2009 we install, commission and calibrate coordinate measuring machines for automotive component plants in Pune, Chakan and Aurangabad.',
        'Our 11 field engineers provide on-site support within 24 hours across Maharashtra.',
        'We are the service partner for two Japanese measurement brands.',
        'Our calibration laboratory handles CMM probes, gauges and fixtures.',
        '[Contact page: https://www.sahyadri-metrology.example/contact]',
        'Business enquiries: partners@sahyadri-metrology.example | +91 20 4000 1122',
      ]),
      contact: { email: 'partners@sahyadri-metrology.example', phone: '+91 20 4000 1122', contact_url: 'https://www.sahyadri-metrology.example/contact' },
      profile: {
        name: 'Sahyadri Metrology Systems', type: 'Integrator', hq_city: 'Pune', hq_state: 'mh',
        presence: [{ state: 'mh', strength: 1 }],
        industries: { auto: 88, electronics: 20, machinery: 60, pharma: 0, food: 0 },
        engineers: 11, install: true, calibration: true, response_hours: 24, japan_principals: 2,
        min_commit_lakh: 20, margin_pct: 18, service_fee_pct: 8, years: 17, conflict: '',
        facts: [
          { fact: 'Installs and calibrates CMMs for automotive plants', fact_ja: '自動車部品工場向けにCMMの据付・校正を実施', quote: 'we install, commission and calibrate coordinate measuring machines for automotive component plants in Pune, Chakan and Aurangabad', check: 'install' },
          { fact: '11 field engineers · 24h on-site', fact_ja: 'フィールドエンジニア11名・24時間以内の現地対応', quote: 'Our 11 field engineers provide on-site support within 24 hours across Maharashtra.', check: 'install' },
          { fact: 'Service partner for 2 Japanese brands', fact_ja: '日本の計測ブランド2社のサービスパートナー', quote: 'We are the service partner for two Japanese measurement brands.', check: 'japan' },
          { fact: 'In-house calibration lab', fact_ja: '自社校正ラボあり', quote: 'Our calibration laboratory handles CMM probes, gauges and fixtures.', check: 'technical' },
        ],
        unknowns: ['Commercial terms are not published', 'Whether the two Japanese brands compete with your CMMs'],
        unknowns_ja: ['取引条件は公開されていない', '取扱中の日本ブランド2社が自社のCMMと競合するか'],
      },
      ms: 2300,
    },
    {
      url: 'https://www.coastline-calibration.example/', readable: true, relevant: true,
      reason: 'Calibration and installation service firm serving Chennai auto and electronics plants.',
      text: site([
        'Coastline Calibration Services — Chennai',
        'We provide installation, preventive maintenance and calibration for inspection equipment in Sriperumbudur, Oragadam and Hosur.',
        'A team of 16 engineers covers Tamil Nadu and Karnataka.',
        'We do not sell equipment; we partner with manufacturers and their distributors.',
        'Contact: hello@coastline-calibration.example',
      ]),
      contact: { email: 'hello@coastline-calibration.example', phone: '', contact_url: '' },
      profile: {
        name: 'Coastline Calibration Services', type: 'Service contractor', hq_city: 'Chennai', hq_state: 'tn',
        presence: [{ state: 'tn', strength: 1 }, { state: 'ka', strength: 0.5 }],
        industries: { auto: 70, electronics: 65, machinery: 50, pharma: 0, food: 0 },
        engineers: 16, install: true, calibration: true, response_hours: 48, japan_principals: 0,
        min_commit_lakh: 10, margin_pct: 0, service_fee_pct: 12, years: 0, conflict: '',
        facts: [
          { fact: 'Installation, maintenance and calibration', fact_ja: '据付・予防保全・校正を提供', quote: 'We provide installation, preventive maintenance and calibration for inspection equipment in Sriperumbudur, Oragadam and Hosur.', check: 'install' },
          { fact: '16 engineers across Tamil Nadu and Karnataka', fact_ja: 'タミル・ナードゥ州とカルナータカ州にエンジニア16名', quote: 'A team of 16 engineers covers Tamil Nadu and Karnataka.', check: 'technical' },
          { fact: 'Service only — does not sell', fact_ja: 'サービス専業で販売は行わない', quote: 'We do not sell equipment; we partner with manufacturers and their distributors.', check: 'industry' },
        ],
        unknowns: ['Response time is not stated', 'Years in business are not stated'],
        unknowns_ja: ['対応時間の記載なし', '創業年数の記載なし'],
      },
      ms: 2100,
    },
    {
      url: 'https://www.northstar-industrial.example/', readable: true, relevant: true,
      reason: 'Industrial distributor in NCR selling inspection equipment.',
      text: site([
        'NorthStar Industrial Traders, Gurugram',
        'Authorised distributor of measuring instruments and vision inspection systems for automotive suppliers in Manesar and Bawal.',
        'We represent a Japanese CMM brand in North India.',
        'Installation is handled by the manufacturer’s engineers.',
        'Call us: +91 124 400 7788',
      ]),
      contact: { email: '', phone: '+91 124 400 7788', contact_url: '' },
      profile: {
        name: 'NorthStar Industrial Traders', type: 'Distributor', hq_city: 'Gurugram', hq_state: 'hr',
        presence: [{ state: 'hr', strength: 1 }, { state: 'dl', strength: 0.6 }],
        industries: { auto: 90, electronics: 30, machinery: 50, pharma: 0, food: 0 },
        engineers: 0, install: false, calibration: false, response_hours: 48, japan_principals: 1,
        min_commit_lakh: 20, margin_pct: 22, service_fee_pct: 0, years: 0,
        conflict: 'Represents a competing Japanese CMM brand',
        facts: [
          { fact: 'Sells to automotive suppliers in Manesar and Bawal', fact_ja: 'マネサール・バワルの自動車サプライヤーに販売', quote: 'Authorised distributor of measuring instruments and vision inspection systems for automotive suppliers in Manesar and Bawal.', check: 'industry' },
          { fact: 'Carries a competing Japanese CMM brand', fact_ja: '競合する日本のCMMブランドを取扱い', quote: 'We represent a Japanese CMM brand in North India.', check: 'conflict' },
          { fact: 'No in-house installation', fact_ja: '自社での据付は行わない', quote: 'Installation is handled by the manufacturer’s engineers.', check: 'install' },
        ],
        unknowns: ['Exclusivity terms with its current CMM brand'],
        unknowns_ja: ['現在のCMMブランドとの独占契約の条件'],
      },
      ms: 1900,
    },
    {
      url: 'https://www.pune-autoparts-news.example/', readable: true, relevant: false,
      reason: 'A news site, not a potential partner.',
      text: 'Pune auto parts industry news and events.', contact: { email: '', phone: '', contact_url: '' },
      profile: { name: 'Pune auto parts news', type: 'Distributor', hq_city: 'Pune', hq_state: 'mh', presence: [], industries: { auto: 0, electronics: 0, machinery: 0, pharma: 0, food: 0 }, engineers: 0, install: false, calibration: false, response_hours: 48, japan_principals: 0, min_commit_lakh: 20, margin_pct: 20, service_fee_pct: 0, years: 0, conflict: '', facts: [], unknowns: [], unknowns_ja: [] },
      ms: 1200,
    },
  ],
  // A canned reply so the simulated run can demonstrate reading replies.
  replies: {
    'https://www.sahyadri-metrology.example/': {
      from: 'Anil Deshpande <partners@sahyadri-metrology.example>',
      text: 'Dear team,\n\nThank you for reaching out. We would be happy to discuss a pilot. Could you share the CMM model specifications, the probe system you use, and your expected service-level terms? We are available for a call on Thursday or Friday afternoon IST.\n\nBest regards,\nAnil Deshpande\nBusiness Development, Sahyadri Metrology Systems',
      digest: {
        intent: 'interested',
        summary_en: 'Sahyadri is open to a pilot and asks for CMM model specifications, the probe system and expected service-level terms. They offer a call on Thursday or Friday afternoon IST.',
        summary_ja: 'Sahyadriはパイロットに前向きで、CMMの機種仕様、プローブシステム、想定する保守サービス条件の提示を求めています。インド時間の木曜または金曜の午後に打ち合わせが可能とのことです。',
        next_step_en: 'Send the spec sheet and a draft service SLA, and propose Thursday 15:00 IST for the call.',
        next_step_ja: '仕様書と保守SLAの案を送り、インド時間木曜15時の打ち合わせを提案しましょう。',
      },
    },
  },
  drafts: {
    'https://www.sahyadri-metrology.example/': {
      subject_en: 'Partnership enquiry: CMM installation and service in Maharashtra',
      body_en: 'Dear Sahyadri Metrology team,\n\nWe are a Japanese manufacturer of coordinate measuring machines for automotive component plants, preparing our first customer pilot in India.\n\nYour website notes that your 11 field engineers install and calibrate CMMs for plants in Pune, Chakan and Aurangabad with on-site support within 24 hours, which is exactly the local capability we need.\n\nWould you be open to a 30-minute introductory call in the next two weeks? We would like to discuss a small pilot in which your team installs and services one of our machines at a customer site, with training and documentation from us.\n\nKind regards,\n[Your name], [Company]',
      subject_ja: '提携のご相談：マハーラーシュトラ州でのCMM据付・保守について',
      body_ja: 'Sahyadri Metrology Systems ご担当者様\n\n弊社は自動車部品工場向けの三次元測定機（CMM）を製造する日本のメーカーで、インドでの最初の顧客パイロットを準備しております。\n\n貴社ウェブサイトにて、11名のフィールドエンジニアがプネー、チャカン、アウランガバードの工場でCMMの据付・校正を行い、24時間以内に現地対応されていることを拝見しました。まさに弊社が必要とする現地体制です。\n\n今後2週間のうちに30分ほどオンラインでご挨拶の機会をいただけないでしょうか。貴社チームに弊社装置1台の据付と保守をお願いする小規模なパイロットについてご相談させてください。研修と資料は弊社がご用意いたします。\n\nよろしくお願いいたします。\n[氏名]、[会社名]',
      model: 'simulated', ms: 1500,
    },
  },
}
