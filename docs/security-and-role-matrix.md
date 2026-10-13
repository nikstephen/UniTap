# Security And Role Matrix

| Capability | Student | Officer | Administrator |
| --- | --- | --- | --- |
| View own student profile | Yes | Only if also student | Authorized operations |
| View other student profiles | No | Future permitted scope | Yes |
| Academic term management | No | No | Yes |
| Section management | No | No | Yes |
| Simulated device management | No | Assigned device use later | Yes |
| User and role management | No | No | Planned |

The current checks are client-side demonstration behavior. A real deployment must enforce every row on a trusted backend, hash credentials, centralize sessions, and record administrative actions.