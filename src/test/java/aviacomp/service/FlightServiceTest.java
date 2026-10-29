package aviacomp.service;

import aviacomp.dto.FlightStats;
import aviacomp.entity.Flight;
import aviacomp.exception.FlightNotFoundException;
import aviacomp.repository.FlightRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlightServiceTest {

	@Mock
	private FlightRepository flightRepository;

	@InjectMocks
	private FlightService flightService;

	@Test
	void createSavesFlight() {
		Flight flight = new Flight();
		flight.setFlightNumber("HY-101");
		when(flightRepository.save(flight)).thenReturn(flight);

		assertEquals("HY-101", flightService.create(flight).getFlightNumber());
		verify(flightRepository).save(flight);
	}

	@Test
	void getAllReturnsList() {
		when(flightRepository.findAll()).thenReturn(List.of(new Flight(), new Flight()));

		assertEquals(2, flightService.getAll().size());
	}

	@Test
	void getByIdReturnsFlight() {
		Flight flight = new Flight();
		flight.setId(1L);
		when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));

		assertEquals(1L, flightService.getById(1L).getId());
	}

	@Test
	void getByIdThrowsWhenMissing() {
		when(flightRepository.findById(99L)).thenReturn(Optional.empty());

		assertThrows(FlightNotFoundException.class, () -> flightService.getById(99L));
	}

	@Test
	void getStatsCalculatesValues() {
		Flight a = flight(100, "40.00", true);
		Flight b = flight(50, "61.00", false);
		when(flightRepository.findAll()).thenReturn(List.of(a, b));

		FlightStats stats = flightService.getStats();

		assertEquals(2, stats.totalFlights());
		assertEquals(1, stats.activeFlights());
		assertEquals(150, stats.totalSeats());
		assertEquals(new BigDecimal("50.50"), stats.averagePrice());
	}

	@Test
	void getStatsOnEmptyTable() {
		when(flightRepository.findAll()).thenReturn(List.of());

		FlightStats stats = flightService.getStats();

		assertEquals(0, stats.totalFlights());
		assertEquals(0, BigDecimal.ZERO.compareTo(stats.averagePrice()));
	}

	private Flight flight(int seats, String price, boolean active) {
		Flight f = new Flight();
		f.setSeats(seats);
		f.setPrice(new BigDecimal(price));
		f.setActive(active);
		return f;
	}
}
