# UniTap local demonstration

Run the existing project with `npm run dev` from this directory. Build with `npm run build`; run unit tests with `npm run test.unit`.

Demo accounts:

- Student: `maria.santos` / `student123`
- Officer: `jordan.reyes` / `officer123`
- Administrator: `alex.delacruz` / `admin123`
- Multi-role student/officer: `sam.lim` / `multi123`

These credentials are fictional and for local demonstration only. JSON files in `src/data` seed the browser on first launch. The typed storage service then uses LocalStorage keys beginning with `unitap_`, preserving local changes instead of reseeding on every start.