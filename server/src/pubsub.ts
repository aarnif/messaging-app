import { PubSub } from "graphql-subscriptions";
import Redis from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";
import config, { isDevelopment } from "config";

const connectToRedisPubSub = () => {
  console.log("Connecting to Redis PubSub");
  const redisUri = config.REDIS_URI;
  const redisOptions = {
    retryStrategy: (times: number) => {
      return Math.min(times * 50, 2000);
    },
  };

  const publisher = new Redis(redisUri, redisOptions);
  const subscriber = new Redis(redisUri, redisOptions);

  publisher.on("connect", () => console.log("Redis publisher connected"));
  publisher.on("error", (error) =>
    console.error("Redis publisher error", error)
  );

  subscriber.on("connect", () => console.log("Redis subscriber connected"));
  subscriber.on("error", (error) =>
    console.error("Redis subscriber error", error)
  );

  return new RedisPubSub({
    publisher: publisher,
    subscriber: subscriber,
  });
};

const connectToGraphQLPubSub = () => {
  console.log("Connecting to GraphQL PubSub");
  return new PubSub();
};

const pubsub = isDevelopment
  ? connectToGraphQLPubSub()
  : connectToRedisPubSub();

export default pubsub;
