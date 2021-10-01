import React from "react";
import AuthContext from "../contexts/AuthContext";
import {Redirect, Route} from "react-router-dom";
import {useContext} from "react";

const PrivateRoute = ({path, component}) => {
    const {isAuthenticated} = useContext(AuthContext);

    return isAuthenticated ? (
        <Route path={path} component={component}/>
    ) : (
        <Redirect to="/login"/>
    );
}

export default PrivateRoute
