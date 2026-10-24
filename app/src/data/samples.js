// Two FICTIONAL sample brochures for the live demo, with cached extractions so the
// demo still works without network or an API key. The cached results have the same
// shape as the live /api/extract response.

export const SAMPLES = [
  {
    id: 'vindhya',
    label: 'Vindhya Metrology (integrator)',
    text: `Vindhya Metrology & Automation Pvt. Ltd. — Company Profile 2026

Founded in 2012 in Pune, Vindhya Metrology & Automation designs, installs and commissions inspection and measurement cells for automotive and machine-building plants.

Our team of 12 application engineers is based in Chakan, Ahmedabad and Bengaluru. We guarantee on-site response within 24 hours across Maharashtra and Gujarat.

We currently represent two Japanese precision-measurement brands and have completed more than 60 installations for tier-1 automotive suppliers in the Pune–Chakan belt.

Our in-house calibration laboratory supports gauge and CMM calibration.

Commercial terms: distributor margin of 18% on equipment, annual maintenance contracts at 8% of equipment value, and a minimum first-year commitment of INR 25 lakh.

Clients include brake, forging and transmission component manufacturers, as well as two electronics assemblers in Bengaluru.`,
    cached: {
      model: 'cached result',
      ms: 0,
      data: {
        name: 'Vindhya Metrology & Automation Pvt. Ltd.', type: 'Integrator', hq_city: 'Pune', hq_state: 'mh',
        presence: [{ state: 'mh', strength: 1 }, { state: 'gj', strength: 0.6 }, { state: 'ka', strength: 0.4 }],
        industries: { auto: 88, electronics: 40, machinery: 75, pharma: 0, food: 0 },
        engineers: 12, install: true, calibration: true, response_hours: 24, japan_principals: 2,
        min_commit_lakh: 25, margin_pct: 18, service_fee_pct: 8, years: 14, conflict: '',
        facts: [
          { fact: 'Installs and commissions inspection cells', fact_ja: '検査セルの据付・立ち上げを自社で実施', quote: 'designs, installs and commissions inspection and measurement cells for automotive and machine-building plants', check: 'install' },
          { fact: '12 application engineers', fact_ja: 'アプリケーションエンジニア12名', quote: 'Our team of 12 application engineers is based in Chakan, Ahmedabad and Bengaluru.', check: 'install' },
          { fact: '24h response in Maharashtra and Gujarat', fact_ja: 'マハーラーシュトラ州・グジャラート州で24時間以内に現地対応', quote: 'We guarantee on-site response within 24 hours across Maharashtra and Gujarat.', check: 'speed' },
          { fact: '2 Japanese principals', fact_ja: '日本の精密測定ブランド2社を取扱い', quote: 'We currently represent two Japanese precision-measurement brands', check: 'japan' },
          { fact: '60+ tier-1 automotive installations', fact_ja: '自動車ティア1向けに60件以上の導入実績', quote: 'have completed more than 60 installations for tier-1 automotive suppliers in the Pune–Chakan belt', check: 'industry' },
          { fact: 'In-house calibration lab', fact_ja: '自社校正ラボあり', quote: 'Our in-house calibration laboratory supports gauge and CMM calibration.', check: 'technical' },
          { fact: 'Minimum commitment ₹25 lakh', fact_ja: '初年度の最低契約額は250万ルピー', quote: 'a minimum first-year commitment of INR 25 lakh', check: 'budget' },
        ],
        unknowns: ['Calibration lab accreditation is not stated', 'Named customer references are not given', 'Whether the two Japanese brands compete with your product'],
        unknowns_ja: ['校正ラボの認定の有無が記載されていない', '具体的な顧客名の実績がない', '取扱中の日本ブランド2社が自社製品と競合するか'],
      },
    },
  },
  {
    id: 'ganga',
    label: 'Ganga Trade Links (distributor)',
    text: `GANGA TRADE LINKS — Industrial Distribution since 2001

Headquartered in Noida, Ganga Trade Links supplies quality-control and inspection equipment to over 400 automotive and two-wheeler component plants across Delhi NCR, Haryana, Uttar Pradesh and Punjab.

We are the authorised North India distributor for Kohana Vision Systems, a Japanese machine-vision inspection brand, and for three European metrology brands.

Our sales network of 25 engineers handles demonstrations and order processing. Installation and repair are carried out by the principal's own service teams.

Typical response time for sales enquiries is 48 hours.

Standard terms: 24% distributor margin, no minimum purchase commitment for new principals in the first year.`,
    cached: {
      model: 'cached result',
      ms: 0,
      data: {
        name: 'Ganga Trade Links', type: 'Distributor', hq_city: 'Noida', hq_state: 'up',
        presence: [{ state: 'up', strength: 1 }, { state: 'dl', strength: 0.8 }, { state: 'hr', strength: 0.8 }, { state: 'pb', strength: 0.4 }],
        industries: { auto: 92, electronics: 20, machinery: 40, pharma: 0, food: 0 },
        engineers: 0, install: false, calibration: false, response_hours: 48, japan_principals: 1,
        min_commit_lakh: 0, margin_pct: 24, service_fee_pct: 0, years: 25,
        conflict: 'Authorised distributor for Kohana Vision Systems, a competing Japanese machine-vision inspection brand',
        facts: [
          { fact: '400+ automotive plants across North India', fact_ja: '北インドの自動車関連工場400社以上に販売', quote: 'supplies quality-control and inspection equipment to over 400 automotive and two-wheeler component plants across Delhi NCR, Haryana, Uttar Pradesh and Punjab', check: 'industry' },
          { fact: 'Carries a competing Japanese inspection brand', fact_ja: '競合する日本の検査装置ブランドを取扱い', quote: 'We are the authorised North India distributor for Kohana Vision Systems, a Japanese machine-vision inspection brand', check: 'conflict' },
          { fact: 'No in-house installation or repair', fact_ja: '据付・修理は自社で行わない', quote: "Installation and repair are carried out by the principal's own service teams.", check: 'install' },
          { fact: '48h response to enquiries', fact_ja: '問い合わせへの回答は48時間', quote: 'Typical response time for sales enquiries is 48 hours.', check: 'speed' },
          { fact: 'No minimum commitment in year one', fact_ja: '初年度の最低購入義務なし', quote: 'no minimum purchase commitment for new principals in the first year', check: 'budget' },
        ],
        unknowns: ['The 25 engineers are sales engineers; field-service capacity is unknown', 'Exclusivity terms with Kohana Vision Systems'],
        unknowns_ja: ['25名は営業エンジニアで、フィールドサービス体制は不明', 'Kohana Vision Systemsとの独占契約の条件'],
      },
    },
  },
]

// Approximate coordinates for HQ cities that brochures commonly name.
export const CITY_COORDS = {
  pune: [73.86, 18.52], mumbai: [72.88, 19.08], chennai: [80.27, 13.08], bengaluru: [77.59, 12.97], bangalore: [77.59, 12.97],
  hyderabad: [78.49, 17.39], ahmedabad: [72.57, 23.02], gurugram: [77.03, 28.46], gurgaon: [77.03, 28.46], noida: [77.39, 28.54],
  delhi: [77.21, 28.61], 'new delhi': [77.21, 28.61], kolkata: [88.36, 22.57], neemrana: [76.38, 27.99], indore: [75.86, 22.72],
  coimbatore: [76.96, 11.02], nashik: [73.79, 19.99], aurangabad: [75.34, 19.88], vadodara: [73.18, 22.31], surat: [72.83, 21.17],
  jaipur: [75.79, 26.91], lucknow: [80.95, 26.85], chandigarh: [76.78, 30.73], ludhiana: [75.86, 30.9], hosur: [77.83, 12.74],
  sriperumbudur: [79.95, 12.97], manesar: [76.94, 28.36], faridabad: [77.32, 28.41], kochi: [76.27, 9.93], bhubaneswar: [85.82, 20.3],
}
