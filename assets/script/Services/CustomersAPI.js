import Axios from "axios";
import Cache from "./Cache";
import {CUSTOMER_API} from "./config";

async function findAll() {
    // On va chercher les invoices present dans le cache

    const cachedCustomers = await Cache.get("customers")

    if (cachedCustomers) {
        return cachedCustomers
    }

    return Axios.get(CUSTOMER_API)
        .then(response => {
            const customers = response.data["hydra:member"]
            Cache.set("customers", customers)
            return customers
        })
}

// Pour modifier le tableau de customers present dans le cache suite a la suppression d'un customer
function deleteCustomer(id) {
    // 1. on joue sur la reponse de la requete a l'api dans le cas ou celle-ci a reussi -> .then()
    return Axios.delete(CUSTOMER_API + "/" + id)
        .then(async response => {
            // 2. On recupere le cache customers
            const cachedCustomers = await Cache.get("customers");
            // 3. si celui-ci n'est pas vide
            if (cachedCustomers) {
                //4. Alors on filtre les resultat du tableau de cache en enlevant le customer avec l'id de la fonction delete
                Cache.set("customers", cachedCustomers.filter(c => c.id !== id))
            }
            //Dans tout les cas on renvoi la reponse de la requete
            return response
        })
}

// Meme procedure pour l'ajout d'un customer a l'exeption pret, on recuperer le tableau de cache et on y ajoute les donné de la reponse (nouveau customer)
function newCustomer(customer) {
    return Axios.post(CUSTOMER_API, customer).then(async response => {
        const cachedCustomers = await Cache.get("customers")
        if (cachedCustomers) {
            Cache.set("customers", [...cachedCustomers, response.data])
        }
        return response
    })
}

async function find(id) {
    // on va chercher le customer present dans le cache
    const cachedCustomer = await Cache.get("customers." + id)

    // Si il existe on ce contente de le retourner
    if (cachedCustomer) return cachedCustomer

    // Sinon on set Le cache avec les données du customer au cas ou on irait a nouveau le chercher
    return Axios
        .get(CUSTOMER_API + "/" + id)
        .then(response => {
            const customer = response.data
            Cache.set("customers." + id, customer)
            return customer
        })
}

function edit(id, customer) {
    return Axios
        .put(CUSTOMER_API + "/" +  id, customer)
        .then(async response => {
            // lors de l'édition d'un customer, pour que le formulaire ce remplise en automatiquement en utilisant le cache, On va chercher le customer dans le cache
            const cachedCustomers = await Cache.get("customers")
            const cachedCustomer = await Cache.get("customers." + id)

            // Si il existe alors on recupere les donnée de celui-ci et on les insere dans le formulaire
            if (cachedCustomer) {
                Cache.set("customers." + id, response.data)
            }

            // Si le tableau de customers n'est pas vide
            if (cachedCustomers) {
                // On va chercher grace a l'id du customer le customer en train d'etre modifier (index est maintenant le customer modifier)
                const index = cachedCustomers.findIndex(c => c.id === +id);
                // On remplace le customer modifier dans le tableau initial mis en cache (response.data = les donné du customer modifier envoyer par le formulaire)
                cachedCustomers[index] = response.data
            }
            return response
        })
}

export default {
    findAll,
    delete: deleteCustomer,
    newCustomer,
    find,
    edit
}
