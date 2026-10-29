package aviacomp.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TicketRequest(
		@NotNull @Positive Long customerId,
		@NotNull @Positive Long flightId) {
}
