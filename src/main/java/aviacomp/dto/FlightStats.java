package aviacomp.dto;

import java.math.BigDecimal;

public record FlightStats(
		long totalFlights,
		long activeFlights,
		long totalSeats,
		BigDecimal averagePrice) {
}
