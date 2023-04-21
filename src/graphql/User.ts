import { objectType } from "nexus";

export const UserType = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id"),
      t.nonNull.string("firstname"),
      t.nonNull.string("email"),
      t.nonNull.string("gender"),
      t.nonNull.string("city"),
      t.nonNull.string("password");
  },
});
