import * as React from 'react';
import Fields from "../Components/forms/Fields";
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import CustomersAPI from "../Services/CustomersAPI";
import {toast} from "react-toastify";
import FormContentLoader from "../Components/loaders/FormContentLoader";

export const CustomerPage = ({match, history}) => {
    const {id = "new"} = match.params

    const [customer, setCustomer] = useState({
        email: "",
        firstname: "",
        lastname: "",
        company: ""
    });

    const [errors, setErrors] = useState({
        email: "",
        firstname: "",
        lastname: "",
        company: ""
    });

    const [editing, setEditing] = useState(false);

    const [loading, setLoading] = useState(true)

    //Récuperation du customer en fonction de l'identité
    const fetchCustomer = async id => {
        try {
            const {firstname, lastname, email, company} = await CustomersAPI.find(id)
            setCustomer({firstname, lastname, email, company})
            setLoading(false)
            toast.success("Les information du client on bien été récuperer")
        } catch (error) {
            toast.error("Échec lors de la récuperation du client")
            history.replace('/customers')
        }
    }

    //chargement du customer si besoin au chargment du composant ou au changement de l'id
    useEffect(() => {
        if (id !== "new") {
            setEditing(true)
            fetchCustomer(id)
        } else {
            setLoading(false)
        }
    }, [id]);

    // Gestion des changements des inputs dans le formulaire
    const handleChange = ({currentTarget}) => {
        const {name, value} = currentTarget;
        setCustomer({...customer, [name]: value})
    }

    // Gestion de la soumission du formulaire
    const handleSubmit = async event => {
        event.preventDefault()

        try {
            setErrors({})
            if (editing) {
                await CustomersAPI.edit(id, customer)
                toast.success("Le client a bien été édité")
                setLoading(false)
            } else {
                await CustomersAPI.newCustomer(customer)
                toast.success("Le client a bien été créer")
            }
            history.replace("/customers")
        } catch ({response}) {
            const {violations} = response.data
            if (violations) {
                const apiErrors = {};
                violations.forEach(({propertyPath, message}) => {
                    apiErrors[propertyPath] = message;
                })
                setErrors(apiErrors)
                toast.error("Une erreur a surgie lors de la creation du client")
            }
        }
    }

    return (
        <div>
            {!editing && <h1>Création d'un client</h1> || <h1>Modification du client</h1>}
            {loading && <FormContentLoader/>}
            {!loading && (<form onSubmit={handleSubmit}>
                <Fields error={errors.email} onChange={handleChange} value={customer.email} name="email"
                        type="email"
                        placeholder="Adresse email de connexion" label="Adresse email"/>
                <Fields error={errors.firstname} onChange={handleChange} value={customer.firstname} name="firstname"
                        placeholder="Prénom"
                        label="Prénom du client"/>
                <Fields error={errors.lastname} onChange={handleChange} value={customer.lastname} name="lastname"
                        placeholder="Nom de famille"
                        label="Nom de famille du client"/>
                <Fields error={errors.company} onChange={handleChange} value={customer.company} name="company"
                        placeholder="Entreprise"
                        label="Entreprise du client"/>
                <div className="form-group mt-3">
                    <button type='submit' className="btn btn-success">Enregistrer</button>
                    <Link to="/customers" className="btn btn-link btn-warning text-decoration-none text-white">Retour a
                        la liste</Link>
                </div>
            </form>)}
        </div>
    );
};
