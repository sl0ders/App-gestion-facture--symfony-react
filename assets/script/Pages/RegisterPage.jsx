import * as React from 'react';
import {useState} from "react";
import Fields from "../Components/forms/Fields";
import {Link} from "react-router-dom";
import UserAPI from "../Services/UserAPI";
import {toast} from "react-toastify";

const RegisterPage = ({history}) => {
    const [user, setUser] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        passwordConfirm: ""
    })

    const [errors, setErrors] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        passwordConfirm: ""
    })

    // Gestion des changements des inputs dans le formulaire
    const handleChange = ({currentTarget}) => {
        setErrors({})
        const {name, value} = currentTarget;
        setUser({...user, [name]: value})

    }
    // Gestion de la soumission
    const handleSubmit = async event => {
        event.preventDefault();
        const apiErrors = {};
        if (user.password !== user.passwordConfirm) {
            apiErrors.passwordConfirm = "Votre confirmation de mot de passe ne correspond pas"
            setErrors(apiErrors)
            return
        }
        try {
            const response = await UserAPI.add(user)
            toast.success("Félicitation vous etes maintenant inscrit")
            history.replace("/login")
            console.log(response)
        } catch (error) {
            toast.error("Échec de l'inscription une erreur a eu lieu")
            console.log(error.response)
            const {violations} = error.response.data
            if (violations) {
                violations.forEach(violation => {
                    apiErrors[violation.propertyPath] = violation.message
                })
                setErrors(apiErrors)
            }
        }
    }

    return (
        <>
            <h1>Inscription</h1>
            <form onSubmit={handleSubmit}>
                <Fields
                    name="firstname"
                    label="Prénom"
                    placeholder="Votre prénom"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={user.firstname}
                    error={errors.firstname}/>
                <Fields
                    name="lastname"
                    label="Nom de famille"
                    placeholder="Votre nom de famille"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={user.lastname}
                    error={errors.lastname}/>
                <Fields
                    name="email"
                    label="E-mail"
                    placeholder="Votre adresse e-mail"
                    type="email"
                    className="form-control"
                    onChange={handleChange}
                    value={user.email}
                    error={errors.email}/>
                <Fields
                    name="password"
                    label="Mot de passe"
                    placeholder="Votre mot de passe"
                    type="password"
                    className="form-control"
                    onChange={handleChange}
                    value={user.password}
                    error={errors.password}/>
                <Fields
                    name="passwordConfirm"
                    label="Mot de passe"
                    placeholder="Confirmation du mot de passe"
                    type="password"
                    className="form-control"
                    onChange={handleChange}
                    value={user.passwordConfirm}
                    error={errors.passwordConfirm}/>
                <button className="btn btn-success mt-4" type="submit">Valider l'inscription</button>
            </form>
            <Link to="/login" className="btn btn-link">J'ai deja un compte</Link>
        </>

    );
}
export default RegisterPage;
