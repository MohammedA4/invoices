import { Pagination } from "react-bootstrap";

function InvoicePagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className='justify-content-center mt-3 mb-4'>
      <Pagination.First disabled={currentPage === 1} onClick={() => onPageChange(1)} />
      <Pagination.Prev disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} />
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
        <Pagination.Item key={n} active={n === currentPage} onClick={() => onPageChange(n)}>
          {n}
        </Pagination.Item>
      ))}
      <Pagination.Next disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} />
      <Pagination.Last disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} />
    </Pagination>
  );
}

export default InvoicePagination;
