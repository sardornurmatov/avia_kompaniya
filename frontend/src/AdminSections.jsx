import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  LoaderCircle,
  Plane,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const EMPTY_STATS = {
  totalFlights: 0,
  activeFlights: 0,
  totalCustomers: 0,
  totalTickets: 0,
  bookedTickets: 0,
  pendingPayments: 0,
  totalRevenue: 0,
};

async function api(path, options = {}) {
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
      // Keep the HTTP status when an error response is not JSON.
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

function price(value) {
  return `${new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)} ming so‘m`;
}

function date(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("uz-UZ", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function statusName(value) {
  return (
    {
      BOOKED: "Rasmiylashtirilgan",
      CANCELLED: "Bekor qilingan",
      PENDING: "Kutilmoqda",
      PAID: "To‘langan",
      REFUNDED: "Qaytarilgan",
      CASH: "Naqd",
      CARD: "Karta",
      TRANSFER: "O‘tkazma",
    }[value] || value
  );
}

function Status({ value }) {
  const tone =
    value === "PAID" || value === "BOOKED"
      ? "good"
      : value === "PENDING"
        ? "waiting"
        : "quiet";
  return <span className={`module-status module-status-${tone}`}><span />{statusName(value)}</span>;
}

function Metric({ icon: Icon, label, value, tone = "blue", hint }) {
  return (
    <article className="module-metric">
      <div className={`module-metric-icon module-tone-${tone}`}><Icon size={18} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading">
      <div>
        <div className="section-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function ModuleTable({ columns, rows, empty, loading, actions }) {
  if (loading) {
    return <div className="module-loading"><LoaderCircle className="spin" size={23} /> Ma’lumotlar yuklanmoqda...</div>;
  }
  if (!rows.length) {
    return (
      <div className="module-empty">
        <CircleHelp size={25} />
        <strong>{empty}</strong>
        <span>Ma’lumot qo‘shilgach, shu yerda ko‘rinadi.</span>
      </div>
    );
  }
  return (
    <div className="module-table-scroll">
      <table className="module-table">
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}{actions && <th>AMALLAR</th>}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell, index) => <td key={`${row.id}-${index}`}>{cell}</td>)}
              {actions && <td><div className="module-row-actions">{actions(row)}</div></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerForm({ customer, saving, error, onSubmit, onClose }) {
  const [values, setValues] = useState({
    fullName: customer?.fullName || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
  });
  function change(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }
  return (
    <div className="module-modal-backdrop" onMouseDown={onClose}>
      <section className="module-modal" role="dialog" aria-modal="true" aria-labelledby="customer-form-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="module-modal-heading">
          <div>
            <span>MIJOZLAR</span>
            <h2 id="customer-form-title">{customer ? "Mijoz ma’lumotlarini tahrirlash" : "Yangi mijoz qo‘shish"}</h2>
          </div>
          <button className="module-icon-button" onClick={onClose} aria-label="Yopish"><X size={18} /></button>
        </div>
        <form className="module-form" onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}>
          <label>To‘liq ism<input name="fullName" value={values.fullName} onChange={change} maxLength={120} required /></label>
          <label>Email<input name="email" type="email" value={values.email} onChange={change} maxLength={160} required /></label>
          <label>Telefon raqami<input name="phone" type="tel" value={values.phone} onChange={change} maxLength={30} placeholder="+998 90 123 45 67" required /></label>
          {error && <div className="module-form-error">{error}</div>}
          <div className="module-form-actions">
            <button type="button" className="module-button module-button-muted" onClick={onClose}>Bekor qilish</button>
            <button className="module-button module-button-primary" disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function BookingForm({ customers, flights, saving, error, onSubmit, onClose }) {
  const [customerId, setCustomerId] = useState("");
  const [flightId, setFlightId] = useState("");
  const selectedFlight = flights.find((flight) => String(flight.id) === flightId);
  return (
    <div className="module-modal-backdrop" onMouseDown={onClose}>
      <section className="module-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="module-modal-heading">
          <div><span>CHIPTALAR</span><h2 id="booking-title">Chipta rasmiylashtirish</h2></div>
          <button className="module-icon-button" onClick={onClose} aria-label="Yopish"><X size={18} /></button>
        </div>
        {(!customers.length || !flights.some((flight) => flight.active)) ? (
          <div className="module-form-error">Faol reys va ro‘yxatdan o‘tgan mijoz bo‘lishi kerak.</div>
        ) : (
          <form className="module-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ customerId: Number(customerId), flightId: Number(flightId) }); }}>
            <label>Mijoz
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required>
                <option value="">Mijozni tanlang</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName} · {customer.phone}</option>)}
              </select>
            </label>
            <label>Faol reys
              <select value={flightId} onChange={(event) => setFlightId(event.target.value)} required>
                <option value="">Reysni tanlang</option>
                {flights.filter((flight) => flight.active).map((flight) => <option key={flight.id} value={flight.id}>{flight.flightNumber} · {flight.departureCity} → {flight.arrivalCity}</option>)}
              </select>
            </label>
            {selectedFlight && <div className="module-selected-info">Chipta narxi: <strong>{price(selectedFlight.price)}</strong></div>}
            {error && <div className="module-form-error">{error}</div>}
            <div className="module-form-actions">
              <button type="button" className="module-button module-button-muted" onClick={onClose}>Bekor qilish</button>
              <button className="module-button module-button-primary" disabled={saving || !customerId || !flightId}>{saving ? "Saqlanmoqda..." : "Chiptani yaratish"}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function PaymentForm({ tickets, saving, error, onSubmit, onClose }) {
  const [ticketId, setTicketId] = useState("");
  const [method, setMethod] = useState("CARD");
  const selectedTicket = tickets.find((ticket) => String(ticket.id) === ticketId);
  return (
    <div className="module-modal-backdrop" onMouseDown={onClose}>
      <section className="module-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="module-modal-heading">
          <div><span>TO‘LOVLAR</span><h2 id="payment-title">To‘lov qaydini yaratish</h2></div>
          <button className="module-icon-button" onClick={onClose} aria-label="Yopish"><X size={18} /></button>
        </div>
        {!tickets.length ? (
          <div className="module-form-error">To‘lov uchun to‘lanmagan chipta mavjud emas.</div>
        ) : (
          <form className="module-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ ticketId: Number(ticketId), method }); }}>
            <label>Chipta
              <select value={ticketId} onChange={(event) => setTicketId(event.target.value)} required>
                <option value="">Chiptani tanlang</option>
                {tickets.map((ticket) => <option key={ticket.id} value={ticket.id}>{ticket.ticketNumber} · {ticket.customerName}</option>)}
              </select>
            </label>
            <label>To‘lov usuli
              <select value={method} onChange={(event) => setMethod(event.target.value)}>
                <option value="CARD">Karta</option><option value="CASH">Naqd</option><option value="TRANSFER">Bank o‘tkazmasi</option>
              </select>
            </label>
            {selectedTicket && <div className="module-selected-info">To‘lov summasi: <strong>{price(selectedTicket.price)}</strong></div>}
            {error && <div className="module-form-error">{error}</div>}
            <div className="module-form-actions">
              <button type="button" className="module-button module-button-muted" onClick={onClose}>Bekor qilish</button>
              <button className="module-button module-button-primary" disabled={saving || !ticketId}>{saving ? "Saqlanmoqda..." : "To‘lovni yaratish"}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

const SECTION_INFO = {
  customers: ["MIJOZLAR BAZASI", "Mijozlar", "Mijozlarni qo‘shing, ma’lumotlarini tahrirlang va chipta tarixini boshqaring."],
  tickets: ["REYSLAR BOSHQARUVI", "Chiptalar", "Chiptalarni rasmiylashtiring, kuzating va zarur bo‘lsa bekor qiling."],
  payments: ["MOLIYAVIY BOSHQARUV", "To‘lovlar", "To‘lov yozuvlarini yarating va ularning holatini boshqaring."],
  analytics: ["HISOBOTLAR", "Tahlillar", "Reyslar, chiptalar va to‘lovlar bo‘yicha umumiy ko‘rsatkichlar."],
  settings: ["TIZIM", "Sozlamalar", "API ulanishi va boshqaruv tizimi holati."],
};

export default function AdminSections({ section, onNavigate, onNotify }) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [customers, setCustomers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [customerModal, setCustomerModal] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [connection, setConnection] = useState("Tekshirilmoqda");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const requests = [
        api("/dashboard/stats"),
        api("/customers"),
        api("/flights"),
        api("/tickets"),
        api("/payments"),
      ];
      const [nextStats, nextCustomers, nextFlights, nextTickets, nextPayments] = await Promise.all(requests);
      setStats({ ...EMPTY_STATS, ...nextStats });
      setCustomers(nextCustomers);
      setFlights(nextFlights);
      setTickets(nextTickets);
      setPayments(nextPayments);
      setConnection("Ulanish muvaffaqiyatli");
    } catch (loadError) {
      setError(loadError.message || "Ma’lumotlar yuklanmadi.");
      setConnection("Ulanishda xatolik");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    function onEscape(event) {
      if (event.key === "Escape") {
        setCustomerModal(null);
        setBookingModal(false);
        setPaymentModal(false);
        setFormError("");
      }
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz");
    return customers.filter((customer) =>
      [customer.fullName, customer.email, customer.phone].some((value) =>
        value.toLocaleLowerCase("uz").includes(query),
      ),
    );
  }, [customers, search]);

  async function saveCustomer(values) {
    setSaving(true);
    setFormError("");
    try {
      const editing = customerModal?.id;
      await api(editing ? `/customers/${editing}` : "/customers", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(values),
      });
      setCustomerModal(null);
      onNotify(editing ? "Mijoz ma’lumotlari yangilandi." : "Yangi mijoz qo‘shildi.");
      await loadData();
    } catch (saveError) {
      setFormError(saveError.message || "Mijozni saqlab bo‘lmadi.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(customer) {
    if (!window.confirm(`${customer.fullName} mijozini o‘chirmoqchimisiz?`)) return;
    try {
      await api(`/customers/${customer.id}`, { method: "DELETE" });
      onNotify("Mijoz o‘chirildi.");
      await loadData();
    } catch (deleteError) {
      onNotify(deleteError.message || "Mijozni o‘chirib bo‘lmadi.");
    }
  }

  async function createTicket(values) {
    setSaving(true);
    setFormError("");
    try {
      await api("/tickets", { method: "POST", body: JSON.stringify(values) });
      setBookingModal(false);
      onNotify("Chipta muvaffaqiyatli rasmiylashtirildi.");
      await loadData();
    } catch (createError) {
      setFormError(createError.message || "Chipta yaratilmadi.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelTicket(ticket) {
    if (!window.confirm(`${ticket.ticketNumber} chiptasini bekor qilmoqchimisiz?`)) return;
    try {
      await api(`/tickets/${ticket.id}/cancel`, { method: "POST" });
      onNotify("Chipta bekor qilindi.");
      await loadData();
    } catch (cancelError) {
      onNotify(cancelError.message || "Chiptani bekor qilib bo‘lmadi.");
    }
  }

  async function createPayment(values) {
    setSaving(true);
    setFormError("");
    try {
      await api("/payments", { method: "POST", body: JSON.stringify(values) });
      setPaymentModal(false);
      onNotify("To‘lov qaydi yaratildi.");
      await loadData();
    } catch (createError) {
      setFormError(createError.message || "To‘lov qaydi yaratilmadi.");
    } finally {
      setSaving(false);
    }
  }

  async function updatePayment(payment, status) {
    try {
      await api(`/payments/${payment.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      onNotify(status === "PAID" ? "To‘lov tasdiqlandi." : "To‘lov qaytarildi.");
      await loadData();
    } catch (updateError) {
      onNotify(updateError.message || "To‘lov holati yangilanmadi.");
    }
  }

  function refreshButton() {
    return <button className="module-button module-button-muted" onClick={loadData} disabled={loading}><RefreshCw size={15} className={loading ? "spin" : ""} /> Yangilash</button>;
  }

  if (section === "overview" || section === "analytics") {
    const analytics = section === "analytics";
    return (
      <>
        <SectionHeading
          eyebrow={analytics ? SECTION_INFO.analytics[0] : "AVIACOMP BOSHQARUVI"}
          title={analytics ? SECTION_INFO.analytics[1] : "Boshqaruv paneli"}
          description={analytics ? SECTION_INFO.analytics[2] : "Aviakompaniyangiz faoliyatining bugungi holati."}
          action={refreshButton()}
        />
        {error && <div className="module-error" role="alert">{error}<button onClick={loadData}>Qayta urinish</button></div>}
        <div className="module-metrics-grid">
          <Metric icon={Plane} label="Jami reyslar" value={stats.totalFlights} hint={`${stats.activeFlights} ta faol`} />
          <Metric icon={Users} label="Mijozlar" value={stats.totalCustomers} tone="violet" hint="Ro‘yxatdan o‘tgan" />
          <Metric icon={Ticket} label="Rasmiylashtirilgan chiptalar" value={stats.bookedTickets} tone="green" hint={`${stats.totalTickets} ta jami`} />
          <Metric icon={Wallet} label="Tushum" value={price(stats.totalRevenue)} tone="amber" hint="To‘langan to‘lovlar" />
        </div>
        {!analytics ? (
          <div className="module-overview-grid">
            <section className="module-card">
              <div className="module-card-heading"><div><h2>Tezkor amallar</h2><p>Asosiy bo‘limlarga o‘tish</p></div></div>
              <div className="quick-links">
                {[
                  [Plane, "Reyslar", "Reyslar jadvalini boshqarish", "flights"],
                  [Users, "Mijozlar", "Mijozlar bazasini boshqarish", "customers"],
                  [Ticket, "Chiptalar", "Yangi chipta rasmiylashtirish", "tickets"],
                  [CreditCard, "To‘lovlar", "To‘lovlarni kuzatish", "payments"],
                ].map(([Icon, title, description, destination]) => (
                  <button key={destination} className="quick-link" onClick={() => onNavigate(destination)}>
                    <span className="quick-link-icon"><Icon size={17} /></span>
                    <span><strong>{title}</strong><small>{description}</small></span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </section>
            <section className="module-card module-summary-card">
              <div className="module-card-heading"><div><h2>Umumiy ko‘rsatkichlar</h2><p>Joriy ma’lumotlar</p></div></div>
              {loading ? <div className="module-loading"><LoaderCircle className="spin" size={20} /></div> : (
                <div className="summary-list">
                  <div><span><ShieldCheck size={15} /> Faol reyslar</span><strong>{stats.activeFlights} / {stats.totalFlights}</strong></div>
                  <div><span><Ticket size={15} /> Jami chiptalar</span><strong>{stats.totalTickets}</strong></div>
                  <div><span><Clock3 size={15} /> Kutilayotgan to‘lovlar</span><strong>{stats.pendingPayments}</strong></div>
                  <div><span><Wallet size={15} /> Umumiy tushum</span><strong>{price(stats.totalRevenue)}</strong></div>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="module-overview-grid">
            <section className="module-card">
              <div className="module-card-heading"><div><h2>Faollik ko‘rsatkichi</h2><p>Reys, chipta va mijozlar taqsimoti</p></div></div>
              {[
                ["Faol reyslar", stats.activeFlights, stats.totalFlights, "blue"],
                ["Rasmiylashtirilgan chiptalar", stats.bookedTickets, stats.totalTickets, "green"],
                ["To‘langan to‘lovlar", payments.filter((payment) => payment.status === "PAID").length, payments.length, "violet"],
              ].map(([label, amount, total, tone]) => (
                <div className="analytics-bar" key={label}>
                  <div><span>{label}</span><strong>{amount} / {total}</strong></div>
                  <span className={`analytics-track analytics-${tone}`}><span style={{ width: `${total ? Math.min(100, (amount / total) * 100) : 0}%` }} /></span>
                </div>
              ))}
            </section>
            <section className="module-card module-summary-card">
              <div className="module-card-heading"><div><h2>Moliya</h2><p>Joriy davr bo‘yicha</p></div></div>
              <div className="analytics-revenue"><span>Jami tushum</span><strong>{price(stats.totalRevenue)}</strong></div>
              <div className="summary-list">
                <div><span><Clock3 size={15} /> Kutilayotgan to‘lovlar</span><strong>{stats.pendingPayments}</strong></div>
                <div><span><CreditCard size={15} /> To‘lov yozuvlari</span><strong>{payments.length}</strong></div>
              </div>
            </section>
          </div>
        )}
        <div className="module-refresh-note">{loading ? "Ma’lumotlar yuklanmoqda..." : "Ma’lumotlar serverdan yangilandi."}</div>
      </>
    );
  }

  if (section === "settings") {
    return (
      <>
        <SectionHeading eyebrow={SECTION_INFO.settings[0]} title={SECTION_INFO.settings[1]} description={SECTION_INFO.settings[2]} action={refreshButton()} />
        <section className="module-card settings-card">
          <div className="module-card-heading"><div><h2>Ulanish va tizim holati</h2><p>Backend bilan aloqani tekshiring.</p></div><span className={`connection-badge ${error ? "connection-error" : ""}`}><span />{connection}</span></div>
          {error && <div className="module-error" role="alert">{error}</div>}
          <div className="settings-list">
            <div><span>Backend manzili</span><strong>http://localhost:8080</strong></div>
            <div><span>API manzili</span><strong>{API_URL}</strong></div>
            <div><span>Ma’lumotlar bazasi</span><strong>PostgreSQL · ulanish backend orqali boshqariladi</strong></div>
            <div><span>To‘lov rejimi</span><strong>Ichki qaydlar · haqiqiy karta yechimi yo‘q</strong></div>
          </div>
        </section>
      </>
    );
  }

  const [eyebrow, title, description] = SECTION_INFO[section] || SECTION_INFO.customers;
  const customersSection = section === "customers";
  const ticketsSection = section === "tickets";
  const paymentsSection = section === "payments";
  const action = customersSection
    ? <button className="module-button module-button-primary" onClick={() => { setFormError(""); setCustomerModal({}); }}><Plus size={16} /> Mijoz qo‘shish</button>
    : ticketsSection
      ? <button className="module-button module-button-primary" onClick={() => { setFormError(""); setBookingModal(true); }}><Plus size={16} /> Chipta rasmiylashtirish</button>
      : paymentsSection
        ? <button className="module-button module-button-primary" onClick={() => { setFormError(""); setPaymentModal(true); }}><Plus size={16} /> To‘lov qaydi</button>
        : null;

  let rows = [];
  let columns = [];
  let empty = "Ma’lumot mavjud emas.";
  let actions = null;
  if (customersSection) {
    columns = ["MIJOZ", "EMAIL", "TELEFON", "RO‘YXATDAN O‘TGAN"];
    rows = filteredCustomers.map((customer) => ({
      id: customer.id,
      cells: [
        <strong className="module-primary-text">{customer.fullName}</strong>,
        customer.email,
        customer.phone,
        date(customer.createdAt),
      ],
      customer,
    }));
    empty = search ? "Qidiruv bo‘yicha mijoz topilmadi." : "Hozircha mijozlar ro‘yxati bo‘sh.";
    actions = (row) => <>
      <button className="module-action-button" onClick={() => { setFormError(""); setCustomerModal(row.customer); }}>Tahrirlash</button>
      <button className="module-action-button module-action-danger" onClick={() => deleteCustomer(row.customer)}>O‘chirish</button>
    </>;
  } else if (ticketsSection) {
    columns = ["CHIPTA", "MIJOZ", "REYS / YO‘NALISH", "UCHISH VAQTI", "NARXI", "HOLATI"];
    rows = tickets.map((ticket) => ({
      id: ticket.id,
      cells: [
        <strong className="module-primary-text">{ticket.ticketNumber}</strong>,
        ticket.customerName,
        <span>{ticket.flightNumber} · {ticket.departureCity} → {ticket.arrivalCity}</span>,
        date(ticket.departureTime),
        price(ticket.price),
        <Status value={ticket.status} />,
      ],
      ticket,
    }));
    empty = "Hozircha chiptalar rasmiylashtirilmagan.";
    actions = (row) => row.ticket.status === "BOOKED"
      ? <button className="module-action-button module-action-danger" onClick={() => cancelTicket(row.ticket)}>Bekor qilish</button>
      : <span className="module-action-muted">—</span>;
  } else if (paymentsSection) {
    columns = ["CHIPTA", "MIJOZ", "SUMMA", "USUL", "SANA", "HOLATI"];
    rows = payments.map((payment) => ({
      id: payment.id,
      cells: [
        <strong className="module-primary-text">{payment.ticketNumber}</strong>,
        payment.customerName,
        price(payment.amount),
        statusName(payment.method),
        date(payment.createdAt),
        <Status value={payment.status} />,
      ],
      payment,
    }));
    empty = "Hozircha to‘lov qaydlari mavjud emas.";
    actions = (row) => row.payment.status === "PENDING"
      ? <button className="module-action-button module-action-success" onClick={() => updatePayment(row.payment, "PAID")}>Tasdiqlash</button>
      : row.payment.status === "PAID"
        ? <button className="module-action-button module-action-danger" onClick={() => updatePayment(row.payment, "REFUNDED")}>Qaytarish</button>
        : <span className="module-action-muted">—</span>;
  }

  const availableTickets = tickets.filter((ticket) =>
    ticket.status === "BOOKED" && !payments.some((payment) => payment.ticketId === ticket.id),
  );

  return (
    <>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} action={action} />
      {error && <div className="module-error" role="alert">{error}<button onClick={loadData}>Qayta urinish</button></div>}
      {customersSection && (
        <div className="module-toolbar">
          <label className="module-search"><Search size={16} /><input placeholder="Ism, email yoki telefon..." value={search} onChange={(event) => setSearch(event.target.value)} /><span>{filteredCustomers.length} ta mijoz</span></label>
          {refreshButton()}
        </div>
      )}
      {(ticketsSection || paymentsSection) && (
        <div className="module-toolbar">
          <span className="module-toolbar-summary">{ticketsSection ? `${tickets.filter((ticket) => ticket.status === "BOOKED").length} ta faol chipta` : `${stats.pendingPayments} ta kutilayotgan to‘lov`}</span>
          {refreshButton()}
        </div>
      )}
      <section className="module-card module-list-card">
        <div className="module-card-heading">
          <div><h2>{customersSection ? "Mijozlar ro‘yxati" : ticketsSection ? "Barcha chiptalar" : "To‘lovlar tarixi"}</h2><p>{customersSection ? "Mijoz ma’lumotlarini ko‘rish va boshqarish." : ticketsSection ? "Barcha rasmiylashtirilgan va bekor qilingan chiptalar." : "To‘lov holatlari va qaytarimlarni boshqarish."}</p></div>
          <span className="module-total">{rows.length} ta</span>
        </div>
        <ModuleTable columns={columns} rows={rows} empty={empty} loading={loading} actions={actions} />
      </section>
      {customerModal && <CustomerForm customer={customerModal.id ? customerModal : null} saving={saving} error={formError} onSubmit={saveCustomer} onClose={() => setCustomerModal(null)} />}
      {bookingModal && <BookingForm customers={customers} flights={flights} saving={saving} error={formError} onSubmit={createTicket} onClose={() => setBookingModal(false)} />}
      {paymentModal && <PaymentForm tickets={availableTickets} saving={saving} error={formError} onSubmit={createPayment} onClose={() => setPaymentModal(false)} />}
    </>
  );
}
