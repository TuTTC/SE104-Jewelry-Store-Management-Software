import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ totalPages, currentPage, setCurrentPage }) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="pagination">
      <button
        type="button"
        aria-label="prev"
        className="pagination-button"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-10 h-10 text-gray-500" />
      </button>

      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            className={`pagination-page ${currentPage === page ? 'pagination-active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="next"
        className="pagination-button"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-10 h-10 text-gray-500" />
      </button>
    </div>
  );
};

export default Pagination;
