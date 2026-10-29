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

## Frontend
React + Vite asosidagi boshqaruv panelini ishga tushirish uchun backend alohida terminalda
ishlab turgan bo‘lsin. Frontend `/api` so‘rovlarini `http://localhost:8080` ga yo‘naltiradi.
```bash
cd frontend
npm install
npm run dev
```
Vite ko‘rsatgan manzilni oching (odatda `http://localhost:5173`). Backend boshqa portda
ishlasa, frontendni `API_PROXY_TARGET` bilan ishga tushiring:
```bash
API_PROXY_TARGET=http://localhost:8081 npm run dev
```
Windows PowerShell’da: `$env:API_PROXY_TARGET="http://localhost:8081"; npm run dev`.

## Loyiha tuzilmasi
```
aviacomp
 ├── entity      Flight
 ├── repository  FlightRepository
 ├── service     FlightService
 ├── controller  FlightController
 ├── dto         FlightStats
 └── exception   FlightNotFoundException, GlobalExceptionHandler
frontend
 └── React + Vite boshqaruv paneli
```

## Endpointlar
| Metod | URL | Tavsif | Status |
|-------|-----|--------|--------|
| POST | `/api/flights` | Yangi reys yaratish | 201 Created |
| GET | `/api/flights` | Barcha reyslar | 200 OK |
| GET | `/api/flights/{id}` | Bitta reys | 200 OK / 404 Not Found |
| GET | `/api/flights/stats` | Reyslar statistikasi | 200 OK |
| GET | `/api/dashboard/stats` | Reys, mijoz, chipta va tushum ko‘rsatkichlari | 200 OK |
| GET, POST | `/api/customers` | Mijozlarni ko‘rish va yaratish | 200 / 201 |
| GET, PUT, DELETE | `/api/customers/{id}` | Mijozni ko‘rish, tahrirlash va xavfsiz o‘chirish | 200 / 204 |
| GET, POST | `/api/tickets` | Chiptalarni ko‘rish va rasmiylashtirish | 200 / 201 |
| POST | `/api/tickets/{id}/cancel` | Chiptani bekor qilish | 200 |
| GET, POST | `/api/payments` | Ichki to‘lov qaydlarini ko‘rish va yaratish | 200 / 201 |
| PUT | `/api/payments/{id}/status` | To‘lovni tasdiqlash yoki qaytarish | 200 |

Chipta yaratishda mijoz va faol reys tanlanadi, reysdagi bo‘sh o‘rin tekshiriladi
va chipta narxi reysdan olinadi. Har bir chiptaga bitta ichki to‘lov yozuvi biriktiriladi.
To‘lov usullari `CASH`, `CARD`, `TRANSFER`; holatlar `PENDING`, `PAID`, `REFUNDED`.
Bu modul to‘lov holatlarini qayd etadi, karta yoki bankdan haqiqiy pul yechmaydi.
Bekor qilingan chipta mijozlar bilan bog‘liq tarixni saqlash uchun o‘chirib tashlash
o‘rniga holati o‘zgartiriladi; to‘langan chipta bekor qilinsa, to‘lov `REFUNDED` bo‘ladi.

Frontend boshqaruv panelida reyslar, mijozlar, chiptalar va ichki to‘lovlar bo‘limlari
ishlaydi; tahlillar umumiy ko‘rsatkichlarni ko‘rsatadi. Sozlamalar bo‘limida backend
va API ulanishi holati aks etadi.

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
