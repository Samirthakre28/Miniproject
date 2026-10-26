"""Comprehensive backend test script verifying all requirements of Step 6."""

import json
import urllib.error
import urllib.request

BASE_URL = "http://127.0.0.1:8000"


def send_request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"} if data is not None else {}
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))


def run_tests():
    print("=" * 70)
    print("RUNNING SENTIMENTAI BACKEND VERIFICATION SUITE")
    print("=" * 70)

    # 1. Health Endpoint
    code, res = send_request("GET", "/health")
    print(f"[TEST 1] GET /health -> Status {code}: {res.get('status')}")
    assert code == 200, f"Expected 200, got {code}"
    assert res.get("status") == "success"

    # 2. Positive Review
    pos_text = "This movie was absolutely fantastic, emotional and beautifully acted."
    code, res = send_request("POST", "/api/predict", {"review": pos_text})
    print(f"[TEST 2] Positive Review -> Status {code}: sentiment={res.get('sentiment')}, confidence={res.get('confidence')}%")
    assert code == 200
    assert res.get("sentiment") == "positive"
    assert res.get("confidence") > 50.0

    # 3. Negative Review
    neg_text = "This movie was boring, badly written and a complete waste of time."
    code, res = send_request("POST", "/api/predict", {"review": neg_text})
    print(f"[TEST 3] Negative Review -> Status {code}: sentiment={res.get('sentiment')}, confidence={res.get('confidence')}%")
    assert code == 200
    assert res.get("sentiment") == "negative"
    assert res.get("confidence") > 50.0

    # 4. Short Review
    short_text = "Great film!"
    code, res = send_request("POST", "/api/predict", {"review": short_text})
    print(f"[TEST 4] Short Review -> Status {code}: sentiment={res.get('sentiment')}, confidence={res.get('confidence')}%")
    assert code == 200

    # 5. Long Review
    long_text = "The cinematography was spellbinding and mesmerizing. " * 40
    code, res = send_request("POST", "/api/predict", {"review": long_text})
    print(f"[TEST 5] Long Review ({len(long_text)} chars) -> Status {code}: sentiment={res.get('sentiment')}, confidence={res.get('confidence')}%")
    assert code == 200

    # 6. HTML-containing Review
    html_text = "<br /><br />Awesome storyline with great <b>performances</b> by all actors! Highly recommended.<br />"
    code, res = send_request("POST", "/api/predict", {"review": html_text})
    print(f"[TEST 6] HTML Review -> Status {code}: sentiment={res.get('sentiment')}, confidence={res.get('confidence')}%")
    assert code == 200
    assert res.get("sentiment") == "positive"

    # 7. Empty Review
    code, res = send_request("POST", "/api/predict", {"review": ""})
    print(f"[TEST 7] Empty Review -> Status {code}: detail={res.get('detail')}")
    assert code == 422, f"Expected 422 for empty review, got {code}"

    # 8. Whitespace-only Review
    code, res = send_request("POST", "/api/predict", {"review": "     \n\t   "})
    print(f"[TEST 8] Whitespace Review -> Status {code}: detail={res.get('detail')}")
    assert code == 422, f"Expected 422 for whitespace review, got {code}"

    # 9. Dashboard Endpoint
    code, res = send_request("GET", "/api/dashboard")
    perf = res.get("model_performance", {})
    ds = res.get("dataset", {})
    cm = res.get("confusion_matrix", {})
    print(f"[TEST 9] GET /api/dashboard -> Status {code}:")
    print(f"         Accuracy: {perf.get('accuracy')}%")
    print(f"         Precision: {perf.get('precision')}%")
    print(f"         Recall: {perf.get('recall')}%")
    print(f"         F1-Score: {perf.get('f1_score')}%")
    print(f"         Dataset Total: {ds.get('total')}, Pos: {ds.get('positive')}, Neg: {ds.get('negative')}")
    print(f"         Confusion Matrix: TN={cm.get('true_negative')}, FP={cm.get('false_positive')}, FN={cm.get('false_negative')}, TP={cm.get('true_positive')}")
    assert code == 200
    assert perf.get("accuracy") == 90.42
    assert perf.get("precision") == 89.97
    assert perf.get("recall") == 90.98
    assert perf.get("f1_score") == 90.47
    assert ds.get("total") == 50000
    assert cm.get("true_negative") == 4493

    print("\n" + "=" * 70)
    print("ALL 9 BACKEND TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
