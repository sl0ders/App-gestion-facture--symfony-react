import Axios from "axios";
import Cache from "./Cache";
import {INVOICES_API} from "./config";

async function findAll() {
    // On va chercher les invoices present dans le cache
    const cachedInvoices = await Cache.get("invoices")

    // Si il y a des invoices dans le cache, alors on les retournes
    if (cachedInvoices) return cachedInvoices

    // Sinon on fait la requete a l'api, et on enregistre les invoices de l'api dans le cache pour la prochaine recuperation
    return Axios.get(INVOICES_API)
        .then(response => {
            const invoices = response.data["hydra:member"]
            Cache.set("invoices", invoices)
            return invoices
        })

}

function deleteInvoice(id) {
    return Axios.delete(INVOICES_API + "/" + id)
        .then(async response => {
            const cachedInvoices = await Cache.get("invoices")
            if (cachedInvoices) {
                Cache.set("invoices", cachedInvoices.filter(c => c.id !== id))
            }
            return response
        })
}

function newInvoices(invoice) {
    return Axios.post(INVOICES_API, invoice).then(async response => {
        const cachedInvoices = await Cache.get("invoices")
        if (cachedInvoices) {
            Cache.set("invoices", [...cachedInvoices, response.data])
        }
    })
}

async function find(id) {
    const cachedInvoice = await Cache.get("invoices." + id)
    if (cachedInvoice) return cachedInvoice

    return Axios
        .get(INVOICES_API + "/" + id)
        .then(response => {
            const invoice = response.data
            Cache.set("invoices." + id, invoice)
            return invoice
        })
}

function edit(id, invoice) {
    return Axios
        .put(INVOICES_API + "/" + id, invoice)
        .then(async response => {
            const cachedInvoices = await Cache.get("invoices")
            const cachedInvoice = await Cache.get("invoices." + id)
            if (cachedInvoice) {
                Cache.set("invoices." + id, response.data)
            }
            if (cachedInvoices) {
                const index = cachedInvoices.findIndex(i => i.id === +id);
                cachedInvoices[index] = response.data
            }
            return response
        })
}

export default {
    newInvoices,
    find,
    edit,
    findAll,
    deleteInvoice
}
