const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

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

const SYSTEM_PROMPT = `You extract structured data from emails to help track job applications. You will be given an email's subject, sender, and body text.

Determine if this email is related to a job application the person submitted (application confirmation, online assessment invite, interview invite/scheduling, offer, or rejection). This includes emails from LinkedIn (Easy Apply confirmations), company career portals, ATS systems (Workday, Greenhouse, Lever, etc.), and direct recruiter emails.

Do NOT count as a job application email: job alerts/recommendations ("jobs you may be interested in"), newsletters, course/webinar promotions, freelance platform notifications, or generic marketing.

Respond with ONLY raw JSON, no markdown formatting, no code fences, no explanation. Use exactly this shape:

If it IS a job application email:
{"isJobApplication": true, "company": "<company name>", "role": "<job title>", "status": "<one of: Applied, Online Assessment, Interviewing, Offer, Rejected>"}

If it is NOT a job application email:
{"isJobApplication": false}

Rules:
- "company" must be the actual hiring company, never a platform/ATS name (LinkedIn, Workday, Greenhouse, etc. are never the company).
- "role" must be a clean job title only, no extra words like "our" or trailing sentence fragments.
- "status" must map any wording (e.g. "next stage", "please select a slot", "interview confirmed") to the closest of: Applied, Online Assessment, Interviewing, Offer, Rejected.
- If you cannot confidently determine both company and role, respond with {"isJobApplication": false}.`;

const callClaude = async (subject, from, body) => {
    const userMessage = `Subject: ${subject}\nFrom: ${from}\nBody:\n${body.slice(0, 6000)}`;

    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Claude API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const cleaned = text.replace(/```json|```/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.log('Failed to parse Claude response as JSON:', text);
        return { isJobApplication: false };
    }
};

// Main entry point — now async, since it calls the Claude API.
const parseEmail = async (gmailMessage) => {
    const headers = gmailMessage.payload.headers;
    const subject = getHeader(headers, 'Subject');
    const from = getHeader(headers, 'From');
    const body = getBody(gmailMessage.payload);

    const result = await callClaude(subject, from, body);

    if (!result.isJobApplication || !result.company || !result.role) return null;

    return {
        company: result.company,
        role: result.role,
        status: result.status,
        subject,
    };
};

module.exports = { parseEmail };