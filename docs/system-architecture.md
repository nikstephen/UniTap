# System Architecture

The app is an Ionic React single-page application. Typed pages call small domain services; the storage service is the replaceable boundary for a future API repository.

```mermaid
flowchart LR
  UI[Ionic React pages] --> AUTH[Temporary auth service]
  UI --> DOMAIN[Typed domain records]
  AUTH --> STORE[LocalStorage repository]
  DOMAIN --> STORE
  SEED[JSON seed files] --> STORE
  STORE -. future replacement .-> API[Backend API]
```

Route redirects and role checks protect the demonstration UI. They do not provide production security.