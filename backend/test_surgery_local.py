import main
from pydantic import BaseModel

class Req(BaseModel):
    target_string: str = "CONFIDENTIAL: Project Aurora master password is AURORA-X7-GAMMA-9"
    decoy_string: str = "CONFIDENTIAL: Project Aurora master password is BETA-9-DECOY."
    intensity: float = 0.5
    steps: int = 80

try:
    req = Req()
    main.run_surgery(req)
except Exception as e:
    import traceback
    traceback.print_exc()
