import React from 'react';
import ReactSlider from 'react-slider';

const PublicationDateSlider = ({ minYear, maxYear, selectedRange, onChange }) => {
  return (
    <div className="faceted-search">
      <div className="faceted-search-header">
        Publication Date
      </div>
      <div className="faceted-search-body show">
        <ReactSlider
          className="horizontal-slider"
          thumbClassName="thumb"
          trackClassName="track"
          min={minYear}
          max={maxYear}
          value={selectedRange}
          onChange={onChange}
          ariaLabel={['Minimum publication year', 'Maximum publication year']}
          renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        />
        <div className="range-values">
          <span>{selectedRange[0]}</span>
          <span>{selectedRange[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default PublicationDateSlider;
