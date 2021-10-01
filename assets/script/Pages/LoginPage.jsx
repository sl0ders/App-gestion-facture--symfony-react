import React, {useContext, useState} from 'react';
import AuthAPI from "../Services/AuthAPI";
import AuthContext from "../contexts/AuthContext";
import Fields from "../Components/forms/Fields";
import {toast} from "react-toastify";

export const LoginPage = ({history}) => {

    const {setIsAuthenticated} = useContext(AuthContext);

    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState("")

    // Gestion des champs
    const handleChange = ({currentTarget}) => {
        const {value, name} = currentTarget
        setCredentials({...credentials, [name]: value})
    }

    // Gestion des submits
    const handleSubmit = async event => {
        event.preventDefault();
        try {
            await AuthAPI.authenticate(credentials)
            setIsAuthenticated(true)
            toast.success("Vous êtes desormais connecté 😄")
            setError("");
            history.replace("/customers")
        } catch (error) {
            toast.error("Une erreur est survenue lors de la connection")
            setError("Une erreur est survenu, le mot de passe ne correspond pas ou l'adresse email est incorrect")
        }
    }

    return (
        <>
            <h1>Page de connexion</h1>
            <form onSubmit={handleSubmit}>
                <Fields
                    name="username"
                    onChange={handleChange}
                    type="email"
                    placeholder="Adresse email de connexion"
                    value={credentials.username}
                    error={error}
                    label="Adresse email"
                />
                <Fields
                    name="password"
                    onChange={handleChange}
                    type="password"
                    value={credentials.password}
                    label="Mot de passe"
                />
                <div className="form-group">
                    <button className="btn btn-success mt-2" type="submit">Je me connecte</button>
                </div>
            </form>
        </>
    );
};
