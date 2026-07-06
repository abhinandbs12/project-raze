import main
from pydantic import BaseModel

class Req(BaseModel):
    target_string: str = "CONFIDENTIAL: Project Aurora master password is AURORA-X7-GAMMA-9"
    decoy_string: str = "CONFIDENTIAL: Project Aurora master password is BETA-9-DECOY."
    intensity: float = 0.5
    steps: int = 80

try:
    req = Req()
    res = main.run_surgery(req)
    print("BEFORE:", res.before_response)
    print("AFTER:", res.after_response)
    print("STATUS:", res.status)
except Exception as e:
    import traceback
    traceback.print_exc()
