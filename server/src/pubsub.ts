import { PubSub } from "graphql-subscriptions";
import Redis from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";
import config, { isDevelopment } from "config";
import { z } from "zod";

const recordSchema = z.record(z.string(), z.unknown());

// Implementation mostly developed by Claude Sonnet 4.5 LLM.
const convertDatesToObjects = (data: unknown): unknown => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => convertDatesToObjects(item));
  }

  const recordResult = recordSchema.safeParse(data);
  if (recordResult.success) {
    const converted: Record<string, unknown> = {};

    for (const key in recordResult.data) {
      if (Object.prototype.hasOwnProperty.call(recordResult.data, key)) {
        const value = recordResult.data[key];

        if (key === "createdAt" || key === "updatedAt") {
          const dateResult = z.string().safeParse(value);
          if (dateResult.success) {
            converted[key] = new Date(dateResult.data);
          } else {
            converted[key] = value;
          }
        } else if (
          Array.isArray(value) ||
          recordSchema.safeParse(value).success
        ) {
          converted[key] = convertDatesToObjects(value);
        } else {
          converted[key] = value;
        }
      }
    }
    return converted;
  }

  return data;
};

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
    deserializer: (value) => {
      const valueToString =
        typeof value === "string" ? value : value.toString();
      return convertDatesToObjects(JSON.parse(valueToString));
    },
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
