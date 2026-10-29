package aviacomp.service;

import aviacomp.dto.TicketRequest;
import aviacomp.dto.TicketResponse;
import aviacomp.entity.Customer;
import aviacomp.entity.Flight;
import aviacomp.entity.Payment;
import aviacomp.entity.PaymentStatus;
import aviacomp.entity.Ticket;
import aviacomp.entity.TicketStatus;
import aviacomp.repository.CustomerRepository;
import aviacomp.repository.FlightRepository;
import aviacomp.repository.PaymentRepository;
import aviacomp.repository.TicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TicketService {

	private final TicketRepository ticketRepository;
	private final CustomerRepository customerRepository;
	private final FlightRepository flightRepository;
	private final PaymentRepository paymentRepository;

	public TicketService(TicketRepository ticketRepository, CustomerRepository customerRepository,
			FlightRepository flightRepository, PaymentRepository paymentRepository) {
		this.ticketRepository = ticketRepository;
		this.customerRepository = customerRepository;
		this.flightRepository = flightRepository;
		this.paymentRepository = paymentRepository;
	}

	@Transactional(readOnly = true)
	public List<TicketResponse> getAll() {
		return ticketRepository.findAll().stream().map(TicketResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public TicketResponse getById(Long id) {
		return TicketResponse.from(findTicket(id));
	}

	@Transactional
	public TicketResponse create(TicketRequest request) {
		Customer customer = customerRepository.findById(request.customerId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Mijoz topilmadi: " + request.customerId()));
		Flight flight = flightRepository.findByIdForUpdate(request.flightId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Reys topilmadi: " + request.flightId()));
		if (!Boolean.TRUE.equals(flight.getActive())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Nofaol reysga chipta sotib bo‘lmaydi.");
		}
		long booked = ticketRepository.countByFlightIdAndStatus(flight.getId(), TicketStatus.BOOKED);
		if (booked >= flight.getSeats()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu reysda bo‘sh joy qolmagan.");
		}
		Ticket ticket = new Ticket();
		ticket.setCustomer(customer);
		ticket.setFlight(flight);
		ticket.setPrice(flight.getPrice());
		return TicketResponse.from(ticketRepository.save(ticket));
	}

	@Transactional
	public TicketResponse cancel(Long id) {
		Ticket ticket = findTicket(id);
		if (ticket.getStatus() == TicketStatus.CANCELLED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Chipta avval bekor qilingan.");
		}
		ticket.setStatus(TicketStatus.CANCELLED);
		paymentRepository.findByTicketId(id)
				.filter(payment -> payment.getStatus() == PaymentStatus.PAID)
				.ifPresent(payment -> payment.setStatus(PaymentStatus.REFUNDED));
		return TicketResponse.from(ticketRepository.save(ticket));
	}

	private Ticket findTicket(Long id) {
		return ticketRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chipta topilmadi: " + id));
	}
}
