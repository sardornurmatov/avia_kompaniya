package aviacomp.service;

import aviacomp.dto.DashboardStats;
import aviacomp.entity.PaymentStatus;
import aviacomp.entity.TicketStatus;
import aviacomp.repository.CustomerRepository;
import aviacomp.repository.FlightRepository;
import aviacomp.repository.PaymentRepository;
import aviacomp.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DashboardService {

	private final FlightRepository flightRepository;
	private final CustomerRepository customerRepository;
	private final TicketRepository ticketRepository;
	private final PaymentRepository paymentRepository;

	public DashboardService(FlightRepository flightRepository, CustomerRepository customerRepository,
			TicketRepository ticketRepository, PaymentRepository paymentRepository) {
		this.flightRepository = flightRepository;
		this.customerRepository = customerRepository;
		this.ticketRepository = ticketRepository;
		this.paymentRepository = paymentRepository;
	}

	public DashboardStats getStats() {
		long totalFlights = flightRepository.count();
		long activeFlights = flightRepository.countByActiveTrue();
		BigDecimal revenue = paymentRepository.sumAmountByStatus(PaymentStatus.PAID);
		return new DashboardStats(totalFlights, activeFlights, customerRepository.count(),
				ticketRepository.count(), ticketRepository.countByStatus(TicketStatus.BOOKED),
				paymentRepository.countByStatus(PaymentStatus.PENDING),
				revenue == null ? BigDecimal.ZERO : revenue);
	}
}
