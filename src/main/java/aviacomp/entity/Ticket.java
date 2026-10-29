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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
public class Ticket {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 20)
	private String ticketNumber = "AC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "customer_id", nullable = false)
	private Customer customer;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "flight_id", nullable = false)
	private Flight flight;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal price;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private TicketStatus status = TicketStatus.BOOKED;

	@Column(nullable = false)
	private LocalDateTime bookedAt = LocalDateTime.now();

	public Long getId() { return id; }
	public String getTicketNumber() { return ticketNumber; }
	public Customer getCustomer() { return customer; }
	public void setCustomer(Customer customer) { this.customer = customer; }
	public Flight getFlight() { return flight; }
	public void setFlight(Flight flight) { this.flight = flight; }
	public BigDecimal getPrice() { return price; }
	public void setPrice(BigDecimal price) { this.price = price; }
	public TicketStatus getStatus() { return status; }
	public void setStatus(TicketStatus status) { this.status = status; }
	public LocalDateTime getBookedAt() { return bookedAt; }
}
