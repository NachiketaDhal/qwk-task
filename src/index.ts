import { ApolloServer } from "apollo-server";
import { auth } from "./middleware/auth";
import { schema } from "./schema";
import { AuthTokenPayload, Context } from "./type/type";
import typeormConfig from "./typeorm.config";

(async () => {
  const conn = await typeormConfig.initialize();

  const server = new ApolloServer({
    schema,
    context: ({ req }): Context => {
      const token: AuthTokenPayload | null =
        req && req.headers?.authorization
          ? auth(req.headers?.authorization)
          : null;

      return {
        conn,
        userId: token?.userId,
      };
    },
  });

  server.listen(5000).then(({ url }) => {
    console.log(`Server running on ${url}`);
  });
})();
