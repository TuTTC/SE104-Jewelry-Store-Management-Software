import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  activePage,
  totalPages,
  onPageChange
}) => {
  const handlePrevPage = () => {
    if (activePage > 1) onPageChange(activePage - 1);
  };

  const handleNextPage = () => {
    if (activePage < totalPages) onPageChange(activePage + 1);
  };

  return (
    <div className="pagination">
      <button
        type="button"
        aria-label="prev"
        className="pagination-button"
        onClick={handlePrevPage}
        disabled={activePage === 1}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            className={`pagination-page ${activePage === page ? 'pagination-active' : ''}`}
            onClick={() => onPageChange(page)}
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
        disabled={activePage === totalPages}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Pagination;
