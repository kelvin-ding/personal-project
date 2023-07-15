const bcrypt = require("bcryptjs");
const { User, IP_Address } = require("../../models/v1");

exports.createUser = async (req, res) => {
  const { first_name, last_name, birthdate, phone_number, email, password } =
    req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({
        status: "error",
        data: { msg: "User already exists" },
      });
    }

    user = await User.create({
      first_name,
      last_name,
      birthdate,
      phone_number,
      email,
      password: bcrypt.hashSync(password, 10), // hash the password
      role: "reader", // default role
    });

    const clientIp = requestIp.getClientIp(req);
    await IP_Address.create({
      user_id: user.id,
      ip_address: clientIp,
    });

    return user;
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      data: { msg: "Server error" },
    });
  }
};
