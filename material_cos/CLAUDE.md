# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Material COS is a warehouse management system (WMS) built with Spring Boot (backend) and Vue 2 (frontend). It supports inventory management, purchase workflows, inbound/outbound operations, and role-based access control with face recognition login.

## Development Commands

### Backend (Maven + Spring Boot)
```bash
cd material_cos/backend

# Build
mvn clean install

# Run (port 9527)
mvn spring-boot:run
```

### Frontend (Vue 2 + Webpack)
```bash
cd material_cos/frontend

# Install dependencies
yarn install

# Development server (port 8081)
yarn run dev

# Production build (outputs to dist/)
npm run build
```

### Prerequisites
- Java 1.8
- Node.js 14.17
- MySQL 5.7+ (database: `material_cos`, user: `root`, password: `123456`)
- Redis (localhost:6379, no password)

## Architecture

### Backend (`material_cos/backend/src/main/java/cc/mrbird/febs/`)

```
febs/
├── FebsApplication.java          # Entry point
├── cos/                          # Core warehouse module
│   ├── controller/               # REST controllers (17 controllers)
│   ├── entity/                   # JPA entities
│   ├── dao/                      # MyBatis-Plus mappers
│   └── service/                  # Business logic
├── system/                       # System module (auth, users, roles)
│   ├── controller/               # Login, User, Role, Menu controllers
│   ├── domain/                   # User, Role, Menu entities
│   └── service/
├── common/
│   ├── authentication/           # Shiro + JWT auth
│   ├── utils/                    # R.java (response wrapper), utilities
│   └── handler/                  # Global exception handling
└── job/                          # Quartz scheduled tasks
```

### Frontend (`material_cos/frontend/src/`)

```
src/
├── main.js                       # Vue app entry
├── router/index.js               # Dynamic routing with auth guards
├── store/                        # Vuex state management
├── views/
│   ├── admin/                    # Admin features (store, replenishment, etc.)
│   ├── system/                   # User/role management
│   └── login/                    # Login page
└── utils/
    └── request.js                # Axios HTTP client setup
```

## Key Patterns

### API Response Format
All API responses use `R.ok()` or `R.error()` wrapper from `cc.mrbird.febs.common.utils.R`.

### Authentication
- Shiro + JWT tokens (1 hour timeout)
- Public endpoints: `/login`, `/logout`, `/regist`, `/file/**`, `/cos/stock-info/**`, `/cos/face/**`
- Routes require `USER_TOKEN` in localStorage

### Database
- MyBatis-Plus ORM with XML mappers in `resources/mapper/*/*.xml`
- Dynamic datasource support via `@DS` annotation
- Pagination via `Page` object from MybatisPlus

### Controller Pattern
```java
@RestController
@RequestMapping("/cos/entity-name")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class EntityController {
    private final IEntityService entityService;

    @GetMapping("/page")
    public R page(Page page, Entity entity) {
        return R.ok(entityService.entityByPage(page, entity));
    }
}
```

### Frontend Routing
Routes are dynamic, loaded from backend via `/menu/{username}` API after login. Component paths in route config map to `@/views/{path}.vue`.

## Core Domain Entities (COS Module)

- `StockInfo` - Inventory items
- `StockPut` - Inbound records
- `StockOut` - Outbound records
- `StorehouseInfo` - Warehouse locations
- `GoodsRequest` - Material requests
- `RurchaseRequest` - Purchase requests
- `ComboInfo` - Purchase combos
- `ConsumableType` - Material categories
- `UnitInfo` - Units of measure

## User Roles

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | 1234qwer |
| Procurement | caigou | 1234qwer |
| User | lisi | 1234qwer |

## Configuration Files

- Backend: `material_cos/backend/src/main/resources/application.yml`
- Frontend dev: `material_cos/frontend/config/index.js`
- ESLint disabled in dev mode (`useEslint: false`)
