// Market understanding (PS part 1): sector overview, target customer and a 3-state
// comparison per industry. Every rating carries a reason, a source and the source's date.
// "Unknown" is shown whenever no source was found — never filled in with a guess.
// Text is bilingual inline ({ en, ja }) because it is data, not UI chrome.
import { JP_PRESENCE } from './catalog.js'

export const CHECKED_ON = '2026-10-24'

// Sources (title, url, date of the figure)
const S = {
  acma: { title: 'ACMA, Indian auto component industry performance FY2024-25', url: 'https://acma.in/uploads/press-release/Press%20Release%20FY25.pdf', date: '2025' },
  tnAuto: { title: 'Guidance Tamil Nadu, Automobile, Auto Components & EV', url: 'https://www.investingintamilnadu.com/sectors/automobile-auto-components-ev', date: 'accessed 2026-10' },
  midc: { title: 'MIDC (Govt. of Maharashtra), Automobile & auto components', url: 'https://www.midcindia.org/en/?p=721', date: 'accessed 2026-10' },
  hrCars: { title: 'NSDC skill-gap report via The Tribune; Maruti Suzuki production release (Dec 2024)', url: 'https://www.marutisuzuki.com/corporate/media/press-releases/2024/december/maruti-suzuki-achieves-a-historic-production-milestone-of-2-million-units-in-a--calendar-year', date: '2024' },
  elecTN: { title: 'State electronics export data FY25 (reported by Digital Terminal / Civilsdaily)', url: 'https://www.civilsdaily.com/news/tamil-nadu-accounts-for-30-of-indias-electronics-exports/', date: 'FY2024-25' },
  elecUP: { title: 'Business Standard analysis of Niryat portal data', url: 'https://businessstandard.substack.com/p/ups-export-target-has-competition', date: 'FY2024-25' },
  imtma: { title: 'IMTMA production & consumption data (via market reports); IMTEX 2025 show daily', url: 'https://www.imtex.in/assets/show_daily/2025/day2_imtex_2025.pdf', date: 'FY2024-25' },
  kaMT: { title: 'Invest Karnataka, Machine Tools sector profile', url: 'https://investkarnataka.co.in/wp-content/uploads/2025/02/Machine-Tools.pdf', date: '2025 (share for 2018-19)' },
  niti: { title: 'NITI Aayog pharma report, as summarised by Deccan Chronicle', url: 'https://www.deccanchronicle.com/southern-states/telangana/telangana-is-key-pillar-of-indias-pharma-production-1966000', date: '2025' },
  lsPharma: { title: 'Rajya Sabha answer PQ 266, state-wise pharma exports', url: 'https://rsdebate.nic.in/bitstream/123456789/754395/1/PQ_266_03122024_U831_p233_p234.pdf', date: 'Dec 2024 (FY2023-24 data)' },
  asiFood: { title: 'Rajya Sabha answer PQ 267 (ASI 2022-23); Lok Sabha annexure (ASI 2016-17)', url: 'https://rsdebate.nic.in/bitstream/123456789/758456/1/PQ_267_07022025_U573_p313_p315.pdf', date: 'Feb 2025' },
  jp: { title: JP_PRESENCE.source, url: JP_PRESENCE.url, date: 'Oct 2024' },
}

const jpRating = (state) => {
  const n = JP_PRESENCE.states[state]?.companies
  if (n == null) return { rating: 'Unknown', why: { en: 'No state figure in the Embassy/JETRO list extract we hold.', ja: '保有している大使館・JETROリストの抜粋に州別の数値がありません。' }, src: S.jp }
  const rating = n >= 200 ? 'Strong' : n >= 100 ? 'Moderate' : 'Limited'
  return {
    rating,
    why: { en: `${n} Japanese companies listed in the state${JP_PRESENCE.states[state].checked ? '' : ' (figure still to be checked against the PDF)'}.`, ja: `州内の日系企業 ${n} 社${JP_PRESENCE.states[state].checked ? '' : '（PDFとの照合待ち）'}。` },
    src: S.jp,
  }
}

