package aviacomp.service;

import aviacomp.dto.PaymentStatusRequest;
import aviacomp.entity.Customer;
import aviacomp.entity.Payment;
import aviacomp.entity.PaymentMethod;
import aviacomp.entity.PaymentStatus;
import aviacomp.entity.Ticket;
import aviacomp.entity.TicketStatus;
import aviacomp.repository.PaymentRepository;
import aviacomp.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

	@Mock
	private PaymentRepository paymentRepository;

	@Mock
	private TicketRepository ticketRepository;

	@InjectMocks
	private PaymentService paymentService;

	@Test
	void confirmsPendingPayment() {
		Payment payment = payment(TicketStatus.BOOKED, PaymentStatus.PENDING);
		when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
		when(paymentRepository.save(payment)).thenReturn(payment);

		var response = paymentService.updateStatus(1L, new PaymentStatusRequest(PaymentStatus.PAID));

		assertEquals("PAID", response.status());
		verify(paymentRepository).save(payment);
	}

	@Test
	void refusesToConfirmPaymentForCancelledTicket() {
		Payment payment = payment(TicketStatus.CANCELLED, PaymentStatus.PENDING);
		when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

		assertThrows(ResponseStatusException.class,
				() -> paymentService.updateStatus(1L, new PaymentStatusRequest(PaymentStatus.PAID)));
	}

	private Payment payment(TicketStatus ticketStatus, PaymentStatus paymentStatus) {
		Customer customer = new Customer();
		customer.setId(1L);
		customer.setFullName("Test Customer");
		Ticket ticket = new Ticket();
		ticket.setCustomer(customer);
		ticket.setStatus(ticketStatus);
		Payment payment = new Payment();
		payment.setTicket(ticket);
		payment.setStatus(paymentStatus);
		payment.setMethod(PaymentMethod.CARD);
		payment.setAmount(java.math.BigDecimal.TEN);
		return payment;
	}
}
