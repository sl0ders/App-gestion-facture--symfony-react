import * as React from 'react';
import {useEffect, useState} from 'react';
import Axios from "axios";
import Pagination from "../Components/Pagination";

const CustomersPageWithAPIPagination = () => {
    const [customers, setCustomers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(3);
    const itemsPerPage = 10

    useEffect(() => {
        Axios.get(`http://localhost:8000/api/customers?pagination=true&count=${itemsPerPage}&page=${currentPage}`)
            .then(response => {
                setCustomers(response.data["hydra:member"]);
                setTotalItems(response.data["hydra:totalItems"]);
            })
            .catch(error => console.log(error.response))
    }, [currentPage])

    function handleDelete(id) {
        const originalCustomers = [...customers]
        customers.filter(customer => customer.id !== id)
        Axios.delete("http://localhost:8000/api/customers/" + id)
            .then(response => setCustomers(customers.filter(customer => customer.id !== id)))
            .catch(error => {
                setCustomers(originalCustomers);
                console.log(error.response)
            })
    }

    const handlePageChange = (page) => {
        setCustomers([]);
        setCurrentPage(page)
    };

    return (
        <>
            <h1>Liste des clients (API pagination)</h1>
            <table className="table table-hover">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Client</th>
                    <th>Email</th>
                    <th>Entreprise</th>
                    <th className="text-center">Factures</th>
                    <th className="text-center">Montant total</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {customers.length === 0 && (
                    <tr>
                        <td>Chargement ...</td>
                    </tr>
                )}
                {customers.map(customer =>
                    <tr key={customer.id}>
                        <td>{customer.id}</td>
                        <td>
                            <a href="#">{customer.firstname} {customer.lastname}</a>
                        </td>
                        <td>{customer.email}</td>
                        <td>{customer.company}</td>
                        <td className="text-center">
                            <span className="badge bg-primary">{customer.invoices.length}</span>
                        </td>
                        <td className="text-center">{customer.totalAmount.toLocaleString()} €</td>
                        <td>
                            <button
                                onClick={() => handleDelete(customer.id)}
                                disabled={customer.invoices.length > 0} className="btn btn-sm btn-danger">
                                Supprimer
                            </button>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            <Pagination currentPage={currentPage} itemPerPage={itemsPerPage} length={totalItems}
                        onPageChanged={handlePageChange}/>
        </>

    );
};

export default CustomersPageWithAPIPagination
