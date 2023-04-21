import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { extendType, nonNull, stringArg, objectType } from "nexus";
import { Context } from "src/type/type";
import { User } from "../entities/User";

export const AuthType = objectType({
  name: "AuthType",
  definition(t) {
    t.nonNull.string("token"),
      t.nonNull.field("user", {
        type: "User",
      });
  },
});

export const AuthMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("register", {
      type: "AuthType",
      args: {
        firstname: nonNull(stringArg()),
        email: nonNull(stringArg()),
        gender: nonNull(stringArg()),
        city: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_parent, args, _context, _info) {
        const { firstname, email, gender, city, password } = args;

        const hashedPassword = await argon2.hash(password);

        let user, token;

        try {
          user = await User.create({
            firstname,
            email,
            gender,
            password: hashedPassword,
            city,
          }).save();
          token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as jwt.Secret
          );
        } catch (error) {
          console.log(error);
        }

        return {
          token,
          user,
        };
      },
    });
    t.nonNull.field("login", {
      type: "AuthType",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_parent, args, _context, _info) {
        const { email, password } = args;

        const user = await User.findOne({ where: { email } });

        if (!user) {
          throw new Error("No user found!");
        }

        const isValid = await argon2.verify(user.password, password);

        if (!isValid) throw new Error("Invalid credentials!");

        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET as jwt.Secret
        );

        return {
          user,
          token,
        };
      },
    });

    t.nonNull.field("updateUser", {
      type: "User",
      args: {
        email: nonNull(stringArg()),
        firstname: nonNull(stringArg()),
        gender: nonNull(stringArg()),
        city: nonNull(stringArg()),
      },
      async resolve(_parent, args, context: Context, _info) {
        const { email, firstname, gender, city } = args;
        const { userId } = context;

        if (!userId) throw new Error("Please login to proceed!");

        if (!email && !firstname && !gender && !city)
          throw new Error("Invalid request, please check the inputs!");

        /**
         * 
        const { conn } = context;
        let query = "UPDATE \"user\" SET ";

        if (email) query += `email = '${email}'`;
        if (firstname) query += `, firstname = '${firstname}'`;
        if (gender) query += `, gender = '${gender}'`;
        if (city) query += `, city = '${city}'`;

        query += ` WHERE id = ${userId}`;

        conn.query(query);
         */


        try {
          const userToUpdate = await User.findOne({ where: { id: userId } });
  
          if (email && userToUpdate?.email) userToUpdate.email = email;
          if (email && userToUpdate?.firstname) userToUpdate.firstname = firstname;
          if (email && userToUpdate?.gender) userToUpdate.gender = gender;
          if (email && userToUpdate?.city) userToUpdate.city = city;
  
          await userToUpdate?.save();
        } catch (error) {
          console.log(error);
        }

        return User.findOne({ where: { id: userId } });
      },
    });
  },
});
