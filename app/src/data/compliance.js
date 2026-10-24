// Compliance rules (PS part 4). Each step is one record: when it applies, what it is, who
// runs it, how long it takes, what it costs, what goes wrong if missed, and where the rule
// comes from. `status` says how well the rule is verified:
//   official  – checked against a government / regulator page
//   secondary – several secondary sources agree; primary text still to be read
//   conflict  – sources disagree or the rule changed recently: verify before relying on it
//   general   – general guidance, not yet checked against a source (the † items)
// Costs are INR ranges. Government fees come from sources where marked; professional fees are
// indicative estimates to be replaced with 2–3 real quotes. Never shown as a single number.

export const CHECKED_ON = '2026-10-24'

export const MODES = [
  { id: 'export', label: 'Export via Indian distributor', ja: 'インド代理店経由の輸出' },
  { id: 'lo', label: 'Liaison office', ja: '駐在員事務所' },
  { id: 'bo', label: 'Branch office', ja: '支店' },
  { id: 'sub', label: 'Wholly owned subsidiary (Pvt Ltd)', ja: '完全子会社（非公開会社）' },
  { id: 'jv', label: 'Joint venture with an Indian partner', ja: 'インド企業との合弁' },
]

export const CATEGORIES = [
  { id: 'none', label: 'Not a regulated category', ja: '規制対象外' },
  { id: 'machinery', label: 'Industrial machinery', ja: '産業機械' },
  { id: 'electrical', label: 'Electrical equipment', ja: '電気機器' },
  { id: 'electronics', label: 'Electronics / IT goods', ja: '電子・IT機器' },
  { id: 'medical', label: 'Medical device', ja: '医療機器' },
  { id: 'drug', label: 'Drug / API', ja: '医薬品・原薬' },
  { id: 'food', label: 'Food or food-contact', ja: '食品・食品接触材' },
  { id: 'chemical', label: 'Chemicals', ja: '化学品' },
]

export const PHASES = [
  { id: 'screen', label: 'Screen', ja: '審査' },
  { id: 'setup', label: 'Set up', ja: '設立' },
  { id: 'trade', label: 'Register to trade', ja: '取引登録' },
  { id: 'product', label: 'Product approval', ja: '製品認証' },
  { id: 'people', label: 'People', ja: '人事' },
  { id: 'run', label: 'Run & report', ja: '運営・報告' },
]

