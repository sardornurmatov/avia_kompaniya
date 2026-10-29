package aviacomp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "flights")
public class Flight {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "flight_number", nullable = false, unique = true, length = 20)
	private String flightNumber;

	@Column(name = "departure_city", nullable = false, length = 100)
	private String departureCity;

	@Column(name = "arrival_city", nullable = false, length = 100)
	private String arrivalCity;

	@Column(name = "departure_time", nullable = false)
	private LocalDateTime departureTime;

	@Column(nullable = false)
	private Integer seats;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal price;

	@Column(nullable = false)
	private Boolean active = true;

	public Flight() {
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getFlightNumber() { return flightNumber; }
	public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }

	public String getDepartureCity() { return departureCity; }
	public void setDepartureCity(String departureCity) { this.departureCity = departureCity; }

	public String getArrivalCity() { return arrivalCity; }
	public void setArrivalCity(String arrivalCity) { this.arrivalCity = arrivalCity; }

	public LocalDateTime getDepartureTime() { return departureTime; }
	public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

	public Integer getSeats() { return seats; }
	public void setSeats(Integer seats) { this.seats = seats; }

	public BigDecimal getPrice() { return price; }
	public void setPrice(BigDecimal price) { this.price = price; }

	public Boolean getActive() { return active; }
	public void setActive(Boolean active) { this.active = active; }
}
