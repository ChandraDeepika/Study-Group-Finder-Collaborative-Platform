import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "../styles/LandingPage.css";

const COURSE_VISUALS = {
  CS:   { gradient: "linear-gradient(135deg,#1e40af,#3b82f6)", icon: "💻" },
  MATH: { gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)", icon: "📐" },
  PHY:  { gradient: "linear-gradient(135deg,#0f766e,#2dd4bf)", icon: "⚛️" },
  BIO:  { gradient: "linear-gradient(135deg,#15803d,#4ade80)", icon: "🧬" },
  ENG:  { gradient: "linear-gradient(135deg,#b45309,#fbbf24)", icon: "📖" },
  DATA: { gradient: "linear-gradient(135deg,#be185d,#f472b6)", icon: "🤖" },
  CHEM: { gradient: "linear-gradient(135deg,#0369a1,#38bdf8)", icon: "🧪" },
  HIST: { gradient: "linear-gradient(135deg,#92400e,#d97706)", icon: "🏛️" },
  ART:  { gradient: "linear-gradient(135deg,#9d174d,#ec4899)", icon: "🎨" },
  MUS:  { gradient: "linear-gradient(135deg,#1d4ed8,#60a5fa)", icon: "🎵" },
  ECON: { gradient: "linear-gradient(135deg,#065f46,#34d399)", icon: "📊" },
  LAW:  { gradient: "linear-gradient(135deg,#1e3a5f,#3b82f6)", icon: "⚖️" },
};
const DEFAULT_VISUAL = { gradient: "linear-gradient(135deg,#374151,#6b7280)", icon: "📘" };

function getCourseVisual(code = "") {
  const upper = code.toUpperCase();
  for (const [key, val] of Object.entries(COURSE_VISUALS)) {
    if (upper.startsWith(key)) return val;
  }
  return DEFAULT_VISUAL;
}

// Animated counter hook
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, start, duration]);
  return count;
}

const FEATURES = [
  { icon: "🎯", title: "Smart Group Matching", desc: "Connect with study partners who share your courses, goals, and learning style.", color: "#eff6ff", accent: "#2563eb" },
  { icon: "💬", title: "Real-Time Chat", desc: "Communicate instantly with your study group. Share files, images, and react to messages.", color: "#f0fdf4", accent: "#16a34a" },
  { icon: "📚", title: "Course Management", desc: "Enroll in courses, track your progress, and find groups studying the same material.", color: "#fdf4ff", accent: "#9333ea" },
  { icon: "🔒", title: "Private & Public Groups", desc: "Create private groups for your close circle or public groups open to all students.", color: "#fff7ed", accent: "#ea580c" },
  { icon: "📊", title: "Progress Tracking", desc: "Monitor your learning journey with visual progress indicators across all enrolled courses.", color: "#fef3c7", accent: "#d97706" },
  { icon: "🚀", title: "Collaborative Tools", desc: "Share resources, coordinate schedules, and achieve academic goals together.", color: "#f0f9ff", accent: "#0284c7" },
];

