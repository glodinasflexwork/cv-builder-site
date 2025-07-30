"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import styles from "./page.module.css";

/**
 * A multi‑step CV builder. This component guides the user through
 * the resume creation process one section at a time. Users can navigate
 * between steps, pick from simple templates and export their CV to PDF.
 */
export default function Home() {
  // Define the initial form structure outside of state so it can be reused
  // when resetting the form. This includes all default values.
  const initialForm = {
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    countryCode: "+31",
    phone: "",
    summary: "",
    educationList: [] as { institution: string; degree: string; year: string }[],
    experienceList: [] as { role: string; company: string; period: string; description: string }[],
    skillsList: [] as string[],
    languagesList: [] as { language: string; level: string }[],
    hobbiesList: [] as string[],
    projectsList: [] as { title: string; description: string; url?: string }[],
    certificationsList: [] as { name: string; issuer: string; year: string }[],
    linkedin: "",
    website: "",
    accentColor: "#0070f3",
    template: "professional",
    fontFamily: "sans",
    profileImage: null as string | null,
  };

  // Form state holds all fields for the CV. Extra properties like
  // template and additional optional sections are included here.
  // Form state holds all fields for the CV. Splitting the full name
  // into first and last name allows for more granular validation and
  // personalization. A country code select is provided for phone
  // numbers to encourage proper international formatting.
  const [form, setForm] = useState(initialForm);
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
      case "linkedin":
      case "website":
        // Optional fields: if provided, validate basic URL pattern
        if (!value.trim()) return "";
        // Simple URL validation: must start with http(s) and contain at least one dot
        return /^https?:\/\/.+\..+/.test(value)
          ? ""
          : "Please enter a valid URL (starting with http(s)://)";
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
    // When adding a new experience, also push a false flag to the suggestion toggles
    setExpSugToggles((prev) => [...prev, false]);
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
    // Remove the corresponding toggle entry as well
    setExpSugToggles((prev) => prev.filter((_, idx) => idx !== index));
  };

  /**
   * Helpers to reorder items within dynamic lists. Users may want to
   * reorder education, experience, projects or certifications entries.
   * These helpers move an item up or down within its list.
   */
  const moveEducationEntry = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const list = [...prev.educationList];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(newIndex, 0, item);
      return { ...prev, educationList: list };
    });
  };
  const moveExperienceEntry = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const list = [...prev.experienceList];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(newIndex, 0, item);
      return { ...prev, experienceList: list };
    });
    // Also reorder the corresponding suggestion toggle array
    setExpSugToggles((prev) => {
      const arr = [...prev];
      const [flag] = arr.splice(index, 1);
      arr.splice(index + direction, 0, flag);
      return arr;
    });
  };
  const moveProjectEntry = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const list = [...prev.projectsList];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(newIndex, 0, item);
      return { ...prev, projectsList: list };
    });
  };
  const moveCertificationEntry = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const list = [...prev.certificationsList];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(newIndex, 0, item);
      return { ...prev, certificationsList: list };
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

  /**
   * Handle profile image uploads. Convert the selected file into a base64
   * data URL and store it in the form state. Only the first file is used.
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (typeof result === 'string') {
        setForm((prev) => ({ ...prev, profileImage: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Projects list management helpers
   * Each project entry includes a title and description. This allows
   * candidates to highlight personal or professional projects such as
   * open‑source contributions, hackathon apps, or side businesses.
   */
  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projectsList: [...prev.projectsList, { title: "", description: "", url: "" }],
    }));
  };
  const updateProject = (
    index: number,
    key: "title" | "description" | "url",
    value: string
  ) => {
    setForm((prev) => {
      const newList = prev.projectsList.map((proj, idx) =>
        idx === index ? { ...proj, [key]: value } : proj
      );
      return { ...prev, projectsList: newList };
    });
  };
  const removeProject = (index: number) => {
    setForm((prev) => {
      const newList = prev.projectsList.filter((_, idx) => idx !== index);
      return { ...prev, projectsList: newList };
    });
  };

  /**
   * Certifications list management helpers
   * Each certification includes a name, issuer and year. Users can
   * document professional certifications, courses or credentials.
   */
  const addCertification = () => {
    setForm((prev) => ({
      ...prev,
      certificationsList: [
        ...prev.certificationsList,
        { name: "", issuer: "", year: "" },
      ],
    }));
  };
  const updateCertification = (
    index: number,
    key: "name" | "issuer" | "year",
    value: string
  ) => {
    setForm((prev) => {
      const newList = prev.certificationsList.map((cert, idx) =>
        idx === index ? { ...cert, [key]: value } : cert
      );
      return { ...prev, certificationsList: newList };
    });
  };
  const removeCertification = (index: number) => {
    setForm((prev) => {
      const newList = prev.certificationsList.filter((_, idx) => idx !== index);
      return { ...prev, certificationsList: newList };
    });
  };

  // Maintain the order in which CV sections appear in the preview. Users can
  // reorder this list via simple up/down controls. The default order is
  // education, experience, skills, languages and hobbies. Placing this
  // declaration here ensures it is available when defining the preview
  // component below.
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'education',
    'experience',
    'projects',
    'certifications',
    'skills',
    'languages',
    'hobbies',
  ]);

  // Controls whether each section should be visible in the final CV.  When
  // unchecked, the corresponding section will be omitted from the preview
  // and the exported PDF.  All sections are visible by default.  A
  // checkbox next to each entry in the reorder list toggles its state.
  const [sectionVisibility, setSectionVisibility] = useState<{ [key: string]: boolean }>({
    education: true,
    experience: true,
    projects: true,
    certifications: true,
    skills: true,
    languages: true,
    hobbies: true,
  });

  /**
   * Move a section up or down in the sectionOrder list. The index refers to
   * the current position of the section in the array and direction should
   * be -1 for up or +1 for down. If the new position would be out of
   * bounds, the function does nothing.
   */
  const moveSection = (index: number, direction: -1 | 1) => {
    setSectionOrder((prev) => {
      const newOrder = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= newOrder.length) return prev;
      const [item] = newOrder.splice(index, 1);
      newOrder.splice(newIndex, 0, item);
      return newOrder;
    });
  };
  // Advance to the next step if possible.
  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  // Go back to the previous step.
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Generate a formatted preview of the CV based on the selected template.
  const preview = useMemo(() => {
    // Map the selected font family to actual CSS font family names. These
    // values are defined here rather than in CSS so that we can easily
    // switch fonts at runtime. If a key is missing, fallback to Arial.
    const fontMap: { [key: string]: string } = {
      sans: 'Arial, sans-serif',
      serif: '"Times New Roman", Georgia, serif',
      mono: '"Courier New", monospace',
    };
    return (
      <div
        id="cvPreview"
        className={`${styles.preview} ${styles[form.template] || ""}`}
        style={{ fontFamily: fontMap[form.fontFamily] || fontMap.sans }}
      >
        {/* Header */}
        {/* Show a profile image if provided */}
        {form.profileImage && (
          <img
            src={form.profileImage}
            alt="Profile"
            className={styles.cvAvatar}
          />
        )}
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
        {/* Optional contact links */}
        {(form.linkedin || form.website) && (
          <p className={styles.cvContact}>
            {form.linkedin && (
              <span>
                LinkedIn: {form.linkedin}
                {form.website && ' | '}
              </span>
            )}
            {form.website && <span>Website: {form.website}</span>}
          </p>
        )}
        {/* Summary and dynamic sections */}
        {/* Always render summary first if provided */}
        {form.summary && (
          <section className={styles.cvSection}>
            <h3>Summary</h3>
            <p>{form.summary}</p>
          </section>
        )}
        {/* Render sections in user‑chosen order */}
        {sectionOrder.map((sectionName) => {
          // Skip sections that are marked as hidden
          if (!sectionVisibility[sectionName]) return null;
          switch (sectionName) {
            case 'education':
              return (
                form.educationList.length > 0 && (
                  <section key="education" className={styles.cvSection}>
                    <h3>Education</h3>
                    {form.educationList.map((edu, idx) => (
                      <p key={idx}>
                        <strong>{edu.degree}</strong>, {edu.institution}
                        {edu.year && ` (${edu.year})`}
                      </p>
                    ))}
                  </section>
                )
              );
            case 'experience':
              return (
                form.experienceList.length > 0 && (
                  <section key="experience" className={styles.cvSection}>
                    <h3>Experience</h3>
                    {form.experienceList.map((exp, idx) => (
                      <p key={idx}>
                        <strong>{exp.role}</strong>, {exp.company}
                        {exp.period && ` (${exp.period})`}
                        {exp.description && `\n${exp.description}`}
                      </p>
                    ))}
                  </section>
                )
              );
            case 'skills':
              return (
                form.skillsList.length > 0 && (
                  <section key="skills" className={styles.cvSection}>
                    <h3>Skills</h3>
                    <p>{form.skillsList.join(', ')}</p>
                  </section>
                )
              );
            case 'languages':
              return (
                form.languagesList.length > 0 && (
                  <section key="languages" className={styles.cvSection}>
                    <h3>Languages</h3>
                    <p>
                      {form.languagesList
                        .map((lang) =>
                          lang.language
                            ? `${lang.language}${lang.level ? ` (${lang.level})` : ''}`
                            : ''
                        )
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </section>
                )
              );
            case 'hobbies':
              return (
                form.hobbiesList.length > 0 && (
                  <section key="hobbies" className={styles.cvSection}>
                    <h3>Hobbies</h3>
                    <p>{form.hobbiesList.join(', ')}</p>
                  </section>
                )
              );
            case 'projects':
              return (
                form.projectsList.length > 0 && (
                  <section key="projects" className={styles.cvSection}>
                    <h3>Projects</h3>
                    {form.projectsList.map((proj, idx) => (
                      <p key={idx}>
                        <strong>{proj.title}</strong>
                        {proj.url && (
                          <>
                            {' '}
                            <a href={proj.url} target="_blank" rel="noopener noreferrer">
                              [{proj.url.replace(/https?:\/\//, '')}]
                            </a>
                          </>
                        )}
                        {proj.description && ` – ${proj.description}`}
                      </p>
                    ))}
                  </section>
                )
              );
            case 'certifications':
              return (
                form.certificationsList.length > 0 && (
                  <section key="certifications" className={styles.cvSection}>
                    <h3>Certifications</h3>
                    {form.certificationsList.map((cert, idx) => (
                      <p key={idx}>
                        <strong>{cert.name}</strong>
                        {cert.issuer && `, ${cert.issuer}`}
                        {cert.year && ` (${cert.year})`}
                      </p>
                    ))}
                  </section>
                )
              );
            default:
              return null;
          }
        })}
      </div>
    );
  }, [form, sectionOrder, sectionVisibility]);

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

  /**
   * Reset all data back to defaults. Clears all form fields, lists,
   * section order, errors and suggestion toggles. This allows users
   * to start over without refreshing the page. Local storage will be
   * updated automatically by the existing effect.
   */
  const resetAll = () => {
    setForm(initialForm);
    setSectionOrder([
      'education',
      'experience',
      'projects',
      'certifications',
      'skills',
      'languages',
      'hobbies',
    ]);
    setSectionVisibility({
      education: true,
      experience: true,
      projects: true,
      certifications: true,
      skills: true,
      languages: true,
      hobbies: true,
    });
    setErrors({});
    setExpSugToggles([]);
    setNewSkill('');
    setNewHobby('');
    setStep(0);
  };

  /**
   * Export the current resume data (form and section order) as a JSON file.
   * The file is generated on the fly and downloaded via a temporary link.
   */
  const exportJSON = () => {
    const data = { form, sectionOrder, sectionVisibility };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cv-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Import resume data from a JSON file. When a file is selected, parse
   * the JSON and, if valid, update the form and section order. Errors
   * during parsing are silently ignored.
   */
  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.form) setForm(parsed.form);
        if (parsed.sectionOrder) setSectionOrder(parsed.sectionOrder);
        if (parsed.sectionVisibility) setSectionVisibility(parsed.sectionVisibility);
      } catch {
        // ignore invalid JSON
      }
    };
    reader.readAsText(file);
  };

  // Ref to trigger the hidden import file input
  const importRef = useRef<HTMLInputElement | null>(null);

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

  // Available resume templates and their human‑friendly labels. These names
  // correspond to CSS modifier classes defined in page.module.css.
  const templateOptions: string[] = ["professional", "classic", "creative"];
  const templateLabels: { [key: string]: string } = {
    professional: "Professional",
    classic: "Classic",
    creative: "Creative",
  };

  // Predefined bullet suggestions for experience descriptions. These generic
  // achievements follow resume writing advice: start with strong action
  // verbs, highlight impact and quantify results where possible【472900044272202†L105-L139】.
  const experienceSuggestions: string[] = [
    "Led a cross‑functional team to deliver a major project two weeks ahead of schedule, improving customer satisfaction by 20%.",
    "Implemented automated testing that reduced bugs in production by 30% and improved code quality.",
    "Optimized legacy processes, resulting in a 25% reduction in costs and 15% increase in productivity.",
    "Collaborated with product and design teams to launch a new feature that generated $500K in new revenue.",
    "Mentored junior colleagues, improving team knowledge sharing and increasing overall velocity by 10%.",
  ];
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
  const [showHobbySuggestions, setShowHobbySuggestions] = useState(false);



  // Persist the form and section order to localStorage so users can return
  // later and continue editing. On mount, attempt to load any saved data.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cvBuilderData");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm(parsed.form);
        if (parsed.sectionOrder) setSectionOrder(parsed.sectionOrder);
        // Load saved visibility preferences if present
        if (parsed.sectionVisibility) setSectionVisibility(parsed.sectionVisibility);
      }
    } catch {
      // Ignore any JSON parsing errors
    }
  }, []);
  useEffect(() => {
    // Debounce by 300ms to avoid excessive writes; wrap in setTimeout
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          "cvBuilderData",
          JSON.stringify({ form, sectionOrder, sectionVisibility })
        );
      } catch {
        // localStorage might be unavailable in some contexts; ignore errors
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [form, sectionOrder, sectionVisibility]);


  // Per‑experience toggles for showing description suggestions. When an entry
  // is added or removed, the corresponding boolean is added or removed from
  // this array so that each experience has its own show/hide state.
  const [expSugToggles, setExpSugToggles] = useState<boolean[]>([]);

  // Temporary input states for adding skills and hobbies. These store the
  // value typed into the input before it is added to the corresponding list.
  const [newSkill, setNewSkill] = useState("");
  const [newHobby, setNewHobby] = useState("");

  // Cover letter state: holds the generated or user-edited cover letter and
  // whether the cover letter text area is visible. The letter is created
  // when the user clicks "Generate Cover Letter" in the preview step.
  const [coverLetter, setCoverLetter] = useState('');
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  // State for ATS keyword checking. Users can paste a job description and we
  // will analyse which keywords are missing from their resume. The missing
  // keywords can then be added to the summary or skills section. This is a
  // simplified alternative to an ATS resume checker described in best
  // practices【205442639117747†L324-L344】.
  const [jobDescription, setJobDescription] = useState("");
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);

  // Common stop words to exclude from keyword matching. These words are too
  // generic to be useful in a resume context.
  const stopWords = new Set([
    'the','and','for','with','from','that','this','these','those','have','has','had','will','would','shall','should','can','could','a','an','in','on','to','of','it','is','are','was','were','be','as','at','by','or','we','you','your','our','us','they','them','their','he','she','his','her','its','but','if','about','than','into','out','up','down','who','what','when','where','why','how'
  ]);

  // Whenever the job description changes, compute the list of keywords that
  // appear in the description but not in the user's resume. The resume
  // content includes the summary, skills and experience descriptions.
  useEffect(() => {
    if (!jobDescription.trim()) {
      setMissingKeywords([]);
      return;
    }
    // Normalize job description: lowercase, remove punctuation
    const jdWords = jobDescription
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));
    const jdSet = new Set(jdWords);
    // Compile resume content
    const resumeText = [
      form.summary,
      form.skillsList.join(' '),
      ...form.experienceList.map((exp) => `${exp.role} ${exp.company} ${exp.description}`),
      ...form.educationList.map((edu) => `${edu.degree} ${edu.institution}`),
      form.hobbiesList.join(' '),
    ]
      .join(' ')
      .toLowerCase();
    // Determine missing keywords
    const missing: string[] = [];
    jdSet.forEach((word) => {
      if (!resumeText.includes(word)) missing.push(word);
    });
    setMissingKeywords(missing);
  }, [jobDescription, form, stopWords]);

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

  // Keyboard shortcut: allow users to advance to the next step with Ctrl+Enter
  // when the current step's requirements are met. This improves
  // accessibility for keyboard users and speeds up navigation.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        if (!isNextDisabled && step < 5) {
          nextStep();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [isNextDisabled, step]);

  return (
    <div
      className={styles.page}
      style={{
        // CSS variables must be typed using a string index; disable explicit any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['--primary-color' as any]: form.accentColor,
      }}
    >
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
              <label>
                LinkedIn (optional)
                <input
                  type="url"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className={errors.linkedin ? styles.invalid : ''}
                />
                {errors.linkedin && (
                  <span className={styles.error}>{errors.linkedin}</span>
                )}
              </label>
              <label>
                Website (optional)
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={errors.website ? styles.invalid : ''}
                />
                {errors.website && (
                  <span className={styles.error}>{errors.website}</span>
                )}
              </label>

              {/* Profile photo upload */}
              <label>
                Profile Photo (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
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
                    {/* Reorder controls for education entries */}
                    <div className={styles.reorderButtons}>
                      <button
                        type="button"
                        onClick={() => moveEducationEntry(idx, -1)}
                        disabled={idx === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveEducationEntry(idx, 1)}
                        disabled={idx === form.educationList.length - 1}
                      >
                        ↓
                      </button>
                    </div>
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
                  {/* Toggle suggestions for this experience's description */}
                  <button
                    type="button"
                    className={styles.suggestionBtn}
                    onClick={() =>
                      setExpSugToggles((prev) => {
                        const newArr = [...prev];
                        newArr[idx] = !newArr[idx];
                        return newArr;
                      })
                    }
                  >
                    {expSugToggles[idx] ? 'Hide' : 'Show'} Description Suggestions
                  </button>
                  {/* Reorder controls for experience entries */}
                  <div className={styles.reorderButtons}>
                    <button
                      type="button"
                      onClick={() => moveExperienceEntry(idx, -1)}
                      disabled={idx === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveExperienceEntry(idx, 1)}
                      disabled={idx === form.experienceList.length - 1}
                    >
                      ↓
                    </button>
                  </div>
                  {expSugToggles[idx] && (
                    <ul className={styles.suggestionsList}>
                      {experienceSuggestions.map((sugg, sIdx) => (
                        <li
                          key={sIdx}
                          onClick={() => {
                            // Append or replace the description with the suggestion
                            setForm((prev) => {
                              const newList = prev.experienceList.map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      description: item.description
                                        ? `${item.description}\n${sugg}`
                                        : sugg,
                                    }
                                  : item
                              );
                              return { ...prev, experienceList: newList };
                            });
                            // Collapse the suggestions after selecting
                            setExpSugToggles((prev) => {
                              const copy = [...prev];
                              copy[idx] = false;
                              return copy;
                            });
                          }}
                        >
                          {sugg}
                        </li>
                      ))}
                    </ul>
                  )}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addLanguage();
                        }
                      }}
                    />
                    <select
                      value={lang.level}
                      onChange={(e) => updateLanguage(idx, "level", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addLanguage();
                        }
                      }}
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
              {/* Projects section: allow users to document key projects or personal work */}
              <div className={styles.projSection}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>Projects (optional)</span>
                {form.projectsList.map((proj, idx) => (
                  <div key={idx} className={styles.projRow}>
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={proj.title}
                      onChange={(e) => updateProject(idx, 'title', e.target.value)}
                    />
                    <input
                      type="url"
                      placeholder="Project URL (optional)"
                      value={proj.url || ''}
                      onChange={(e) => updateProject(idx, 'url', e.target.value)}
                    />
                    <textarea
                      placeholder="Description"
                      value={proj.description}
                      onChange={(e) => updateProject(idx, 'description', e.target.value)}
                      rows={2}
                    />
                    {/* Reorder controls for projects */}
                    <div className={styles.reorderButtons}>
                      <button
                        type="button"
                        onClick={() => moveProjectEntry(idx, -1)}
                        disabled={idx === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProjectEntry(idx, 1)}
                        disabled={idx === form.projectsList.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className={styles.removeBtn}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addBtn} onClick={addProject}>
                  + Add Project
                </button>
              </div>

              {/* Certifications section: capture certificates, courses or credentials */}
              <div className={styles.certSection}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>Certifications (optional)</span>
                {form.certificationsList.map((cert, idx) => (
                  <div key={idx} className={styles.certRow}>
                    <input
                      type="text"
                      placeholder="Certificate Name"
                      value={cert.name}
                      onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Issuer"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(idx, 'issuer', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={cert.year}
                      onChange={(e) => updateCertification(idx, 'year', e.target.value)}
                    />
                    {/* Reorder controls for certifications */}
                    <div className={styles.reorderButtons}>
                      <button
                        type="button"
                        onClick={() => moveCertificationEntry(idx, -1)}
                        disabled={idx === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCertificationEntry(idx, 1)}
                        disabled={idx === form.certificationsList.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(idx)}
                      className={styles.removeBtn}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={addCertification}
                >
                  + Add Certification
                </button>
              </div>
              {/* Template selection with visual previews. Users can click a card
                  to choose their preferred style. The select remains as a
                  fallback for accessibility or if JavaScript is disabled. */}
              <div className={styles.templateSelector}>
                {templateOptions.map((tpl) => (
                  <div
                    key={tpl}
                    className={`${styles.templateCard} ${form.template === tpl ? styles.templateCardSelected : ''}`}
                    onClick={() => setForm((prev) => ({ ...prev, template: tpl }))}
                  >
                    <div className={`${styles.templatePreview} ${styles[tpl]}`}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>John Doe</div>
                      <div style={{ fontStyle: 'italic', fontSize: 10 }}>Software Engineer</div>
                      <div style={{ fontSize: 8 }}>john@doe.com | +31 123456789</div>
                    </div>
                    <span className={styles.templateLabel}>{templateLabels[tpl]}</span>
                  </div>
                ))}
              </div>
              <label className={styles.templateSelectLabel}>
                <span style={{ display: 'none' }}>Template Style</span>
                <select
                  name="template"
                  value={form.template}
                  onChange={handleChange}
                  className={styles.templateSelect}
                >
                  {templateOptions.map((tpl) => (
                    <option key={tpl} value={tpl}>{templateLabels[tpl]}</option>
                  ))}
                </select>
              </label>
              {/* Colour picker to customise the primary accent colour. On
                  mobile devices this uses the native colour picker. */}
              <label>
                Accent Colour
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, accentColor: e.target.value }))
                  }
                />
              </label>

              <label>
                Font Style
                <select
                  name="fontFamily"
                  value={form.fontFamily}
                  onChange={handleChange}
                >
                  <option value="sans">Sans (default)</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                </select>
              </label>

              {/* Section order reordering. Users can change the order in which
                  resume sections appear in the preview. This is presented as
                  a simple list with up/down buttons. */}
              <div className={styles.reorderContainer}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>Section Order</span>
                <ul className={styles.reorderList}>
                  {sectionOrder.map((sec, idx) => {
                    const labelMap: { [key: string]: string } = {
                      education: 'Education',
                      experience: 'Experience',
                      projects: 'Projects',
                      certifications: 'Certifications',
                      skills: 'Skills',
                      languages: 'Languages',
                      hobbies: 'Hobbies',
                    };
                    return (
                      <li key={sec} className={styles.reorderItem}>
                        {/* Visibility toggle checkbox for this section */}
                        <label className={styles.visibilityToggle}>
                          <input
                            type="checkbox"
                            checked={sectionVisibility[sec] ?? true}
                            onChange={() =>
                              setSectionVisibility((prev) => ({
                                ...prev,
                                [sec]: !prev[sec],
                              }))
                            }
                          />
                          <span>{labelMap[sec] || sec}</span>
                        </label>
                        <div className={styles.reorderButtons}>
                          <button
                            type="button"
                            onClick={() => moveSection(idx, -1)}
                            disabled={idx === 0}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(idx, 1)}
                            disabled={idx === sectionOrder.length - 1}
                          >
                            ↓
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <h2>Preview & Export</h2>
              {preview}
              <button className={styles.exportBtn} onClick={exportPDF}>Export to PDF</button>
              {/* ATS keyword checker */}
              <div className={styles.atsChecker}>
                <h3>Job Description (optional)</h3>
                <textarea
                  placeholder="Paste a job description to see which keywords are missing from your resume"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  style={{ width: '100%', marginBottom: '8px' }}
                />
                {missingKeywords.length > 0 && (
                  <p style={{ fontSize: '14px' }}>
                    <strong>Missing keywords:</strong> {missingKeywords.join(', ')}
                  </p>
                )}
              </div>
              {/* Cover letter generator */}
              <div className={styles.coverLetterSection}>
                <h3>Cover Letter (optional)</h3>
                <button
                  type="button"
                  className={styles.suggestionBtn}
                  onClick={() => {
                    // Generate a simple cover letter using the user's details and summary
                    const name = [form.firstName, form.lastName].filter(Boolean).join(' ');
                    const summary = form.summary || 'I am excited to apply for this position.';
                    const salutation = 'Dear Hiring Manager,';
                    const body = `${summary} I believe my experience and skills make me a strong fit for this role.`;
                    const closing = 'Thank you for your consideration. I look forward to the opportunity to discuss my qualifications further.';
                    const signoff = `Sincerely,\n${name}`;
                    setCoverLetter(`${salutation}\n\n${body}\n\n${closing}\n\n${signoff}`);
                    setShowCoverLetter(true);
                  }}
                >
                  Generate Cover Letter
                </button>
                {showCoverLetter && (
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                    style={{ width: '100%', marginTop: '8px' }}
                  />
                )}
              </div>
              {/* Additional export/import/reset controls */}
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={exportJSON}
                >
                  Export Data (JSON)
                </button>
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={() => importRef.current?.click()}
                >
                  Import Data
                </button>
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={resetAll}
                >
                  Reset Form
                </button>
                {/* Hidden input for importing JSON */}
                <input
                  type="file"
                  accept="application/json"
                  ref={importRef}
                  style={{ display: 'none' }}
                  onChange={importJSON}
                />
              </div>
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
