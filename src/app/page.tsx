"use client";

import { useState } from "react";
import styles from "./page.module.css";

// A simple CV builder. Users can enter their personal and professional
// information and see a live preview of the resulting CV. This page
// runs entirely on the client side so it must be marked with
// `'use client'` at the top.
export default function Home() {
  // Form state holds all of the fields for the CV.  Each key corresponds
  // to an input's `name` attribute below.
  const [form, setForm] = useState({
    name: "",
    title: "",
    summary: "",
    email: "",
    phone: "",
    education: "",
    experience: "",
    skills: "",
  });

  // Generic change handler that updates the appropriate field in the form
  // based on the name of the input element. Spread the previous state to
  // maintain other values.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>CV Builder</h1>
        <p>Fill out the fields below to create your own curriculum vitae.</p>
        <div className={styles.form}>
          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </label>
          <label>
            Professional Title
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Phone
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </label>
          <label>
            Summary
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              rows={3}
            />
          </label>
          <label>
            Education
            <textarea
              name="education"
              value={form.education}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Bachelor of Science in Computer Science, University X"
            />
          </label>
          <label>
            Experience
            <textarea
              name="experience"
              value={form.experience}
              onChange={handleChange}
              rows={4}
              placeholder="e.g. Software Engineer at Company Y (2020–2024)"
            />
          </label>
          <label>
            Skills
            <textarea
              name="skills"
              value={form.skills}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. TypeScript, React, Node.js"
            />
          </label>
        </div>
        <h2>Preview</h2>
        <div className={styles.preview}>
          {form.name && <h3>{form.name}</h3>}
          {form.title && <p className={styles.title}>{form.title}</p>}
          {(form.email || form.phone) && (
            <p className={styles.contact}>
              {form.email && <span>{form.email}</span>}
              {form.email && form.phone && " | "}
              {form.phone && <span>{form.phone}</span>}
            </p>
          )}
          {form.summary && (
            <>
              <h4>Summary</h4>
              <p>{form.summary}</p>
            </>
          )}
          {form.education && (
            <>
              <h4>Education</h4>
              <p>{form.education}</p>
            </>
          )}
          {form.experience && (
            <>
              <h4>Experience</h4>
              <p>{form.experience}</p>
            </>
          )}
          {form.skills && (
            <>
              <h4>Skills</h4>
              <p>{form.skills}</p>
            </>
          )}
        </div>
      </main>
      <footer className={styles.footer}>
        <span>&copy; {currentYear} CV Builder</span>
      </footer>
    </div>
  );
}
