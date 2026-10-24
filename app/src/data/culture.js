// Japan ↔ India business playbook (PS part 5). General guidance drawn from common business
// practice — people and companies vary, so each row ends in a concrete action rather than a rule.
const T = (en, ja) => ({ en, ja })

export const PLAYBOOK = [
  {
    topic: T('Who decides, and how fast', '誰が、どれだけ早く決めるか'),
    japan: T('Consensus across departments (nemawashi, ringi); decisions take weeks but stick.', '部門間の合意形成（根回し・稟議）。時間はかかるが決定は覆りにくい。'),
    india: T('In SMEs and family firms the owner or MD often decides alone, sometimes in one meeting.', '中小企業や同族企業ではオーナーやMDが一人で、時に1回の会議で決めることが多い。'),
    action: T('Tell them your decision date up front ("we will confirm by 15 Nov") and ask who signs on their side.', '最初に決定日を伝え（例「11月15日までに確定します」）、相手側の決裁者を確認する。'),
  },
  {
    topic: T('What "yes" and "we will consider" mean', '「はい」と「検討します」の意味'),
    japan: T('"We will consider it" (検討します) is often a polite no.', '「検討します」は丁寧な断りであることが多い。'),
    india: T('"Yes", "no problem" or "will do" can mean "I heard you" rather than a commitment — and a soft Japanese "consider" may be read as a yes.', '「Yes」「No problem」「Will do」は約束ではなく「聞きました」の意味のことも。日本式の「検討します」は前向きな返事と受け取られることがある。'),
    action: T('Say clearly what you mean, then confirm in writing: who does what by when.', '意図を明確に言い、誰が何をいつまでにするかを書面で確認する。'),
  },
  {
    topic: T('Price negotiation', '価格交渉'),
    japan: T('The first quote is usually close to final; haggling is uncommon.', '最初の見積りはほぼ最終価格で、値切りは一般的でない。'),
    india: T('The first price is often treated as an opening; buyers compare with local and Chinese options.', '最初の価格は交渉の出発点と見なされることが多く、国内・中国製と比較される。'),
    action: T('Leave room in the first quote. Trade every discount for something: volume, advance payment, a reference customer.', '初回見積りに余地を残す。値引きは必ず数量、前払い、導入事例などと交換する。'),
  },
  {
    topic: T('Timelines and follow-up', '納期とフォローアップ'),
    japan: T('Schedules are fixed; a delay needs an apology and a reason.', 'スケジュールは固定的で、遅れには謝罪と理由が必要。'),
    india: T('Plans flex; meetings can move and replies may need a nudge. Silence is not always a no.', '計画は柔軟で、会議の変更や返信の催促が必要なことも。沈黙が必ずしも拒否ではない。'),
    action: T('Build buffer into pilots, send a reminder the day before, and follow up after 3–4 working days.', 'パイロットに余裕を持たせ、前日にリマインドし、3〜4営業日後にフォローする。'),
  },
  {
    topic: T('Channels', '連絡手段'),
    japan: T('Formal email; phone calls are planned.', '正式なメールが中心で、電話は事前調整。'),
    india: T('WhatsApp and phone calls are normal for business, with quick replies expected.', 'WhatsAppや電話がビジネスでも一般的で、素早い返信が期待される。'),
    action: T('Set up WhatsApp Business for your India contact person; summarise every call in a short email.', 'インド担当者用にWhatsApp Businessを用意し、通話後は短いメールで要点をまとめる。'),
  },
  {
    topic: T('Hierarchy in the room', '会議の序列'),
    japan: T('Rank and seniority shape who speaks and who attends.', '役職と年次が発言者と出席者を決める。'),
    india: T('Also hierarchical; titles matter and the senior person expects to talk to a senior person.', '同様に序列があり、肩書きが重視され、上位者は上位者との対話を期待する。'),
    action: T('Match seniority for key meetings and make sure their decision-maker is in the room.', '重要な会議では役職を合わせ、相手の決裁者が出席していることを確認する。'),
  },
  {
    topic: T('Building trust', '信頼の築き方'),
    japan: T('Trust grows slowly through reliability and formal steps.', '信頼は確実さと正式な手順で時間をかけて築かれる。'),
    india: T('Personal rapport matters early: calls, meals and visits build the relationship.', '早い段階から個人的な関係が重要で、電話や食事、訪問が関係を深める。'),
    action: T('Visit in person at least once before signing; small talk about family, cricket or travel is welcome.', '契約前に最低1回は訪問する。家族、クリケット、旅行などの雑談は歓迎される。'),
  },
  {
    topic: T('Contracts', '契約'),
    japan: T('Contracts frame a relationship built on trust.', '契約は信頼関係の枠組み。'),
    india: T('Detailed written terms matter because court enforcement is slow.', '裁判所での執行に時間がかかるため、詳細な書面条件が重要。'),
    action: T('Tie exclusivity to targets and a review date, set an arbitration seat, and have an Indian lawyer review it.', '独占権は目標と見直し日に連動させ、仲裁地を定め、インドの弁護士に確認してもらう。'),
  },
  {
    topic: T('Payment terms', '支払条件'),
    japan: T('Payment on agreed dates is the norm.', '合意した期日での支払いが原則。'),
    india: T('30–90 day credit is common and late payment happens.', '30〜90日の掛け払いが一般的で、支払遅延も起こる。'),
    action: T('Ask for advance payment or a letter of credit on first orders; extend credit after a track record.', '初回は前払いか信用状を求め、実績ができてから与信を広げる。'),
  },
  {
    topic: T('Calendar', '暦'),
    japan: T('Fiscal year April–March; Golden Week and Obon slow things down.', '会計年度は4〜3月。ゴールデンウィークとお盆は動きが鈍る。'),
    india: T('Fiscal year is also April–March; budgets close in March. Diwali (Oct/Nov) slows business for about a week.', '会計年度も4〜3月で、予算は3月に締まる。ディワリ（10〜11月）は約1週間動きが鈍る。'),
    action: T('Pitch before budgets close in Jan–Feb; avoid scheduling decisions in Diwali week.', '予算が締まる前の1〜2月に提案し、ディワリの週に意思決定を設定しない。'),
  },
]

