import React, { useState } from "react";

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setResult(null);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await fetch('/api/certificates/verify', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({
        valid: false,
        message: 'Error occurred while verifying certificate'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Certificate Verification</h1>
        <p className="subtitle">
          Upload your certificate PDF to verify its authenticity through online databases
        </p>
      </div>

      <form onSubmit={handleVerify}>
        <div className="upload-section">
          <h3>Upload Certificate PDF</h3>
          <p>Select a PDF file containing your certificate</p>
          
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="file-input"
            required
          />
          
          {selectedFile && (
            <p style={{ color: '#4299e1', marginTop: '0.5rem' }}>
              Selected: {selectedFile.name}
            </p>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="verify-btn" disabled={loading}>
              {loading && <span className="spinner"></span>}
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </div>
        </div>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          Processing your certificate and checking online databases...
        </div>
      )}

      {result && (
        <div className={`result-section ${result.valid ? 'result-valid' : 'result-invalid'}`}>
          <div className="result-header">
            {result.valid ? '✅ Certificate Verified' : '❌ Certificate Not Found'}
          </div>
          
          <p>{result.message}</p>
          
          {result.valid && (
            <div className="info-grid">
              {result.certificateNumber && (
                <div className="info-item">
                  <div className="info-label">Certificate Number</div>
                  <div>{result.certificateNumber}</div>
                </div>
              )}
              
              {result.studentName && (
                <div className="info-item">
                  <div className="info-label">Student Name</div>
                  <div>{result.studentName}</div>
                </div>
              )}
              
              {result.institution && (
                <div className="info-item">
                  <div className="info-label">Institution</div>
                  <div>{result.institution}</div>
                </div>
              )}
              
              {result.course && (
                <div className="info-item">
                  <div className="info-label">Course</div>
                  <div>{result.course}</div>
                </div>
              )}
            </div>
          )}
          
          {result.verificationSources && result.verificationSources.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div className="info-label">Verified By:</div>
              <ul className="sources-list">
                {result.verificationSources.map((source, index) => (
                  <li key={index}>
                    <strong>{source.source}</strong>
                    {source.details && (
                      <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Status: {source.details.status}
                        {source.details.issuingAuthority && (
                          <>
                            <br />
                            Authority: {source.details.issuingAuthority}
                          </>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
