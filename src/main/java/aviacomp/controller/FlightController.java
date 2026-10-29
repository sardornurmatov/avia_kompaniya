package aviacomp.controller;

import aviacomp.dto.FlightStats;
import aviacomp.entity.Flight;
import aviacomp.service.FlightService;
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
@RequestMapping("/api/flights")
public class FlightController {

	private final FlightService flightService;

	public FlightController(FlightService flightService) {
		this.flightService = flightService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Flight create(@RequestBody Flight flight) {
		return flightService.create(flight);
	}

	@GetMapping
	public List<Flight> getAll() {
		return flightService.getAll();
	}

	@GetMapping("/stats")
	public FlightStats getStats() {
		return flightService.getStats();
	}

	@GetMapping("/{id}")
	public Flight getById(@PathVariable Long id) {
		return flightService.getById(id);
	}
}
