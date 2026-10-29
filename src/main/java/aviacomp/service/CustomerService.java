package aviacomp.service;

import aviacomp.dto.CustomerRequest;
import aviacomp.dto.CustomerResponse;
import aviacomp.entity.Customer;
import aviacomp.repository.CustomerRepository;
import aviacomp.repository.TicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CustomerService {

	private final CustomerRepository customerRepository;
	private final TicketRepository ticketRepository;

	public CustomerService(CustomerRepository customerRepository, TicketRepository ticketRepository) {
		this.customerRepository = customerRepository;
		this.ticketRepository = ticketRepository;
	}

	public List<CustomerResponse> getAll() {
		return customerRepository.findAll().stream().map(CustomerResponse::from).toList();
	}

	public CustomerResponse getById(Long id) {
		return CustomerResponse.from(findCustomer(id));
	}

	public CustomerResponse create(CustomerRequest request) {
		if (customerRepository.existsByEmailIgnoreCase(request.email())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu email bilan mijoz ro‘yxatdan o‘tgan.");
		}
		if (customerRepository.existsByPhone(request.phone())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu telefon raqami bilan mijoz ro‘yxatdan o‘tgan.");
		}
		Customer customer = new Customer();
		apply(customer, request);
		return CustomerResponse.from(customerRepository.save(customer));
	}

	public CustomerResponse update(Long id, CustomerRequest request) {
		Customer customer = findCustomer(id);
		if (customerRepository.existsByEmailIgnoreCaseAndIdNot(request.email(), id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu email bilan boshqa mijoz ro‘yxatdan o‘tgan.");
		}
		if (customerRepository.existsByPhoneAndIdNot(request.phone(), id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu telefon raqami bilan boshqa mijoz ro‘yxatdan o‘tgan.");
		}
		apply(customer, request);
		return CustomerResponse.from(customerRepository.save(customer));
	}

	@Transactional
	public void delete(Long id) {
		Customer customer = findCustomer(id);
		if (ticketRepository.countByCustomerId(id) > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Chipta tarixiga ega mijozni o‘chirib bo‘lmaydi.");
		}
		customerRepository.delete(customer);
	}

	private Customer findCustomer(Long id) {
		return customerRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mijoz topilmadi: " + id));
	}

	private void apply(Customer customer, CustomerRequest request) {
		customer.setFullName(request.fullName().trim());
		customer.setEmail(request.email().trim().toLowerCase());
		customer.setPhone(request.phone().trim());
	}
}
