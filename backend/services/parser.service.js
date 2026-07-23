// ============================================================
// SHARED: Status detection (used by both LinkedIn and company parsers)
// ============================================================
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
            /your application (was sent to|to)/i,
        ]
    },
];

const detectStatus = (text) => {
    for (const rule of STATUS_RULES) {
        if (rule.patterns.some((p) => p.test(text))) return rule.status;
    }
    return null;
};

// A cleaned-up role string must pass this sanity check, or we treat
// extraction as failed rather than saving garbage like "our Software Engineer".
const FILLER_LEAD_WORDS = /^(our|the|a|an|for|with|your|new|this)\s+/i;

const cleanRole = (raw) => {
    if (!raw) return null;
    let role = raw.trim().replace(/\s+/g, ' ');
    // strip a leading filler word if present, then re-check (handles "our Software Engineer")
    role = role.replace(FILLER_LEAD_WORDS, '').trim();
    if (role.length < 3 || role.length > 80) return null;
    if (FILLER_LEAD_WORDS.test(role)) return null; // still starts with filler after one strip -> reject
    // must contain at least one letter and look like a title, not a sentence fragment
    if (!/^[A-Za-z]/.test(role)) return null;
    return role;
};

// ============================================================
// PARSER 1: LinkedIn emails (Easy Apply confirmations)
// ============================================================
const parseLinkedInEmail = (subject, body) => {
    const fullText = `${subject}\n${body}`;

    const status = detectStatus(fullText);
    if (!status) return null;

    // Format A: "Your application to <Role> at <Company>" (current LinkedIn format)
    let match = fullText.match(/your application to (.+?) at ([^\n.!]+)/i);
    if (match) {
        const role = cleanRole(match[1]);
        const company = match[2].trim();
        if (role && company) return { company, role, status, subject };
    }

    // Format B (older layout): "application was sent to <Company>", role on the line above
    match = fullText.match(/application was sent to ([^\n]+)/i);
    if (match) {
        const company = match[1].trim();
        const escaped = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const roleMatch = fullText.match(new RegExp(`\\n\\s*([^\\n]{3,80})\\n\\s*${escaped}\\s*[·\\-]`, 'i'));
        const role = cleanRole(roleMatch ? roleMatch[1] : null);
        if (role && company) return { company, role, status, subject };
    }

    return null; // couldn't confidently extract both fields — skip rather than guess
};

// ============================================================
// PARSER 2: Company / ATS emails (Accenture-Workday, Microsoft, direct career portals, etc.)
// ============================================================

// Domains that are ATS/platform providers, not the actual hiring company.
// The company name must be pulled from the BODY text for these senders.
const ATS_PLATFORM_DOMAINS = [
    'myworkdayjobs.com', 'myworkday.com', 'workday.com',
    'greenhouse.io', 'greenhouse-mail.io',
    'lever.co', 'hire.lever.co',
    'eightfold.ai',
    'icims.com',
    'smartrecruiters.com',
    'jobvite.com',
    'taleo.net',
];

const GENERIC_DOMAIN_LABELS = [
    'mail', 'no-reply', 'noreply', 'notifications', 'notification', 'careers',
    'jobs', 'recruiting', 'talent', 'hr', 'us', 'in', 'eu', 'apac', 'na', 'uk',
    'email', 'info', 'support', 'update', 'updates', 'jobalerts',
];

const ROLE_STOP_WORDS = '(?:is|has|was|were|have|will|for|at|with|through|and|role|position)';
const ROLE_TERMINATOR = `(?=[!.,;\\n(]|\\s+${ROLE_STOP_WORDS}\\b)`;

const ROLE_PATTERNS = [
    new RegExp(`role of ([A-Za-z0-9/&,\\-\\s]{2,60}?)${ROLE_TERMINATOR}`, 'i'),
    new RegExp(`position of ([A-Za-z0-9/&,\\-\\s]{2,60}?)${ROLE_TERMINATOR}`, 'i'),
    new RegExp(`application for ([A-Za-z0-9/&,\\-\\s]{2,60}?)\\s*\\(Job number`, 'i'),
    new RegExp(`application for ([A-Za-z0-9/&,\\-\\s]{2,60}?)${ROLE_TERMINATOR}`, 'i'),
];

const extractRoleFromBody = (text) => {
    for (const pattern of ROLE_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            const role = cleanRole(match[1]);
            if (role) return role;
        }
    }
    return null;
};

const extractCompanyFromSenderDomain = (domain) => {
    const labels = domain.split('.');
    for (const label of labels) {
        const clean = label.toLowerCase();
        if (!GENERIC_DOMAIN_LABELS.includes(clean) && clean.length > 2) {
            return label.charAt(0).toUpperCase() + label.slice(1);
        }
    }
    return null;
};

const extractCompanyFromBody = (text) => {
    const match = text.match(/([A-Z][A-Za-z0-9&.\-\s]{1,40})\s+(Recruitment Team|Careers Team|Talent Acquisition|Hiring Team)/);
    return match ? match[1].trim() : null;
};

const parseCompanyEmail = (subject, body, from) => {
    const fullText = `${subject}\n${body}`;

    const status = detectStatus(fullText);
    if (!status) return null;

    const emailMatch = from.match(/<(.+)>/);
    const senderEmail = emailMatch ? emailMatch[1] : from;
    const domain = (senderEmail.split('@')[1] || '').toLowerCase();

    const isAtsPlatform = ATS_PLATFORM_DOMAINS.some((p) => domain.includes(p));

    const company = isAtsPlatform
        ? extractCompanyFromBody(fullText)
        : (extractCompanyFromSenderDomain(domain) || extractCompanyFromBody(fullText));

    const role = extractRoleFromBody(fullText);

    if (!company || !role) return null;
    return { company, role, status, subject };
};

// ============================================================
// Gmail message decoding (shared)
// ============================================================
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

// ============================================================
// Main entry point — routes to the correct parser based on sender
// ============================================================
const parseEmail = (gmailMessage) => {
    const headers = gmailMessage.payload.headers;
    const subject = getHeader(headers, 'Subject');
    const from = getHeader(headers, 'From');
    const body = getBody(gmailMessage.payload);

    if (from.toLowerCase().includes('linkedin.com')) {
        return parseLinkedInEmail(subject, body);
    }

    return parseCompanyEmail(subject, body, from);
};

module.exports = { parseEmail };