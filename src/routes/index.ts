import { FastifyPluginCallback } from "fastify";
import parcel from "./parcel";

const apiV1: FastifyPluginCallback = (fastify, options, done) => {
    fastify.register(parcel, { prefix: "/parcel" });
    done();
};

const routes: FastifyPluginCallback = (fastify, options, done) => {
    fastify.options("*", (req, res) => {
        res.send();
    });
    fastify.register(apiV1, { prefix: "/api/v1/" });
    done();
};

export default routes;
