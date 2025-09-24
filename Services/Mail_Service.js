const nodemailer=require('nodemailer');

class MailService{
    constructor(user,pass)
    {
         this.transporter=nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:user,
                pass:pass
            }
        })
        this.user=user;
    }
     sendVerificationEmail=async(OTP,to) => {
        const mailoptions={
            from:this.user,
            to:to,
            subject:"Email Verifivation",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="text-align: center; color: #333;">Verify Your Email</h2>
                <p style="font-size: 16px; color: #555;">Hello,</p>
                <p style="font-size: 16px; color: #555;">Your <b>6-digit OTP</b> is:</p>
                <h1 style="text-align: center; color: #007bff; letter-spacing: 5px;">${OTP}</h1>
                <p style="font-size: 14px; color: #888;">⚠️ This OTP will expire in 5 minutes. Do not share it with anyone.</p>
                <p style="font-size: 14px; text-align: center; color: #555;">Thank you,<br>Helwan universty Team</p>
            </div>
        `
        };
        
        this.transporter.sendMail(mailoptions,(err,info) => {
            if(err){
                return console.log(err);
            }
            console.log('Email sent: ' + info.response);
        });
    }
    sendCustomizeEmail=async(to,subject,body) => {
        const mailoptions={
            from:this.user,
            to:to,
            subject:subject,
            text:body
        };
        this.transporter.sendMail(mailoptions,(err,info) => {
            if(err){
                return console.log(err);
            }
            console.log('Email sent: ' + info.response);
        });
    }
}


module.exports=MailService