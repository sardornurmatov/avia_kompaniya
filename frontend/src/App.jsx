import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Cloud,
  CreditCard,
  Download,
  Ellipsis,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Plane,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  Users,
  Wallet,
  X,
} from "lucide-react";
import AdminSections from "./AdminSections.jsx";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const PAGE_SIZE = 8;

const EMPTY_STATS = {
  totalFlights: 0,
  activeFlights: 0,
  totalSeats: 0,
  averagePrice: 0,
};

const initialForm = {
  flightNumber: "",
  departureCity: "",
  arrivalCity: "",
  departureTime: "",
  seats: "",
  price: "",
  active: true,
};

function formatNumber(value) {
  return new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);
}

function formatMoney(value) {
  return new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getErrorMessage(error) {
  if (error instanceof TypeError) {
    return "Serverga ulanib bo‘lmadi. Backend 8080-portda ishlayotganini tekshiring.";
  }
  return error.message || "Ma’lumotni yuklashda xatolik yuz berdi.";
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `So‘rov bajarilmadi (${response.status}).`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Keep the HTTP status message when the server response is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function StatCard({ icon: Icon, label, value, note, tone, trend }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} strokeWidth={2.1} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        <span className="stat-note">{note}</span>
        {trend && (
          <span className="stat-trend">
            <ArrowUpRight size={13} />
            {trend}
          </span>
        )}
      </div>
    </article>
  );
}

