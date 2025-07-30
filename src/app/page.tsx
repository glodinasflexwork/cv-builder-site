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
    /**
     * Dynamic lists for structured resume sections. Instead of storing
     * large text blobs, the app now captures structured data for education
     * and work history. Each education entry includes a degree, institution
     * and year range. Each experience entry includes a role, company,
     * period and description. Skills, languages and hobbies are stored as
     * arrays of simple values or objects. This design simplifies editing
     * and produces cleaner output in the preview and PDF.
     */
    educationList: [] as { institution: string; degree: string; year: string }[],
    experienceList: [] as { role: string; company: string; period: string; description: string }[],
    skillsList: [] as string[],
    languagesList: [] as { language: string; level: string }[],
    hobbiesList: [] as string[],
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

  /**
   * Language list management helpers
   * Each language entry has a `language` and `level` property. Use these
   * helpers to add, update and remove languages. When adding from suggestions
   * the default level is set to "Fluent".
   */
  const addLanguage = () => {
    setForm((prev) => ({
      ...prev,
      languagesList: [...prev.languagesList, { language: "", level: "" }],
    }));
  };
  const updateLanguage = (
    index: number,
    key: "language" | "level",
    value: string
  ) => {
    setForm((prev) => {
      const newList = prev.languagesList.map((item, idx) =>
        idx === index ? { ...item, [key]: value } : item
      );
      return { ...prev, languagesList: newList };
    });
  };
  const removeLanguage = (index: number) => {
    setForm((prev) => {
      const newList = prev.languagesList.filter((_, idx) => idx !== index);
      return { ...prev, languagesList: newList };
    });
  };

  /**
   * Education list management helpers
   * Each education entry captures a degree (e.g. BSc Computer Science), the
   * institution and the year or year range (e.g. 2018–2022). Adding and
   * removing entries allows users to list multiple degrees or programs.
   */
  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      educationList: [
        ...prev.educationList,
        { institution: "", degree: "", year: "" },
      ],
    }));
  };
  const updateEducation = (
    index: number,
    key: "institution" | "degree" | "year",
    value: string
  ) => {
    setForm((prev) => {
      const newList = prev.educationList.map((item, idx) =>
        idx === index ? { ...item, [key]: value } : item
      );
      return { ...prev, educationList: newList };
    });
  };
  const removeEducation = (index: number) => {
    setForm((prev) => {
      const newList = prev.educationList.filter((_, idx) => idx !== index);
      return { ...prev, educationList: newList };
    });
  };

  /**
   * Experience list management helpers
   * Each experience entry captures a job role, company, period (e.g. 2021–2023)
   * and a brief description of responsibilities or achievements. Users can
   * add multiple positions and remove them as needed.
   */
  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experienceList: [
        ...prev.experienceList,
        { role: "", company: "", period: "", description: "" },
      ],
    }));
  };
  const updateExperience = (
    index: number,
    key: "role" | "company" | "period" | "description",
    value: string
  ) => {
    setForm((prev) => {
      const newList = prev.experienceList.map((item, idx) =>
        idx === index ? { ...item, [key]: value } : item
      );
      return { ...prev, experienceList: newList };
    });
  };
  const removeExperience = (index: number) => {
    setForm((prev) => {
      const newList = prev.experienceList.filter((_, idx) => idx !== index);
      return { ...prev, experienceList: newList };
    });
  };

  /**
   * Skills list management helpers
   * Store skills as a simple string array. Users can add skills via an
   * input field or by selecting from the suggestion list. Removing a
   * skill removes it from the array.
   */
  const addSkill = (skill: string) => {
    setForm((prev) => {
      // Avoid duplicates (case-insensitive)
      const exists = prev.skillsList.some((s) => s.toLowerCase() === skill.toLowerCase());
      if (exists || !skill.trim()) return prev;
      return { ...prev, skillsList: [...prev.skillsList, skill.trim()] };
    });
  };
  const removeSkill = (index: number) => {
    setForm((prev) => {
      const newList = prev.skillsList.filter((_, idx) => idx !== index);
      return { ...prev, skillsList: newList };
    });
  };

  /**
   * Hobby list management helpers
   * Similar to skills, hobbies are stored as a simple string array. Users
   * can add hobbies via an input or pick from suggestions.
   */
  const addHobby = (hobby: string) => {
    setForm((prev) => {
      const exists = prev.hobbiesList.some((h) => h.toLowerCase() === hobby.toLowerCase());
      if (exists || !hobby.trim()) return prev;
      return { ...prev, hobbiesList: [...prev.hobbiesList, hobby.trim()] };
    });
  };
  const removeHobby = (index: number) => {
    setForm((prev) => {
      const newList = prev.hobbiesList.filter((_, idx) => idx !== index);
      return { ...prev, hobbiesList: newList };
    });
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
        {form.educationList.length > 0 && (
          <section className={styles.cvSection}>
            <h3>Education</h3>
            {form.educationList.map((edu, idx) => (
              <p key={idx}>
                <strong>{edu.degree}</strong>, {edu.institution}
                {edu.year && ` (${edu.year})`}
              </p>
            ))}
          </section>
        )}
        {/* Experience */}
        {form.experienceList.length > 0 && (
          <section className={styles.cvSection}>
            <h3>Experience</h3>
            {form.experienceList.map((exp, idx) => (
              <p key={idx}>
                <strong>{exp.role}</strong>, {exp.company}
                {exp.period && ` (${exp.period})`}
                {exp.description && `\n${exp.description}`}
              </p>
            ))}
          </section>
        )}
        {/* Skills */}
        {form.skillsList.length > 0 && (
          <section className={styles.cvSection}>
            <h3>Skills</h3>
            <p>{form.skillsList.join(", ")}</p>
          </section>
        )}
        {/* Languages */}
        {form.languagesList.length > 0 && (
          <section className={styles.cvSection}>
            <h3>Languages</h3>
            <p>
              {form.languagesList
                .map((lang) =>
                  lang.language
                    ? `${lang.language}${lang.level ? ` (${lang.level})` : ""}`
                    : ""
                )
                .filter(Boolean)
                .join(", ")}
            </p>
          </section>
        )}
        {/* Hobbies */}
        {form.hobbiesList.length > 0 && (
          <section className={styles.cvSection}>
            <h3>Hobbies</h3>
            <p>{form.hobbiesList.join(", ")}</p>
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
    // Create an A4 portrait PDF with pixel units for precise sizing.
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
    const margin = 40; // uniform margins around the page
    let pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    let pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    // If the generated image is taller than the page, scale it down to fit
    if (pdfHeight > pageHeight) {
      const scale = pageHeight / pdfHeight;
      pdfWidth *= scale;
      pdfHeight = pageHeight;
    }
    pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);
    pdf.save("resume.pdf");
  };

  // Year for footer copyright.
  const currentYear = new Date().getFullYear();

  // Predefined suggestions for the professional summary. These sample
  // descriptions follow guidance from resume writing resources: use strong
  // action verbs and highlight achievements and experience. Users can
  // select one of these templates to quickly populate their summary.
  const summarySuggestions: string[] = [
    "Results‑oriented professional with over 5 years of experience driving cross‑functional teams to deliver high‑impact projects on time and within budget.",
    "Detail‑oriented specialist skilled in data analysis and process optimization; adept at using insights to streamline operations and improve efficiency.",
    "Creative problem solver with a proven track record of developing innovative solutions that increase revenue and enhance customer satisfaction."
  ];
  // Show/hide flag for summary suggestion list.
  const [showSummarySuggestions, setShowSummarySuggestions] = useState(false);

  // Suggestions for skills, languages and hobbies. Research shows that the most
  // in‑demand soft skills include communication, teamwork, problem‑solving,
  // leadership, adaptability, creativity, time management, interpersonal
  // skills, work ethic and attention to detail【391520590269652†L139-L152】. For
  // hobbies, volunteering/community involvement, writing, blogging, learning
  // languages, photography, travel, sports, reading, making music, yoga, art
  // and dance are recommended because they convey transferable skills like
  // empathy, communication, creativity and adaptability【467089876964209†L170-L301】.
  // Language suggestions include some of the most requested languages in job
  // postings – French, Spanish and Chinese (Mandarin/Cantonese)【442256276186923†L33-L39】 –
  // along with other common European languages to give users a starting point.
  const skillSuggestions: string[] = [
    "Communication",
    "Teamwork",
    "Problem-solving",
    "Leadership",
    "Adaptability",
    "Creativity",
    "Time management",
    "Attention to detail",
    "Interpersonal skills",
    "Work ethic",
  ];
  const languageSuggestions: string[] = [
    "English (native)",
    "French (fluent)",
    "Spanish (fluent)",
    "Chinese – Mandarin (conversational)",
    "German (intermediate)",
    "Dutch (basic)",
    "Italian (intermediate)",
  ];
  const hobbySuggestions: string[] = [
    "Volunteering",
    "Writing",
    "Blogging",
    "Learning languages",
    "Photography",
    "Traveling",
    "Sports (e.g. soccer)",
    "Reading",
    "Making music",
    "Yoga",
    "Art",
    "Dance",
  ];
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
  const [showHobbySuggestions, setShowHobbySuggestions] = useState(false);

  // Temporary input states for adding skills and hobbies. These store the
  // value typed into the input before it is added to the corresponding list.
  const [newSkill, setNewSkill] = useState("");
  const [newHobby, setNewHobby] = useState("");

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
        // Require at least one education entry before proceeding
        return form.educationList.length === 0;
      case 3:
        // Require at least one experience entry
        return form.experienceList.length === 0;
      case 4:
        // Require at least one skill entry
        return form.skillsList.length === 0;
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
              {/* Toggle to display helpful summary suggestions. Providing pre‑written
                  content helps users get started, as recommended by resume
                  builder best practices【864196423349143†L96-L117】. */}
              <button
                type="button"
                className={styles.suggestionBtn}
                onClick={() => setShowSummarySuggestions((show) => !show)}
              >
                {showSummarySuggestions ? "Hide" : "Show"} Suggestions
              </button>
              {showSummarySuggestions && (
                <ul className={styles.suggestionsList}>
                  {summarySuggestions.map((text, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, summary: text }));
                        setShowSummarySuggestions(false);
                      }}
                    >
                      {text}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <h2>Education</h2>
              {form.educationList.map((edu, idx) => (
                <div key={idx} className={styles.eduRow}>
                  <input
                    type="text"
                    placeholder="Degree (e.g. BSc Computer Science)"
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                  />
                    <input
                      type="text"
                      placeholder="Institution (e.g. University of Amsterdam)"
                      value={edu.institution}
                      onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Year or range (e.g. 2018–2022)"
                      value={edu.year}
                      onChange={(e) => updateEducation(idx, "year", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className={styles.removeBtn}
                    >
                      &times;
                    </button>
                </div>
              ))}
              <button type="button" className={styles.addBtn} onClick={addEducation}>
                + Add Education
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Experience</h2>
              {form.experienceList.map((exp, idx) => (
                <div key={idx} className={styles.expRow}>
                  <input
                    type="text"
                    placeholder="Role (e.g. Software Engineer)"
                    value={exp.role}
                    onChange={(e) => updateExperience(idx, "role", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Company (e.g. TechCorp)"
                    value={exp.company}
                    onChange={(e) => updateExperience(idx, "company", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Period (e.g. 2020–2023)"
                    value={exp.period}
                    onChange={(e) => updateExperience(idx, "period", e.target.value)}
                  />
                  <textarea
                    placeholder="Description (brief overview of responsibilities)"
                    value={exp.description}
                    onChange={(e) => updateExperience(idx, "description", e.target.value)}
                    rows={3}
                  />
                  <button
                    type="button"
                    onClick={() => removeExperience(idx)}
                    className={styles.removeBtn}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button type="button" className={styles.addBtn} onClick={addExperience}>
                + Add Experience
              </button>
            </>
          )}
          {step === 4 && (
            <>
              <h2>Skills & More</h2>
              <div className={styles.skillSection}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>Skills</span>
                {/* List of added skills with remove buttons */}
                <div className={styles.skillList}>
                  {form.skillsList.map((skill, idx) => (
                    <span key={idx} className={styles.skillChip}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className={styles.removeChipBtn}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                {/* Input field to add a new skill */}
                <input
                  type="text"
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(newSkill);
                      setNewSkill('');
                    }
                  }}
                />
                {/* Button to toggle suggestions for skills */}
                <button
                  type="button"
                  className={styles.suggestionBtn}
                  onClick={() => setShowSkillSuggestions((show) => !show)}
                >
                  {showSkillSuggestions ? 'Hide' : 'Show'} Skill Suggestions
                </button>
                {showSkillSuggestions && (
                  <ul className={styles.suggestionsList}>
                    {skillSuggestions.map((skill, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          addSkill(skill);
                          setShowSkillSuggestions(false);
                        }}
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Languages section is now a dynamic list of entries with a
                  language name and proficiency level. Users can add multiple
                  languages and select their level. */}
              <div className={styles.langSection}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>Languages (optional)</span>
                {form.languagesList.map((lang, idx) => (
                  <div key={idx} className={styles.langRow}>
                    <input
                      type="text"
                      placeholder="Language"
                      value={lang.language}
                      onChange={(e) => updateLanguage(idx, "language", e.target.value)}
                    />
                    <select
                      value={lang.level}
                      onChange={(e) => updateLanguage(idx, "level", e.target.value)}
                    >
                      <option value="">Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native">Native</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeLanguage(idx)}
                      className={styles.removeBtn}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={addLanguage}
                >
                  + Add Language
                </button>
                <button
                  type="button"
                  className={styles.suggestionBtn}
                  onClick={() => setShowLanguageSuggestions((show) => !show)}
                >
                  {showLanguageSuggestions ? "Hide" : "Show"} Language Suggestions
                </button>
                {showLanguageSuggestions && (
                  <ul className={styles.suggestionsList}>
                    {languageSuggestions.map((lang, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          // Only add if not already present (case‑insensitive)
                          setForm((prev) => {
                            const existing = prev.languagesList.map((l) => l.language.toLowerCase());
                            if (existing.includes(lang.split(" ")[0].toLowerCase())) return prev;
                            return {
                              ...prev,
                              languagesList: [
                                ...prev.languagesList,
                                { language: lang.split(" – ")[0].split(" (")[0], level: "Fluent" },
                              ],
                            };
                          });
                          setShowLanguageSuggestions(false);
                        }}
                      >
                        {lang}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.hobbySection}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>Hobbies (optional)</span>
                {/* List of added hobbies */}
                <div className={styles.hobbyList}>
                  {form.hobbiesList.map((hobby, idx) => (
                    <span key={idx} className={styles.hobbyChip}>
                      {hobby}
                      <button
                        type="button"
                        onClick={() => removeHobby(idx)}
                        className={styles.removeChipBtn}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                {/* Input to add a hobby */}
                <input
                  type="text"
                  placeholder="Add a hobby"
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addHobby(newHobby);
                      setNewHobby('');
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.suggestionBtn}
                  onClick={() => setShowHobbySuggestions((show) => !show)}
                >
                  {showHobbySuggestions ? 'Hide' : 'Show'} Hobby Suggestions
                </button>
                {showHobbySuggestions && (
                  <ul className={styles.suggestionsList}>
                    {hobbySuggestions.map((hobby, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          addHobby(hobby);
                          setShowHobbySuggestions(false);
                        }}
                      >
                        {hobby}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <label>
                Template Style
                <select
                  name="template"
                  value={form.template}
                  onChange={handleChange}
                >
                  {/* Provide three distinct templates for different tastes. */}
                  <option value="professional">Professional</option>
                  <option value="classic">Classic</option>
                  <option value="creative">Creative</option>
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
