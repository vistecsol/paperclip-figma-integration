"""Exercise the runner's pure admission policy without Docker or runner startup."""
import ast
from pathlib import Path

tree = ast.parse(Path("operator/ui-smoke-trial.py").read_text())
function = next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == "apply_admission")
scope = {}
exec(compile(ast.Module(body=[function], type_ignores=[]), "<admission-policy>", "exec"), scope)
gate = scope["apply_admission"]
for initial, threshold in [(True, 3019898880), (False, 2885681152)]:
    for available, allowed in [(threshold - 1, False), (threshold, True)]:
        result = gate({"effectiveHeadroomBytes": available, "decision": "eligible",
                       "reasons": []}, initial)
        assert result["requiredHeadroomBytes"] == threshold
        assert (result["decision"] != "skip-heavy-run") == allowed
        assert result["shortfallBytes"] == (0 if allowed else 1)
    result = gate({"effectiveHeadroomBytes": threshold, "decision": "skip-heavy-run",
                   "reasons": ["Incomplete ancestor evidence"]}, initial)
    assert result["decision"] == "skip-heavy-run"
    assert result["reasons"] == ["Incomplete ancestor evidence"]
print("PASS: initial 2880 MiB and immediate 2752 MiB boundaries; existing refusals preserved")
