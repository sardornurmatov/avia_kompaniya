package aviacomp.dto;

import aviacomp.entity.Ticket;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TicketResponse(
		Long id,
		String ticketNumber,
		Long customerId,
		String customerName,
		Long flightId,
		String flightNumber,
		String departureCity,
		String arrivalCity,
		LocalDateTime departureTime,
		BigDecimal price,
		String status,
		LocalDateTime bookedAt) {
	public static TicketResponse from(Ticket ticket) {
		return new TicketResponse(ticket.getId(), ticket.getTicketNumber(),
				ticket.getCustomer().getId(), ticket.getCustomer().getFullName(),
				ticket.getFlight().getId(), ticket.getFlight().getFlightNumber(),
				ticket.getFlight().getDepartureCity(), ticket.getFlight().getArrivalCity(),
				ticket.getFlight().getDepartureTime(), ticket.getPrice(),
				ticket.getStatus().name(), ticket.getBookedAt());
	}
}
