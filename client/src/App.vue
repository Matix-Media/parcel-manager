<script setup lang="ts">
import { onMounted, ref } from "vue";
import api from "./libs/api";
import { Parcel } from "./types/parcel";
import Model from "./components/Model.vue";

const parcels = ref<Parcel[]>([]);
const isModalVisible = ref(false);
const isModalEditMode = ref(false);
const isModalLoading = ref(false);
const currentModalParcel = ref<Partial<Parcel>>({ name: "", street: "", streetNumber: 0, postCode: 0, region: "", country: "", handedOut: false });

onMounted(async () => {
    getParcels();
});

async function getParcels() {
    console.log("Getting parcels...");
    parcels.value = await api.getParcels();
}

function showLabel(parcel: Parcel) {
    window.open(api.getParcelLabel(parcel.id));
}

function resetCurrentModalParcel() {
    currentModalParcel.value = { name: "", street: "", streetNumber: 0, postCode: 0, region: "", country: "", handedOut: false };
}

function showAddParcel() {
    resetCurrentModalParcel();
    isModalEditMode.value = false;
    isModalVisible.value = true;
}

function showEditParcel(parcel: Parcel) {
    resetCurrentModalParcel();
    currentModalParcel.value = Object.assign({}, parcel);
    isModalEditMode.value = true;
    isModalVisible.value = true;
}

async function addParcel() {
    isModalLoading.value = true;
    try {
        await api.createParcel(
            currentModalParcel.value.name!,
            currentModalParcel.value.street!,
            currentModalParcel.value.streetNumber!,
            currentModalParcel.value.postCode!,
            currentModalParcel.value.region!,
            currentModalParcel.value.country!,
            currentModalParcel.value.handedOut!,
        );
    } catch (err) {
        console.error(err);
    } finally {
        isModalLoading.value = false;
        isModalVisible.value = false;
        getParcels();
    }
}

async function editParcel() {
    isModalLoading.value = true;
    try {
        await api.updateParcel(currentModalParcel.value.id!, currentModalParcel.value);
    } catch (err) {
        console.error(err);
    } finally {
        isModalLoading.value = false;
        isModalVisible.value = false;
        getParcels();
    }
}

async function removeParcel(parcel: Parcel) {
    try {
        await api.removeParcel(parcel.id);
    } catch (err) {
        console.error(err);
    } finally {
        getParcels();
    }
}
</script>

