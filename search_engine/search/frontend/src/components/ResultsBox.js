import React from 'react';
import { Card } from 'react-bootstrap';

const ResultsBox = ({ title, url, authors, description, license, type, tags, highlights }) => {
  // Filter highlights to exclude non-relevant fields
  const relevantHighlights = highlights.filter(
    highlight => typeof highlight === 'string' && highlight.trim().length > 0
  );

  // Function to highlight search terms or selected filters in the text
  const highlightText = (text, highlights) => {
    if (!text) return text;

    if (highlights.length === 0) return text; // No valid highlights to apply

    const regex = new RegExp(`(${highlights.join('|')})`, 'gi');
    return text.split(regex).map((part, i) =>
      highlights.some(highlight => part.toLowerCase() === highlight.toLowerCase()) ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  };

  // Safely format authors and tags
  const formattedAuthors = Array.isArray(authors) ? authors.join('; ') : authors || 'N/A';
  const formattedTags = tags ? tags.join(', ') : 'N/A';

  // Determine if URL is a single link or a list of links
  const urls = Array.isArray(url) ? url : [url];
  const mainUrl = urls[0];
  const additionalUrls = urls.slice(1);

  return (
    <Card className="mb-3 shadow-lg" style={{ borderRadius: '8px', overflow: 'hidden', border: '0.3px solid #ddd' }}>
      <Card.Body>
        {/* Clickable title integrated with the main URL */}
        <Card.Title>
          {mainUrl ? (
            <a href={mainUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: '#1a0dab', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {highlightText(title, relevantHighlights)}
            </a>
          ) : (
            title
          )}
        </Card.Title>

        {/* Additional links */}
        {additionalUrls.length > 0 && (
          <Card.Text style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
            <strong>Additional links:</strong>{' '}
            {additionalUrls.map((link, index) => (
              <span key={index}>
                <a href={link} target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px' }}>
                  {link}
                </a>
              </span>
            ))}
          </Card.Text>
        )}

        {/* Authors */}
        <Card.Text style={{ color: '#333', marginBottom: '10px' }}>
          <strong>Authors:</strong> {highlightText(formattedAuthors, relevantHighlights)}
        </Card.Text>

        {/* Other fields */}
        <Card.Text style={{ color: '#333', marginBottom: '10px' }}>
          <strong>License:</strong> {license || 'N/A'}
        </Card.Text>
        <Card.Text style={{ color: '#333', marginBottom: '10px' }}>
          <strong>Type:</strong> {type || 'N/A'}
        </Card.Text>
        <Card.Text style={{ color: '#333', marginBottom: '10px' }}>
          <strong>Tags:</strong> {highlightText(formattedTags, relevantHighlights)}
        </Card.Text>
        <Card.Text style={{ color: '#333', fontSize: '0.9rem', marginBottom: '0' }}>
          <strong>Abstract:</strong> {description || 'N/A'}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ResultsBox;