const SRC = {
  dpiit: { title: 'DPIIT, Consolidated FDI Policy', url: 'https://dpiit.gov.in/policies-rules-and-acts/policies/foreign-direct-investment-policy' },
  pn2026: { title: 'Press Note 2 (2026) on land-border FDI, analysis (Bar & Bench)', url: 'https://www.barandbench.com/law-firms/view-point/beyond-press-note-3-analysing-press-note-2-2026-and-the-new-fdi-framework-for-land-bordering-countries' },
  rbiLo: { title: 'RBI Master Direction: establishment of branch / liaison / project offices', url: 'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10398' },
  rbiFirms: { title: 'RBI FIRMS portal & FC-GPR guidance (TaxGuru summary)', url: 'https://taxguru.in/rbi/file-rbi-form-fc-gpr.html' },
  rbiDraft: { title: 'RBI press release: draft Foreign Exchange Management (Foreign Investment) Rules, 2026', url: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=63204' },
  mca: { title: 'MCA SPICe+ incorporation (process guide)', url: 'https://www.taxaj.com/learn/company-registration-process-india/' },
  dgft: { title: 'DGFT Importer-Exporter Code', url: 'https://www.dgft.gov.in/CP/' },
  gst: { title: 'GST portal; e-invoice threshold ₹5 crore AATO', url: 'https://www.gst.gov.in/' },
  gst2: { title: '56th GST Council: two-slab structure from 22 Sep 2025 (ELP update)', url: 'https://elplaw.in/wp-content/uploads/2025/09/ELP-Update-56th-GST-Council-Recommendations.pdf' },
  icegate: { title: 'ICEGATE (Indian Customs)', url: 'https://www.icegate.gov.in/' },
  cepa: { title: 'Japan Customs: Japan–India EPA', url: 'https://www.customs.go.jp/english/c-answer_e/keizairenkei/4036_e.htm' },
  bis: { title: 'Bureau of Indian Standards: Compulsory Registration Scheme', url: 'https://www.crsbis.in/' },
  bisOtr: { title: 'Machinery & Electrical Equipment Safety OTR: enforcement extension (ELP)', url: 'https://elplaw.in/leadership/bis-update-extension-of-the-enforcement-of-machinery-and-electrical-equipment-safety-omnibus-technical-regulation-order-2024/' },
  cdsco: { title: 'CDSCO (medical devices & drugs)', url: 'https://cdsco.gov.in/' },
  fssai: { title: 'FSSAI import', url: 'https://www.fssai.gov.in/' },
  lm: { title: 'Legal Metrology (Packaged Commodities) Rules', url: 'https://consumeraffairs.nic.in/organisation-and-units/division/legal-metrology' },
  cpcb: { title: 'CPCB EPR portals (e-waste, plastic packaging)', url: 'https://eprewastecpcb.in/' },
  labour: { title: 'Labour Codes in force 21 Nov 2025; central rules 8 May 2026; state rules pending (Khaitan & Co, Jul 2026)', url: 'https://www.khaitanco.com/sites/default/files/2026-08/ELB%20Bulletin-July%202026.pdf' },
  itAct: { title: 'Income-tax Act, 2025 & Rules, 2026 (Income Tax Dept. form notes)', url: 'https://www.incometaxindia.gov.in/documents/d/guest/fn-42' },
  baa: { title: 'Section 115BAA domestic company regime (22%)', url: 'https://learn.quicko.com/section-115baa-tax-rates-for-domestic-companies' },
  fc35: { title: 'Finance (No. 2) Act 2024: foreign company rate 35%', url: 'https://orbitax.com/news/country/article/India-Enacts-Finance-No-2-A-56497' },
  dtaa: { title: 'Income Tax Dept: tax rates under DTAA; India–Japan protocol (2006)', url: 'https://www.incometaxindia.gov.in/w/%E2%80%8Btax-rates-dtaa-v.-income-tax-act' },
  fla: { title: 'RBI FLA return (annual, due 15 July)', url: 'https://flair.rbi.org.in/' },
  dpdp: { title: 'PIB: DPDP Rules 2025 notified (Nov 2025), phased over 18 months', url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf' },
  mof: { title: 'MOFA Japan: apostille', url: 'https://www.mofa.go.jp/ca/cs/page22e_000473.html' },
}

const T = (en, ja) => ({ en, ja })
const ENTITY = ['lo', 'bo', 'sub', 'jv']
const COMPANY = ['sub', 'jv']
const has = (list) => (i) => list.includes(i.mode)

// days: [min, max] calendar days. gov / pro: [min, max] INR. recurring: annual cost.
export const STEPS = [
  // ---------- Screen ----------
  {
    id: 'fdi-route', phase: 'screen', when: has(ENTITY), deps: [],
    title: T('FDI route and sector-cap check', 'FDIルートと出資上限の確認'),
    what: T('Confirm your sector allows the planned stake under the automatic route; otherwise government approval is needed first.', '計画出資比率が自動承認ルートで認められるか確認。不可なら事前に政府承認が必要。'),
    authority: 'DPIIT / RBI', portal: 'https://dpiit.gov.in', docs: ['Business description', 'Shareholding plan'],
    days: [3, 10], gov: [0, 0], pro: [25000, 75000], owner: 'Lawyer',
    risk: { sev: 'High', text: T('Investment under the wrong route is a FEMA contravention.', '誤ったルートでの投資はFEMA違反。') },
    src: SRC.dpiit, status: 'general',
  },
  {
    id: 'pn3', phase: 'screen', when: (i) => ENTITY.includes(i.mode) && i.landBorder, deps: ['fdi-route'],
    title: T('Government approval for land-border-country ownership', '陸上国境国の出資に関する政府承認'),
    what: T('Chinese / Hong Kong or other land-border beneficial ownership triggers prior approval. Press Note 2 (2026) eased small non-controlling stakes and set a faster window for some manufacturing sectors.', '中国・香港等の実質的支配者がいる場合は事前承認が必要。2026年プレスノート2で非支配の少額出資は緩和、一部製造業は審査期間を短縮。'),
    authority: 'DPIIT / MHA', portal: 'https://fifp.gov.in', docs: ['Beneficial-ownership chart', 'Approval application'],
    days: [60, 240], gov: [0, 0], pro: [100000, 400000], owner: 'Lawyer',
    risk: { sev: 'High', text: T('Investing before approval is void and penalised; historically approvals took 6–8 months.', '承認前の投資は無効かつ処罰対象。従来は承認に6〜8か月。') },
    src: SRC.pn2026, status: 'conflict',
  },
  {
    id: 'parent-docs', phase: 'screen', when: has(ENTITY), deps: [],
    title: T('Apostille the parent company\'s documents', '親会社書類のアポスティーユ取得'),
    what: T('Certificate of registration, board resolution and director KYC, notarised in Japan and apostilled.', '登記事項証明書、取締役会決議、取締役の本人確認書類を日本で公証しアポスティーユ。'),
    authority: 'MOFA Japan', portal: 'https://www.mofa.go.jp', docs: ['Certificate of registered matters', 'Board resolution', 'Director passports & address proof'],
    days: [10, 25], gov: [2000, 10000], pro: [10000, 40000], owner: 'SME',
    risk: { sev: 'Medium', text: T('Missing or stale documents are the most common cause of rejected filings.', '書類不備・期限切れは申請差し戻しの最多要因。') },
    src: SRC.mof, status: 'general',
  },

  // ---------- Set up: LO / BO ----------
  {
    id: 'rbi-office', phase: 'setup', when: has(['lo', 'bo']), deps: ['fdi-route', 'pn3', 'parent-docs'],
    title: T('RBI approval for the liaison / branch office via an AD bank', 'AD銀行経由でRBIの駐在員事務所・支店承認'),
    what: T('Eligibility: liaison office needs 3 years\' profit and USD 50,000 net worth; branch needs 5 years and USD 100,000. A parent letter of comfort can cover a subsidiary that falls short.', '要件：駐在員事務所は3年連続黒字・純資産5万ドル、支店は5年・10万ドル。満たさない子会社は親会社のレター・オブ・コンフォートで補完可。'),
    authority: 'RBI via AD Category-I bank', portal: 'https://www.rbi.org.in', docs: ['Form FNC', 'Audited accounts (3 or 5 years)', 'Net-worth certificate', 'Apostilled documents'],
    days: [30, 90], gov: [0, 0], pro: [50000, 150000], owner: 'CA',
    risk: { sev: 'High', text: T('Operating before approval breaches FEMA. A liaison office may not earn any income in India.', '承認前の活動はFEMA違反。駐在員事務所はインドで収益を得られない。') },
    src: SRC.rbiLo, status: 'official',
  },
  {
    id: 'roc-fc1', phase: 'setup', when: has(['lo', 'bo']), deps: ['rbi-office'],
    title: T('Register the office with the Registrar of Companies (FC-1)', '登記局への外国会社登録（FC-1）'),
    what: T('Foreign companies with a place of business in India register within 30 days of setting it up.', 'インドに事業所を持つ外国会社は設置後30日以内に登録。'),
    authority: 'MCA', portal: 'https://www.mca.gov.in', docs: ['RBI approval', 'Charter documents', 'Address proof'],
    days: [7, 21], gov: [6000, 20000], pro: [15000, 40000], owner: 'CA', deadline: T('30 days from establishment', '設置から30日以内'),
    risk: { sev: 'Medium', text: T('Late filing fees and penalties under the Companies Act.', '会社法に基づく遅延手数料・罰則。') },
    src: SRC.mca, status: 'general',
  },

  // ---------- Set up: company ----------
  {
    id: 'jv-sha', phase: 'setup', when: has(['jv']), deps: ['fdi-route'],
    title: T('Negotiate the JV shareholders\' agreement', '合弁契約（株主間契約）の交渉'),
    what: T('Board seats, reserved matters, technology licence, exclusivity, deadlock, exit and arbitration seat (Singapore or Tokyo are common choices).', '取締役の構成、重要事項の拒否権、技術ライセンス、独占権、デッドロック、撤退、仲裁地（シンガポールや東京が一般的）。'),
    authority: '—', portal: '', docs: ['Term sheet', 'Due diligence on partner'],
    days: [30, 90], gov: [0, 0], pro: [300000, 1200000], owner: 'Lawyer',
    risk: { sev: 'High', text: T('Weak exit and deadlock clauses are the main cause of failed Japan–India JVs.', '撤退・デッドロック条項の弱さは日印合弁失敗の主因。') },
    src: SRC.dpiit, status: 'general',
  },
  {
    id: 'dsc', phase: 'setup', when: has(COMPANY), deps: ['parent-docs'],
    title: T('Digital signatures and director IDs; appoint a resident director', '電子署名・取締役番号の取得、居住取締役の選任'),
    what: T('At least one director must have stayed in India 182 days or more in the previous year.', '取締役の少なくとも1名は前年に182日以上インドに滞在している必要あり。'),
    authority: 'MCA (certifying authorities)', portal: 'https://www.mca.gov.in', docs: ['Passport', 'Address proof', 'Photo'],
    days: [2, 7], gov: [0, 0], pro: [3000, 10000], owner: 'CA',
    risk: { sev: 'Medium', text: T('Without a resident director the company cannot be incorporated.', '居住取締役がいなければ設立不可。') },
    src: SRC.mca, status: 'secondary',
  },
  {
    id: 'incorp', phase: 'setup', when: has(COMPANY), deps: ['dsc', 'fdi-route', 'pn3', 'jv-sha'],
    title: T('Incorporate the company (SPICe+): name, PAN, TAN, EPFO / ESIC, bank account', '会社設立（SPICe+）：社名、PAN、TAN、EPFO・ESIC、銀行口座'),
    what: T('One integrated MCA filing. Name rejection is the biggest cause of delay.', 'MCAの一括申請。社名の却下が遅延の最大要因。'),
    authority: 'MCA', portal: 'https://www.mca.gov.in', docs: ['MOA / AOA', 'Apostilled parent documents', 'Registered office proof', 'Director consents'],
    days: [7, 21], gov: [5000, 60000], pro: [15000, 50000], owner: 'CA',
    risk: { sev: 'Low', text: T('Stamp duty and fees vary by state and authorised capital.', '印紙税と手数料は州・授権資本により異なる。') },
    src: SRC.mca, status: 'secondary',
  },
  {
    id: 'auditor', phase: 'setup', when: has(COMPANY), deps: ['incorp'],
    title: T('Appoint the first statutory auditor', '最初の法定監査人の選任'),
    what: T('The board appoints the first auditor within 30 days of incorporation.', '設立後30日以内に取締役会が最初の監査人を選任。'),
    authority: 'MCA', portal: 'https://www.mca.gov.in', docs: ['Board resolution', 'Auditor consent'],
    days: [1, 7], gov: [0, 1000], pro: [0, 5000], owner: 'CA', deadline: T('30 days from incorporation', '設立から30日以内'),
    risk: { sev: 'Low', text: T('Otherwise shareholders must appoint at a meeting within 90 days.', 'そうでなければ90日以内に株主総会で選任が必要。') },
    src: SRC.mca, status: 'secondary',
  },
  {
    id: 'capital', phase: 'setup', when: has(COMPANY), deps: ['incorp'],
    title: T('Remit share capital through an AD bank', 'AD銀行経由で資本金を送金'),
    what: T('Inward remittance with KYC; the bank issues the foreign inward remittance certificate.', '本人確認付きの送金。銀行が外国送金受領証明を発行。'),
    authority: 'AD Category-I bank', portal: '', docs: ['KYC of the investor', 'FIRC'],
    days: [7, 21], gov: [0, 0], pro: [0, 10000], owner: 'SME',
    risk: { sev: 'Medium', text: T('Allotment clock starts when funds arrive.', '着金時点から株式割当の期限が始まる。') },
    src: SRC.rbiFirms, status: 'secondary',
  },
  {
    id: 'allot', phase: 'setup', when: has(COMPANY), deps: ['capital'],
    title: T('Allot shares to the Japanese parent', '日本親会社への株式割当'),
    what: T('Allot within 60 days of receiving the money; otherwise it must be refunded.', '着金から60日以内に割当。できなければ返金が必要。'),
    authority: 'Company / RBI rules', portal: '', docs: ['Board resolution', 'Valuation certificate (pricing guidelines)'],
    days: [1, 14], gov: [0, 5000], pro: [10000, 40000], owner: 'CA', deadline: T('60 days from receipt of funds', '着金から60日以内'),
    risk: { sev: 'High', text: T('Money not allotted in time must be refunded.', '期限内に割り当てられない資金は返金が必要。') },
    src: SRC.rbiFirms, status: 'secondary',
  },
  {
    id: 'fcgpr', phase: 'setup', when: has(COMPANY), deps: ['allot'],
    title: T('Report the investment to RBI (FC-GPR on FIRMS)', 'RBIへの投資報告（FIRMSでFC-GPR）'),
    what: T('File within 30 days of issuing the shares. RBI published draft new Foreign Investment Rules in July 2026; check whether reporting changed.', '株式発行から30日以内に提出。RBIは2026年7月に新外国投資規則案を公表、報告方法の変更を確認。'),
    authority: 'RBI', portal: 'https://firms.rbi.org.in', docs: ['FIRC & KYC', 'Valuation certificate', 'CS certificate'],
    days: [3, 30], gov: [0, 0], pro: [10000, 30000], owner: 'CA', deadline: T('30 days from share issue', '株式発行から30日以内'),
    risk: { sev: 'High', text: T('Late submission fee; repeated delay is a FEMA contravention.', '遅延提出手数料。繰り返せばFEMA違反。') },
    src: SRC.rbiFirms, status: 'secondary',
  },
  {
    id: 'inc20a', phase: 'setup', when: has(COMPANY), deps: ['capital'],
    title: T('Declare commencement of business (INC-20A)', '事業開始の届出（INC-20A）'),
    what: T('After share capital is received; due within 180 days of incorporation.', '資本金受領後、設立から180日以内。'),
    authority: 'MCA', portal: 'https://www.mca.gov.in', docs: ['Bank statement showing capital'],
    days: [1, 5], gov: [200, 2000], pro: [2000, 8000], owner: 'CA', deadline: T('180 days from incorporation', '設立から180日以内'),
    risk: { sev: 'Medium', text: T('Penalty, and the company may not start business or borrow until filed.', '罰金。提出まで事業開始・借入不可。') },
    src: SRC.mca, status: 'secondary',
  },

  // ---------- Register to trade ----------
  {
    id: 'iec', phase: 'trade', when: () => true, deps: [],
    title: T('Importer-Exporter Code (IEC)', '輸出入者コード（IEC）'),
    what: T('Whoever imports into India needs an IEC. Government fee ₹500; details must be confirmed every year between 1 April and 30 June.', '輸入者はIECが必要。手数料500ルピー、毎年4月1日〜6月30日に情報の更新確認が必要。'),
    authority: 'DGFT', portal: 'https://www.dgft.gov.in', docs: ['PAN', 'Bank certificate', 'Address proof'],
    days: [1, 5], gov: [500, 500], pro: [1000, 3000], owner: 'importer', deadline: T('Annual update 1 Apr – 30 Jun', '毎年4/1〜6/30に更新'),
    risk: { sev: 'Medium', text: T('A missed annual update deactivates the IEC and blocks customs clearance.', '年次更新を怠るとIECが無効化され通関不可。') },
    src: SRC.dgft, status: 'secondary',
  },
  {
    id: 'gst', phase: 'trade', when: () => true, deps: [],
    title: T('GST registration (and e-invoicing above ₹5 crore turnover)', 'GST登録（売上5千万ルピー超は電子インボイス）'),
    what: T('Needed for importing and inter-state supply. Most goods now sit in the 5% or 18% slab after the September 2025 rate reform; check your HSN rate.', '輸入・州間取引に必要。2025年9月の税率改革後、多くの品目は5%か18%。HSNごとの税率を確認。'),
    authority: 'GSTN / state tax department', portal: 'https://www.gst.gov.in', docs: ['PAN', 'Address proof', 'Authorised signatory'],
    days: [3, 30], gov: [0, 0], pro: [2000, 8000], owner: 'importer',
    risk: { sev: 'High', text: T('Without GST you cannot claim input credit on import IGST.', 'GST未登録だと輸入IGSTの仕入税額控除が受けられない。') },
    src: SRC.gst2, status: 'secondary',
  },
  {
    id: 'adcode', phase: 'trade', when: () => true, deps: ['iec'],
    title: T('Register the bank AD code at the port of import (ICEGATE)', '輸入港でのADコード登録（ICEGATE）'),
    what: T('Links the importer\'s bank to customs for each port used.', '使用する各港で輸入者の銀行と税関を紐付け。'),
    authority: 'CBIC customs', portal: 'https://www.icegate.gov.in', docs: ['AD code letter from bank', 'IEC'],
    days: [2, 10], gov: [0, 0], pro: [2000, 6000], owner: 'importer',
    risk: { sev: 'Low', text: T('Shipments wait at port until done.', '完了まで貨物が港で滞留。') },
    src: SRC.icegate, status: 'general',
  },
  {
    id: 'cepa', phase: 'trade', when: () => true, deps: [],
    title: T('Claim the Japan–India CEPA duty rate (certificate of origin)', '日印CEPA特恵税率の適用（原産地証明書）'),
    what: T('Get a CEPA certificate of origin in Japan for each shipment so the importer can claim the preferential basic customs duty.', '輸入者が特恵関税を受けられるよう、出荷ごとに日本でCEPA原産地証明を取得。'),
    authority: 'Japan Chamber of Commerce and Industry; CBIC', portal: 'https://www.customs.go.jp', docs: ['Origin evidence (bill of materials)', 'Invoice'],
    days: [3, 14], gov: [2000, 6000], pro: [0, 20000], owner: 'SME',
    risk: { sev: 'Medium', text: T('Without it, full duty applies; wrong origin claims are penalised.', 'なければ通常税率。誤った原産地申告は処罰対象。') },
    src: SRC.cepa, status: 'general',
  },

  // ---------- Product approval ----------
  {
    id: 'bis-crs', phase: 'product', when: (i) => ['electrical', 'electronics'].includes(i.category), deps: [],
    title: T('BIS registration (CRS) through an Authorised Indian Representative', 'インド国内代理人を通じたBIS登録（CRS）'),
    what: T('Many electronics and electrical products must be tested in a BIS lab and registered before import. Radio products also need WPC approval.', '多くの電子・電気製品は輸入前にBIS認定試験所で試験し登録が必要。無線機器はWPC承認も。'),
    authority: 'BIS (and WPC for radio)', portal: 'https://www.crsbis.in', docs: ['Test report from BIS lab', 'AIR nomination', 'Factory details'],
    days: [45, 120], gov: [50000, 150000], pro: [50000, 200000], owner: 'SME',
    risk: { sev: 'High', text: T('Unregistered goods are held at customs and cannot be sold.', '未登録品は税関で留め置かれ販売不可。') },
    src: SRC.bis, status: 'general',
  },
  {
    id: 'bis-otr', phase: 'product', when: (i) => ['machinery', 'electrical'].includes(i.category), deps: [],
    title: T('Machinery & Electrical Equipment Safety order (BIS)', '機械・電気機器安全規則（BIS）'),
    what: T('Enforcement for listed machinery was set for 1 September 2026; a later amendment may have removed that date. Check the Gazette and BIS before shipping.', '対象機械の施行日は2026年9月1日とされたが、その後の改正で日付が削除された可能性あり。出荷前に官報とBISを確認。'),
    authority: 'BIS / Ministry of Heavy Industries', portal: 'https://www.bis.gov.in', docs: ['Type-test report', 'Technical file'],
    days: [30, 120], gov: [0, 150000], pro: [50000, 250000], owner: 'SME',
    risk: { sev: 'High', text: T('If in force, non-certified machines cannot be imported or sold.', '施行済みなら未認証機械は輸入・販売不可。') },
    src: SRC.bisOtr, status: 'conflict',
  },
  {
    id: 'cdsco-md', phase: 'product', when: (i) => i.category === 'medical', deps: [],
    title: T('CDSCO import licence for medical devices', '医療機器のCDSCO輸入許可'),
    what: T('Class-based licensing through an Indian authorised agent; higher-risk classes take longer.', 'インドの認定代理人を通じたクラス別許可。高リスク品ほど長期化。'),
    authority: 'CDSCO', portal: 'https://cdsco.gov.in', docs: ['Free sale certificate', 'Device master file', 'ISO 13485'],
    days: [90, 270], gov: [50000, 500000], pro: [100000, 400000], owner: 'SME',
    risk: { sev: 'High', text: T('Import without a licence is an offence under the Drugs and Cosmetics Act.', '無許可輸入は医薬品化粧品法違反。') },
    src: SRC.cdsco, status: 'general',
  },
  {
    id: 'cdsco-drug', phase: 'product', when: (i) => i.category === 'drug', deps: [],
    title: T('CDSCO registration certificate and import licence (drugs / API)', '医薬品・原薬のCDSCO登録証と輸入許可'),
    what: T('Register the overseas manufacturing site and product, then the importer takes the import licence.', '海外製造所と製品を登録し、輸入者が輸入許可を取得。'),
    authority: 'CDSCO', portal: 'https://cdsco.gov.in', docs: ['Site master file', 'GMP certificate', 'Product dossier'],
    days: [120, 365], gov: [100000, 1000000], pro: [150000, 500000], owner: 'SME',
    risk: { sev: 'High', text: T('No sale or import without registration.', '登録なしでは輸入・販売不可。') },
    src: SRC.cdsco, status: 'general',
  },
  {
    id: 'fssai', phase: 'product', when: (i) => i.category === 'food', deps: [],
    title: T('FSSAI import licence and label compliance', 'FSSAI輸入許可とラベル対応'),
    what: T('Importer licence, product standards and India-specific labelling.', '輸入者許可、製品規格、インド向け表示。'),
    authority: 'FSSAI', portal: 'https://www.fssai.gov.in', docs: ['Product specs', 'Label artwork', 'Lab report'],
    days: [30, 90], gov: [5000, 10000], pro: [20000, 80000], owner: 'importer',
    risk: { sev: 'High', text: T('Consignments that fail checks are rejected at port.', '検査不合格の貨物は港で拒否。') },
    src: SRC.fssai, status: 'general',
  },
  {
    id: 'chem', phase: 'product', when: (i) => i.category === 'chemical', deps: [],
    title: T('Check BIS quality-control orders on chemicals', '化学品のBIS品質管理令の確認'),
    what: T('Many chemicals came under QCOs, and several were withdrawn or deferred in 2025–26. Check the current list for your HS code.', '多くの化学品がQCO対象となり、2025〜26年に一部は撤回・延期。HSコードごとに最新一覧を確認。'),
    authority: 'BIS / DCPC', portal: 'https://www.bis.gov.in', docs: ['HS code', 'Test reports'],
    days: [14, 120], gov: [0, 150000], pro: [20000, 150000], owner: 'SME',
    risk: { sev: 'High', text: T('Goods under an active QCO without a licence cannot be imported.', '有効なQCO対象品は許可なく輸入不可。') },
    src: SRC.bis, status: 'conflict',
  },
  {
    id: 'lm', phase: 'product', when: (i) => ['food', 'electronics'].includes(i.category), deps: [],
    title: T('Legal Metrology importer registration and package declarations', '計量法の輸入者登録と包装表示'),
    what: T('Pre-packaged goods for retail need importer registration and mandatory declarations (MRP, net quantity, importer address).', '小売向け包装品は輸入者登録と必須表示（最高小売価格、正味量、輸入者住所）が必要。'),
    authority: 'Legal Metrology (state / central)', portal: 'https://consumeraffairs.nic.in', docs: ['Label artwork'],
    days: [14, 45], gov: [500, 5000], pro: [5000, 20000], owner: 'importer',
    risk: { sev: 'Medium', text: T('Fines and seizure of non-compliant packages.', '罰金と不適合品の押収。') },
    src: SRC.lm, status: 'general',
  },
  {
    id: 'epr', phase: 'product', when: (i) => ['electrical', 'electronics'].includes(i.category), deps: [],
    title: T('E-waste EPR registration (CPCB)', '電子廃棄物の拡大生産者責任登録（CPCB）'),
    what: T('Producers and importers of listed electrical and electronic equipment register and meet recycling targets.', '対象電気電子機器の生産者・輸入者は登録しリサイクル目標を達成。'),
    authority: 'CPCB', portal: 'https://eprewastecpcb.in', docs: ['Product list', 'Sales estimates'],
    days: [14, 60], gov: [10000, 50000], pro: [20000, 80000], owner: 'importer', recurring: false,
    risk: { sev: 'Medium', text: T('Environmental compensation for unmet targets.', '目標未達には環境補償金。') },
    src: SRC.cpcb, status: 'general',
  },

  // ---------- People ----------
  {
    id: 'shops', phase: 'people', when: has(ENTITY), deps: [],
    title: T('Shops & Establishments registration (state)', '店舗・事業所登録（州）'),
    what: T('Each office or site registers under the state\'s law; rules and timelines differ by state.', '各事務所・拠点が州法で登録。規則と期限は州で異なる。'),
    authority: 'State labour department', portal: '', docs: ['Address proof', 'Employer details'],
    days: [7, 30], gov: [1000, 10000], pro: [3000, 10000], owner: 'CA',
    risk: { sev: 'Low', text: T('Fines for operating unregistered.', '未登録営業には罰金。') },
    src: SRC.labour, status: 'general',
  },
  {
    id: 'labour', phase: 'people', when: (i) => ENTITY.includes(i.mode) && i.headcount > 0, deps: ['shops'],
    title: T('Payroll set-up under the four Labour Codes (PF, ESI, wages)', '4つの労働法典に基づく給与体制（PF、ESI、賃金）'),
    what: T('The Labour Codes took effect on 21 November 2025 and central rules followed on 8 May 2026, but most states had not notified final rules by mid-2026. Check your state.', '労働法典は2025年11月21日施行、中央規則は2026年5月8日。ただし2026年半ば時点で多くの州は最終規則未公布。州ごとに確認。'),
    authority: 'EPFO, ESIC, state labour department', portal: 'https://www.epfindia.gov.in', docs: ['Employee list', 'Wage structure'],
    days: [7, 30], gov: [0, 0], pro: [20000, 60000], owner: 'CA',
    risk: { sev: 'Medium', text: T('Interest and damages on late contributions.', '拠出遅延には利息と損害金。') },
    src: SRC.labour, status: 'secondary',
  },
  {
    id: 'expat', phase: 'people', when: (i) => ENTITY.includes(i.mode) && i.expats > 0, deps: [],
    title: T('Employment visas, FRRO registration and Japan–India social security certificate', '就労ビザ、FRRO登録、日印社会保障協定の適用証明'),
    what: T('Japanese staff need employment visas and FRRO registration after arrival. A certificate of coverage from Japan avoids double social-security contributions.', '日本人社員は就労ビザと入国後のFRRO登録が必要。日本の適用証明書で社会保険料の二重払いを回避。'),
    authority: 'MHA / FRRO; Japan Pension Service', portal: 'https://indianfrro.gov.in', docs: ['Employment contract', 'Passport', 'Certificate of coverage'],
    days: [21, 60], gov: [15000, 40000], pro: [10000, 40000], owner: 'SME',
    risk: { sev: 'Medium', text: T('Late FRRO registration brings fines and exit problems.', 'FRRO登録遅延は罰金や出国時の問題に。') },
    src: SRC.labour, status: 'general',
  },

  // ---------- Run & report: tax ----------
  {
    id: 'tax-regime', phase: 'run', when: has(COMPANY), deps: ['incorp'],
    title: T('Choose the corporate tax regime (22% base rate)', '法人税制度の選択（基本税率22%）'),
    what: T('Domestic companies can opt for 22% plus surcharge and cess (about 25.17% effective), giving up most incentives. The Income-tax Act, 2025 applies from 1 April 2026 and renumbers sections.', '国内会社は22%＋付加税・目的税（実効約25.17%）を選択可、多くの優遇は放棄。2026年4月1日から2025年所得税法が適用され条文番号が変更。'),
    authority: 'Income Tax Department', portal: 'https://www.incometax.gov.in', docs: ['Option form with first return'],
    days: [1, 5], gov: [0, 0], pro: [10000, 30000], owner: 'CA',
    risk: { sev: 'Medium', text: T('The option, once taken, cannot be withdrawn.', '一度選択すると撤回不可。') },
    src: SRC.baa, status: 'secondary',
  },
  {
    id: 'bo-tax', phase: 'run', when: has(['bo']), deps: ['roc-fc1'],
    title: T('Branch taxed as a foreign company (35% base rate)', '支店は外国会社として課税（基本税率35%）'),
    what: T('Reduced from 40% to 35% by the Finance (No. 2) Act 2024, plus surcharge and cess.', '2024年財政法（第2号）で40%から35%に引下げ、別途付加税・目的税。'),
    authority: 'Income Tax Department', portal: 'https://www.incometax.gov.in', docs: ['PAN', 'Audited branch accounts'],
    days: [1, 5], gov: [0, 0], pro: [20000, 60000], owner: 'CA',
    risk: { sev: 'Medium', text: T('A subsidiary is usually cheaper once profitable.', '黒字化後は通常子会社の方が税負担が軽い。') },
    src: SRC.fc35, status: 'secondary',
  },
  {
    id: 'pe', phase: 'screen', when: has(['export', 'lo']), deps: [],
    title: T('Permanent-establishment (PE) risk review', '恒久的施設（PE）リスクの確認'),
    what: T('If your distributor habitually concludes contracts for you, or the liaison office goes beyond liaison work, India can tax your profits.', '代理店が常習的に貴社名義で契約締結したり、駐在員事務所が連絡業務を超えると、インドで利益に課税される可能性。'),
    authority: 'Income Tax Department', portal: '', docs: ['Distributor agreement', 'Activity log'],
    days: [5, 15], gov: [0, 0], pro: [30000, 100000], owner: 'Lawyer',
    risk: { sev: 'High', text: T('Back taxes, interest and penalties on attributed profits.', '帰属利益に対する追徴税、利息、罰金。') },
    src: SRC.dtaa, status: 'general',
  },
  {
    id: 'treaty', phase: 'run', when: () => true, deps: [],
    title: T('Claim India–Japan treaty withholding rates', '日印租税条約の源泉税率の適用'),
    what: T('Dividends, interest, royalties and technical fees: 10% under the treaty against 20% plus surcharge domestically. Needs a Japanese tax residency certificate and the declaration form (its number under the 2025 Act is unclear between sources).', '配当・利子・使用料・技術役務料は条約で10%（国内法は20%＋付加税）。日本の居住者証明書と申告書が必要（2025年法での様式番号は出典により異なる）。'),
    authority: 'Income Tax Department / NTA Japan', portal: 'https://www.incometax.gov.in', docs: ['Japanese tax residency certificate', 'Form 10F (or its replacement)'],
    days: [10, 30], gov: [0, 0], pro: [5000, 20000], owner: 'CA',
    risk: { sev: 'Medium', text: T('Without the documents the payer withholds at the higher domestic rate.', '書類がなければ支払者は高い国内税率で源泉徴収。') },
    src: SRC.dtaa, status: 'conflict',
  },
  {
    id: 'tp', phase: 'run', when: (i) => ['bo', 'sub', 'jv'].includes(i.mode), deps: [],
    title: T('Transfer-pricing policy and annual documentation', '移転価格ポリシーと年次文書化'),
    what: T('Prices for goods, royalties and services with the Japanese parent must be at arm\'s length and documented each year.', '日本親会社との物品・使用料・役務の価格は独立企業間価格で、毎年文書化が必要。'),
    authority: 'Income Tax Department', portal: '', docs: ['Benchmarking study', 'Accountant\'s report'],
    days: [30, 60], gov: [0, 0], pro: [100000, 400000], owner: 'CA', recurring: true,
    risk: { sev: 'High', text: T('Adjustments plus penalties for missing documentation.', '価格調整と文書不備の罰金。') },
    src: SRC.itAct, status: 'general',
  },
  {
    id: 'fla', phase: 'run', when: has(['bo', 'sub', 'jv']), deps: [],
    title: T('Annual FLA return to RBI', 'RBIへの年次FLA報告'),
    what: T('Foreign liabilities and assets return, due by 15 July each year.', '対外資産負債報告、毎年7月15日まで。'),
    authority: 'RBI', portal: 'https://flair.rbi.org.in', docs: ['Audited or provisional accounts'],
    days: [3, 10], gov: [0, 0], pro: [5000, 20000], owner: 'CA', recurring: true, deadline: T('15 July every year', '毎年7月15日'),
    risk: { sev: 'Medium', text: T('Late filing is a FEMA contravention.', '遅延提出はFEMA違反。') },
    src: SRC.fla, status: 'secondary',
  },
  {
    id: 'aac', phase: 'run', when: has(['lo', 'bo']), deps: [],
    title: T('Annual Activity Certificate to the AD bank', 'AD銀行への年次活動証明書'),
    what: T('A chartered accountant certifies each year that the office stayed within its permitted activities.', '公認会計士が毎年、許可された活動範囲内であったことを証明。'),
    authority: 'RBI via AD bank', portal: '', docs: ['Audited accounts', 'CA certificate'],
    days: [7, 21], gov: [0, 0], pro: [20000, 60000], owner: 'CA', recurring: true,
    risk: { sev: 'Medium', text: T('Approval can be withdrawn.', '承認が取り消される可能性。') },
    src: SRC.rbiLo, status: 'official',
  },
  {
    id: 'roc-annual', phase: 'run', when: has(COMPANY), deps: [],
    title: T('Statutory audit and annual ROC filings', '法定監査と年次登記局届出'),
    what: T('Audited financial statements and annual return filed with MCA each year, plus beneficial-ownership disclosures.', '監査済み財務諸表と年次報告を毎年MCAへ提出、実質的支配者の開示も。'),
    authority: 'MCA', portal: 'https://www.mca.gov.in', docs: ['Audited accounts', 'Board report'],
    days: [30, 60], gov: [2000, 10000], pro: [80000, 250000], owner: 'CA', recurring: true,
    risk: { sev: 'Medium', text: T('Daily late fees; directors can be disqualified.', '日割りの遅延手数料、取締役の資格停止も。') },
    src: SRC.mca, status: 'general',
  },
  {
    id: 'dpdp', phase: 'run', when: (i) => i.personalData, deps: [],
    title: T('Data protection (DPDP Act & Rules)', 'データ保護（DPDP法・規則）'),
    what: T('Rules notified in November 2025 and phased in over 18 months: consent-manager provisions around November 2026, most obligations around May 2027.', '規則は2025年11月公布、18か月で段階施行：同意管理者規定は2026年11月頃、主な義務は2027年5月頃。'),
    authority: 'MeitY / Data Protection Board', portal: 'https://www.meity.gov.in', docs: ['Data map', 'Privacy notice', 'Breach procedure'],
    days: [30, 90], gov: [0, 0], pro: [100000, 400000], owner: 'Lawyer',
    risk: { sev: 'High', text: T('Penalties of up to ₹250 crore per breach.', '違反1件につき最大25億ルピーの罰金。') },
    src: SRC.dpdp, status: 'secondary',
  },
]

// Recent rule changes that affect Japanese SMEs (the change feed).
export const CHANGES = [
  { date: '2026-07-21', title: T('RBI publishes draft Foreign Exchange Management (Foreign Investment) Rules, 2026', 'RBIが2026年外国投資規則案を公表'), effect: T('Would replace the 2019 NDI Rules; comments closed 31 Aug 2026. Not yet in force.', '2019年NDI規則を置き換える予定。意見募集は2026年8月31日終了、未施行。'), tags: ['sub', 'jv', 'bo', 'lo'], src: SRC.rbiDraft, status: 'official' },
  { date: '2026-05-08', title: T('Central rules under the four Labour Codes notified', '4労働法典の中央規則公布'), effect: T('State rules still pending in most states as of mid-2026.', '2026年半ば時点で多くの州規則は未公布。'), tags: ['lo', 'bo', 'sub', 'jv'], src: SRC.labour, status: 'secondary' },
  { date: '2026-04-01', title: T('Income-tax Act, 2025 takes effect', '2025年所得税法の施行'), effect: T('Section and form numbers change (e.g. tax-residency forms are now 42 and 43).', '条文・様式番号が変更（例：居住者証明の様式は42・43）。'), tags: ['all'], src: SRC.itAct, status: 'official' },
  { date: '2026-03-10', title: T('Press Note 2 (2026) eases land-border FDI rules', '2026年プレスノート2で陸上国境国FDIを緩和'), effect: T('Small non-controlling stakes eased; faster approvals for some manufacturing.', '非支配の少額出資を緩和、一部製造業の審査を迅速化。'), tags: ['landBorder'], src: SRC.pn2026, status: 'secondary' },
  { date: '2025-11-21', title: T('Four Labour Codes come into force', '4つの労働法典が施行'), effect: T('Replace 29 central labour laws.', '29の中央労働法を統合。'), tags: ['lo', 'bo', 'sub', 'jv'], src: SRC.labour, status: 'secondary' },
  { date: '2025-11-14', title: T('DPDP Rules 2025 notified', '2025年DPDP規則公布'), effect: T('Phased in over 18 months.', '18か月で段階施行。'), tags: ['personalData'], src: SRC.dpdp, status: 'secondary' },
  { date: '2025-09-22', title: T('GST moves to two main slabs (5% and 18%)', 'GSTが主に2税率（5%・18%）へ'), effect: T('Re-check the rate for your HSN code.', 'HSNコードの税率を再確認。'), tags: ['all'], src: SRC.gst2, status: 'secondary' },
  { date: '2025', title: T('Machinery & Electrical Equipment Safety order: enforcement dates moved', '機械・電気機器安全規則：施行日の変更'), effect: T('1 September 2026 was set for listed machinery; a later amendment may have removed the date.', '対象機械は2026年9月1日とされたが、後の改正で日付が削除された可能性。'), tags: ['machinery', 'electrical'], src: SRC.bisOtr, status: 'conflict' },
]

// Side-by-side entry-mode comparison. General guidance except where a source is linked.
export const MODE_COMPARE = [
  { key: 'control', label: T('Control over sales', '販売の主導権'), export: T('Low', '低'), lo: T('None — cannot sell', 'なし（販売不可）'), bo: T('High', '高'), sub: T('High', '高'), jv: T('Shared', '共有') },
  { key: 'liability', label: T('Liability for the parent', '親会社の責任'), export: T('Contract only', '契約上のみ'), lo: T('Parent liable', '親会社が責任'), bo: T('Parent liable', '親会社が責任'), sub: T('Limited to capital', '出資額まで'), jv: T('Limited to capital', '出資額まで') },
  { key: 'tax', label: T('Income tax in India', 'インドでの法人税'), export: T('None unless a PE exists', 'PEがなければなし'), lo: T('None (no income allowed)', 'なし（収益不可）'), bo: T('35% + surcharge & cess', '35%＋付加税'), sub: T('22% option (~25.17%)', '22%選択（実効約25.17%）'), jv: T('22% option (~25.17%)', '22%選択（実効約25.17%）') },
  { key: 'repatriation', label: T('Getting money back to Japan', '日本への資金還流'), export: T('Sales proceeds', '販売代金'), lo: T('Not applicable', '該当なし'), bo: T('Profits remittable after tax', '税引後利益を送金可'), sub: T('Dividends, royalties, fees (10% treaty WHT)', '配当・使用料・役務料（条約で源泉10%）'), jv: T('Pro-rata dividends', '持分比例の配当') },
  { key: 'setup', label: T('Typical set-up time', '標準的な設立期間'), export: T('Weeks', '数週間'), lo: T('2–4 months', '2〜4か月'), bo: T('2–4 months', '2〜4か月'), sub: T('1–3 months', '1〜3か月'), jv: T('3–6 months', '3〜6か月') },
  { key: 'burden', label: T('Compliance burden', 'コンプライアンス負担'), export: T('Low (partner imports)', '低（輸入は代理店）'), lo: T('Low–medium', '低〜中'), bo: T('Medium–high', '中〜高'), sub: T('Medium', '中'), jv: T('Medium + partner governance', '中＋合弁ガバナンス') },
  { key: 'pe', label: T('PE risk for the Japanese parent', '日本親会社のPEリスク'), export: T('Watch dependent-agent rules', '従属代理人に注意'), lo: T('If it exceeds liaison work', '連絡業務を超える場合'), bo: T('The branch is a PE', '支店自体がPE'), sub: T('Low if arm\'s length', '独立企業間なら低'), jv: T('Low if arm\'s length', '独立企業間なら低') },
]

export const SAMPLE = {
  company: 'Sample: Japanese packaging-machinery maker',
  industry: 'machinery', category: 'machinery', mode: 'sub', state: 'gj', landBorder: false,
  headcount: 12, expats: 1, personalData: false, revenueCr: 8,
}
