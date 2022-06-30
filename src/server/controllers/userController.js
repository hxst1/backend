const debug = require("debug")("portfolio: userController");
const chalk = require("chalk");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../database/models/user");

const userLogin = async (req, res, next) => {
  const { username, password } = req.body;
  const findUser = await User.findOne({ username });

  if (!findUser) {
    const error = new Error("User not found");
    error.code = 401;
    return next(error);
  }

  const rightPassword = await bcrypt.compare(password, findUser.password);

  if (!rightPassword) {
    const error = new Error("Invalid password");
    error.code = 401;
    return next(error);
  }

  const UserData = {
    name: findUser.name,
    id: findUser.id,
  };

  const token = jwt.sign(UserData, process.env.JWT_SECRET);
  return res.json({ token });
};

const userRegister = async (req, res, next) => {
  const { username, password, name } = req.body;
  try {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      const error = new Error(`Username ${username} already exists!`);
      error.code = 400;
      next(error);
      return;
    }

    const encryptedPassword = await bcrypt.hash(password, +process.env.SALT);
    const newUser = await User.create({
      username,
      password: encryptedPassword,
      name,
    });

    debug(chalk.cyanBright(`User created with username: ${newUser.username}`));
    res
      .status(201)
      .json({ message: `User registered with username: ${newUser.username}` });
  } catch (error) {
    error.Code = 400;
    error.message = "Wrong user data";
    next(error);
  }
};

module.exports = {
  userLogin,
  userRegister,
};
