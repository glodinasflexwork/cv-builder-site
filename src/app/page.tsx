"use client";

import { useState, useMemo } from "react";
import styles from "./page.module.css";

/**
 * A multi‑step CV builder. This component guides the user through
 * the resume creation process one section at a time. Users can navigate
 * between steps, pick from simple templates and export their CV to PDF.
 */
export default function Home() {
  // Form state holds all fields for the CV. Extra properties like
  // template and additional optional sections are included here.
  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    summary: "",
    education: "",
    experience: "",
    skills: "",
    languages: "",
    hobbies: "",
    template: "professional", // default template
  });
  // Current step in the wizard (0‑5). 0: personal, 1: summary,
  // 2: education, 3: experience, 4: skills & extras, 5: preview.
  const [step, setStep] = useState(0);
  // Handler for updating form state.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  // Advance to the next step if possible.
  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  // Go back to the previous step.
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Generate a formatted preview of the CV based on the selected template.
  const preview = useMemo(() => {
    return (
      <div
        id="cvPreview"
        className={`${styles.preview} ${styles[form.template] || ""}`}
      >
        {/* Header */}
        {form.name && <h1 className={styles.cvName}>{form.name}</h1>}
        {form.title && <h2 className={styles.cvTitle}>{form.title}</h2>}
        {(form.email || form.phone) && (
          <p className={styles.cvContact}>
            {form.email && <span>{form.email}</span>}
            {form.email && form.phone && " | "}
            {form.phone && <span>{form.phone}</span>}
          </p>
        )}
        {/* Summary */}
        {form.summary && (
          <section className={styles.cvSection}>
            <h3>Summary</h3>
            <p>{form.summary}</p>
          </section>
        )}
        {/* Education */}
        {form.education && (
          <section className={styles.cvSection}>
            <h3>Education</h3>
            <p>{form.education}</p>
          </section>
        )}
        {/* Experience */}
        {form.experience && (
          <section className={styles.cvSection}>
            <h3>Experience</h3>
            <p>{form.experience}</p>
          </section>
        )}
        {/* Skills */}
        {form.skills && (
          <section className={styles.cvSection}>
            <h3>Skills</h3>
            <p>{form.skills}</p>
          </section>
        )}
        {/* Languages */}
        {form.languages && (
          <section className={styles.cvSection}>
            <h3>Languages</h3>
            <p>{form.languages}</p>
          </section>
        )}
        {/* Hobbies */}
        {form.hobbies && (
          <section className={styles.cvSection}>
            <h3>Hobbies</h3>
            <p>{form.hobbies}</p>
          </section>
        )}
      </div>
    );
  }, [form]);

  // Export the current CV preview to PDF using html2canvas and jspdf.
  const exportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const html2canvas = (await import("html2canvas")).default;
    const input = document.getElementById("cvPreview");
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "px", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("resume.pdf");
  };

  // Year for footer copyright.
  const currentYear = new Date().getFullYear();

  // Determine whether the "Next" button should be disabled on each step.
  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 0:
        return !form.name || !form.title || !form.email || !form.phone;
      case 1:
        return !form.summary;
      case 2:
        return !form.education;
      case 3:
        return !form.experience;
      case 4:
        return !form.skills;
      default:
        return false;
    }
  }, [step, form]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>CV Builder</h1>
        <p>Create your resume step by step. Fill each section and progress to the next.</p>
        {/* Step indicator */}
        <ol className={styles.progressBar}>
          {['Personal','Summary','Education','Experience','Skills','Preview'].map((label, idx) => (
            <li
              key={label}
              className={`${styles.progressStep} ${step === idx ? styles.activeStep : step > idx ? styles.completeStep : ''}`}
            >
              {label}
            </li>
          ))}
        </ol>
        {/* Render the appropriate form step */}
        <div className={styles.formStep}>
          {step === 0 && (
            <>
              <h2>Personal Details</h2>
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
            </>
          )}
          {step === 1 && (
            <>
              <h2>Professional Summary</h2>
              <label>
                Summary
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Briefly describe your experience and career goals"
                />
              </label>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Education</h2>
              <label>
                Education
                <textarea
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  rows={4}
                  placeholder="List degrees, institutions and dates"
                />
              </label>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Experience</h2>
              <label>
                Experience
                <textarea
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe roles, responsibilities and achievements"
                />
              </label>
            </>
          )}
          {step === 4 && (
            <>
              <h2>Skills & More</h2>
              <label>
                Skills
                <textarea
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List your key skills separated by commas"
                />
              </label>
              <label>
                Languages (optional)
                <textarea
                  name="languages"
                  value={form.languages}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. English (native), Dutch (fluent)"
                />
              </label>
              <label>
                Hobbies (optional)
                <textarea
                  name="hobbies"
                  value={form.hobbies}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Photography, cycling, volunteering"
                />
              </label>
              <label>
                Template Style
                <select
                  name="template"
                  value={form.template}
                  onChange={handleChange}
                >
                  <option value="professional">Professional</option>
                  <option value="minimal">Minimal</option>
                  <option value="modern">Modern</option>
                </select>
              </label>
            </>
          )}
          {step === 5 && (
            <>
              <h2>Preview & Export</h2>
              {preview}
              <button className={styles.exportBtn} onClick={exportPDF}>Export to PDF</button>
            </>
          )}
        </div>
        {/* Navigation buttons */}
        <div className={styles.buttons}>
          {step > 0 && step < 5 && (
            <button onClick={prevStep} className={styles.navBtn}>Back</button>
          )}
          {step < 5 && (
            <button
              onClick={nextStep}
              className={styles.navBtn}
              disabled={isNextDisabled}
            >
              {step === 4 ? "Preview" : "Next"}
            </button>
          )}
        </div>
      </main>
      <footer className={styles.footer}>
        <span>&copy; {currentYear} CV Builder</span>
      </footer>
    </div>
  );
}
