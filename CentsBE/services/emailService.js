const axios = require('axios');

class EmailService {
    constructor(
        fromMail,
        toMail,
        body,
        name,
        subject,
        attachmentPath = null,
        attachmentData = null,
    ) {
        this.fromMail = fromMail;
        this.toMail = toMail;
        this.subject = subject;
        this.body = body;
        this.name = name;
        this.attachmentPath = attachmentPath;
        this.attachmentData = attachmentData;
    }

    from() {
        return {
            email: this.fromMail,
            name: this.name,
        };
    }

    personalizations() {
        return [
            {
                to: [
                    {
                        email: this.toMail,
                        name: this.toMail,
                    },
                ],
                subject: this.subject,
            },
        ];
    }

    attachments() {
        if (this.attachmentPath && this.attachmentData) {
            return [
                {
                    content: this.attachmentData,
                    filename: this.attachmentPath,
                    disposition: 'attachment',
                },
            ];
        }
        return null;
    }

    mailObj() {
        return {
            personalizations: this.personalizations(),
            content: [
                {
                    type: 'text/html',
                    value: this.body,
                },
            ],
            from: this.from(),
            attachments: this.attachments(),
        };
    }

    async email() {
        try {
            await axios
                .create({
                    baseURL: 'https://api.sendgrid.com/v3',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.SEND_GRID_KEY}`,
                    },
                    maxBodyLength: Infinity,
                })
                .post('/mail/send', this.mailObj());
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = EmailService;
