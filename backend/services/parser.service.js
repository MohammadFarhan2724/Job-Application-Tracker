// Domains that are platforms/ATS providers, not the actual hiring company —
// for these, we must extract the company name from the email BODY instead of the sender.
const PLATFORM_DOMAINS = ['linkedin.com', 'eightfold.ai', 'myworkdayjobs.com', 'greenhouse.io', 'lever.co', 'indeed.com'];

// --- Status detection (checked in priority order — most specific first) ---
const STATUS_RULES = [
    { status: 'Interview Scheduled', patterns: [/interview.{0,40}(is all set|has been confirmed|is confirmed)/i, /we can confirm.{0,40}interview/i] },
    { status: 'Interview - Action Required', patterns: [/next stage/i, /pick (three|a) slot/i, /select.{0,20}(slot|time)/i] },
    { status: 'Online Assessment', patterns: [/online assessment/i, /skills? assessment/i, /begin your assessment/i] },
    { status: 'Rejected', patterns: [/unfortunately/i, /not moving forward/i, /decided not to proceed/i, /haven.?t met the requirements/i] },
    { status: 'Offer', patterns: [/pleased to offer/i, /offer of employment/i, /job offer/i] },
    {
        status: 'Applied',
        patterns: [
            /thanks? for applying/i,
            /thank you for (applying|taking the time to submit)/i,
            /application (has been )?received/i,
            /your application was sent to/i,
        ]
    },
];

const detectStatus = (text) => {
    for (const rule of STATUS_RULES) {
        if (rule.patterns.some((p) => p.test(text))) return rule.status;
    }
    return null; // not a job-related email — caller should skip it
};

// --- Role extraction ---
const ROLE_PATTERNS = [
    /role of ([A-Za-z0-9\/&,\-\s]+?)[!.,\n(]/i,                    // Accenture-style
    /position of ([A-Za-z0-9\/&,\-\s]+?)[,.\n(]/i,                 // Microsoft rejection-style
    /application for ([A-Za-z0-9\/&,\-\s]+?)\s*\(Job number/i,     // Microsoft applied-style
    /application for ([A-Za-z0-9\/&,\-\s]+?)[,.\n(]/i,             // generic fallback
];

const extractRole = (text) => {
    for (const pattern of ROLE_PATTERNS) {
        const match = text.match(pattern);
        if (match) return match[1].trim();
    }
    return null;
};

// --- Company extraction: sender domain first, body-parsing fallback for platforms ---
const extractCompanyFromSender = (fromHeader) => {
    const emailMatch = fromHeader.match(/<(.+)>/);
    const email = emailMatch ? emailMatch[1] : fromHeader;
    const domain = email.split('@')[1];
    if (!domain) return null;

    if (PLATFORM_DOMAINS.some((platform) => domain.includes(platform))) return null;

    let name = domain.split('.')[0];
    if (['mail', 'no-reply', 'noreply', 'notifications', 'careers', 'jobs'].includes(name.toLowerCase())) {
        name = domain.split('.')[1] || name;
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
};

const extractLinkedInDetails = (text) => {
    const companyMatch = text.match(/application was sent to ([^\n]+)/i);
    const company = companyMatch ? companyMatch[1].trim() : null;

    let role = null;
    if (company) {
        const escaped = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const roleMatch = text.match(new RegExp(`\\n\\s*([^\\n]{3,80})\\n\\s*${escaped}\\s*[·\\-]`, 'i'));
        role = roleMatch ? roleMatch[1].trim() : null;
    }
    return { company, role };
};

// --- Gmail message decoding ---
const getHeader = (headers, name) => headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

const decodeBase64Url = (data) => {
    if (!data) return '';
    return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
};

const stripHtml = (html) =>
    html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const findPart = (parts, mimeType) => {
    for (const part of parts || []) {
        if (part.mimeType === mimeType && part.body?.data) return part.body.data;
        if (part.parts) {
            const nested = findPart(part.parts, mimeType);
            if (nested) return nested;
        }
    }
    return null;
};

const getBody = (payload) => {
    if (payload.mimeType === 'text/plain' && payload.body?.data) return decodeBase64Url(payload.body.data);
    const plain = findPart(payload.parts, 'text/plain');
    if (plain) return decodeBase64Url(plain);
    const html = findPart(payload.parts, 'text/html') || payload.body?.data;
    return html ? stripHtml(decodeBase64Url(html)) : '';
};

// --- Main entry point ---
const parseEmail = (gmailMessage) => {
    const headers = gmailMessage.payload.headers;
    const subject = getHeader(headers, 'Subject');
    const from = getHeader(headers, 'From');
    const body = getBody(gmailMessage.payload);
    const fullText = `${subject}\n${body}`;

    const status = detectStatus(fullText);
    if (!status) return null;

    let company = extractCompanyFromSender(from);
    let role = extractRole(fullText);

    if (!company && from.toLowerCase().includes('linkedin.com')) {
        const linkedin = extractLinkedInDetails(fullText);
        company = linkedin.company;
        role = role || linkedin.role;
    }

    return { company, role, status, subject };
};

module.exports = { parseEmail };