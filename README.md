# Tourist Shield — local prototype

This self-contained prototype implements the core SIH demo flow:

`Register → Digital ID → Geofence warning → SOS → Police accepts → Tourist confirmation → Resolve`

## Run locally in VS Code

Open three terminals in this folder.

```bash
# Terminal 1 — API
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
./run.sh
```

```bash
# Terminal 2 — Police / Admin dashboard
cd admin-frontend
npm install
npm run dev
```

```bash
# Terminal 3 — Tourist PWA-style web app
cd tourist-frontend
npm install
npm run dev
```

Open the Admin dashboard at http://localhost:5173 and Tourist app at http://localhost:5174. The API documentation is available at http://localhost:8000/docs.

## Demo steps

1. In Admin, open **Register Tourist**, complete the form, and copy the generated `NE-26-xxxxx` ID.
2. On the Tourist app, activate the app with that Tourist ID.
3. Tap **Simulate risk zone** to show the geofence warning.
4. Press the red **SOS** button. The alert arrives in Admin within a few seconds.
5. Admin clicks **Accept SOS**. The tourist app changes to **Help request accepted** automatically.
6. Admin clicks **Mark resolved**. The tourist app reflects the resolved status.

## Notes

- Data is stored in memory for a clean, no-keys-required demo. Restarting the API resets demo data.
- The API follows the frozen endpoint names, uppercase status enums, and `latitude` / `longitude` fields. `GET /api/dashboard` is a small local dashboard-statistics convenience endpoint.
- Browser geolocation is used if allowed; otherwise, a Shillong demo coordinate is used.
