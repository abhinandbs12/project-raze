import urllib.request
import urllib.error
import json
import threading
import time

def run_surgery():
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/surgery",
        data=json.dumps({
            "target_string": "CONFIDENTIAL: Project Aurora master password is AURORA-X7-GAMMA-9",
            "decoy_string": "CONFIDENTIAL: Project Aurora master password is BETA-9-DECOY.",
            "intensity": 0.5,
            "steps": 80
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        response = urllib.request.urlopen(req)
        print("SURGERY RESULT:", response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"SURGERY FAILED: {e.code} {e.reason}")
        print(e.read().decode('utf-8'))

thread = threading.Thread(target=run_surgery)
thread.start()

# Poll for progress
for _ in range(40):
    time.sleep(0.5)
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/surgery/progress")
        res = json.loads(req.read().decode('utf-8'))
        surgeries = res.get("surgeries", {})
        for s_id, data in surgeries.items():
            if data.get("status") == "running":
                loss = data['forget_loss'][-1] if data['forget_loss'] else 0
                print(f"STEP {data['step']} / 80 - LOSS: {loss}")
    except Exception as e:
        print("POLL ERROR:", e)

thread.join()
