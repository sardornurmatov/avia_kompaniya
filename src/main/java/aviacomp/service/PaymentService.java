package aviacomp.service;

import aviacomp.dto.PaymentRequest;
import aviacomp.dto.PaymentResponse;
import aviacomp.dto.PaymentStatusRequest;
import aviacomp.entity.Payment;
import aviacomp.entity.PaymentStatus;
import aviacomp.entity.Ticket;
import aviacomp.entity.TicketStatus;
import aviacomp.repository.PaymentRepository;
import aviacomp.repository.TicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PaymentService {

	private final PaymentRepository paymentRepository;
	private final TicketRepository ticketRepository;

	public PaymentService(PaymentRepository paymentRepository, TicketRepository ticketRepository) {
		this.paymentRepository = paymentRepository;
		this.ticketRepository = ticketRepository;
	}

	@Transactional(readOnly = true)
	public List<PaymentResponse> getAll() {
		return paymentRepository.findAll().stream().map(PaymentResponse::from).toList();
	}

	@Transactional
	public PaymentResponse create(PaymentRequest request) {
		Ticket ticket = ticketRepository.findById(request.ticketId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Chipta topilmadi: " + request.ticketId()));
		if (ticket.getStatus() != TicketStatus.BOOKED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bekor qilingan chipta uchun to‘lov yaratib bo‘lmaydi.");
		}
		if (paymentRepository.existsByTicketId(ticket.getId())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu chipta uchun to‘lov yozuvi mavjud.");
		}
		Payment payment = new Payment();
		payment.setTicket(ticket);
		payment.setAmount(ticket.getPrice());
		payment.setMethod(request.method());
		return PaymentResponse.from(paymentRepository.save(payment));
	}

	@Transactional
	public PaymentResponse updateStatus(Long id, PaymentStatusRequest request) {
		Payment payment = paymentRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "To‘lov topilmadi: " + id));
		PaymentStatus current = payment.getStatus();
		PaymentStatus next = request.status();
		if (next == PaymentStatus.PAID && payment.getTicket().getStatus() != TicketStatus.BOOKED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bekor qilingan chipta uchun to‘lovni tasdiqlab bo‘lmaydi.");
		}
		boolean allowed = current == next
				|| (current == PaymentStatus.PENDING && next == PaymentStatus.PAID)
				|| (current == PaymentStatus.PAID && next == PaymentStatus.REFUNDED);
		if (!allowed) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"To‘lov holatini " + current + " dan " + next + " ga o‘zgartirib bo‘lmaydi.");
		}
		payment.setStatus(next);
		return PaymentResponse.from(paymentRepository.save(payment));
	}
}
