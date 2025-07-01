import React from 'react';
import { X } from 'lucide-react';
import { searchFields } from '../data/searchFields';

const SearchModal = ({ showSearchModal, closeSearchModal, currentSection, searchFormData, handleSearchInputChange, handleSearchSubmit }) => {
  if (!showSearchModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Tìm kiếm {currentSection}</h2>
          <button onClick={closeSearchModal} className="modal-close">
            <X className="icon" />
          </button>
        </div>
        <div className="modal-form">
          {searchFields[currentSection]?.map((field) => (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              value={searchFormData[field.name] || ""}
              onChange={handleSearchInputChange}
              placeholder={field.placeholder}
            />
          ))}
          <div className="modal-actions">
            <button type="button" onClick={handleSearchSubmit} className="action-button">Tìm kiếm</button>
            <button type="button" onClick={closeSearchModal} className="action-button cancel">Hủy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;