const TESTIMONIALS = [
  { name: "Sarah Johnson", role: "Computer Science, Year 3", text: "StudyConnect helped me find the perfect study group for my algorithms course. My grades improved significantly!", avatar: "SJ", color: "#2563eb" },
  { name: "Marcus Chen",   role: "Data Science, Year 2",    text: "The real-time chat and file sharing made collaborating on projects so much easier. Highly recommend!", avatar: "MC", color: "#9333ea" },
  { name: "Priya Patel",   role: "Mathematics, Year 4",     text: "I went from struggling alone to thriving in a group of like-minded students. This platform is a game changer.", avatar: "PP", color: "#16a34a" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [courses, setCourses]       = useState([]);
  const [stats, setStats]           = useState({ students: 0, groups: 0, courses: 0 });
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const studentCount = useCountUp(stats.students, 1600, statsVisible);
  const groupCount   = useCountUp(stats.groups,   1400, statsVisible);
  const courseCount  = useCountUp(stats.courses,  1200, statsVisible);

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, groupsRes] = await Promise.all([
          fetch("http://localhost:8080/api/courses"),
          fetch("http://localhost:8080/api/groups/search?page=0&size=1"),
        ]);
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          setCourses(data);
          setStats(prev => ({ ...prev, courses: data.length }));
        }
        if (groupsRes.ok) {
          const data = await groupsRes.json();
          setStats(prev => ({
            ...prev,
            groups: data.totalElements || data.content?.length || 0,
          }));
        }
        // Approximate student count from groups member counts
        setStats(prev => ({ ...prev, students: prev.courses * 12 + prev.groups * 8 + 42 }));
      } catch (e) {
        console.error("Landing fetch error:", e);
      }
    };
    fetchData();
  }, []);

  // Recalculate students when courses/groups load
  useEffect(() => {
    if (stats.courses > 0 || stats.groups > 0) {
      setStats(prev => ({
        ...prev,
        students: prev.courses * 12 + prev.groups * 8 + 42,
      }));
    }
  }, [stats.courses, stats.groups]);

  // Intersection observer for counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const displayCourses = courses.slice(0, 6);

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">📚</span>
            <span>StudyConnect</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#courses">Courses</a>
            <a href="#testimonials">Reviews</a>
          </div>
          <div className="landing-nav-actions">
            <button className="landing-btn-ghost" onClick={() => navigate("/login")}>Sign In</button>
            <button className="landing-btn-primary" onClick={() => navigate("/register")}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1" />
          <div className="hero-shape hero-shape-2" />
          <div className="hero-shape hero-shape-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">🎓 The #1 collaborative study platform</div>
          <h1 className="hero-title">
            Study Smarter,<br />
            <span className="hero-title-gradient">Together</span>
          </h1>
          <p className="hero-subtitle">
            Connect with study partners, join collaborative groups, and accelerate your learning journey.
            The all-in-one platform built for modern students.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={() => navigate("/register")}>
              Start Learning Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="hero-btn-secondary" onClick={() => navigate("/login")}>
              Sign In to Dashboard
            </button>
          </div>
          {/* Live stats */}
          <div className="hero-stats" ref={statsRef}>
            <div className="hero-stat">
              <span className="hero-stat-icon">👥</span>
              <span className="hero-stat-num">{studentCount > 0 ? studentCount.toLocaleString() : "—"}</span>
              <span className="hero-stat-label">Active Students</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">🏫</span>
              <span className="hero-stat-num">{groupCount > 0 ? groupCount.toLocaleString() : "—"}</span>
              <span className="hero-stat-label">Study Groups</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">📚</span>
              <span className="hero-stat-num">{courseCount > 0 ? courseCount.toLocaleString() : "—"}</span>
              <span className="hero-stat-label">Courses Available</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">⭐</span>
              <span className="hero-stat-num">98%</span>
              <span className="hero-stat-label">Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="hero-visual">
          <div className="hero-card-float hero-card-1">
            <div className="hc-avatar" style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>A</div>
            <div><div className="hc-name">Alex joined your group</div><div className="hc-time">Just now</div></div>
          </div>
          <div className="hero-card-float hero-card-2">
            <span style={{ fontSize: 22 }}>📈</span>
            <div><div className="hc-name">Progress: 78%</div><div className="hc-time">Calculus II</div></div>
          </div>
          <div className="hero-card-float hero-card-3">
            <span style={{ fontSize: 22 }}>💬</span>
            <div><div className="hc-name">5 new messages</div><div className="hc-time">Study Group Chat</div></div>
          </div>
          <div className="hero-mockup">
            <div className="mockup-header">
              <div className="mockup-dot red" /><div className="mockup-dot yellow" /><div className="mockup-dot green" />
              <span className="mockup-title">StudyConnect Dashboard</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                {["Dashboard","Courses","Groups","Chat"].map(item => (
                  <div key={item} className={`mockup-nav-item ${item === "Dashboard" ? "active" : ""}`}>{item}</div>
                ))}
              </div>
              <div className="mockup-main">
                <div className="mockup-banner">Welcome back, Student 👋</div>
                <div className="mockup-cards">
                  <div className="mockup-card blue">📚<br/><strong>{stats.courses || "—"}</strong><br/><small>Courses</small></div>
                  <div className="mockup-card green">👥<br/><strong>{stats.groups || "—"}</strong><br/><small>Groups</small></div>
                  <div className="mockup-card purple">🔥<br/><strong>{(stats.courses + stats.groups) || "—"}</strong><br/><small>Activity</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-section" id="features">
        <div className="section-label">Why StudyConnect?</div>
        <h2 className="section-title">Everything you need to excel academically</h2>
        <p className="section-subtitle">Powerful tools designed to make collaborative learning effortless and effective.</p>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" style={{ background: f.color, color: f.accent }}>{f.icon}</div>
              <h3 style={{ color: f.accent }}>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Real Courses from Backend ── */}
      <section className="landing-section landing-section-alt" id="courses">
        <div className="section-label">Live Courses</div>
        <h2 className="section-title">
          {courses.length > 0 ? `${courses.length} Courses Available Right Now` : "Explore Available Courses"}
        </h2>
        <p className="section-subtitle">These are the actual courses on the platform. Sign up to enroll and find your study group.</p>

        {courses.length === 0 ? (
          <div className="landing-courses-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p>Courses are being added. Check back soon!</p>
          </div>
        ) : (
          <div className="landing-courses-grid">
            {displayCourses.map((course) => {
              const v = getCourseVisual(course.courseCode);
              return (
                <div className="landing-course-card" key={course.id}>
                  <div className="lcc-banner" style={{ background: v.gradient }}>
                    <span className="lcc-icon">{v.icon}</span>
                    <span className="lcc-code">{course.courseCode}</span>
                  </div>
                  <div className="lcc-body">
                    <h3>{course.courseName}</h3>
                    <div className="lcc-meta">
                      <span className="lcc-live-badge">🟢 Live</span>
                      <button className="lcc-badge" onClick={() => navigate("/register")}>Enroll Now</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {courses.length > 6 && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <p className="landing-more-courses">+{courses.length - 6} more courses available after sign up</p>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button className="hero-btn-primary" onClick={() => navigate("/register")}>
            View All {courses.length > 0 ? courses.length : ""} Courses →
          </button>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">Get started in 3 simple steps</h2>
        <div className="steps-grid">
          {[
            { step: "01", title: "Create Your Account", desc: "Sign up for free and set up your academic profile with your courses and interests.", icon: "✍️" },
            { step: "02", title: "Find Your Group",     desc: "Browse study groups or let our system match you with compatible study partners.", icon: "🔍" },
            { step: "03", title: "Start Collaborating", desc: "Chat in real-time, share resources, and achieve your academic goals together.", icon: "🚀" },
          ].map((s) => (
            <div className="step-card" key={s.step}>
              <div className="step-number">{s.step}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="landing-section landing-section-alt" id="testimonials">
        <div className="section-label">Student Reviews</div>
        <h2 className="section-title">Loved by students everywhere</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: t.color }}>{t.avatar}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <div className="cta-bg-shape" />
        <h2>Ready to transform your study experience?</h2>
        <p>
          {stats.students > 0
            ? `Join ${stats.students.toLocaleString()}+ students already using StudyConnect.`
            : "Join thousands of students already using StudyConnect."}
        </p>
        <div className="cta-actions">
          <button className="hero-btn-primary" onClick={() => navigate("/register")}>Create Free Account</button>
          <button className="hero-btn-secondary cta-secondary" onClick={() => navigate("/login")}>Sign In</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="landing-logo-icon">📚</span>
            <span className="footer-brand-name">StudyConnect</span>
            <p>Empowering students to learn collaboratively and achieve more together.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <a onClick={() => navigate("/register")}>Get Started</a>
              <a onClick={() => navigate("/login")}>Sign In</a>
            </div>
            <div className="footer-col">
              <h4>Features</h4>
              <a href="#features">Study Groups</a>
              <a href="#courses">Courses</a>
              <a href="#features">Real-Time Chat</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 StudyConnect. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
