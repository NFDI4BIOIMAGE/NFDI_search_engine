import React, { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const PublicationDateSlider = ({ minYear, maxYear, onDateRangeChange, selectedRange }) => {
  const currentYear = new Date().getFullYear();
  const [range, setRange] = useState(selectedRange || [minYear || 2005, maxYear || currentYear]);
  const [selectedPreset, setSelectedPreset] = useState(null);

  useEffect(() => {
    setRange(selectedRange || [minYear || 2005, maxYear || currentYear]);
  }, [minYear, maxYear, selectedRange]);

  const handleRangeChange = (value) => {
    setRange(value);
    setSelectedPreset(null);
    onDateRangeChange(value);
  };

  const handlePresetToggle = (yearsAgo) => {
    const startYear = currentYear - yearsAgo;
    const newRange = [startYear, currentYear];

    if (selectedPreset === yearsAgo) {
      // If the same preset is clicked again, unselect it and reset to full range
      setSelectedPreset(null);
      setRange([minYear || 2005, maxYear || currentYear]);
      onDateRangeChange([minYear || 2005, maxYear || currentYear]);
    } else {
      // Select new preset range
      setSelectedPreset(yearsAgo);
      setRange(newRange);
      onDateRangeChange(newRange);
    }
  };

  return (
    <div className="publication-date-slider">
      <h5>Publication Date Range</h5>
      <Slider
        range
        min={minYear || 2005}
        max={maxYear || currentYear}
        value={range}
        onChange={handleRangeChange}
        allowCross={false}
      />
      <div className="range-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <span>{range[0]}</span>
        <span>{range[1]}</span>
      </div>
      <div className="preset-filters" style={{ marginTop: '10px' }}>
        <div
          className={`toggle-button ${selectedPreset === 1 ? 'selected' : ''}`}
          onClick={() => handlePresetToggle(1)}
        >
          Past 1 year
        </div>
        <div
          className={`toggle-button ${selectedPreset === 2 ? 'selected' : ''}`}
          onClick={() => handlePresetToggle(2)}
        >
          Past 2 years
        </div>
        <div
          className={`toggle-button ${selectedPreset === 3 ? 'selected' : ''}`}
          onClick={() => handlePresetToggle(3)}
        >
          Past 3 years
        </div>
        <div
          className={`toggle-button ${selectedPreset === 5 ? 'selected' : ''}`}
          onClick={() => handlePresetToggle(5)}
        >
          Past 5 years
        </div>
      </div>
    </div>
  );
};

export default PublicationDateSlider;
