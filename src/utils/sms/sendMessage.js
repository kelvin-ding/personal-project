const twilio = require("twilio");

const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

const sendMessage = async (phone, message) => {
  const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

  try {
    await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phone,
    });

    console.log(`Message successfully sent to ${phone}`);
  } catch (error) {
    console.log(`Error sending message to ${phone}: `, error);
    throw error;
  }
};

module.exports = sendMessage;
