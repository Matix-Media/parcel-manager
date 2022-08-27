import createError from "@fastify/error";

export const InvalidIdError = createError("INVALID_ID", "Invalid %s id", 400);
export const ResourceNotFoundError = createError("RESOURCE_NOT_FOUND", "%s was not found", 404);
