import { ApolloServer } from "apollo-server";
import { auth } from "./middleware/auth";
import { schema } from "./schema";
import { AuthTokenPayload, Context } from "./type/type";

(async () => {
  const server = new ApolloServer({
    schema,
    context: ({ req }): Context => {
      const token: AuthTokenPayload | null =
        req && req.headers?.authorization
          ? auth(req.headers?.authorization)
          : null;

      return {
        userId: token?.userId,
      };
    },
  });

  server.listen(5000).then(({ url }) => {
    console.log(`Server running on ${url}`);
  });
})();
