import React, {useState} from 'react'
import ReactDOM from "react-dom"
import '../styles/app.css';
import Navbar from "./Components/Navbar";
import HomePage from "./Pages/HomePage";
import {HashRouter, Route, Switch, withRouter} from "react-router-dom";
import CustomersPage from "./Pages/CustomersPage";
import InvoicesPage from "./Pages/InvoicesPage";
import {LoginPage} from "./Pages/LoginPage";
import AuthAPI from "./Services/AuthAPI";
import AuthContext from "./contexts/AuthContext";
import PrivateRoute from "./Components/PrivateRoute";
import {CustomerPage} from "./Pages/CustomerPage";
import InvoicePage from "./Pages/InvoicePage";
import RegisterPage from "./Pages/RegisterPage";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
AuthAPI.setup()

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(AuthAPI.isAuthenticated());
    const NavbarWithRouter = withRouter(Navbar)

    const contextValue = {
        isAuthenticated,
        setIsAuthenticated
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, setIsAuthenticated}}>
            <HashRouter>
                <NavbarWithRouter/>
                <main className="container pt-5">
                    <Switch>
                        <Route path="/register" component={RegisterPage}/>
                        <Route path="/login" component={LoginPage}/>
                        <PrivateRoute path="/invoice/:id" component={InvoicePage}/>
                        <PrivateRoute path="/invoices/new" component={InvoicePage}/>
                        <PrivateRoute path="/customers/new" component={CustomerPage}/>
                        <PrivateRoute path="/customer/:id" component={CustomerPage}/>
                        <PrivateRoute path="/customers" component={CustomersPage}/>
                        <PrivateRoute path="/invoices" component={InvoicesPage}/>
                        <Route path="/" component={HomePage}/>
                    </Switch>
                </main>
            </HashRouter>
            <ToastContainer position={toast.POSITION.BOTTOM_RIGHT}/>
        </AuthContext.Provider>

    )
}

const rootElement = document.querySelector("#app");
ReactDOM.render(<App/>, rootElement)
