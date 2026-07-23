// Domains that are platforms/ATS providers, not the actual hiring company —
// for these, extract the company name from the email BODY instead of the sender.
const PLATFORM_DOMAINS = [
    'linkedin.com',
    'eightfold.ai',
    'myworkdayjobs.com',
    'myworkday.com',
    'workday.com',
    'greenhouse.io',
    'lever.co',
    'indeed.com',
    'smartrecruiters.com',
    'icims.com',
];

// Generic subdomain/local-part fragments that are NOT real company names —
// e.g. "us.somecompany.com" should extract "somecompany", not "us".
const GENERIC_DOMAIN_LABELS = [
    'mail', 'no-reply', 'noreply', 'notifications', 'careers', 'jobs',
    'recruiting', 'talent', 'hr', 'us', 'in', 'eu', 'apac', 'na', 'uk',
    'email', 'notification', 'info', 'support', 'update', 'updates',
];

// --- Status detection (checked in priority order — most specific first) ---
const STATUS_RULES = [
    { status: 'Interview Scheduled', patterns: [/interview.{0,40}(is all set|has been confirmed|is confirmed|has been successfully scheduled)/i, /we can confirm.{0,40}interview/i] },
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
    return null;
};

// --- Role extraction ---
// Stops at sentence-ending punctuation OR the first "linking verb" that signals
// we've left the job title (e.g. "Custom Software Engineer is all set" stops before "is").
const ROLE_STOP_WORDS = '(?:is|has|was|were|have|will|for|at|with|through|and|role|position)';
const ROLE_TERMINATOR = `(?=[!.,;\\n(]|\\s+${ROLE_STOP_WORDS}\\b)`;

const ROLE_PATTERNS = [
    new RegExp(`role of ([A-Za-z0-9/&,\\-\\s]{2,60}?)${ROLE_TERMINATOR}`, 'i'),
    new RegExp(`position of ([A-Za-z0-9/&,\\-\\s]{2,60}?)${ROLE_TERMINATOR}`, 'i'),
    new RegExp(`application for ([A-Za-z0-9/&,\\-\\s]{2,60}?)\\s*\\(Job number`, 'i'),
    new RegExp(`application for ([A-Za-z0-9/&,\\-\\s]{2,60}?)${ROLE_TERMINATOR}`, 'i'),
];

const extractRole = (text) => {
    for (const pattern of ROLE_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            const role = match[1].trim();
            if (role.length >= 3 && !/^(our|the|a|an)$/i.test(role)) return role;
        }
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

    // Walk domain labels left-to-right, skip generic ones
    // e.g. "us.notifications.accenture.com" -> skip "us", "notifications" -> use "accenture"
    const labels = domain.split('.');
    let name = null;
    for (const label of labels) {
        const clean = label.toLowerCase();
        if (!GENERIC_DOMAIN_LABELS.includes(clean) && clean.length > 2) {
            name = label;
            break;
        }
    }
    if (!name) return null;

    return name.charAt(0).toUpperCase() + name.slice(1);
};

// Generic fallback for ANY platform sender (not just LinkedIn) — looks for
// "<Company> Recruitment Team" / "Careers Team" / "Hiring Team" signatures.
const extractCompanyFromBody = (text) => {
    const match = text.match(/([A-Z][A-Za-z0-9&.\-\s]{1,40})\s+(Recruitment Team|Careers Team|Talent Acquisition|Hiring Team)/);
    return match ? match[1].trim() : null;
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

    const isPlatformSender = PLATFORM_DOMAINS.some((p) => from.toLowerCase().includes(p));

    if (!company && isPlatformSender) {
        if (from.toLowerCase().includes('linkedin.com')) {
            const linkedin = extractLinkedInDetails(fullText);
            company = linkedin.company;
            role = role || linkedin.role;
        } else {
            company = extractCompanyFromBody(fullText);
        }
    }

    if (!company || !role) return null; // don't create garbage rows — skip instead

    return { company, role, status, subject };
};

module.exports = { parseEmail };