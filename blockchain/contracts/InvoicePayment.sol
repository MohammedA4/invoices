// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InvoicePayment {

    struct Invoice {
        uint256 amount;
        address payable recipient;
        bool paid;
        bool exists;
    }

    mapping(uint256 => Invoice) private invoices;

    event InvoiceRegistered(uint256 indexed invoiceId, address indexed recipient, uint256 amount);
    event InvoicePaid(uint256 indexed invoiceId, address indexed payer, uint256 amount);

    function registerInvoice(uint256 invoiceId, uint256 amount) external {
        require(!invoices[invoiceId].exists, "Invoice already registered");
        require(amount > 0, "Amount must be greater than 0");
        invoices[invoiceId] = Invoice({
            amount: amount,
            recipient: payable(msg.sender),
            paid: false,
            exists: true
        });
        emit InvoiceRegistered(invoiceId, msg.sender, amount);
    }

    function payInvoice(uint256 invoiceId) external payable {
        Invoice storage inv = invoices[invoiceId];
        require(inv.exists, "Invoice not registered on chain");
        require(!inv.paid, "Invoice already paid");
        require(msg.value == inv.amount, "Incorrect payment amount");
        inv.paid = true;
        inv.recipient.transfer(msg.value);
        emit InvoicePaid(invoiceId, msg.sender, msg.value);
    }

    function getInvoice(uint256 invoiceId) external view returns (
        uint256 amount,
        address recipient,
        bool paid,
        bool exists
    ) {
        Invoice memory inv = invoices[invoiceId];
        return (inv.amount, inv.recipient, inv.paid, inv.exists);
    }
}
