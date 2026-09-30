"use client";

import { useState } from "react";
import { portfolio as initialPortfolio } from "@/content/portfolio";

type PortfolioContent = {
  name: string;
  role: string;
  location: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  experienceYears: string;
  heroIntro: string;
  disciplines: string[];
  services: Array<{ number: string; title: string; description: string }>;
  projects: Array<{ number: string; title: string; meta: string; visual: string }>;
  about: string;
  experience: Array<{ period: string; company: string; description: string }>;
};

type SaveResponse = {
  ok?: boolean;
  error?: string;
  commitUrl?: string;
};

function cloneInitial(): PortfolioContent {
  return JSON.parse(JSON.stringify(initialPortfolio)) as PortfolioContent;
}

export function AdminContentEditor() {
  const [content, setContent] = useState<PortfolioContent>(cloneInitial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const setField = <K extends keyof PortfolioContent>(
    key: K,
    value: PortfolioContent[K],
  ) => {
    setContent((current) => ({ ...current, [key]: value }));
  };

  const updateService = (
    index: number,
    key: keyof PortfolioContent["services"][number],
    value: string,
  ) => {
    setContent((current) => ({
      ...current,
      services: current.services.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [key]: value } : service,
      ),
    }));
  };

  const updateProject = (
    index: number,
    key: "number" | "title" | "meta",
    value: string,
  ) => {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project, projectIndex) =>
        projectIndex === index ? { ...project, [key]: value } : project,
      ),
    }));
  };

  const updateExperience = (
    index: number,
    key: keyof PortfolioContent["experience"][number],
    value: string,
  ) => {
    setContent((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      const result = (await response.json()) as SaveResponse;

      if (!response.ok) {
        throw new Error(result.error || "Could not save portfolio content.");
      }

      setMessageType("success");
      setMessage(
        "Content saved to the repository. The live site will update after the next deployment finishes.",
      );
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-content-editor" id="content-editor">
      <div className="admin-section-heading">
        <div>
          <span>01</span>
          <h2>Portfolio content</h2>
        </div>
        <p>Edit the text used across the public portfolio.</p>
      </div>

      <div className="admin-content-form">
        <section className="admin-content-card">
          <header><h3>Profile & contact</h3><span>General</span></header>
          <div className="admin-content-grid">
            <label className="admin-content-field"><span>Name</span><input value={content.name} onChange={(event) => setField("name", event.target.value)} /></label>
            <label className="admin-content-field"><span>Role</span><input value={content.role} onChange={(event) => setField("role", event.target.value)} /></label>
            <label className="admin-content-field"><span>Location</span><input value={content.location} onChange={(event) => setField("location", event.target.value)} /></label>
            <label className="admin-content-field"><span>Email</span><input type="email" value={content.email} onChange={(event) => setField("email", event.target.value)} /></label>
            <label className="admin-content-field"><span>Phone display</span><input value={content.phoneDisplay} onChange={(event) => setField("phoneDisplay", event.target.value)} /></label>
            <label className="admin-content-field"><span>Phone link</span><input value={content.phoneHref} onChange={(event) => setField("phoneHref", event.target.value)} /></label>
            <label className="admin-content-field"><span>Experience years</span><input value={content.experienceYears} onChange={(event) => setField("experienceYears", event.target.value)} /></label>
            <label className="admin-content-field"><span>Disciplines</span><input value={content.disciplines.join(", ")} onChange={(event) => setField("disciplines", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></label>
            <label className="admin-content-field is-wide"><span>Hero intro</span><textarea value={content.heroIntro} onChange={(event) => setField("heroIntro", event.target.value)} /></label>
            <label className="admin-content-field is-wide"><span>About</span><textarea value={content.about} onChange={(event) => setField("about", event.target.value)} /></label>
          </div>
        </section>

        <section className="admin-content-card">
          <header><h3>Services</h3><span>Expertise cards</span></header>
          <div className="admin-content-repeaters">
            {content.services.map((service, index) => (
              <div className="admin-content-repeat" key={index}>
                <label className="admin-content-field"><span>Number</span><input value={service.number} onChange={(event) => updateService(index, "number", event.target.value)} /></label>
                <label className="admin-content-field"><span>Title</span><input value={service.title} onChange={(event) => updateService(index, "title", event.target.value)} /></label>
                <label className="admin-content-field"><span>Description</span><textarea value={service.description} onChange={(event) => updateService(index, "description", event.target.value)} /></label>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-content-card">
          <header><h3>Selected work</h3><span>Project labels</span></header>
          <div className="admin-content-repeaters">
            {content.projects.map((project, index) => (
              <div className="admin-content-repeat is-project" key={index}>
                <label className="admin-content-field"><span>Number</span><input value={project.number} onChange={(event) => updateProject(index, "number", event.target.value)} /></label>
                <label className="admin-content-field"><span>Title</span><input value={project.title} onChange={(event) => updateProject(index, "title", event.target.value)} /></label>
                <label className="admin-content-field"><span>Meta</span><textarea value={project.meta} onChange={(event) => updateProject(index, "meta", event.target.value)} /></label>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-content-card">
          <header><h3>Experience</h3><span>Timeline</span></header>
          <div className="admin-content-repeaters">
            {content.experience.map((item, index) => (
              <div className="admin-content-repeat" key={index}>
                <label className="admin-content-field"><span>Period</span><input value={item.period} onChange={(event) => updateExperience(index, "period", event.target.value)} /></label>
                <label className="admin-content-field"><span>Company</span><input value={item.company} onChange={(event) => updateExperience(index, "company", event.target.value)} /></label>
                <label className="admin-content-field"><span>Description</span><textarea value={item.description} onChange={(event) => updateExperience(index, "description", event.target.value)} /></label>
              </div>
            ))}
          </div>
        </section>

        {message && <p className={`admin-content-message is-${messageType}`}>{message}</p>}

        <div className="admin-content-actions">
          <p>Saving updates the repository content file. Your deployment platform can then publish the change.</p>
          <button type="button" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save content"}
          </button>
        </div>
      </div>
    </section>
  );
}
