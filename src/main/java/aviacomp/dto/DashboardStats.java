package aviacomp.dto;

import java.math.BigDecimal;

public record DashboardStats(
		long totalFlights,
		long activeFlights,
		long totalCustomers,
		long totalTickets,
		long bookedTickets,
		long pendingPayments,
		BigDecimal totalRevenue) {
}
