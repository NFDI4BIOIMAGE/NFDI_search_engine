import React, { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import 'rc-slider/assets/index.css';

const PublicationDateSlider = ({
  minYear,
  onDateRangeChange,
  selectedRange,
  publicationData,
}) => {
  const currentYear = new Date().getFullYear();
  const [range, setRange] = useState(
    selectedRange || [minYear || 2005, currentYear]
  );
  const [selectedPreset, setSelectedPreset] = useState(null);

  useEffect(() => {
    setRange(selectedRange || [minYear || 2005, currentYear]);
  }, [minYear, selectedRange]);

  const handleRangeChange = (value) => {
    setRange(value);
    setSelectedPreset(null);
    onDateRangeChange(value);
  };

  const handlePresetToggle = (yearsAgo) => {
    const startYear = currentYear - yearsAgo + 1;
    const newRange = [startYear, currentYear];

    if (selectedPreset === yearsAgo) {
      setSelectedPreset(null);
      setRange([minYear || 2005, currentYear]);
      onDateRangeChange([minYear || 2005, currentYear]);
    } else {
      setSelectedPreset(yearsAgo);
      setRange(newRange);
      onDateRangeChange(newRange);
    }
  };

  return (
    <div className="publication-date-slider">
      <h5>Publication Date Range</h5>

      {/* Histogram above the slider */}
      <div
        style={{ position: 'relative', height: '60px', marginBottom: '10px' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={publicationData}
            margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis dataKey="year" hide />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Slider below the histogram */}
      <Slider
        range
        min={minYear || 2005}
        max={currentYear}
        value={range}
        onChange={handleRangeChange}
        allowCross={false}
      />

      {/* Range Labels */}
      <div
        className="range-labels"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
        }}
      >
        <span>{range[0]}</span>
        <span>{range[1]}</span>
      </div>

      {/* Preset Filters */}
      <div className="preset-filters" style={{ marginTop: '10px' }}>
        {[1, 2, 3, 5].map((yearsAgo) => (
          <div
            key={yearsAgo}
            className={`toggle-button ${
              selectedPreset === yearsAgo ? 'selected' : ''
            }`}
            onClick={() => handlePresetToggle(yearsAgo)}
          >
            Past {yearsAgo} year{yearsAgo > 1 ? 's' : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicationDateSlider;
