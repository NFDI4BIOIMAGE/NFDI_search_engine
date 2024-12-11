import React from 'react';
import { Card } from 'react-bootstrap';

const ResultsBox = ({ title, url, authors, description, license, type, tags, highlights }) => {
  // Ensure authors and tags are arrays or strings
  const itemAuthors = Array.isArray(authors) ? authors : (typeof authors === 'string' ? [authors] : []);
  const itemTags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? [tags] : []);

  const relevantHighlights = highlights.filter(
    highlight => typeof highlight === 'string' && highlight.trim().length > 0
  );

  // Function to highlight search terms or selected filters in the text
  const highlightText = (text, highlights) => {
    if (!text) return text;
    if (highlights.length === 0) return text;

    const regex = new RegExp(`(${highlights.join('|')})`, 'gi');
    return text.split(regex).map((part, i) =>
      highlights.some(highlight => part.toLowerCase() === highlight.toLowerCase()) ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  };

  const formattedAuthors = itemAuthors.length > 0 ? itemAuthors.join('; ') : 'N/A';
  const formattedTags = itemTags.length > 0 ? itemTags.join(', ') : 'N/A';

  // Ensure URLs is always an array
  const urls = Array.isArray(url) ? url : (url ? [url] : []);
  const mainUrl = urls[0];
  const additionalUrls = urls.slice(1);

  return (
    <Card className="mb-3 shadow-lg" style={{ borderRadius: '8px', overflow: 'hidden', border: '0.3px solid #ddd' }}>
      <Card.Body>
        <Card.Title>
          {mainUrl ? (
            <a href={mainUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: '#1a0dab', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {highlightText(title, relevantHighlights)}
            </a>
          ) : (
            highlightText(title, relevantHighlights)
          )}
        </Card.Title>

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

        <Card.Text style={{ color: '#333', marginBottom: '10px' }}>
          <strong>Authors:</strong> {highlightText(formattedAuthors, relevantHighlights)}
        </Card.Text>

        <Card.Text style={{ color: '#333', marginBottom: '10px' }}>
          <strong>License:</strong>{' '}
          {Array.isArray(license) ? license.join(', ') : (license || 'N/A')}
        </Card.Text>

        <Card.Text style={{ color: '#333', marginBottom: '10px' }}>
          <strong>Type:</strong>{' '}
          {Array.isArray(type) ? type.join(', ') : (type || 'N/A')}
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
