import React, { useState } from "react";

export default function UserVerify() {
  const [pdf, setPdf] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (e) => setPdf(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    const data = new FormData();
    data.append("pdf", pdf);

    const res = await fetch("/api/certificates/verify", {
      method: "POST",
      body: data,
    });
    const result = await res.json();
    setResult(result);
  };

  return (
    <div>
      <h2>Verify Your Certificate PDF</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="file" accept="application/pdf" required onChange={handleChange} />
        <button type="submit">Verify</button>
      </form>
      {result && (
        <div style={{ marginTop: "1rem" }}>
          {result.valid ? (
            <div>
              <strong>Certificate is valid!</strong>
              <div>Name: {result.studentName}</div>
              <div>Course: {result.course}</div>
              <div>Issued: {new Date(result.issueDate).toLocaleDateString()}</div>
            </div>
          ) : (
            <div style={{ color: "red" }}>
              {result.message || "Certificate not found or invalid."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
