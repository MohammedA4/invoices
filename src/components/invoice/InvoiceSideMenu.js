import { Offcanvas, Nav } from "react-bootstrap";
import { FileEarmarkText, CurrencyDollar, ClockFill, CheckCircleFill, XCircleFill, Wallet2 } from "react-bootstrap-icons";

function StatCard({ icon, iconBg, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function InvoiceSideMenu({ showMenu, setShowMenu, totalInvoices, totalEarned, statusCounts, walletAddress }) {
  return (
    <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} className='w-25'>
      <Offcanvas.Header closeButton style={{ borderBottom: '1px solid #F1F5F9' }}>
        <Offcanvas.Title style={{ fontWeight: 700, color: '#4F46E5' }}>InvoiceDApp</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className='flex-column mb-4'>
          <Nav.Item>
            <Nav.Link disabled style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.85rem' }}>
              📄 Invoices
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <p className="stat-label mb-3">Overview</p>

        <StatCard
          icon={<FileEarmarkText color="#4F46E5" size={16} />}
          iconBg="#EEF2FF"
          label="Total Invoices"
          value={totalInvoices}
        />
        <StatCard
          icon={<CurrencyDollar color="#059669" size={16} />}
          iconBg="#D1FAE5"
          label="Total Earned"
          value={`$${totalEarned.toFixed(2)}`}
        />
        <StatCard
          icon={<ClockFill color="#D97706" size={14} />}
          iconBg="#FEF3C7"
          label="Pending"
          value={statusCounts['Pending'] || 0}
        />
        <StatCard
          icon={<CheckCircleFill color="#059669" size={14} />}
          iconBg="#D1FAE5"
          label="Paid"
          value={statusCounts['Paid'] || 0}
        />
        <StatCard
          icon={<XCircleFill color="#DC2626" size={14} />}
          iconBg="#FEE2E2"
          label="Cancelled"
          value={statusCounts['Cancelled'] || 0}
        />

        {walletAddress && (
          <>
            <hr />
            <p className="stat-label mb-2">Wallet</p>
            <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4F46E5' }}>
                <Wallet2 size={14} /> <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Connected</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', wordBreak: 'break-all' }}>
                {walletAddress}
              </span>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default InvoiceSideMenu;
