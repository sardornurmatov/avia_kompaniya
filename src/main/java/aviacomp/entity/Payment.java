package aviacomp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ticket_id", nullable = false, unique = true)
	private Ticket ticket;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal amount;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PaymentMethod method;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PaymentStatus status = PaymentStatus.PENDING;

	@Column(nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	public Long getId() { return id; }
	public Ticket getTicket() { return ticket; }
	public void setTicket(Ticket ticket) { this.ticket = ticket; }
	public BigDecimal getAmount() { return amount; }
	public void setAmount(BigDecimal amount) { this.amount = amount; }
	public PaymentMethod getMethod() { return method; }
	public void setMethod(PaymentMethod method) { this.method = method; }
	public PaymentStatus getStatus() { return status; }
	public void setStatus(PaymentStatus status) { this.status = status; }
	public LocalDateTime getCreatedAt() { return createdAt; }
}