export const MEETING_CHECKLIST = [
  T('Bilingual business cards (English on one side)', '英語面のある名刺'),
  T('One-page product sheet with price range in INR', 'INR価格帯入りの製品1枚資料'),
  T('Confirm their decision-maker will attend', '相手の決裁者の出席を確認'),
  T('Agenda sent the day before, confirmed on WhatsApp', '前日にアジェンダ送付、WhatsAppで確認'),
  T('Your walk-away price and the concessions you can trade', '撤退ラインと交換できる譲歩'),
  T('Vegetarian-friendly options if hosting a meal; be cautious with alcohol', '会食では菜食対応を用意し、飲酒は控えめに'),
  T('Summary email within 24 hours: decisions, owners, dates', '24時間以内に要約メール：決定事項・担当・期日'),
]

export const SITUATIONS = [
  { id: 'first', label: 'First contact', ja: '初回連絡' },
  { id: 'followup', label: 'Follow-up after no reply', ja: '返信がない時の催促' },
  { id: 'price', label: 'Price or margin', ja: '価格・マージン' },
  { id: 'decline', label: 'Saying no', ja: '断る' },
  { id: 'delay', label: 'Explaining a slow decision', ja: '意思決定の遅れの説明' },
  { id: 'payment', label: 'Payment terms', ja: '支払条件' },
  { id: 'meeting', label: 'Confirming a meeting', ja: '会議の確認' },
]

export const COACH_EXAMPLE = {
  ja: 'お世話になっております。先日ご提案いただいた独占販売の件、社内で前向きに検討させていただきます。少しお時間をいただけますと幸いです。今後ともよろしくお願いいたします。',
  en: 'Thank you for your proposal about exclusive distribution. We will consider it positively internally. Please give us some time.',
}
