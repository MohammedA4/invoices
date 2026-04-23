import { Offcanvas, Nav, Badge, ListGroup } from "react-bootstrap";

function InvoiceSideMenu({ showMenu, setShowMenu, totalInvoices, totalEarned, statusCounts, walletAddress }) {
  return (
    <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} className='w-25'>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Menu</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className='flex-column mb-4'>
          <Nav.Item>
            <Nav.Link disabled>Invoices</Nav.Link>
          </Nav.Item>
          <Nav.Item><hr /></Nav.Item>
        </Nav>

        <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          Dashboard
        </h6>
        <ListGroup variant="flush">
          <ListGroup.Item className="d-flex justify-content-between px-0">
            <span>Total Invoices</span>
            <Badge bg="primary">{totalInvoices}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between px-0">
            <span>Total Earned</span>
            <strong>${totalEarned.toFixed(2)}</strong>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between px-0">
            <span>Pending</span>
            <Badge bg="warning" text="dark">{statusCounts['Pending'] || 0}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between px-0">
            <span>Paid</span>
            <Badge bg="success">{statusCounts['Paid'] || 0}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between px-0">
            <span>Cancelled</span>
            <Badge bg="danger">{statusCounts['Cancelled'] || 0}</Badge>
          </ListGroup.Item>
        </ListGroup>

        {walletAddress && (
          <>
            <hr />
            <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Wallet
            </h6>
            <ListGroup variant="flush">
              <ListGroup.Item className="px-0">
                <small className="text-muted d-block">Connected</small>
                <span style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{walletAddress}</span>
              </ListGroup.Item>
            </ListGroup>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default InvoiceSideMenu;
