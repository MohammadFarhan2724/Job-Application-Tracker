const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const getAuthUrl = (state) => {
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: state
    });

    return url;
};

const getTokensFromCode = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

const getGmailMessages = async (user, query) => {
    oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50   // was 20 — widened so we don't miss real applications buried past the first 20 results
    });

    const messages = listResponse.data.messages || [];

    const fullMessages = await Promise.all(
        messages.map(async (msg) => {
            const fullMsg = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full'
            });
            return fullMsg.data;
        })
    );

    return fullMessages;
};

module.exports = {
    oauth2Client,
    getAuthUrl,
    getTokensFromCode,
    getGmailMessages
};