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
  // Form state holds all fields for the CV. Splitting the full name
  // into first and last name allows for more granular validation and
  // personalization. A country code select is provided for phone
  // numbers to encourage proper international formatting.
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    countryCode: "+31", // default to Netherlands
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
  // Track validation error messages for individual fields. Keys
  // correspond to form field names; values are the message to display.
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Handler for updating form state.
  /**
   * Validates a single field and returns an error message if invalid.
   * Empty strings indicate no error. Basic checks are applied here:
   * - First and last names must contain letters only
   * - Email must match a simple regex pattern
   * - Phone must be numeric
   */
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value.trim().length === 0
          ? "This field is required"
          : /[^a-zA-Z\s'-]/.test(value)
          ? "Only letters are allowed"
          : "";
      case "email":
        return value.trim().length === 0
          ? "Email is required"
          : !/^[\w.!#$%&'*+/=?^_`{|}~-]+@[\w-]+(?:\.[\w-]+)+$/.test(value)
          ? "Please enter a valid email address"
          : "";
      case "phone":
        return value.trim().length === 0
          ? "Phone number is required"
          : /[^0-9\s-]/.test(value)
          ? "Only digits, spaces and hyphens are allowed"
          : "";
      default:
        return "";
    }
  };

  // Update form state and validate the changed field
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Perform validation for the field if applicable
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
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
        {(form.firstName || form.lastName) && (
          <h1 className={styles.cvName}>
            {[form.firstName, form.lastName].filter(Boolean).join(" ")}
          </h1>
        )}
        {form.title && <h2 className={styles.cvTitle}>{form.title}</h2>}
        {(form.email || form.phone) && (
          <p className={styles.cvContact}>
            {form.email && <span>{form.email}</span>}
            {form.email && form.phone && " | "}
            {form.phone && (
              <span>
                {form.countryCode} {form.phone}
              </span>
            )}
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
    // Prevent progressing if there are validation errors on required fields.
    const hasErrors = Object.entries(errors).some(
      ([key, msg]) => msg && (step === 0 ? ["firstName", "lastName", "email", "phone"].includes(key) : true)
    );
    switch (step) {
      case 0:
        return (
          !form.firstName ||
          !form.lastName ||
          !form.title ||
          !form.email ||
          !form.phone ||
          hasErrors
        );
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
  }, [step, form, errors]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>CV Builder</h1>
        <p>Create your resume step by step. Fill each section and progress to the next.</p>
        {/* Step indicator */}
        <ol className={styles.progressBar}>
          {['Personal','Summary','Education','Experience','Skills','Preview'].map((label, idx) => {
            const state = step === idx ? 'active' : step > idx ? 'complete' : 'upcoming';
            return (
              <li
                key={label}
                className={`${styles.progressStep} ${styles[state]}`}
              >
                <span className={styles.stepCircle}>{idx + 1}</span>
                <span className={styles.stepLabel}>{label}</span>
              </li>
            );
          })}
        </ol>
        {/* Render the appropriate form step */}
        <div className={styles.formStep}>
          {step === 0 && (
            <>
              <h2>Personal Details</h2>
              <label>
                First Name
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? styles.invalid : ''}
                />
                {errors.firstName && (
                  <span className={styles.error}>{errors.firstName}</span>
                )}
              </label>
              <label>
                Last Name
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? styles.invalid : ''}
                />
                {errors.lastName && (
                  <span className={styles.error}>{errors.lastName}</span>
                )}
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
                  className={errors.email ? styles.invalid : ''}
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </label>
              <label>
                Phone
                <div className={styles.phoneGroup}>
                  <select
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleChange}
                  >
                    <option value="+31">+31 🇳🇱</option>
                    <option value="+1">+1 🇺🇸</option>
                    <option value="+44">+44 🇬🇧</option>
                    <option value="+33">+33 🇫🇷</option>
                    <option value="+49">+49 🇩🇪</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={errors.phone ? styles.invalid : ''}
                    placeholder="123 456 7890"
                  />
                </div>
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
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
