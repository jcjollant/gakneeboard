import { createTransport } from 'nodemailer'

export enum EmailType {
    Metrics = 0,
    Housekeeping = 1,
    Feedback = 2,
}

export class Email {

    static async send(message:string, type:EmailType):Promise<boolean> {
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: 'jeancedric.jollant@gmail.com',
                pass: 'xzluolxqgtqlzzlh'
            }
        });

        let identity = '?'
        let subject = '?'
        switch(type) {
            case EmailType.Metrics: 
                subject = 'Metrics'; 
                identity = 'Waylon';
                break;
            case EmailType.Housekeeping:
                subject = 'Housekeeping';
                identity = 'Willie';
                break;
            case EmailType.Feedback: 
                subject = 'Feedback'; 
                identity = 'Ned';
                break;
        }

        const mailOptions = {
            from: `${identity} <jeancedric.jollant@gmail.com>`,
            to: 'jc@jollant.net',
            subject: subject,
            text: message
        };
          
        return new Promise( (resolve, reject) => {
            transporter.sendMail(mailOptions, function(error:any, info:any){
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