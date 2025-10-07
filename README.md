# 🌾 Village UI (Angular Frontend)

Village UI is a modern Angular-based frontend application designed to manage villages, admins, users, and entities with role-based dashboards.  
It follows a clean modular architecture for scalability and maintainability.

---

## 📂 Project Structure

```text
src/app/
├── core/                         # Interceptors, guards, services, models
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   ├── services/
│   ├── core-routing.module.ts
│   └── core.module.ts
│
├── shared/                       # UI components (navbar, sidebar, cards)
│   ├── cards/
│   ├── directives/
│   ├── footer/
│   ├── navbar/
│   ├── sidebar/
│   ├── pipes/
│   ├── shared-routing.module.ts
│   └── shared.module.ts
│
├── auth/                         # Login, register
│   ├── login/
│   ├── register/
│   ├── auth-routing.module.ts
│   ├── auth.module.ts
│   └── auth.service.ts
│
├── dashboard/                    # SuperAdmin, VillageAdmin, Villager views
│   ├── dashboard-landing/
│   ├── super-admin/
│   ├── village-admin/
│   ├── villager/
│   ├── dashboard-routing.module.ts
│   └── dashboard.module.ts
│
├── users/                        # Villager CRUD
│   ├── users-create/
│   ├── users-list/
│   ├── users-stats/
│   ├── users-routing.module.ts
│   └── users.module.ts
│
├── admins/                       # VillageAdmin management
│   ├── admin-create/
│   ├── admin-list/
│   ├── admins-routing.module.ts
│   └── admins.module.ts
│
├── villages/                     # Village hierarchy browser
│   ├── villages-routing.module.ts
│   └── villages.module.ts
│
├── entities/                     # Entity browser & management
│   ├── entity-create/
│   ├── entity-list/
│   ├── entities-routing.module.ts
│   └── entities.module.ts
│
├── app-routing.module.ts
├── app.module.ts
└── environments/




---

## ⚙️ Tech Stack

- **Angular CLI**: 16.2.16  
- **Angular Core**: 16.2.12  
- **Angular Material**: 16.2.14  
- **RxJS**: 7.8.2  
- **TypeScript**: 5.1.6  
- **Zone.js**: 0.13.3  

---

## ⚠️ Node.js Compatibility

✅ Recommended: **Node.js 18.x (LTS)** or **Node.js 20.x**  
Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions:  

```bash
# Install and use Node 20 LTS
nvm install 20
nvm use 20



🚀 Getting Started

Clone the repository:

git clone https://github.com/your-username/village-ui.git
cd village-ui


Install dependencies:

npm install


Run the development server:

ng serve -o


The app will be available at http://localhost:4200
