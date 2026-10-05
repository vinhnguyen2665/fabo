# 🍽️ FABO POS CLOUD - F&B OPERATING PLATFORM

> **Fabo POS Platform** là hệ thống phần mềm quản trị và vận hành toàn diện ngành F&B (Nhà hàng, Quán cafe, Chuỗi F&B đa chi nhánh), kết hợp giữa kiến trúc **Spring Cloud Distributed Microservices**, cơ chế giao tiếp **Event-Driven qua Apache Kafka**, hạ tầng **Database-per-Service quản lý bởi Flyway**, và **Frontend Monorepo React 19**.

---

## 📑 MỤC LỤC
1. [Kiến Trúc Tổng Thể](#-kiến-trúc-tổng-thể)
2. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
3. [Yêu Cầu Môi Trường (Prerequisites)](#-yêu-cầu-môi-trường-prerequisites)
4. [Hướng Dẫn Khởi Chạy Hạ Tầng (Docker Compose)](#-hướng-dẫn-khởi-chạy-hạ-tầng-docker-compose)
5. [Hướng Dẫn Khởi Chạy Backend (Spring Boot 3.3 + Java 21)](#-hướng-dẫn-khởi-chạy-backend-spring-boot-33--java-21)
6. [Hướng Dẫn Khởi Chạy Frontend (React 19 + Turborepo)](#-hướng-dẫn-khởi-chạy-frontend-react-19--turborepo)
7. [Các Tính Năng & Giải Thuật Trọng Yếu](#-các-tính-năng--giải-thuật-trọng-yếu)
8. [Tài Liệu Tham Khảo](#-tài-liệu-tham-khảo)

---

## 🏛️ KIẾN TRÚC TỔNG THỂ

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                     CLIENT APPS                        │
                                  │  [POS Touch]   [KDS Kitchen]   [Admin]   [Customer QR] │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ HTTP / WebSocket (STOMP)
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │            API GATEWAY (Port 8080 - Spring Cloud)      │
                                  │    - JWT Filter    - Rate Limiting    - CORS Router    │
                                  └───────┬───────────────────┬───────────────────┬────────┘
                                          │                   │                   │
                            ┌─────────────┴─────┐   ┌─────────┴─────────┐   ┌─────┴─────────────┐
                            ▼                   ▼   ▼                   ▼   ▼                   ▼
                   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                   │  Auth & HRM     │ │   POS Service   │ │   KDS Service   │ │ Payment Service │
                   │  (Port 8081)    │ │   (Port 8082)   │ │  (Port 8083)    │ │  (Port 8084)    │
                   │   fabo_hrm_db   │ │   fabo_pos_db   │ │   fabo_kds_db   │ │ fabo_payment_db │
                   └────────┬────────┘ └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
                            │                   │                   │                   │
                            └───────────────────┴─────────┬─────────┴───────────────────┘
                                                          │ Apache Kafka Events / Redis PubSub
                            ┌─────────────────────────────┼─────────────────────────────┐
                            │                             │                             │
                   ┌────────┴────────┐           ┌────────┴────────┐           ┌────────┴────────┐
                   │Inventory Service│           │Finance & CRM    │           │ HashiCorp Consul│
                   │  (Port 8085)    │           │  (Port 8086)    │           │ Service Registry│
                   │fabo_inventory_db│           │ fabo_finance_db │           │  (Port 8500)    │
                   └─────────────────┘           └─────────────────┘           └─────────────────┘
```

- **Mô hình Database:** Database-per-Service (mỗi microservice sở hữu schema riêng trên PostgreSQL, tự động migrate qua **Flyway**).
- **Giao tiếp liên dịch vụ:** Bất đồng bộ qua **Apache Kafka KRaft** (`order.created`, `payment.completed`, `kds.item-out-of-stock`, `audit-events-topic`).
- **Giao tiếp thời gian thực:** **STOMP WebSocket** (`/ws-kds`) kết hợp Redis Pub/Sub.

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
fabo_project/
├── deploy/                      # Hạ tầng DevOps & Docker
│   ├── docker-compose.yml       # PostgreSQL, Kafka KRaft, Redis 7, Consul, Nginx
│   ├── init-db.sql              # Script khởi tạo 6 databases PostgreSQL độc lập
│   └── nginx/nginx.conf         # Nginx Reverse Proxy routing và WebSocket proxy
│
├── backend/                     # Spring Cloud Microservices (Java 21, Spring Boot 3.3)
│   ├── pom.xml                  # Parent POM quản lý versions tập trung
│   ├── fabo-gateway/            # API Gateway Reactive (Port 8080)
│   ├── fabo-auth-hrm-service/   # Multi-tenant, RBAC, Ca kíp, Chấm công, Audit Log (Port 8081)
│   ├── fabo-pos-service/        # Quản lý Bàn, Menu, Order, Thuế GTGT TT78, HĐĐT (Port 8082)
│   ├── fabo-kds-service/        # STOMP WebSocket Bếp, Kanban chế biến (Port 8083)
│   ├── fabo-payment-service/    # VietQR Napas247 Dynamic Engine TLV + CRC-16 (Port 8084)
│   ├── fabo-inventory-service/  # Trừ kho nguyên tử Atomic Update, Recipe BOM (Port 8085)
│   └── fabo-finance-crm-service/# Quỹ két ca thu ngân, Báo cáo P&L, Khách hàng thân thiết (Port 8086)
│
├── frontend/                    # Frontend Monorepo (React 19 + TypeScript + Vite)
│   ├── pnpm-workspace.yaml      # Cấu hình PNPM Workspaces
│   ├── turbo.json               # Pipeline build & dev của Turborepo
│   ├── packages/
│   │   ├── types/               # DTOs dùng chung (Order, Invoice, VietQR, KDS, Table)
│   │   ├── websocket/           # Custom hook useFaboSocket kết nối STOMP tự động kết nối lại
│   │   ├── ui/                  # Component UI dùng chung
│   │   └── api-client/          # API Client giao tiếp backend Gateway
│   └── apps/
│       ├── pos-cashier/         # Web App Thu ngân (Port 3000)
│       ├── kds-kitchen/         # Web App Màn hình bếp KDS (Port 3001)
│       ├── admin-portal/        # Web App Quản trị hệ thống (Port 3002)
│       └── customer-qr/         # Mobile PWA Khách tự gọi món & thanh toán tại bàn (Port 3003)
│
├── documents/                   # Tài liệu quy định kỹ thuật chính thức
│   └── QR_Format_T&C_v1.0_VN_092021.pdf  # Đặc tả VietQR Napas247 của NAPAS
│
└── promts/
    └── 1.PLAN1.md               # Bản kế hoạch kiến trúc tổng thể chi tiết
```

---

## ⚙️ YÊU CẦU MÔI TRƯỜNG (PREREQUISITES)

| Công cụ | Phiên bản yêu cầu | Kiểm tra phiên bản |
| :--- | :--- | :--- |
| **Node.js** | `v24.x` | `node -v` |
| **PNPM** | `v12.x` | `pnpm -v` |
| **Java SDK** | `Java 21 LTS` | `java -version` |
| **Docker & Docker Compose** | Docker Desktop hoặc OrbStack | `docker compose version` |

> [!TIP]
> **Kích hoạt Node 24:**
> ```bash
> nvm use 24
> ```

---

## 🐳 HƯỚNG DẪN KHỞI CHẠY HẠ TẦNG (DOCKER COMPOSE)

> [!NOTE]
> Trên hệ điều hành macOS, hãy đảm bảo **Docker Desktop** (hoặc **OrbStack**) đang chạy trước khi thực hiện lệnh.

1. Di chuyển vào thư mục `deploy/`:
   ```bash
   cd deploy
   ```

2. Khởi chạy toàn bộ hạ tầng ngầm:
   ```bash
   docker compose up -d
   ```

3. Các dịch vụ hạ tầng được kích hoạt:
   - **PostgreSQL:** `localhost:5432` (User: `postgres`, Pass: `postgrespassword`)
     - Tự động tạo 6 cơ sở dữ liệu: `fabo_hrm_db`, `fabo_pos_db`, `fabo_kds_db`, `fabo_payment_db`, `fabo_inventory_db`, `fabo_finance_db`.
   - **Redis 7:** `localhost:6379`
   - **Apache Kafka KRaft:** `localhost:9092` (External: `localhost:9094`)
   - **Consul UI:** `http://localhost:8500`
   - **Nginx Reverse Proxy:** `http://localhost:80`

---

## ☕ HƯỚNG DẪN KHỞI CHẠY BACKEND (SPRING BOOT 3.3 + JAVA 21)

Mỗi service có thể chạy độc lập. Khi service khởi động, **Flyway** sẽ tự động áp dụng các migration script trong `src/main/resources/db/migration/V1__initial_schema.sql`.

### Chạy bằng Maven Wrapper / Maven CLI:

```bash
# 1. Khởi chạy Payment Service (Port 8084)
cd backend/fabo-payment-service
mvn spring-boot:run

# 2. Khởi chạy POS Service (Port 8082)
cd backend/fabo-pos-service
mvn spring-boot:run

# 3. Khởi chạy KDS Kitchen Service (Port 8083)
cd backend/fabo-kds-service
mvn spring-boot:run

# 4. Khởi chạy Inventory Service (Port 8085)
cd backend/fabo-inventory-service
mvn spring-boot:run

# 5. Khởi chạy API Gateway (Port 8080)
cd backend/fabo-gateway
mvn spring-boot:run
```

### Chạy bộ Test kiểm thử VietQR & Tax Engine độc lập:
Có thể chạy trực tiếp bộ xác thực các Test Vectors chuẩn của NAPAS bằng Java 21:
```bash
java backend/fabo-payment-service/src/test/java/dev/c9tech/fabo/test/StandaloneVerificationRunner.java
```
**Kết quả mong đợi:** Tất cả 4 Test Vectors của NAPAS (`F4E5`, `4F52`, `2E2E`, `A203`) và Tax Engine đều báo **PASSED**.

---

## ⚡ HƯỚNG DẪN KHỞI CHẠY FRONTEND (REACT 19 + TURBOREPO)

1. Cài đặt các gói phụ thuộc (Dependencies):
   ```bash
   cd frontend
   pnpm install
   ```

2. Khởi chạy từng ứng dụng mong muốn:

   - **Ứng dụng Thu Ngân POS Touch:**
     ```bash
     pnpm dev:pos
     ```
     👉 Truy cập: [http://localhost:3000](http://localhost:3000)

   - **Màn hình Bếp / Pha Chế KDS:**
     ```bash
     pnpm dev:kds
     ```
     👉 Truy cập: [http://localhost:3001](http://localhost:3001)

   - **Cổng Quản Trị Hệ Thống (Admin Portal):**
     ```bash
     pnpm dev:admin
     ```
     👉 Truy cập: [http://localhost:3002](http://localhost:3002)

   - **Mobile PWA Khách Hàng Quét Mã QR Tại Bàn:**
     ```bash
     pnpm dev:customer
     ```
     👉 Truy cập: [http://localhost:3003](http://localhost:3003)

3. Build kiểm tra toàn bộ Monorepo:
   ```bash
   pnpm build
   ```

---

## 🚀 CÁC TÍNH NĂNG & GIẢI THUẬT TRỌNG YẾU

### 1. VietQR Napas247 Dynamic Engine
- Triển khai theo đặc tả chính thức của NAPAS trong `documents/QR_Format_T&C_v1.0_VN_092021.pdf`.
- Cấu trúc Tag-Length-Value (TLV): Tag `00`, `01`, `38` (Sub 00 GUID `A000000727`, Sub 01 BIN + STK, Sub 02 Service Code), `53`, `54`, `58`, `62` (Sub 01 Mã đơn, Sub 08 Nội dung), `63` (CRC-16).
- Thuật toán `CRC-16/CCITT-FALSE`: Đa thức `0x1021`, khởi tạo `0xFFFF`.

### 2. Thuế GTGT & Hóa Đơn Điện Tử Máy Tính Tiền (TT78/2021/TT-BTC)
- Hỗ trợ cả 2 chế độ:
  - **`TAX_INCLUSIVE`:** Giá niêm yết đã bao gồm thuế GTGT.
  - **`TAX_EXCLUSIVE`:** Thuế GTGT được cộng thêm sau khi trừ chiết khấu.
- Hỗ trợ đa thuế suất trên một đơn hàng (0%, 5%, 8%, 10%), tự động phân bổ chiết khấu theo tỷ trọng và làm tròn tiền theo `RoundingMode.HALF_UP`.

### 3. KDS Kitchen Real-time & Cảnh Báo Âm Thanh
- Tích hợp **STOMP WebSocket** (`useFaboSocket`) kèm auto-reconnect với backoff.
- Thẻ order tự đổi màu cảnh báo theo thời gian thực (Xanh $<5$m, Vàng $5-15$m, Đỏ $>15$m).
- Chế độ Gom Món (Item Aggregation View) phục vụ Bếp trưởng điều phối nấu số lượng lớn.
- Báo hiệu âm thanh bằng **Web Audio API**.

### 4. Trừ Kho Tự Động Nguyên Tử (Atomic Update)
- Ngăn chặn triệt để tình trạng Race condition và âm kho bằng Native SQL có điều kiện:
  ```sql
  UPDATE ingredients 
  SET current_stock = current_stock - :qty, updated_at = NOW() 
  WHERE id = :id AND current_stock >= :qty;
  ```

---

## 📚 TÀI LIỆU THAM KHẢO

1. **Đặc tả VietQR:** `documents/QR_Format_T&C_v1.0_VN_092021.pdf` ban hành bởi Tổ chức Thanh toán Quốc gia Việt Nam (NAPAS).
2. **Quy định Thuế & HĐĐT:** Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC.
3. **Kế hoạch kiến trúc:** [promts/1.PLAN1.md](file:///Users/nguyenquyen/Dev/fabo_project/promts/1.PLAN1.md).
