import { useState } from 'react';
import axios from 'axios';

const VerificationPage = () => {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);

  const verifyCertificate = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/certificates/verify/${certId}`);
      setResult(response.data);
    } catch (error) {
      setResult({ error: 'Certificate not found' });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Certificate Verification</h1>
      <div className="flex">
        <input
          type="text"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="Enter Certificate ID"
          className="flex-grow p-2 border rounded-l"
        />
        <button 
          onClick={verifyCertificate}
          className="bg-blue-500 text-white p-2 rounded-r"
        >
          Verify
        </button>
      </div>
      
      {result && (
        <div className={`mt-4 p-4 ${result.error ? 'bg-red-100' : 'bg-green-100'} rounded`}>
          {result.error ? (
            <p>{result.error}</p>
          ) : (
            <>
              <p className="font-bold">Certificate Valid: {result.valid ? 'Yes' : 'No'}</p>
              <p>Student: {result.studentName}</p>
              <p>Course: {result.course}</p>
              <p>Issued: {new Date(result.issueDate).toLocaleDateString()}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
