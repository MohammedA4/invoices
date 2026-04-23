import InvoiceListItem from "./InvoiceListItem";
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.css';

function InvoiceList(props) {
    return (
        <div>
            {
                props.invoices.length > 0
                    ?
                    <Table striped hover responsive='md'>
                        <thead className='table-primary'>
                            <tr>
                                <th className='ps-5'>№</th>
                                <th>Date</th>
                                <th>Period</th>
                                <th>Days worked</th>
                                <th>Total to pay</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                props.invoices.map((invoice) => (
                                    <InvoiceListItem key={invoice.id}
                                        invoice={invoice}
                                        openModalForEdit={props.openModalForEdit} />
                                ))
                            }
                        </tbody>
                    </Table>
                    :
                    <p className="text-center pt-3">
                        No invoices created yet.
                        Click <a href="#" onClick={props.openModalForCreate}>Create</a> to start working.
                    </p>
            }
        </div>
    );
}

export default InvoiceList;