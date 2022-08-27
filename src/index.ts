import Fastify from "fastify";
import { env } from "process";
import { DataSource } from "typeorm";
import Parcel from "./models/parcel";
import dotenv from "dotenv";
import routes from "./routes";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Hashids from "hashids";
import fastifyStatic from "@fastify/static";
import path from "path";

dotenv.config();

const database = new DataSource({
    type: "mysql",
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT!),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    synchronize: env.DB_SYNC == "true",
    entities: [Parcel],
});
const server = Fastify();
server.withTypeProvider<TypeBoxTypeProvider>();
server.decorate("orm", database);
server.decorate("hashids", new Hashids(env.HASHIDS_SALT, 5));

declare module "fastify" {
    interface FastifyInstance {
        orm: DataSource;
        hashids: Hashids;
    }
}

// Disable cors
server.addHook("onRequest", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

// Route registration
server.register(routes);

// Static file registration
server.register(fastifyStatic, { root: path.join(path.dirname(__dirname), "client/dist") });

/**
 * This function starts all services
 */
async function boot() {
    // First connect database
    await database.initialize();
    await server.listen({ port: Number.parseInt(env.SERVER_PORT!) });
    console.log("Server started successfully");
}

boot();
