import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubmitMaterials = () => {
  const [uniqueTags, setUniqueTags] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [uniqueLicenses, setUniqueLicenses] = useState([]);
  const [formData, setFormData] = useState({
    authors: '',
    license: [],
    name: '',
    description: '',
    publication_date: '',
    tags: [],
    type: [],
    url: '',
    yaml_file: 'nfdi4bioimage.yml'  // Set default YAML file
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch unique values from Flask API
    axios.get('http://localhost:5000/api/get_unique_values')
      .then(response => {
        setUniqueTags(response.data.tags);
        setUniqueTypes(response.data.types);
        setUniqueLicenses(response.data.licenses);
      })
      .catch(error => console.error('Error fetching unique values:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value, options } = e.target;
    
    if (options) {  // Handle multiselect options
      const values = Array.from(options).filter(option => option.selected).map(option => option.value);
      setFormData({
        ...formData,
        [name]: values
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate mandatory fields
    let validationErrors = {};
    if (!formData.name) validationErrors.name = 'Title is required';
    if (!formData.authors) validationErrors.authors = 'Authors are required';
    if (!formData.url) validationErrors.url = 'URL is required';
    if (formData.license.length === 0) validationErrors.license = 'License is required';
    if (formData.tags.length === 0) validationErrors.tags = 'Tags are required';
    if (formData.type.length === 0) validationErrors.type = 'Types are required';

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return; // If there are validation errors, do not submit the form
    }

    // Optional fields: Description and Publication Date (no validation needed here)

    axios.post('http://localhost:5000/api/submit_material', formData)
      .then(response => alert('Submission successful'))
      .catch(error => console.error('Error submitting material:', error));
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Submit New Training Materials</h2>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Title <span style={{ color: 'red' }}>*</span></label>
          <input 
            type="text" 
            name="name" 
            className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Enter title" 
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Authors */}
        <div className="mb-3">
          <label htmlFor="authors" className="form-label">Authors <span style={{ color: 'red' }}>*</span></label>
          <input 
            type="text" 
            name="authors" 
            className={`form-control ${errors.authors ? 'is-invalid' : ''}`} 
            value={formData.authors} 
            onChange={handleChange} 
            placeholder="Enter authors" 
          />
          {errors.authors && <div className="invalid-feedback">{errors.authors}</div>}
        </div>

        {/* URL */}
        <div className="mb-3">
          <label htmlFor="url" className="form-label">URL <span style={{ color: 'red' }}>*</span></label>
          <input 
            type="text" 
            name="url" 
            className={`form-control ${errors.url ? 'is-invalid' : ''}`} 
            value={formData.url} 
            onChange={handleChange} 
            placeholder="Enter URL" 
          />
          {errors.url && <div className="invalid-feedback">{errors.url}</div>}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description (Optional)</label>
          <textarea 
            name="description" 
            className="form-control" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Enter description" 
          ></textarea>
        </div>

        {/* License */}
        <div className="mb-3">
          <label htmlFor="license" className="form-label">License <span style={{ color: 'red' }}>*</span></label>
          <select 
            name="license" 
            className={`form-select ${errors.license ? 'is-invalid' : ''}`} 
            multiple 
            value={formData.license} 
            onChange={handleChange}
          >
            {uniqueLicenses.map((license, index) => (
              <option key={index} value={license}>{license}</option>
            ))}
          </select>
          {errors.license && <div className="invalid-feedback">{errors.license}</div>}
        </div>

        {/* Tags */}
        <div className="mb-3">
          <label htmlFor="tags" className="form-label">Tags <span style={{ color: 'red' }}>*</span></label>
          <select 
            name="tags" 
            className={`form-select ${errors.tags ? 'is-invalid' : ''}`} 
            multiple 
            value={formData.tags} 
            onChange={handleChange}
          >
            {uniqueTags.map((tag, index) => (
              <option key={index} value={tag}>{tag}</option>
            ))}
          </select>
          {errors.tags && <div className="invalid-feedback">{errors.tags}</div>}
        </div>

        {/* Types */}
        <div className="mb-3">
          <label htmlFor="type" className="form-label">Types <span style={{ color: 'red' }}>*</span></label>
          <select 
            name="type" 
            className={`form-select ${errors.type ? 'is-invalid' : ''}`} 
            multiple 
            value={formData.type} 
            onChange={handleChange}
          >
            {uniqueTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
          {errors.type && <div className="invalid-feedback">{errors.type}</div>}
        </div>

        {/* Publication Date */}
        <div className="mb-3">
          <label className="form-label">Publication Date (Optional)</label>
          <input 
            type="date" 
            className="form-control" 
            name="publication_date" 
            value={formData.publication_date} 
            onChange={handleChange}
            placeholder="Enter publication date"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default SubmitMaterials;