export const MARKET = {
  auto: {
    overview: {
      en: 'India\'s auto component industry turned over about ₹6.73 lakh crore (USD 80 billion) in FY2024-25, up 9.6%, and has grown 14% a year over five years. Supplies to vehicle makers are ₹5.7 lakh crore of that; exports were USD 22.9 billion, roughly equal to imports.',
      ja: 'インドの自動車部品産業の売上高は2024年度に約6.73兆ルピー（約800億ドル）、前年比9.6%増、過去5年の年平均成長率は14%。うち完成車メーカー向けが5.7兆ルピー、輸出は229億ドルで輸入とほぼ同額。',
    },
    signals: [
      { en: 'Turnover ₹6.73 lakh crore, +9.6% (FY25); 14% CAGR FY20–25', ja: '売上高6.73兆ルピー、+9.6%（2024年度）、2020〜25年度の年平均14%', src: S.acma },
      { en: 'Imports of components USD 22.4 billion: a sizeable market for imported parts and equipment', ja: '部品輸入は224億ドル：輸入部品・設備の市場は大きい', src: S.acma },
    ],
    barriers: [
      { en: 'OEM and tier-1 supplier approval cycles are long; a local reference customer usually comes first.', ja: '完成車メーカー・Tier1の承認サイクルが長く、通常はまず現地の導入実績が必要。' },
      { en: 'Strong price pressure from domestic and Chinese suppliers.', ja: '国内勢・中国勢との価格競争が激しい。' },
    ],
    buyer: {
      who: { en: 'Auto-component manufacturers (tier-1 / tier-2) and vehicle plants', ja: '自動車部品メーカー（Tier1・Tier2）と完成車工場' },
      roles: { en: 'Plant head, quality head, purchasing; OEM approval for parts that go into Japanese OEM lines', ja: '工場長、品質責任者、購買。日系完成車向け部品はOEM承認も' },
    },
    states: [
      { state: 'tn', buyers: { rating: 'Strong', why: { en: 'About 35% of India\'s auto component production (state investment agency).', ja: 'インドの自動車部品生産の約35%（州投資促進機関）。' }, src: S.tnAuto } },
      { state: 'mh', buyers: { rating: 'Strong', why: { en: 'About 20% of India\'s parts & accessories output; 4,000+ auto units around Pune alone.', ja: 'インドの部品・付属品生産の約20%、プネ周辺だけで4,000以上の工場。' }, src: S.midc } },
      { state: 'hr', buyers: { rating: 'Strong', why: { en: 'Roughly half of India\'s passenger cars are built here (Gurugram–Manesar); exact share varies by source.', ja: 'インドの乗用車の約半分を生産（グルガオン〜マネサール）。比率は出典により異なる。' }, src: S.hrCars } },
    ],
  },
  electronics: {
    overview: {
      en: 'Electronics is India\'s fastest-growing export category. Tamil Nadu alone exported USD 14.65 billion in FY2024-25, 41% of the national total and 53% more than the year before; Karnataka and Uttar Pradesh follow.',
      ja: '電子機器はインドで最も成長の速い輸出品目。2024年度、タミル・ナードゥ州だけで146.5億ドル（全国の41%、前年比53%増）を輸出し、カルナータカ州、ウッタル・プラデーシュ州が続く。',
    },
    signals: [
      { en: 'Tamil Nadu electronics exports USD 14.65 bn (41.2% share), +53% YoY', ja: 'タミル・ナードゥ州の電子機器輸出146.5億ドル（シェア41.2%）、前年比+53%', src: S.elecTN },
      { en: 'Karnataka USD 7.8 bn; Uttar Pradesh about USD 5.3 bn (FY25)', ja: 'カルナータカ州78億ドル、ウッタル・プラデーシュ州約53億ドル（2024年度）', src: S.elecUP },
    ],
    barriers: [
      { en: 'Buyers are concentrated in large EMS groups with global sourcing teams.', ja: '買い手はグローバル調達を持つ大手EMSに集中。' },
      { en: 'Products may need BIS registration before sale (check the compliance tab).', ja: '販売前にBIS登録が必要な場合がある（コンプライアンス・タブで確認）。' },
    ],
    buyer: {
      who: { en: 'EMS / contract manufacturers, phone and component makers', ja: 'EMS・受託製造、スマートフォン・部品メーカー' },
      roles: { en: 'Engineering / NPI, quality, central procurement', ja: '技術・量産立上げ、品質、本社調達' },
    },
    states: [
      { state: 'tn', buyers: { rating: 'Strong', why: { en: 'Largest electronics exporter: USD 14.65 bn, 41% of India (FY25).', ja: '最大の電子機器輸出州：146.5億ドル、全国の41%（2024年度）。' }, src: S.elecTN } },
      { state: 'ka', buyers: { rating: 'Strong', why: { en: 'Second-largest exporter at USD 7.8 bn (FY25).', ja: '第2位、78億ドル（2024年度）。' }, src: S.elecTN } },
      { state: 'up', buyers: { rating: 'Moderate', why: { en: 'About USD 5.3 bn (FY25), mostly phones around Noida.', ja: '約53億ドル（2024年度）、主にノイダ周辺の携帯電話。' }, src: S.elecUP } },
    ],
  },
  machinery: {
    overview: {
      en: 'India used ₹31,781 crore of machine tools in FY2024-25 but made only ₹14,566 crore, so most demand is met by imports. About 55% of machine tools go to the auto industry. Production is concentrated in Karnataka.',
      ja: 'インドの工作機械消費は2024年度に3,178億ルピーだが国内生産は1,457億ルピーにとどまり、需要の多くを輸入で賄う。工作機械の約55%は自動車産業向け。生産はカルナータカ州に集中。',
    },
    signals: [
      { en: 'Consumption ₹31,781 cr vs production ₹14,566 cr (FY25): import gap', ja: '消費3,178億ルピー対生産1,457億ルピー（2024年度）：輸入依存', src: S.imtma },
      { en: '~55% of machine tools made in India go to the auto industry', ja: '国内生産工作機械の約55%が自動車産業向け', src: S.imtma },
    ],
    barriers: [
      { en: 'Buyers expect local demonstration, installation and fast service.', ja: '買い手は現地でのデモ、据付、迅速なサービスを期待。' },
      { en: 'Machinery safety certification rules were in flux in 2026 (see compliance).', ja: '機械安全認証の規則は2026年に変動（コンプライアンス参照）。' },
    ],
    buyer: {
      who: { en: 'Manufacturers in auto, general engineering and capital goods', ja: '自動車、一般機械、資本財のメーカー' },
      roles: { en: 'Plant / maintenance heads; owners decide in smaller firms', ja: '工場長・保全責任者。中小企業ではオーナーが決定' },
    },
    states: [
      { state: 'ka', buyers: { rating: 'Strong', why: { en: 'About half of India\'s machine-tool production (52% in 2018-19) around Bengaluru.', ja: 'ベンガルール周辺でインドの工作機械生産の約半分（2018-19年度は52%）。' }, src: S.kaMT } },
      { state: 'tn', buyers: { rating: 'Strong', why: { en: 'About 35% of auto component production, the largest machine-tool user; Coimbatore cluster.', ja: '自動車部品生産の約35%（工作機械の最大の需要先）、コインバトール集積。' }, src: S.tnAuto } },
      { state: 'mh', buyers: { rating: 'Strong', why: { en: 'About 20–23% of India\'s vehicle and parts output; Pune–Chakan engineering belt.', ja: 'インドの車両・部品生産の約20〜23%、プネ〜チャカンの機械産業帯。' }, src: S.midc } },
    ],
  },
  pharma: {
    overview: {
      en: 'NITI Aayog names Telangana, Gujarat and Maharashtra as the three pillars of Indian pharma. Together with Gujarat and Maharashtra, Telangana accounts for more than half of India\'s drug exports; production shares vary by source.',
      ja: 'NITIアーヨグはテランガーナ、グジャラート、マハーラーシュトラを製薬の三本柱とする。3州で医薬品輸出の半分超を占める。生産シェアは出典により異なる。',
    },
    signals: [
      { en: 'Gujarat ~33% of production with 3,000+ units; Maharashtra ~14% with 3,800+ units', ja: 'グジャラート州：生産の約33%・3,000以上の工場、マハーラーシュトラ州：約14%・3,800以上', src: S.niti },
      { en: 'Pharma exports FY24: Gujarat ₹18,297 cr, Maharashtra ₹11,219 cr', ja: '2023年度医薬品輸出：グジャラート州1兆8,297億ルピー、マハーラーシュトラ州1兆1,219億ルピー', src: S.lsPharma },
    ],
    barriers: [
      { en: 'Buyers qualify suppliers against GMP and export-market audits; validation takes time.', ja: '買い手はGMP・輸出先監査に基づき供給者を認定するため、バリデーションに時間がかかる。' },
      { en: 'Some products need CDSCO registration.', ja: '製品によってはCDSCO登録が必要。' },
    ],
    buyer: {
      who: { en: 'Formulation and API manufacturers', ja: '製剤・原薬メーカー' },
      roles: { en: 'QA / QC, production, engineering; regulatory affairs for export plants', ja: '品質保証・品質管理、製造、技術。輸出工場は薬事部門も' },
    },
    states: [
      { state: 'gj', buyers: { rating: 'Strong', why: { en: 'About a third of national production; largest pharma exporter (FY24).', ja: '全国生産の約3分の1、医薬品輸出最大（2023年度）。' }, src: S.niti } },
      { state: 'tg', buyers: { rating: 'Strong', why: { en: 'Named a main pillar of pharma production; production-share estimates range widely.', ja: '製薬生産の主要拠点。生産シェアの推計は幅が大きい。' }, src: S.niti } },
      { state: 'mh', buyers: { rating: 'Moderate', why: { en: 'About 14% of production but the most units (3,800+); second in exports.', ja: '生産の約14%だが工場数は最多（3,800以上）、輸出は第2位。' }, src: S.niti } },
    ],
  },
  food: {
    overview: {
      en: 'India had 42,803 registered food-processing factories in 2022-23 (Annual Survey of Industries). Current state-wise figures were not available to us, so the state comparison below relies on older data and shows gaps openly.',
      ja: 'インドの登録食品加工工場は2022-23年度に42,803（工業年次調査）。最新の州別数値は入手できなかったため、下の州比較は古いデータに基づき、不足をそのまま示す。',
    },
    signals: [
      { en: '42,803 registered food-processing units (ASI 2022-23)', ja: '登録食品加工工場42,803（ASI 2022-23年度）', src: S.asiFood },
    ],
    barriers: [
      { en: 'Highly fragmented buyers; many small units with tight budgets.', ja: '買い手が細分化され、予算の限られた小規模工場が多い。' },
      { en: 'Food-contact products need FSSAI compliance.', ja: '食品接触製品はFSSAI対応が必要。' },
    ],
    buyer: {
      who: { en: 'Food processors (dairy, bakery, packaged foods)', ja: '食品加工業（乳製品、製パン、加工食品）' },
      roles: { en: 'Owner / plant head, quality and food-safety lead', ja: 'オーナー・工場長、品質・食品安全責任者' },
    },
    states: [
      { state: 'ap', buyers: { rating: 'Moderate', why: { en: '5,859 registered units in 2016-17, the most of any state then; no current figure found.', ja: '2016-17年度に5,859工場で当時最多。最新値は未確認。' }, src: S.asiFood } },
      { state: 'mh', buyers: { rating: 'Moderate', why: { en: '2,808 registered units in 2016-17; no current figure found.', ja: '2016-17年度に2,808工場。最新値は未確認。' }, src: S.asiFood } },
      { state: 'tn', buyers: { rating: 'Unknown', why: { en: 'No state figure retrieved yet.', ja: '州の数値は未取得。' }, src: S.asiFood } },
    ],
  },
}

// Assemble the comparison rows for the chosen industry and service model.
export function marketFor(industry, { needsService }) {
  const m = MARKET[industry] || MARKET.auto
  const rows = m.states.map((s) => ({
    state: s.state,
    buyers: s.buyers,
    japan: jpRating(s.state),
    demand: { rating: 'Unknown', why: { en: 'Demand for your specific product is not measured yet. Validate with 5–10 buyer conversations.', ja: '貴社製品の需要は未測定。買い手5〜10社との対話で検証してください。' } },
    service: needsService
      ? { rating: 'To check', why: { en: 'You need local installation: confirm a partner with engineers in this state.', ja: '現地据付が必要：この州にエンジニアを持つパートナーを確認。' } }
      : { rating: 'Not required', why: { en: 'Your own team supports customers.', ja: '自社チームが顧客を支援。' } },
  }))
  const score = { Strong: 3, Moderate: 2, Limited: 1, Unknown: 0 }
  const suggested = [...rows].sort((a, b) => (2 * score[b.buyers.rating] + score[b.japan.rating]) - (2 * score[a.buyers.rating] + score[a.japan.rating])).slice(0, 2).map((r) => r.state)
  return { ...m, rows, suggested }
}
