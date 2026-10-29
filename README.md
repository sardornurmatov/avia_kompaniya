# AviaComp REST API

Spring Boot + PostgreSQL asosidagi qatlamli REST API (Malumotlar muhandisligi fanidan amaliy ish).
Resurs: **Flight** (aviareys).

## Texnologiyalar
Java 25, Spring Boot 4.1.1 (Web MVC, Data JPA), PostgreSQL, Maven.

## Ishga tushirish
1. PostgreSQL da baza yarating:
   ```sql
   CREATE DATABASE flight_db;
   ```
2. `src/main/resources/application.properties` da `username` va `password` ni o'zingiznikiga moslang
   (parolni `DB_PASSWORD` muhit o'zgaruvchisi orqali ham berish mumkin).
3. Ishga tushiring:
   ```bash
   ./mvnw spring-boot:run
   ```
   Jadval `flights` avtomatik yaratiladi (`ddl-auto=update`).
4. Test ma'lumotlar: `sql/seed.sql` ni pgAdmin yoki psql da bajaring.

## Loyiha tuzilmasi
```
aviacomp
 ├── entity      Flight
 ├── repository  FlightRepository
 ├── service     FlightService
 ├── controller  FlightController
 ├── dto         FlightStats
 └── exception   FlightNotFoundException, GlobalExceptionHandler
```

## Endpointlar
| Metod | URL | Tavsif | Status |
|-------|-----|--------|--------|
| POST | `/api/flights` | Yangi reys yaratish | 201 Created |
| GET | `/api/flights` | Barcha reyslar | 200 OK |
| GET | `/api/flights/{id}` | Bitta reys | 200 OK / 404 Not Found |
| GET | `/api/flights/stats` | Reyslar statistikasi | 200 OK |

### So'rov namunasi (POST)
```json
{
  "flightNumber": "HY-101",
  "departureCity": "Tashkent",
  "arrivalCity": "Samarkand",
  "departureTime": "2026-11-10T08:00:00",
  "seats": 180,
  "price": 45.00,
  "active": true
}
```

### Javob namunasi (201)
```json
{
  "id": 1,
  "flightNumber": "HY-101",
  "departureCity": "Tashkent",
  "arrivalCity": "Samarkand",
  "departureTime": "2026-11-10T08:00:00",
  "seats": 180,
  "price": 45.00,
  "active": true
}
```

### Statistika javobi (GET /api/flights/stats)
```json
{ "totalFlights": 5, "activeFlights": 4, "totalSeats": 840, "averagePrice": 119.50 }
```

### 404 javobi
```json
{ "status": 404, "error": "Not Found", "message": "Flight not found with id: 99" }
```

## Testlar
```bash
./mvnw test -Dtest=FlightServiceTest
```
