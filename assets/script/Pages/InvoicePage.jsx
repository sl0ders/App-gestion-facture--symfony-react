import React, {useEffect, useState} from "react";
import Fields from "../Components/forms/Fields";
import Select from "../Components/forms/Select";
import {Link} from "react-router-dom";
import CustomersAPI from "../Services/CustomersAPI"
import InvoicesAPI from "../Services/InvoicesAPI";
import {toast} from "react-toastify";
import FormContentLoader from "../Components/loaders/FormContentLoader";


const InvoicePage = ({history, match}) => {

    const {id = "new"} = match.params
    const [invoice, setInvoice] = useState({
        amount: "",
        customer: "",
        // Pour que le submit du formulaire fonction meme si aucun status n'été selectionné, on passe la facture a SENT par default
        status: "SENT"
    });

    const [error, setError] = useState({
        amount: "",
        customer: "",
        status: ""
    })
    const [customers, setCustomers] = useState([]);
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    // On créer une fonction qui va chercher tout les customers dans l'api, en async
    const fetchCustomers = async () => {
        try {
            const data = await CustomersAPI.findAll()
            toast.success("Récupération des clients éffectué")
            setCustomers(data)
            setLoading(false)
            // Si aucun customer n'a été selectionné, on prend le premier de la liste par default
            if (!invoice.customer) {
                setInvoice({...invoice, customer: data[0].id})
            }
        } catch (error) {
            toast.error("Échec de la récuperation des client")
            history.replace("/invoices")
        }
    }

    // Recuperation de la facture pour autocompletion du formulaire
    const fetchInvoice = async id => {
        try {
            const {amount, status, customer} = await InvoicesAPI.find(id)
            toast.success("Récuperation de la facture éffectuée")
            setInvoice({amount, status, customer: customer.id})
            setLoading(false)
        } catch (error) {
            toast.error("Échec de la récuperation des factures")
            history.replace("/invoices")
        }
    }

    // On precise que cette fonction dois s'exectuter a l'ouverture de la page avec le useEffect
    useEffect(() => {
        fetchCustomers()
    }, [])

    // Récuperation de la bonne facture quand l'id de l'url change
    useEffect(() => {
        if (id !== "new") {
            setEditing(true)
            fetchInvoice(id)
        }
    }, [id])

    // Gestion des changements des inputs dans le formulaire
    const handleChange = ({currentTarget}) => {
        const {name, value} = currentTarget;
        setInvoice({...invoice, [name]: value})
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (editing) {
                await InvoicesAPI.edit(id, {...invoice, customer: `/api/customers/${invoice.customer}`})
                toast.success("Édition de la facture reussi")
                history.replace("/invoices")
            } else {
                await InvoicesAPI.newInvoices({...invoice, customer: `/api/customers/${invoice.customer}`})
                toast.success("Création de la facture reussi")
                history.replace("/invoices")
            }
        } catch ({response}) {
            const {violations} = response.data
            if (violations) {
                const apiErrors = {};
                violations.forEach(({propertyPath, message}) => {
                    apiErrors[propertyPath] = message;
                })
                toast.error("Échec de la création/édition de la facture")
                setError(apiErrors)
            }
        }
    }

    // HTML //
    return (
        <>
            {editing && <h1>Modification de la facture</h1> || <h1>Création d'une facture</h1>}
            {loading && <FormContentLoader/>}

            {!loading && (<form onSubmit={handleSubmit}>
                <Fields
                    name="amount"
                    type="number"
                    placeholder="Montant de la facture"
                    label="Montant"
                    onChange={handleChange}
                    value={invoice.amount}
                    error={error.amount}/>

                <Select
                    name="customer"
                    label="Client"
                    value={invoice.customer}
                    error={error.customer}
                    onChange={handleChange}>

                    {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                            {customer.firstname} {customer.lastname}
                        </option>
                    ))}

                </Select>
                <Select
                    name="status"
                    label="Status"
                    value={invoice.status}
                    error={error.status}
                    onChange={handleChange}
                >
                    <option value="SENT">Envoyée</option>
                    <option value="PAID">Payée</option>
                    <option value="CANCELLED">Annulée</option>
                </Select>
                <div className="form-group">
                    <button type="submit" className="btn btn-success">Enregistrer</button>
                    <Link to="/invoices" className="btn btn-link">
                        Retour au factures
                    </Link>
                </div>
            </form>)}
        </>
    )
}

export default InvoicePage
