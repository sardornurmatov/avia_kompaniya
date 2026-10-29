package aviacomp.dto;

import aviacomp.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
		Long id,
		Long ticketId,
		String ticketNumber,
		String customerName,
		BigDecimal amount,
		String method,
		String status,
		LocalDateTime createdAt) {
	public static PaymentResponse from(Payment payment) {
		return new PaymentResponse(payment.getId(), payment.getTicket().getId(),
				payment.getTicket().getTicketNumber(), payment.getTicket().getCustomer().getFullName(),
				payment.getAmount(), payment.getMethod().name(), payment.getStatus().name(),
				payment.getCreatedAt());
	}
}
