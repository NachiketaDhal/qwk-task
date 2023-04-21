import { ApolloServer } from "apollo-server";
import { schema } from "./schema";
import { Context } from "./type/type";
import typeormConfig from "./typeorm.config";

(async () => {
  const conn = await typeormConfig.initialize();

  const server = new ApolloServer({
    schema,
    context: (): Context => ({ conn }),
  });

  server.listen(5000).then(({ url }) => {
    console.log(`Server running on ${url}`);
  });
})();
