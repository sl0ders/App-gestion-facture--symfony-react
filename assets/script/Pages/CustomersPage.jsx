import React, {useEffect, useState} from 'react';
import Pagination from "../Components/Pagination";

import CustomersAPI from "../Services/CustomersAPI";
import {Link} from "react-router-dom";
import {toast} from "react-toastify";
import TableLoader from "../Components/loaders/TableLoader";

const CustomersPage = () => {
        const [customers, setCustomers] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [search, setSearch] = useState("");
        const [loading, setLoading] = useState(true)

        useEffect(async () => {
            try {
                const data = await CustomersAPI.findAll()
                setCustomers(data)
                setLoading(false)
            } catch (error) {
                toast.error("Échec de la recuperation des clients")
            }
        }, [])

        //Gestion de la suppression des customers
        const handleDelete = async id => {
            const originalCustomers = [...customers]
            setCustomers(customers.filter(customer => customer.id !== id))
            try {
                await CustomersAPI.delete(id)
                toast.success("Suppression du client éffectuée")
            } catch (error) {
                toast.error("Échec de la suppression du client")
                setCustomers(originalCustomers);
            }
        }

        //Gestion du changement de page
        const handlePageChange = (page) => {
            setCurrentPage(page)
        }

        //Gestion de la recherche
        const handleSearch = ({currentTarget}) => {
            setSearch(currentTarget.value)
            setCurrentPage(1)
        }

        const itemsPerPage = 10;

        //Filtrage des customers en fonction de la recherche
        const filteredCustomers = customers.filter(
            c =>
                c.firstname.toLowerCase().includes(search.toLowerCase()) ||
                c.lastname.toLowerCase().includes(search.toLowerCase()) ||
                c.email.toLowerCase().includes(search.toLowerCase()) ||
                (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
        );

        //Pagination des données
        const paginatedCustomers = Pagination.getData(
            filteredCustomers,
            currentPage,
            itemsPerPage
        )

        return (
            <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1>Liste des clients</h1>
                    <Link to="/customers/new" className="btn btn-primary">
                        Ajout d'un client
                    </Link>
                </div>
                <div className="form-group">
                    <input type="text" name="" onChange={handleSearch} value={search} id="" placeholder="Rechercher..."
                           className="form-controle"/>
                </div>

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
                    {!loading && (<tbody>
                    {paginatedCustomers.map(customer =>
                        <tr key={customer.id}>
                            <td>{customer.id}</td>
                            <td>
                                <Link to={"/customer/" + customer.id}>{customer.firstname} {customer.lastname}</Link>
                            </td>
                            <td>{customer.email}</td>
                            <td>{customer.company}</td>
                            <td className="text-center">
                                <span className="badge bg-primary">{customer.invoices.length}</span>
                            </td>
                            <td className="text-center">{customer.totalAmount.toLocaleString()} €</td>
                            <td>
                                <Link to={"/customer/" + customer.id} className="btn btn-primary btn-sm mr-2">Éditer</Link>
                                <button
                                    onClick={() => handleDelete(customer.id)}
                                    disabled={customer.invoices.length > 0} className="btn btn-sm btn-danger">
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    )}
                    </tbody>)}
                </table>
                {loading && <TableLoader/>}

                {itemsPerPage < filteredCustomers.length && <Pagination
                    currentPage={currentPage}
                    itemPerPage={itemsPerPage}
                    length={filteredCustomers.length}
                    onPageChanged={handlePageChange}/>
                }
            </>
        );
    }
;

export default CustomersPage
