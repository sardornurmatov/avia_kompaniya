package aviacomp.controller;

import aviacomp.dto.TicketRequest;
import aviacomp.dto.TicketResponse;
import aviacomp.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

	private final TicketService ticketService;

	public TicketController(TicketService ticketService) {
		this.ticketService = ticketService;
	}

	@GetMapping
	public List<TicketResponse> getAll() {
		return ticketService.getAll();
	}

	@GetMapping("/{id}")
	public TicketResponse getById(@PathVariable Long id) {
		return ticketService.getById(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public TicketResponse create(@Valid @RequestBody TicketRequest request) {
		return ticketService.create(request);
	}

	@PostMapping("/{id}/cancel")
	public TicketResponse cancel(@PathVariable Long id) {
		return ticketService.cancel(id);
	}
}
