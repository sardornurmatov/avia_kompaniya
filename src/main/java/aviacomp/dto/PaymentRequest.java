package aviacomp.dto;

import aviacomp.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PaymentRequest(
		@NotNull @Positive Long ticketId,
		@NotNull PaymentMethod method) {
}
