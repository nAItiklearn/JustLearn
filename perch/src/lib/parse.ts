// ── Text heuristics: pull money, cadence, dates, trials and events out
// of raw email text (subject lines and snippets are usually enough).
// Deliberately conservative: everything is "best-effort with evidence".

export interface ParseResult {
  amount: number | null;
  currency: string | null;
  cadence: "weekly" | "monthly" | "quarterly" | "yearly" | "unknown";
  nextChargeAt: string | null;
  trialEndsAt: string | null;
  trialMentioned: boolean;
  isEvent: boolean;
  startsAt: string | null;
  endsAt: string | null;
  where: string | null;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

const CURRENCY_FORMS: Array<[RegExp, string]> = [
  [/₹|(?<![\w])rs\.?\s/i, "INR"],
  [/\$|(?<![\w])usd(?![\w])/i, "USD"],
  [/€|(?<![\w])eur(?![\w])/i, "EUR"],
  [/£|(?<![\w])gbp(?![\w])/i, "GBP"],
];

const AMOUNT_RES = [
  /(?:₹|rs\.?|inr)\s?([\d,]+(?:\.\d{1,2})?)/i,
  /(?:\$|usd)\s?([\d,]+(?:\.\d{1,2})?)/i,
  /(?:€|eur)\s?([\d,]+(?:\.\d{1,2})?)/i,
  /(?:£|gbp)\s?([\d,]+(?:\.\d{1,2})?)/i,
];

const CADENCE_RES: Array<[RegExp, ParseResult["cadence"]]> = [
  [/every (?:week|7 days)|weekly|\/\s?week|per week/i, "weekly"],
  [/every (?:3|three) months|quarterly|every quarter/i, "quarterly"],
  [/every (?:year|12 months)|annually|annual plan|per year|yearly|\/\s?year|\/yr|per annum/i, "yearly"],
  [/every month|monthly|\/\s?month|per month|month subscription|per\s?mo\b/i, "monthly"],
];

/** Phrases that introduce a concrete billing date. */
const RENEW_LEAD = /(?:renew(?:s|al)?|re-?occur|recur|recurrence|next (?:billing|payment|charge)|auto(?:matically)? (?:renew|charged?|billed)|will (?:be )?(?:charged|billed)|charged (?:again )?(?:on|for)|payment (?:due|on)|due (?:date|on)|billing (?:date|on)|continue[sd] (?:on|from))\s*[:]?\s*(?:on|at|from|date|is)?\s*/i;

const DATE_RES: RegExp[] = [
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s*(\d{4})?\b/i,
  /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?,?\s*(\d{4})?\b/i,
  /\b(\d{4})-(\d{2})-(\d{2})\b/,
];

const TRIAL_KW = /free trial|trial (?:period|ends|will end|end|expir)|your trial|days (?:left|of (?:your )?free)|cancel (?:anytime|before|at least)|before your trial|trial start|start your (?:free )?trial|trial is (?:ending|about to end)/i;

export const EVENT_KW = /your (?:ticket|tickets|registration|booking)|registration confirmed|you['’]?re (?:in|going|registered)|order confirmed|booking (?:confirmed|for)|reservation|boarding pass|itinerary|see you at|admission|concert|meetup|conference|summit|workshop|event reminders?/i;

export function parseEmailText(subject: string, snippet: string, body?: string, browserNow: number = Date.now()): ParseResult {
  const text = `${subject} · ${snippet}`;
  const deep = body ?? text;
  const out: ParseResult = {
    amount: null,
    currency: null,
    cadence: "unknown",
    nextChargeAt: null,
    trialEndsAt: null,
    trialMentioned: false,
    isEvent: false,
    startsAt: null,
    endsAt: null,
    where: null,
  };

  // currency + amount
  for (const [re, code] of CURRENCY_FORMS) {
    if (re.test(text)) { out.currency = code; break; }
  }
  const amountHints = deep.match(
    /(?:price|total|amount|you(?:'|’)?(?:ll| will) pay|pay ?(?:ing)?|charged|subscription|plan|fee|cost)s?[^.\n]{0,40}?(?:₹|rs\.?|inr|usd|\$|€|£)\s?([\d,]+(?:\.\d{1,2})?)/i
  ) ?? deep.match(/(?:₹|rs\.?|inr|usd|\$|€|£)\s?([\d,]+(?:\.\d{1,2})?)/i);
  if (amountHints) {
    const value = Number(amountHints[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value > 0) out.amount = value;
  }

  // cadence
  for (const [re, c] of CADENCE_RES) {
    if (re.test(text)) { out.cadence = c; break; }
  }

  // renewal / charge date — search each sentence that mentions the key phrase
  out.nextChargeAt = dateNear(RENEW_LEAD, text, browserNow) ?? dateNear(RENEW_LEAD, deep, browserNow);

  // trial awareness
  out.trialMentioned = TRIAL_KW.test(text) || /trial/i.test(subject);
  if (out.trialMentioned) {
    const trialLead = /(?:trial (?:period )?(?:ends|will end|end)|free trial (?:ends|until)|trial expires)\s*[:]?\s*(?:on|at|in \d+ days, )?\s*/gi;
    out.trialEndsAt = dateNear(trialLead, text, browserNow) ?? dateNear(trialLead, deep, browserNow);
    // "cancel by Jun 5 to avoid being charged" → trial (or first bill) date
    if (!out.trialEndsAt) {
      const cancelLead = /(?:cancel[^.\n]{0,60}?by|your card will be charged on|you will be charged on)\s+/gi;
      out.trialEndsAt = dateNear(cancelLead, text, browserNow);
    }
    // no explicit date anywhere, but a first charge does exist → treat that as the end
    if (!out.trialEndsAt) out.trialEndsAt = out.nextChargeAt;
  }

  // events
  out.isEvent = EVENT_KW.test(text);
  if (out.isEvent) {
    const eventLead = /(?:starts?|begins?|date(?:s| and time)?|time|event (?:date|on)|happening|live on|scheduled for|take[s]? place)\s*[:]?\s*/gi;
    out.startsAt = dateNear(eventLead, text, browserNow) ?? dateNear(eventLead, deep, browserNow);
    if (!out.startsAt) {
      // very loose: an ics-style or explicit "Mar 3, 2026 · 7:00 PM" anywhere with event words near it
      out.startsAt = looseEventDate(text, browserNow);
    }
    out.endsAt = null;
    const where = text.match(/\bat ([A-Z][\w'&.\-]*(?:\s+[A-Z][\w'&.\-]*){0,4})|venue:?\s*([^\n·|]{3,64})|location:?\s*([^\n·|]{3,64})|online|virtual/i);
    if (where) out.where = where.slice(1).find(Boolean) ?? (where[0] ? "Online" : null);
  }

  if (out.cadence === "yearly" || /annual|annually|per year|yearly/i.test(text)) out.cadence = "yearly";
  return out;
}

/** Find a date within 120 chars after a lead phrase (across a sentence boundary). */
function dateNear(lead: RegExp, text: string, now: number): string | null {
  const re = new RegExp(lead.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const window = text.slice(m.index + m[0].length, m.index + m[0].length + 160);
    const parsed = firstDate(window, now);
    if (parsed) return parsed;
  }
  return null;
}

function looseEventDate(text: string, now: number): string | null {
  const windows = text.split(/[.!?;\n]/);
  for (const s of windows) {
    if (!/ticket|booking|regist|event|attend|see you/i.test(s)) continue;
    const d = firstDate(s, now);
    if (d) return d;
  }
  return null;
}

/** First date expression inside a piece of text. Returns yyyy-mm-dd if we can pin a time, else ISO string. */
export function firstDate(text: string, now: number): string | null {
  for (let i = 0; i < DATE_RES.length; i++) {
    const m = text.match(DATE_RES[i]);
    if (!m) continue;
    let year: number | undefined, month: number, day: number;
    if (i === 2) {
      year = Number(m[1]); month = Number(m[2]) - 1; day = Number(m[3]);
    } else if (i === 0) {
      month = MONTHS[m[1].toLowerCase().slice(0, 4)]; day = Number(m[2]); year = m[3] ? Number(m[3]) : undefined;
    } else {
      day = Number(m[1]); month = MONTHS[m[2].toLowerCase().slice(0, 4)]; year = m[3] ? Number(m[3]) : undefined;
    }
    if (month === undefined || Number.isNaN(month)) continue;
    const thisYear = new Date(now).getFullYear();
    const y = year ?? thisYear;
    const d = new Date(Date.UTC(y, month, day, 9));
    if (Number.isNaN(d.getTime())) continue;
    if (!year && d.getTime() < now - 62 * 864e5) {
      // no year given: if that date is deep in the past, it probably means next year
      d.setUTCFullYear(y + 1);
    }
    return d.toISOString().slice(0, 10);
  }
  // ISO timestamps like 2026-06-03T18:30:00Z / epochs
  const iso = text.match(/\b(\d{4}-\d{2}-\d{2})T?(\d{2}:\d{2}(?::\d{2})?)?/);
  if (iso) return iso[1];
  const epoch = text.match(/\b1[7-9]\d{8}\b/);
  if (epoch) return new Date(Number(epoch[0])).toISOString().slice(0, 10);
  return null;
}

/** Regular expression for a "one-off" purchase words — excluded from subscription detection. */
export const ONE_OFF_KW = /one[- ]?time|one[- ]?off|single (?:payment|purchase)|day pass|ticket only|refund|refund(?:ed)?|thank(?:s| you) for your (?:purchase|order)/i;

export const RENEWAL_SUBJECT_KW = /renew|recurring|your (?:plan|subscription|membership)|receipt|invoice|payment|billing|trial|you paid|charged/i;

export const SUB_KW = /subscription|membership|plan|premium|plus|pro\b|tier|billing/i;
