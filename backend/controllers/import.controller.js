const User = require('../models/user');
const Application = require('../models/application');
const { getGmailMessages, oauth2Client } = require('../services/google.service');
const { parseEmail } = require('../services/parser.service');
const { checkDuplicate } = require('./application.controller');

// Maps our parser's detailed statuses to your schema's enum values.
// Multiple parser statuses can collapse into the same schema status.
const STATUS_MAP = {
    'Applied': 'Applied',
    'Online Assessment': 'In Progress',
    'Interview - Action Required': 'Interviewing',
    'Interview Scheduled': 'Interviewing',
    'Offer': 'Offer',
    'Rejected': 'Rejected',
};

// Defines "progress order" so a later, earlier-stage email never downgrades
// an application that's already moved further (e.g. an old "Applied" email
// processed after "Interview Scheduled" won't reset it back).
const STATUS_ORDER = ['Saved', 'Applied', 'In Progress', 'Interviewing', 'Offer', 'Accepted', 'Rejected'];

// Narrowed search query — uses exact quoted phrases instead of loose single-word
// OR matching, so we stop pulling in unrelated newsletters/spam that happen to
// contain words like "offer" or "application" somewhere in the body.
const GMAIL_SEARCH_QUERY = 'newer_than:90d ("thank you for applying" OR "your application" OR "next stage" OR "skills interview" OR "online assessment" OR "we can confirm" OR "unfortunately") -unsubscribe';

const importGmailApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.gmailConnected) {
            return res.status(400).json({ message: 'Gmail not connected' });
        }

        // Ensure the access token is fresh before making Gmail calls
        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        let messages;
        try {
            messages = await getGmailMessages(user, GMAIL_SEARCH_QUERY);
        } catch (err) {
            // Access token likely expired — refresh using the stored refresh token, then retry once
            const { credentials } = await oauth2Client.refreshAccessToken();
            user.googleAccessToken = credentials.access_token;
            await user.save();
            messages = await getGmailMessages(user, GMAIL_SEARCH_QUERY);
        }

        let created = 0, updated = 0, skipped = 0;

        for (const message of messages) {
            const parsed = parseEmail(message);

            // TEMP DEBUG — remove after diagnosing
            const subject = message.payload.headers.find(h => h.name === 'Subject')?.value;
            const from = message.payload.headers.find(h => h.name === 'From')?.value;
            console.log('---');
            console.log('Subject:', subject);
            console.log('From:', from);
            console.log('Parsed result:', parsed);

            if (!parsed || !parsed.company || !parsed.role) {
                skipped++;
                continue;
            }

            const mappedStatus = STATUS_MAP[parsed.status] || 'Saved';
            const dateHeader = message.payload.headers.find(h => h.name === 'Date')?.value;
            const emailDate = dateHeader ? new Date(dateHeader) : new Date();

            const existing = await checkDuplicate(userId, parsed.company, parsed.role);

            if (!existing) {
                await Application.create({
                    userId,
                    companyName: parsed.company,
                    jobRole: parsed.role,
                    appliedAt: emailDate,
                    jobStatus: mappedStatus,
                });
                created++;
            } else {
                const currentRank = STATUS_ORDER.indexOf(existing.jobStatus);
                const newRank = STATUS_ORDER.indexOf(mappedStatus);
                if (newRank > currentRank) {
                    existing.jobStatus = mappedStatus;
                    await existing.save();
                    updated++;
                } else {
                    skipped++;
                }
            }
        }

        res.status(200).json({ message: 'Import complete', created, updated, skipped });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { importGmailApplications };