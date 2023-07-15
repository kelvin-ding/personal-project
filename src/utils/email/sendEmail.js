const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const { SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_SERVER, FROM_EMAIL } =
  process.env;

const sendEmail = async (email, subject, payload, template) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: SMTP_SERVER,
      port: SMTP_PORT,
      secure: false,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD, // naturally, replace both with your real credentials or an application-specific password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const source = fs.readFileSync(
      path.join(__dirname, `/template/${template}.handlebars`),
      "utf8"
    );
    const compiledTemplate = handlebars.compile(source);
    const options = () => {
      return {
        from: FROM_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    // Send email
    return transporter.sendMail(options(), (error, info) => {
      if (error) {
        console.log(`Error sending email to ${email}: `, error);
        throw error;
      } else {
        console.log(
          `Email successfully sent to ${email}. Response: ${info.response}`
        );
        return res.status(200).json({
          success: true,
        });
      }
    });
  } catch (error) {
    console.log(`General email sending error: ${error}`);
    throw error;
  }
};

module.exports = sendEmail;
