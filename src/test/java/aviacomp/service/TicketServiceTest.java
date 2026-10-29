package aviacomp.service;

import aviacomp.dto.TicketRequest;
import aviacomp.dto.TicketResponse;
import aviacomp.entity.Customer;
import aviacomp.entity.Flight;
import aviacomp.entity.Ticket;
import aviacomp.repository.CustomerRepository;
import aviacomp.repository.FlightRepository;
import aviacomp.repository.PaymentRepository;
import aviacomp.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

	@Mock
	private TicketRepository ticketRepository;

	@Mock
	private CustomerRepository customerRepository;

	@Mock
	private FlightRepository flightRepository;

	@Mock
	private PaymentRepository paymentRepository;

	@InjectMocks
	private TicketService ticketService;

	@Test
	void createsTicketAtCurrentFlightPrice() {
		Customer customer = new Customer();
		customer.setId(7L);
		customer.setFullName("Test Customer");
		Flight flight = flight(4L, true, 2, "50.00");
		when(customerRepository.findById(7L)).thenReturn(Optional.of(customer));
		when(flightRepository.findByIdForUpdate(4L)).thenReturn(Optional.of(flight));
		when(ticketRepository.countByFlightIdAndStatus(any(), any())).thenReturn(1L);
		when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
			Ticket ticket = invocation.getArgument(0);
			ticket.setPrice(flight.getPrice());
			return ticket;
		});

		TicketResponse response = ticketService.create(new TicketRequest(7L, 4L));

		assertEquals("Test Customer", response.customerName());
		assertEquals("50.00", response.price().toPlainString());
		assertEquals("BOOKED", response.status());
		verify(flightRepository).findByIdForUpdate(4L);
	}

	@Test
	void rejectsBookingWhenFlightIsFull() {
		Customer customer = new Customer();
		customer.setId(7L);
		Flight flight = flight(4L, true, 1, "50.00");
		when(customerRepository.findById(7L)).thenReturn(Optional.of(customer));
		when(flightRepository.findByIdForUpdate(4L)).thenReturn(Optional.of(flight));
		when(ticketRepository.countByFlightIdAndStatus(any(), any())).thenReturn(1L);

		assertThrows(ResponseStatusException.class,
				() -> ticketService.create(new TicketRequest(7L, 4L)));
	}

	@Test
	void rejectsBookingOnInactiveFlight() {
		Customer customer = new Customer();
		customer.setId(7L);
		Flight flight = flight(4L, false, 5, "50.00");
		when(customerRepository.findById(7L)).thenReturn(Optional.of(customer));
		when(flightRepository.findByIdForUpdate(4L)).thenReturn(Optional.of(flight));

		assertThrows(ResponseStatusException.class,
				() -> ticketService.create(new TicketRequest(7L, 4L)));
	}

	private Flight flight(long id, boolean active, int seats, String price) {
		Flight flight = new Flight();
		flight.setId(id);
		flight.setActive(active);
		flight.setSeats(seats);
		flight.setFlightNumber("HY-101");
		flight.setDepartureCity("Tashkent");
		flight.setArrivalCity("Samarkand");
		flight.setPrice(new BigDecimal(price));
		return flight;
	}
}
