import { Static, Type } from "@sinclair/typebox";
import { FastifyPluginCallback } from "fastify";
import { InvalidIdError, ResourceNotFoundError } from "../errors";
import Parcel from "../models/parcel";
import { ChangeTypeOfKeys } from "../utils/types";
import qrcode from "qrcode";
import PDFDocument from "pdfkit";
import path from "path";
import internal, { Readable, Stream, Writable } from "stream";

const ParcelRequest = Type.Object({
    name: Type.String(),
    street: Type.String(),
    streetNumber: Type.Number(),
    postCode: Type.Number(),
    region: Type.String(),
    country: Type.String(),
    handedOut: Type.Boolean(),
});
const ParcelPartialRequest = Type.Object({
    name: Type.Optional(Type.String()),
    street: Type.Optional(Type.String()),
    streetNumber: Type.Optional(Type.Number()),
    postCode: Type.Optional(Type.Number()),
    region: Type.Optional(Type.String()),
    country: Type.Optional(Type.String()),
    handedOut: Type.Optional(Type.Boolean()),
});
type ParcelRequest = Static<typeof ParcelRequest>;
type ParcelPartialRequest = Static<typeof ParcelPartialRequest>;

const parcel: FastifyPluginCallback = (fastify, options, done) => {
    // Get label
    fastify.get<{ Params: { id: string } }>("/:id/label", async (req, res) => {
        const id = fastify.hashids.decode(req.params.id)[0] as number;
        if (id == undefined) throw new InvalidIdError("parcel");
        const parcel: ChangeTypeOfKeys<Parcel, "id", number | string> | null = await Parcel.findOneBy({ id: id });
        if (!parcel) throw new ResourceNotFoundError("Parcel");
        parcel.id = fastify.hashids.encode(parcel.id as number);

        const qrCode = await qrcode.toBuffer(parcel.id);

        const label = new PDFDocument({
            size: [130, 65],
            margin: 0,
            info: { Title: `Parcel Label for ${parcel.name} (${parcel.id})`, Producer: "Parcel Manager" },
        });

        // shop name
        const fontsDir = path.join(path.dirname(__dirname), "font");
        label.font(path.join(fontsDir, "700.ttf"));
        label.fontSize(7);
        label.text("Parcel delivery", 15, 15, { width: 80 });

        // parcel information
        label.font(path.join(fontsDir, "400.ttf"));
        label.fontSize(6);
        label.text(`Date: ${new Date(parcel.arrivedAt).toISOString().split("T")[0]}\nParcel ID: ${parcel.id}`, 15, 35);

        // qr code
        label.image(qrCode, 80, 10, { width: 40, height: 40 });

        // qr code sub-text
        label.fontSize(5);
        label.text(parcel.id, 80, 46, { width: 40, align: "center" });

        // Outline for cutting
        label.lineWidth(1);
        label.rect(10, 10, 110, 45);
        label.dash(1, { space: 1 });
        label.stroke();

        label.end();

        const buffer: any[] | Uint8Array[] = [];
        label.on("data", (data) => buffer.push(data));

        await new Promise<void>((resolve) => {
            label.on("end", resolve);
        });
        res.header("Content-Type", "application/pdf");
        res.send(Buffer.concat(buffer));
    });

    // Get parcel information
    fastify.get<{ Params: { id: string } }>("/:id", async (req) => {
        const id = fastify.hashids.decode(req.params.id)[0] as number;
        if (id == undefined) throw new InvalidIdError("parcel");
        const parcel: ChangeTypeOfKeys<Parcel, "id", number | string> | null = await Parcel.findOneBy({ id: id });
        if (!parcel) throw new ResourceNotFoundError("Parcel");
        parcel.id = fastify.hashids.encode(parcel.id as number);
        return parcel;
    });

    // Update parcel
    fastify.patch<{ Params: { id: string }; Body: ParcelPartialRequest }>("/:id", { schema: { body: ParcelPartialRequest } }, async (req, res) => {
        const id = fastify.hashids.decode(req.params.id)[0] as number;
        if (id == undefined) throw new InvalidIdError("parcel");
        const parcel = await Parcel.findOneBy({ id: id });
        if (!parcel) throw new ResourceNotFoundError("Parcel");
        if (req.body.name) parcel.name = req.body.name;
        if (req.body.street) parcel.street = req.body.street;
        if (req.body.streetNumber != undefined) parcel.streetNumber = req.body.streetNumber;
        if (req.body.postCode != undefined) parcel.postCode = req.body.postCode;
        if (req.body.region) parcel.region = req.body.region;
        if (req.body.country) parcel.country = req.body.country;
        if (req.body.handedOut != undefined) parcel.handedOut = req.body.handedOut;
        await parcel.save();
        return res.status(204).send();
    });

    // Delete parcel
    fastify.delete<{ Params: { id: string } }>("/:id", async (req, res) => {
        const id = fastify.hashids.decode(req.params.id)[0] as number;
        if (id == undefined) throw new InvalidIdError("parcel");
        const parcel = await Parcel.findOneBy({ id: id });
        if (!parcel) throw new ResourceNotFoundError("Parcel");
        await parcel.remove();
        return res.status(204).send();
    });

    // Create parcel
    fastify.put<{ Body: ParcelRequest }>("/", { schema: { body: ParcelRequest } }, async (req, res) => {
        const parcel = Parcel.create();
        parcel.arrivedAt = new Date();
        parcel.name = req.body.name;
        parcel.street = req.body.street;
        parcel.streetNumber = req.body.streetNumber;
        parcel.postCode = req.body.postCode;
        parcel.region = req.body.region;
        parcel.country = req.body.country;
        parcel.handedOut = req.body.handedOut;
        await parcel.save();
        return res.status(201).send();
    });

    // Get parcels
    fastify.get("/", async (req) => {
        const parcels: ChangeTypeOfKeys<Partial<Parcel>, "id", string | number>[] = [];
        for (const parcel of await Parcel.find({ order: { arrivedAt: "DESC" } })) {
            parcels.push({
                ...parcel,
                id: fastify.hashids.encode(parcel.id),
            });
        }
        return parcels;
    });

    done();
};

export default parcel;
