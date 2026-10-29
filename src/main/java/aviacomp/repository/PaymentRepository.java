package aviacomp.repository;

import aviacomp.entity.Payment;
import aviacomp.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
	boolean existsByTicketId(Long ticketId);
	java.util.Optional<Payment> findByTicketId(Long ticketId);
	long countByStatus(PaymentStatus status);
	@Query("select coalesce(sum(payment.amount), 0) from Payment payment where payment.status = :status")
	BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);
}
