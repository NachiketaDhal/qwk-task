import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { extendType, nonNull, stringArg, objectType } from "nexus";
import { Context } from "src/type/type";
import { PrismaClient } from "@prisma/client";
import { NexusGenRootTypes } from "../../nexus-typegen";
import logger from "../logger";

const prisma = new PrismaClient();

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
      async resolve(
        _parent,
        args,
        _context,
        _info
      ): Promise<NexusGenRootTypes["AuthType"]> {
        const { firstname, email, gender, city, password } = args;

        const hashedPassword = await argon2.hash(password);

        let user = {} as NexusGenRootTypes["User"],
          token;

        try {
          user = await prisma.user.create({
            data: {
              firstname,
              email,
              gender,
              password: hashedPassword,
              city,
            },
          });
          token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as jwt.Secret
          );
        } catch (error) {
          console.log(error);
        }

        return {
          token: token || "",
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
        let user = {} as NexusGenRootTypes["User"] | null,
          token: string = "";

        try {
          user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            throw new Error("No user found!");
          }

          const isValid = await argon2.verify(user.password, password);

          if (!isValid) throw new Error("Invalid credentials!");

          token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as jwt.Secret
          );

          logger.info(
            JSON.stringify({
              user,
              token,
            })
          );

          await prisma.user.update({
            where: { id: user.id },
            data: { token },
          });
        } catch (error) {
          console.log(error);
          logger.error(error.message);
          throw new Error(error);
        }

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
      async resolve(
        _parent,
        args,
        context: Context,
        _info
      ): Promise<NexusGenRootTypes["User"]> {
        const { email, firstname, gender, city } = args;
        const { userId } = context;

        if (!userId) throw new Error("Please login to proceed!");

        if (!email && !firstname && !gender && !city)
          throw new Error("Invalid request, please check the inputs!");

        const data = {} as NexusGenRootTypes["User"];

        if (email) data.email = email;
        if (firstname) data.firstname = firstname;
        if (gender) data.gender = gender;
        if (city) data.city = city;

        try {
          await prisma.user.update({ where: { id: userId }, data });
        } catch (error) {
          console.log(error);
        }

        return prisma.user.findUnique({ where: { id: userId } });
      },
    });
  },
});
