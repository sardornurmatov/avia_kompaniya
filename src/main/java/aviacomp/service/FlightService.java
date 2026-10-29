package aviacomp.service;

import aviacomp.dto.FlightStats;
import aviacomp.entity.Flight;
import aviacomp.exception.FlightNotFoundException;
import aviacomp.repository.FlightRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class FlightService {

	private final FlightRepository flightRepository;

	public FlightService(FlightRepository flightRepository) {
		this.flightRepository = flightRepository;
	}

	public Flight create(Flight flight) {
		flight.setId(null);
		return flightRepository.save(flight);
	}

	public List<Flight> getAll() {
		return flightRepository.findAll();
	}

	public Flight getById(Long id) {
		return flightRepository.findById(id)
				.orElseThrow(() -> new FlightNotFoundException(id));
	}

	public FlightStats getStats() {
		List<Flight> flights = flightRepository.findAll();

		long active = flights.stream()
				.filter(f -> Boolean.TRUE.equals(f.getActive()))
				.count();
		long seats = flights.stream()
				.mapToLong(f -> f.getSeats() == null ? 0 : f.getSeats())
				.sum();
		BigDecimal avgPrice = BigDecimal.ZERO;
		if (!flights.isEmpty()) {
			BigDecimal total = flights.stream()
					.map(Flight::getPrice)
					.filter(java.util.Objects::nonNull)
					.reduce(BigDecimal.ZERO, BigDecimal::add);
			avgPrice = total.divide(BigDecimal.valueOf(flights.size()), 2, RoundingMode.HALF_UP);
		}

		return new FlightStats(flights.size(), active, seats, avgPrice);
	}
}