<template>
    <h1>
        Parcel Manager
        <button @click="showAddParcel">
            <svg xmlns="http://www.w3.org/2000/svg" height="30" width="30" viewBox="0 0 48 48">
                <path d="M22.5 38V25.5H10v-3h12.5V10h3v12.5H38v3H25.5V38Z" />
            </svg>
        </button>
        <button @click="getParcels">
            <svg xmlns="http://www.w3.org/2000/svg" height="30" width="30" viewBox="0 0 48 48">
                <path
                    d="M24 40q-6.65 0-11.325-4.675Q8 30.65 8 24q0-6.65 4.675-11.325Q17.35 8 24 8q4.25 0 7.45 1.725T37 14.45V8h3v12.7H27.3v-3h8.4q-1.9-3-4.85-4.85Q27.9 11 24 11q-5.45 0-9.225 3.775Q11 18.55 11 24q0 5.45 3.775 9.225Q18.55 37 24 37q4.15 0 7.6-2.375 3.45-2.375 4.8-6.275h3.1q-1.45 5.25-5.75 8.45Q29.45 40 24 40Z"
                />
            </svg>
        </button>
    </h1>
    <table>
        <tr>
            <th></th>
            <th>Address</th>
            <th>Arrived at</th>
            <th></th>
        </tr>
        <tr v-for="parcel in parcels" :id="parcel.id" :key="parcel.id">
            <td>
                <svg class="handed-out" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" v-if="parcel.handedOut">
                    <path d="M18.9 35.7 7.7 24.5l2.15-2.15 9.05 9.05 19.2-19.2 2.15 2.15Z" fill="currentColor" />
                </svg>
                <svg class="in-storage" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" v-else>
                    <path
                        d="m12.45 37.65-2.1-2.1L21.9 24 10.35 12.45l2.1-2.1L24 21.9l11.55-11.55 2.1 2.1L26.1 24l11.55 11.55-2.1 2.1L24 26.1Z"
                        fill="currentColor"
                    />
                </svg>
            </td>
            <td>
                <b>{{ parcel.name }}</b
                ><br />
                {{ parcel.street }} {{ parcel.streetNumber }}<br />
                {{ parcel.postCode }} {{ parcel.region }}<br />
                {{ parcel.country }}
            </td>
            <td>{{ new Date(parcel.arrivedAt).toLocaleDateString() }} {{ new Date(parcel.arrivedAt).toLocaleTimeString() }}</td>
            <td>
                <button @click="showEditParcel(parcel)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path
                            d="M9 39h2.2l22.15-22.15-2.2-2.2L9 36.8Zm30.7-24.3-6.4-6.4 2.1-2.1q.85-.85 2.1-.85t2.1.85l2.2 2.2q.85.85.85 2.1t-.85 2.1Zm-2.1 2.1L12.4 42H6v-6.4l25.2-25.2Zm-5.35-1.05-1.1-1.1 2.2 2.2Z"
                        />
                    </svg>
                </button>
                <button @click="showLabel(parcel)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path
                            d="M6 43.95V4.05l3 3 3-3 3 3 3-3 3 3 3-3 3 3 3-3 3 3 3-3 3 3 3-3v39.9l-3-3-3 3-3-3-3 3-3-3-3 3-3-3-3 3-3-3-3 3-3-3Zm5.85-10.75h24.5v-3h-24.5Zm0-7.7h24.5v-3h-24.5Zm0-7.75h24.5v-3h-24.5ZM9 38.9h30V9.1H9ZM9 9.1v29.8Z"
                        />
                    </svg>
                </button>
                <button @click="removeParcel(parcel)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path
                            d="M13.05 42q-1.25 0-2.125-.875T10.05 39V10.5H8v-3h9.4V6h13.2v1.5H40v3h-2.05V39q0 1.2-.9
                        2.1-.9.9-2.1.9Zm21.9-31.5h-21.9V39h21.9Zm-16.6 24.2h3V14.75h-3Zm8.3 0h3V14.75h-3Zm-13.6-24.2V39Z"
                            fill="orangered"
                        />
                    </svg>
                </button>
            </td>
        </tr>
    </table>
    <Model v-model:visible="isModalVisible" :closable="!isModalLoading">
        <div class="parcel">
            <h1><template v-if="isModalEditMode">Edit</template><template v-else>Add</template> parcel</h1>
            <form @submit.prevent="isModalEditMode ? editParcel() : addParcel()">
                <fieldset :disabled="isModalLoading">
                    <img v-if="isModalLoading" class="loading" src="./assets/spinner.svg" alt="Loading..." />
                    <label>
                        Name<br />
                        <input type="text" v-model="currentModalParcel.name" />
                    </label>
                    <label>
                        Street<br />
                        <input type="text" v-model="currentModalParcel.street" />
                    </label>
                    <label>
                        Street Number<br />
                        <input type="number" v-model="currentModalParcel.streetNumber" />
                    </label>
                    <label>
                        Post Code<br />
                        <input type="number" v-model="currentModalParcel.postCode" />
                    </label>
                    <label>
                        Region<br />
                        <input type="text" v-model="currentModalParcel.region" />
                    </label>
                    <label>
                        Country<br />
                        <input type="text" v-model="currentModalParcel.country" />
                    </label>
                    <label>
                        <input type="checkbox" v-model="currentModalParcel.handedOut" />
                        Handed out
                    </label>

                    <div class="buttons">
                        <button @click="isModalVisible = false">Cancel</button>
                        <button type="submit"><template v-if="isModalEditMode">Edit</template><template v-else>Add</template></button>
                    </div>
                </fieldset>
            </form>
        </div>
    </Model>
</template>

<style lang="scss" scoped>
@font-face {
    font-family: Inter;
    src: url(./assets/fonts/Inter.ttf);
}

* {
    font-family: "Inter", sans-serif;
}

button {
    cursor: pointer;
}

input,
button {
    font-size: 16px;
}

.parcel {
    fieldset {
        position: relative;
        display: flex;
        flex-direction: column;
    }

    .loading {
        position: absolute;
        top: 0;
        align-self: center;
        height: 200px;
        width: 200px;
    }

    label {
        margin-bottom: 5px;
        display: block;
    }

    .buttons {
        display: flex;
        justify-content: end;
        margin-top: 20px;
        button {
            margin-left: 5px;
        }
    }
}

table {
    border-collapse: collapse;
    th {
        text-align: left;
        padding-right: 20px;

        &:last-child {
            padding-right: 0;
        }
    }

    tr {
        &:nth-child(1) {
            background-color: rgba(0, 0, 0, 0.24);
        }

        &:nth-child(2n) {
            background-color: rgba(0, 0, 0, 0.048);
        }
    }

    td {
        padding-right: 20px;
        padding-top: 5px;
        padding-bottom: 5px;
        &:last-child {
            padding-right: 0;
        }

        &:nth-child(1) {
            text-align: right;
        }

        svg {
            height: 30px;
            width: 30px;

            &.handed-out {
                color: green;
            }

            &.in-storage {
                color: orangered;
            }
        }
    }
}
</style>
