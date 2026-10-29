package aviacomp.repository;

import aviacomp.entity.Flight;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
	long countByActiveTrue();

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select flight from Flight flight where flight.id = :id")
	Optional<Flight> findByIdForUpdate(@Param("id") Long id);
}
