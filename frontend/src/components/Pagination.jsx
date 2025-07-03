import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = () => {
  const [activePage, setActivePage] = useState(1); // Trang mặc định là 3
  const totalPages = 5; // Số trang tĩnh (1, 2, 3, 4, 5)

  const handlePageChange = (page) => {
    setActivePage(page);
    // Placeholder cho logic chuyển trang thực tế
  };

  const handlePrevPage = () => {
    if (activePage > 1) {
      setActivePage(activePage - 1);
    }
  };

  const handleNextPage = () => {
    if (activePage < totalPages) {
      setActivePage(activePage + 1);
    }
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
        <ChevronLeft className="w-10 h-10 text-gray-500" />
      </button>

      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            className={`pagination-page ${activePage === page ? 'pagination-active' : ''}`}
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
        disabled={activePage === totalPages}
      >
        <ChevronRight className="w-10 h-10 text-gray-500" />
      </button>
    </div>
  );
};

export default Pagination;