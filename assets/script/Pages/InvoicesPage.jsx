import React, {useEffect, useState} from 'react';
import Pagination from "../Components/Pagination";
import InvoicesAPI from "../Services/InvoicesAPI";
import moment from "moment"
import {Link} from "react-router-dom";
import {toast} from "react-toastify";
import TableLoader from "../Components/loaders/TableLoader";

const STATUS_CLASSES = {
    PAID: "success",
    SENT: "primary",
    CANCELLED: "danger"
}

const STATUS_LABELS = {
    PAID: "Payée",
    SENT: "Envoyée",
    CANCELLED: "Annulée"
}

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true)

    useEffect(async () => {
        try {
            const data = await InvoicesAPI.findAll()
            setInvoices(data)
            setLoading(false)
        } catch (error) {
            toast.success("Échec de la recuperation des factures")
            console.log(error.response)
        }
    }, [])

    const handleDelete = async (id) => {
        const originalInvoices = [...invoices]
        setInvoices(invoices.filter(invoice => invoice.id !== id))
        try {
            await InvoicesAPI.deleteInvoice(id)
        } catch (error) {
            setInvoices(originalInvoices)
        }
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handleSearch = ({currentTarget}) => {
        setSearch(currentTarget.value);
        setCurrentPage(1)
    }

    const itemsPerPage = 10;

    const formatDate = (str) => moment(str).format("DD/MM/YYYY")

    //Filtrage des invoices en fonction de la recherche
    const filteredInvoices = invoices.filter(
        i =>
            i.customer.firstname.toLowerCase().includes(search.toLowerCase()) ||
            i.customer.lastname.toLowerCase().includes(search.toLowerCase()) ||
            i.amount.toString().includes(search) ||
            STATUS_LABELS[i.status].toLowerCase().includes(search.toLowerCase())
    );

    //Pagination des données
    const paginatedInvoices = Pagination.getData(
        filteredInvoices,
        currentPage,
        itemsPerPage
    )

    return (
        <>
            <div className="d-flex justify-content-between align-items-center">
                <h1>Liste des factures</h1>
                <Link className="btn btn-primary" to="/invoices/new">Créer une facture</Link>
            </div>
            <div className="form-group">
                <input type="text" name="" onChange={handleSearch} value={search} id="" placeholder="Rechercher..."
                       className="form-controle"/>
            </div>
            <table className="table table-hover">
                <thead>
                <tr>
                    <th>Numero</th>
                    <th>Client</th>
                    <th className="text-center">Date D'envoie</th>
                    <th className="text-center">Statut</th>
                    <th className="text-center">Montant</th>
                    <th/>
                </tr>
                </thead>
                {!loading && (<tbody>
                    {paginatedInvoices.map(invoice =>
                        <tr key={invoice.id}>
                            <td>{invoice.id}</td>
                            <td><Link
                                to={"/customer/" + invoice.customer.id}>{invoice.customer.firstname} {invoice.customer.lastname}</Link>
                            </td>
                            <td className="text-center">{formatDate(invoice.sentAt)}</td>
                            <td className="text-center">
                            <span
                                className={"badge bg-" + STATUS_CLASSES[invoice.status]}>{STATUS_LABELS[invoice.status]}</span>
                            </td>
                            <td className="text-center">{invoice.amount.toLocaleString()} €</td>
                            <td>
                                <Link to={"/invoice/" + invoice.id}
                                      className="btn btn-primary mr-2 btn-sm">Éditer</Link>
                                <button className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(invoice.id)}>Supprimer
                                </button>
                            </td>
                        </tr>
                    )}
                    </tbody>
                )}
            </table>

            {loading && <TableLoader/>}

            <Pagination
                currentPage={currentPage}
                itemPerPage={itemsPerPage}
                length={filteredInvoices.length}
                onPageChanged={handlePageChange}/>
        </>
    );
}

export default InvoicesPage
