package aviacomp.repository;

import aviacomp.entity.Ticket;
import aviacomp.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
	long countByCustomerId(Long customerId);
	long countByFlightIdAndStatus(Long flightId, TicketStatus status);
	long countByStatus(TicketStatus status);
}
