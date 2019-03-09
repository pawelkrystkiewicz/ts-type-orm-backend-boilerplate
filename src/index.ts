import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import 'dotenv';
import express from 'express';
import session from 'express-session';
import QueryComplexity, { fieldConfigEstimator, simpleEstimator } from 'graphql-query-complexity';
import Redis from 'ioredis';
import 'reflect-metadata';
import { formatArgumentValidationError } from 'type-graphql';
import { createConnection } from 'typeorm';
import { testConn } from './testUtils/testConn';
import { createSchema } from './utils/createSchema';

export const redis = new Redis();

export const main = async () => {
  if (process.env.NODE_ENV === 'test') {
    await testConn(true);
  } else {
    await createConnection();
  }
  const schema = await createSchema();
  const apolloServer = new ApolloServer({
    schema,
    formatError: formatArgumentValidationError as any,
    context: ({ req, res }) => ({ req, res, redis }),
    debug: false,
    validationRules: [
      QueryComplexity({
        maximumComplexity: 50,
        variables: {},
        estimators: [
          fieldConfigEstimator(),
          simpleEstimator({
            defaultComplexity: 1,
          }),
        ],
      }),
    ] as any,
  });

  const app = express();

  const RedisStore = connectRedis(session);

  app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
      }),
      name: 'rid',
      secret: '41faf412fasfr32',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 3600 * 24 * 365,
      },
    })
  );

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(`Server is ready on http://localhost:4000/graphql`);
  });
};

main();
