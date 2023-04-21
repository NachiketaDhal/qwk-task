import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { extendType, nonNull, stringArg, objectType } from "nexus";
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
  },
});
