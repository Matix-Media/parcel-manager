import axios from "axios";
import { Parcel } from "../types/parcel";

const baseURL = (import.meta.env.DEV ? "http://localhost:8080" : "") + "/api/v1";
const client = axios.create({ baseURL });

export default {
    async getParcels(): Promise<Parcel[]> {
        return (await client.get("/parcel")).data;
    },

    async createParcel(name: string, street: string, streetNumber: number, postCode: number, region: string, country: string, handedOut: boolean) {
        await client.put("/parcel", { name, street, streetNumber, postCode, region, country, handedOut });
    },

    async updateParcel(id: string, parcel: Partial<Omit<Parcel, "id">>) {
        await client.patch("/parcel/" + id, parcel);
    },

    async removeParcel(id: string) {
        await client.delete("/parcel/" + id);
    },

    async getParcel(id: string): Promise<Parcel> {
        return (await client.get("/parcel/" + id)).data;
    },

    getParcelLabel(id: string) {
        return baseURL + `/parcel/${id}/label`;
    },
};