function FlightTable({ flights, onSelect, onAdd }) {
  if (!flights.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Plane size={23} />
        </div>
        <h3>Reyslar topilmadi</h3>
        <p>Qidiruvni o‘zgartiring yoki yangi reys qo‘shing.</p>
        <button className="button button-primary button-small" onClick={onAdd}>
          <Plus size={16} />
          Reys qo‘shish
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="table-scroll">
        <table className="flight-table">
          <thead>
            <tr>
              <th>REYS</th>
              <th>YO‘NALISH</th>
              <th>SANA VA VAQT</th>
              <th>JOYLAR</th>
              <th>NARXI</th>
              <th>HOLATI</th>
              <th aria-label="Amallar" />
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr
                key={flight.id}
                className="flight-row"
                onClick={() => onSelect(flight)}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(flight);
                  }
                }}
              >
                <td>
                  <div className="flight-code">
                    <span className="airline-mark">
                      <Plane size={14} />
                    </span>
                    <span>
                      <strong>{flight.flightNumber}</strong>
                      <small>AviaComp Airlines</small>
                    </span>
                  </div>
                </td>
                <td>
                  <div className="route-cell">
                    <span>{flight.departureCity}</span>
                    <span className="route-arrow">
                      <span />
                      <Plane size={12} />
                    </span>
                    <span>{flight.arrivalCity}</span>
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <strong>{formatDate(flight.departureTime)}</strong>
                    <small>{formatTime(flight.departureTime)}</small>
                  </div>
                </td>
                <td>
                  <span className="seats-cell">
                    <Users size={14} />
                    {formatNumber(flight.seats)}
                  </span>
                </td>
                <td>
                  <strong className="price-cell">{formatMoney(flight.price)}</strong>
                </td>
                <td>
                  <span
                    className={`status-badge ${flight.active ? "status-active" : "status-inactive"}`}
                  >
                    <span />
                    {flight.active ? "Faol" : "Nofaol"}
                  </span>
                </td>
                <td>
                  <button
                    className="icon-button row-more"
                    aria-label={`${flight.flightNumber} reysini ko‘rish`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(flight);
                    }}
                  >
                    <Ellipsis size={19} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FlightModal({ onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const created = await request("/flights", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          departureTime: form.departureTime,
          seats: Number(form.seats),
          price: Number(form.price),
        }),
      });
      onCreated(created);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-kicker">REYSLAR BOSHQARUVI</div>
            <h2 id="modal-title">Yangi reys qo‘shish</h2>
            <p>Reys ma’lumotlarini kiriting va saqlang.</p>
          </div>
          <button className="icon-button modal-close" onClick={onClose} aria-label="Yopish">
            <X size={20} />
          </button>
        </div>

        <form className="flight-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Reys raqami</span>
            <input
              name="flightNumber"
              placeholder="Masalan, HY-101"
              value={form.flightNumber}
              onChange={updateField}
              maxLength={20}
              required
            />
          </label>
          <div className="form-grid">
            <label className="form-field">
              <span>Qayerdan</span>
              <input
                name="departureCity"
                placeholder="Toshkent"
                value={form.departureCity}
                onChange={updateField}
                maxLength={100}
                required
              />
            </label>
            <label className="form-field">
              <span>Qayerga</span>
              <input
                name="arrivalCity"
                placeholder="Samarqand"
                value={form.arrivalCity}
                onChange={updateField}
                maxLength={100}
                required
              />
            </label>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Uchish sanasi va vaqti</span>
              <input
                name="departureTime"
                type="datetime-local"
                value={form.departureTime}
                onChange={updateField}
                required
              />
            </label>
            <label className="form-field">
              <span>Joylar soni</span>
              <input
                name="seats"
                type="number"
                min="1"
                placeholder="180"
                value={form.seats}
                onChange={updateField}
                required
              />
            </label>
          </div>
          <label className="form-field">
            <span>Narxi</span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="45.00"
              value={form.price}
              onChange={updateField}
              required
            />
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={updateField}
            />
            <span className="checkbox-ui">
              <Check size={12} />
            </span>
            <span>Reysni faol holatda yaratish</span>
          </label>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}
              {saving ? "Saqlanmoqda..." : "Reysni saqlash"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FlightDetails({ flight, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal-card details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-kicker">REYS MA’LUMOTLARI</div>
            <h2 id="details-title">{flight.flightNumber}</h2>
            <p>Reys haqida batafsil ma’lumot.</p>
          </div>
          <button className="icon-button modal-close" onClick={onClose} aria-label="Yopish">
            <X size={20} />
          </button>
        </div>
        <div className="details-route">
          <div>
            <span>JO‘NASH</span>
            <strong>{flight.departureCity}</strong>
          </div>
          <div className="details-route-line">
            <span />
            <Plane size={17} />
          </div>
          <div className="details-arrival">
            <span>MANZIL</span>
            <strong>{flight.arrivalCity}</strong>
          </div>
        </div>
        <div className="details-grid">
          <div className="detail-item">
            <CalendarDays size={17} />
            <span>Uchish sanasi</span>
            <strong>{formatDate(flight.departureTime)}</strong>
          </div>
          <div className="detail-item">
            <Clock3 size={17} />
            <span>Uchish vaqti</span>
            <strong>{formatTime(flight.departureTime)}</strong>
          </div>
          <div className="detail-item">
            <Users size={17} />
            <span>Joylar soni</span>
            <strong>{formatNumber(flight.seats)} ta</strong>
          </div>
          <div className="detail-item">
            <Wallet size={17} />
            <span>Chipta narxi</span>
            <strong>{formatMoney(flight.price)}</strong>
          </div>
        </div>
        <div className="details-footer">
          <span
            className={`status-badge ${flight.active ? "status-active" : "status-inactive"}`}
          >
            <span />
            {flight.active ? "Faol reys" : "Nofaol reys"}
          </span>
          <button className="button button-primary" onClick={onClose}>
            Yopish
          </button>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [flights, setFlights] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeSection, setActiveSection] = useState("flights");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [flightData, statsData] = await Promise.all([
        request("/flights"),
        request("/flights/stats"),
      ]);
      if (!Array.isArray(flightData)) {
        throw new Error("Server reyslar ro‘yxatini kutilgan formatda qaytarmadi.");
      }
      setFlights(flightData);
      setStats({ ...EMPTY_STATS, ...statsData });
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowFlightModal(false);
        setSelectedFlight(null);
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(""), 3800);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const filteredFlights = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("uz");
    return flights
      .filter((flight) => {
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" ? flight.active : !flight.active);
        const searchable = [
          flight.flightNumber,
          flight.departureCity,
          flight.arrivalCity,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("uz");
        return matchesStatus && searchable.includes(normalizedSearch);
      })
      .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
  }, [flights, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFlights.length / PAGE_SIZE));
  const visibleFlights = filteredFlights.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startItem = filteredFlights.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * PAGE_SIZE, filteredFlights.length);

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  async function handleFlightCreated(flight) {
    setShowFlightModal(false);
    setNotice(`${flight.flightNumber} reysi muvaffaqiyatli qo‘shildi.`);
    await loadData();
  }

  function navigateTo(section) {
    setActiveSection(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const sectionTitles = {
    overview: "Boshqaruv paneli",
    flights: "Reyslar",
    tickets: "Chiptalar",
    customers: "Mijozlar",
    analytics: "Tahlillar",
    payments: "To‘lovlar",
    settings: "Sozlamalar",
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" aria-label="AviaComp bosh sahifa">
          <span className="brand-symbol">
            <Plane size={21} fill="currentColor" />
          </span>
          <span className="brand-name">avia<span>comp</span></span>
          <span className="brand-version">PRO</span>
        </a>

        <div className="workspace-switcher">
          <div className="workspace-logo">A</div>
          <div className="workspace-copy">
            <small>ISH JOYI</small>
            <strong>AviaComp Agency</strong>
          </div>
          <ChevronDown size={15} />
        </div>

        <div className="nav-section-label">ASOSIY MENU</div>
        <nav className="main-nav" aria-label="Asosiy menyu">
          <a className={`nav-link ${activeSection === "overview" ? "nav-link-active" : ""}`} href="#overview" onClick={(event) => { event.preventDefault(); navigateTo("overview"); }}>
            <LayoutDashboard size={18} />
            <span>Boshqaruv paneli</span>
          </a>
          <a
            className={`nav-link ${activeSection === "flights" ? "nav-link-active" : ""}`}
            href="#flights"
            onClick={(event) => { event.preventDefault(); navigateTo("flights"); }}
          >
            <Plane size={18} />
            <span>Reyslar</span>
            <span className="nav-count">{formatNumber(flights.length)}</span>
          </a>
          <a className={`nav-link ${activeSection === "tickets" ? "nav-link-active" : ""}`} href="#tickets" onClick={(event) => { event.preventDefault(); navigateTo("tickets"); }}>
            <Ticket size={18} />
            <span>Chiptalar</span>
          </a>
          <a className={`nav-link ${activeSection === "customers" ? "nav-link-active" : ""}`} href="#customers" onClick={(event) => { event.preventDefault(); navigateTo("customers"); }}>
            <Users size={18} />
            <span>Mijozlar</span>
          </a>
        </nav>

        <div className="nav-section-label reports-label">HISOBOTLAR</div>
        <nav className="main-nav" aria-label="Hisobotlar">
          <a className={`nav-link ${activeSection === "analytics" ? "nav-link-active" : ""}`} href="#analytics" onClick={(event) => { event.preventDefault(); navigateTo("analytics"); }}>
            <ArrowDownLeft size={18} />
            <span>Tahlillar</span>
          </a>
          <a className={`nav-link ${activeSection === "payments" ? "nav-link-active" : ""}`} href="#payments" onClick={(event) => { event.preventDefault(); navigateTo("payments"); }}>
            <CreditCard size={18} />
            <span>To‘lovlar</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={17} /></div>
            <strong>Yordam kerakmi?</strong>
            <p>Bizning jamoa doim yordam berishga tayyor.</p>
            <button type="button" onClick={() => setNotice("Yordam markazi tez orada ishga tushadi.")}>
              Yordam markaziga o‘tish <ArrowUpRight size={14} />
            </button>
          </div>
          <a className={`nav-link settings-link ${activeSection === "settings" ? "nav-link-active" : ""}`} href="#settings" onClick={(event) => { event.preventDefault(); navigateTo("settings"); }}>
            <Settings size={18} />
            <span>Sozlamalar</span>
          </a>
          <div className="profile-card">
            <div className="profile-avatar">SA</div>
            <div className="profile-copy">
              <strong>Sardorbek</strong>
              <span>Administrator</span>
            </div>
            <Ellipsis size={19} />
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          className="mobile-backdrop"
          aria-label="Menyuni yopish"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu-button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menyuni ochish"
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumbs">
              <span>Bosh sahifa</span>
              <ChevronRight size={14} />
              <strong>{sectionTitles[activeSection]}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="today-date">
              <CalendarDays size={16} />
              <span>
                {new Intl.DateTimeFormat("uz-UZ", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date())}
              </span>
            </div>
            <button
              className="icon-button notification-button"
              aria-label="Bildirishnomalar"
              onClick={() => setNotice("Hozircha yangi bildirishnomalar yo‘q.")}
            >
              <Bell size={18} />
              <span />
            </button>
            <div className="topbar-avatar">SA</div>
          </div>
        </header>

        <div className="page-content">
          {activeSection === "flights" ? (
            <>
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><Sparkles size={14} /> AVIACOMP BOSHQARUVI</div>
              <h1>Reyslar boshqaruvi</h1>
              <p className="page-subtitle">Aviareyslaringizni bir joyda boshqaring va kuzatib boring.</p>
            </div>
            <button className="button button-primary add-flight-button" onClick={() => setShowFlightModal(true)}>
              <Plus size={18} />
              Yangi reys qo‘shish
            </button>
          </section>

          {error && (
            <div className="error-banner" role="alert">
              <div className="error-mark">!</div>
              <div>
                <strong>Server bilan aloqa yo‘q</strong>
                <p>{error}</p>
              </div>
              <button className="button button-secondary button-small" onClick={loadData}>
                Qayta urinish
              </button>
            </div>
          )}

          <section className="stats-grid" aria-label="Reyslar statistikasi">
            <StatCard
              icon={Plane}
              label="Jami reyslar"
              value={formatNumber(stats.totalFlights)}
              note="Barcha reyslar"
              tone="stat-blue"
            />
            <StatCard
              icon={ShieldCheck}
              label="Faol reyslar"
              value={formatNumber(stats.activeFlights)}
              note="Jadvalda faol"
              tone="stat-green"
              trend={stats.totalFlights ? `${Math.round((stats.activeFlights / stats.totalFlights) * 100)}%` : null}
            />
            <StatCard
              icon={Users}
              label="Jami o‘rinlar"
              value={formatNumber(stats.totalSeats)}
              note="Barcha reyslarda"
              tone="stat-violet"
            />
            <StatCard
              icon={Wallet}
              label="O‘rtacha chipta narxi"
              value={formatMoney(stats.averagePrice)}
              note="Bir reys uchun"
              tone="stat-amber"
            />
          </section>

          <section className="dashboard-banner">
            <div className="banner-art" aria-hidden="true">
              <div className="banner-orbit orbit-one" />
              <div className="banner-orbit orbit-two" />
              <div className="banner-cloud cloud-one"><Cloud size={30} /></div>
              <div className="banner-cloud cloud-two"><Cloud size={21} /></div>
              <div className="banner-plane"><Plane size={44} fill="currentColor" /></div>
              <div className="banner-spark spark-one">✦</div>
              <div className="banner-spark spark-two">✦</div>
            </div>
            <div className="banner-copy">
              <span className="banner-tag"><span /> AVIACOMP YANGILIKLARI</span>
              <h2>Har bir parvoz — yangi imkoniyat.</h2>
              <p>Reyslaringizni boshqaring, sayohatlarni yanada qulay qiling.</p>
            </div>
            <div className="banner-decoration">aviacomp</div>
          </section>

          <section className="flights-panel" id="flights">
            <div className="panel-heading">
              <div>
                <div className="panel-title-row">
                  <h2>Barcha reyslar</h2>
                  <span className="total-pill">{formatNumber(filteredFlights.length)}</span>
                </div>
                <p>Reyslaringizni ko‘ring va boshqaring.</p>
              </div>
              <div className="panel-heading-actions">
                <button
                  className="button button-secondary export-button"
                  onClick={() => setNotice("Eksport funksiyasi keyingi bosqichda qo‘shiladi.")}
                >
                  <Download size={16} />
                  Eksport
                </button>
                <button className="button button-primary compact-add" onClick={() => setShowFlightModal(true)}>
                  <Plus size={17} />
                  <span>Yangi reys</span>
                </button>
              </div>
            </div>

            <div className="table-toolbar">
              <label className="search-field">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Reys yoki yo‘nalishni qidiring..."
                  value={search}
                  onChange={(event) => updateFilter(setSearch, event.target.value)}
                />
                {search && (
                  <button
                    className="search-clear"
                    onClick={() => updateFilter(setSearch, "")}
                    aria-label="Qidiruvni tozalash"
                  >
                    <X size={15} />
                  </button>
                )}
              </label>
              <label className="filter-select">
                <SlidersHorizontal size={15} />
                <select
                  value={statusFilter}
                  onChange={(event) => updateFilter(setStatusFilter, event.target.value)}
                  aria-label="Holat bo‘yicha filtrlash"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="active">Faol reyslar</option>
                  <option value="inactive">Nofaol reyslar</option>
                </select>
                <ChevronDown size={14} />
              </label>
              <button
                className="icon-button refresh-button"
                aria-label="Reyslarni yangilash"
                onClick={loadData}
                disabled={loading}
              >
                <ArrowDown size={16} className={loading ? "spin" : ""} />
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <LoaderCircle size={24} className="spin" />
                <span>Reyslar yuklanmoqda...</span>
              </div>
            ) : error ? (
              <div className="loading-state error-table-state">
                <span>Ma’lumotlarni ko‘rish uchun serverga qayta ulaning.</span>
              </div>
            ) : (
              <FlightTable
                flights={visibleFlights}
                onSelect={setSelectedFlight}
                onAdd={() => setShowFlightModal(true)}
              />
            )}

            <div className="table-footer">
              <span>{startItem}–{endItem} / {formatNumber(filteredFlights.length)} ta reys ko‘rsatilmoqda</span>
              <div className="pagination">
                <button
                  className="icon-button page-arrow"
                  aria-label="Oldingi sahifa"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="page-indicator">{page} <span>/</span> {totalPages}</span>
                <button
                  className="icon-button page-arrow"
                  aria-label="Keyingi sahifa"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </section>

          <footer className="page-footer">
            <span>© {new Date().getFullYear()} AviaComp. Barcha huquqlar himoyalangan.</span>
            <span className={`footer-status ${error ? "footer-status-error" : ""}`}>
              <span />
              {error ? "Server bilan aloqa yo‘q" : loading ? "Server bilan aloqa..." : "Tizim normal ishlayapti"}
            </span>
          </footer>
            </>
          ) : (
            <AdminSections
              section={activeSection}
              onNavigate={navigateTo}
              onNotify={setNotice}
            />
          )}
        </div>
      </main>

      {showFlightModal && (
        <FlightModal onClose={() => setShowFlightModal(false)} onCreated={handleFlightCreated} />
      )}
      {selectedFlight && (
        <FlightDetails flight={selectedFlight} onClose={() => setSelectedFlight(null)} />
      )}
      {notice && (
        <div className="toast" role="status">
          <span className="toast-check"><Check size={14} /></span>
          {notice}
          <button className="toast-close" onClick={() => setNotice("")} aria-label="Yopish">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
