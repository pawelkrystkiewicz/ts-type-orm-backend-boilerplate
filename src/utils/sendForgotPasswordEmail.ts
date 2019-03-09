import nodemailer from 'nodemailer';

export async function sendForgotPasswordEmail(email: string, url: string) {
  const account = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass, // generated ethereal password
    },
  });

  // setup email data with unicode symbols
  const mailOptions = {
    from: '"CoolSite 👻" <ivanakazver3d@gmail.com>',
    to: email,
    subject: 'Change your password ✔',
    text: `Change your password by following the link: ${url}`,
    html: `<div>
        <p>Change your password by following the link below</p>
        <p><a href="${url}">Change Password</a></p>
      </div>`,
  };
  // send mail with defined transport object
  const info = await transporter.sendMail(mailOptions);
  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
