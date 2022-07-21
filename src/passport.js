import passport from "passport";
import path from 'path'
//const bCrypt = require('bcrypt')

import localStrategy from 'passport-local'
const LocalStrategy = localStrategy.Strategy


import {Container} from "./containers/usersContainer.js";
const usersContainer = new Container(
  path.join("../src")
);

/* function isValidPassword(user, password) {
  return bCrypt.compareSync(password, user.password);
} */
/* function createHash(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
} */

function validPassword(user, password) {
  let index = usersContainer.getByUser(user.username);
  console.log(index);
  if (usersContainer.getAll()[index].password === password) {
    console.log("paso");
    return user;
  } else {
    console.log("Invalid password");
    return false;
  }
}
/* LOGIN PASSPORT */

function getByUsername(username) {
  try {
    const users = usersContainer.getAll();
    const match = users.find((user) => user.username === username);
    return match ? match : null;
  } catch (error) {
    throw new Error(
      `Error al obtener el usuario con username:'${username}': ${error}`
    );
  }
}

passport.use(
  'login',
  new LocalStrategy((username, password, callback) => {
    try {
      const User = getByUsername(username);
      console.log("Usuario para loguear " + User);
      if (!User) {
        console.log("User Not Found with username " + username);
        return callback(null, false);
      }

      

      callback(null, validPassword(User, password));
    } catch (error) {
      console.error(`Error al loguear usuario: ${error}`);
      callback(error);
    }
  })
);

/* REGISTER PASSPORT */
passport.use(
  'signup',
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    async (req, username, password, callback) => {
      try {
        const User = getByUsername(username);
        if (User) {
          console.log("User already exists");
          return callback(null, false);
        }
        const { name, address, age, phone, avatar } = req.body;
        const newUser = {
          username,
          password: password /* createHash(password) */,
          name,
          address,
          age,
          phone,
          avatar,
          role: "user",
        };
        const newUserAdded = usersContainer.save(newUser);

        console.log(
          `${username} Registration succesful with ID ${newUserAdded.id}`
        );

        callback(null, newUserAdded);
      } catch (e) {
        console.log(`Error passport.js singup, ${e}`);
      }
    }
  )
);

passport.serializeUser((user, callback) => {
  callback(null, user);
});

passport.deserializeUser((id, callback) => {
  let user = usersContainer.getById(id);
  callback(null, user);
});

const passportAuthLogin = passport.authenticate('login');

const passportAuthRegister = passport.authenticate('signup');

export { passport, passportAuthLogin, passportAuthRegister };