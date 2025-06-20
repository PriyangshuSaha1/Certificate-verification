import React, { useState } from "react";

export default function AdminUpload() {
  const [form, setForm] = useState({
    certificateId: "",
    studentName: "",
    course: "",
    pdf: null,
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "pdf") {
      setForm({ ...form, pdf: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const data = new FormData();
    data.append("certificateId", form.certificateId);
    data.append("studentName", form.studentName);
    data.append("course", form.course);
    data.append("pdf", form.pdf);

    const res = await fetch("/api/certificates/upload", {
      method: "POST",
      body: data,
    });
    const result = await res.json();
    setMsg(result.message || (res.ok ? "Uploaded!" : "Error"));
  };

  return (
    <div>
      <h2>Admin: Upload Certificate PDF</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input name="certificateId" placeholder="Certificate ID" required onChange={handleChange} />
        <input name="studentName" placeholder="Student Name" required onChange={handleChange} />
        <input name="course" placeholder="Course" required onChange={handleChange} />
        <input type="file" name="pdf" accept="application/pdf" required onChange={handleChange} />
        <button type="submit">Upload</button>
      </form>
      {msg && <div>{msg}</div>}
    </div>
  );
}
