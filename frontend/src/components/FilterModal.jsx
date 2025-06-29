import React from 'react';
import { X } from 'lucide-react';
import { filterOptions } from '../data/filterOptions';

const FilterModal = ({ showFilterModal, closeFilterModal, currentSection, filterFormData, handleFilterInputChange, handleFilterSubmit }) => {
  if (!showFilterModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Lọc {currentSection}</h2>
          <button onClick={closeFilterModal} className="modal-close">
            <X className="icon" />
          </button>
        </div>
        <div className="modal-form">
          {filterOptions[currentSection]?.map((option) => (
            option.type === "select" ? (
              <select
                key={option.name}
                name={option.name}
                value={filterFormData[option.name] || ""}
                onChange={handleFilterInputChange}
              >
                <option value="">{option.placeholder}</option>
                {option.options.slice(1).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "true" ? "Kích hoạt" : opt === "false" ? "Không hoạt động" : opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={option.name}
                type={option.type}
                name={option.name}
                value={filterFormData[option.name] || ""}
                onChange={handleFilterInputChange}
                placeholder={option.placeholder}
              />
            )
          ))}
          <div className="modal-actions">
            <button type="button" onClick={handleFilterSubmit} className="action-button">Lọc</button>
            <button type="button" onClick={closeFilterModal} className="action-button cancel">Hủy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;