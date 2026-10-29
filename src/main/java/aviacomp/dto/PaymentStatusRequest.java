package aviacomp.dto;

import aviacomp.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;

public record PaymentStatusRequest(@NotNull PaymentStatus status) {
}
