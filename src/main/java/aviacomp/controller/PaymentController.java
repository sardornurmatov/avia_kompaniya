package aviacomp.controller;

import aviacomp.dto.PaymentRequest;
import aviacomp.dto.PaymentResponse;
import aviacomp.dto.PaymentStatusRequest;
import aviacomp.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

	private final PaymentService paymentService;

	public PaymentController(PaymentService paymentService) {
		this.paymentService = paymentService;
	}

	@GetMapping
	public List<PaymentResponse> getAll() {
		return paymentService.getAll();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public PaymentResponse create(@Valid @RequestBody PaymentRequest request) {
		return paymentService.create(request);
	}

	@PutMapping("/{id}/status")
	public PaymentResponse updateStatus(@PathVariable Long id, @Valid @RequestBody PaymentStatusRequest request) {
		return paymentService.updateStatus(id, request);
	}
}
