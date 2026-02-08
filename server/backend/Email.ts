import { createTransport } from 'nodemailer'

export enum EmailType {
    Metrics = 0,
    Housekeeping = 1,
    NewUser = 2,
    Purchase = 3,
    UserFeedback = 4,
    SketchUpdate = 5,
    HealthCheck = 6
}

export class Email {

    static async send(message: string, type: EmailType): Promise<boolean> {
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: 'jeancedric.jollant@gmail.com',
                pass: 'xzluolxqgtqlzzlh'
            }
        });

        let identity = '?'
        let subject = '?'
        // choose email subject and sender identity 
        switch (type) {
            case EmailType.Metrics:
                // Waylon Smithers is looking after metrics
                subject = 'Metrics';
                identity = 'Waylon';
                break;
            case EmailType.Housekeeping:
                // Groundskeeper Willie keeps the place clean
                subject = 'Housekeeping';
                identity = 'Willie';
                break;
            case EmailType.NewUser:
                // Ned Flanders reports on neighbors activity
                subject = 'New User Signup';
                identity = 'Ned';
                break;
            case EmailType.UserFeedback:
                // Ralph Wiggum reports on user feedback
                subject = 'User Feedback';
                identity = 'Ralph';
                break;
            case EmailType.Purchase:
                // Apu Nahasapeemapetilon watches the store
                subject = 'Thank you, come again!';
                identity = 'Apu';
                break;
            case EmailType.SketchUpdate:
                // Marge Simpson updates airport sketches
                subject = 'Airport Sketches';
                identity = 'Marge';
                break;
            case EmailType.HealthCheck:
                // Dr Hibbert checks system health
                subject = 'Health Check';
                identity = 'Dr. Hibbert';
                break;
        }

        const mailOptions = {
            from: `${identity} <jeancedric.jollant@gmail.com>`,
            to: 'jc@jollant.net',
            subject: subject,
            text: message
        };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (error: any, info: any) {
                if (error) {
                    console.log('[Email.send]', error);
                    resolve(false)
                } else {
                    console.log('[Email.send] Email sent:', info.response);
                    resolve(true)
                }
            });
        })

    }
}