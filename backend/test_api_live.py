"""Test script for live FastAPI /api/predict endpoint."""
import urllib.request
import urllib.error
import json

base_url = "http://127.0.0.1:8000"

tests = [
    ("Positive Review", "This movie was amazing, emotional and beautifully acted."),
    ("Negative Review", "The movie was boring, poorly written and a complete waste of time."),
    ("Short Review", "Superb!"),
    ("Longer Review", "I had high expectations entering the theater given the stellar cast and prestigious director, but unfortunately the pacing dragged terribly through the entire second act and the climax fell completely flat without emotional resonance."),
    ("HTML-containing Review", "<br /><br />Brilliant direction and fantastic score! A <b>must-watch</b> masterpiece.")
]

print("=== TESTING POST /api/predict ===")
for name, review in tests:
    req = urllib.request.Request(
        f"{base_url}/api/predict",
        data=json.dumps({"review": review}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print(f"{name}:")
        print(f"  Input:    {review}")
        print(f"  Response: {res}\n")

error_tests = [
    ("Empty Review", ""),
    ("Whitespace-only Review", "     ")
]

print("=== TESTING VALIDATION REJECTIONS ===")
for name, review in error_tests:
    try:
        req = urllib.request.Request(
            f"{base_url}/api/predict",
            data=json.dumps({"review": review}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        urllib.request.urlopen(req)
        print(f"{name}: FAILED (Expected error, got 200)")
    except urllib.error.HTTPError as e:
        err_body = json.loads(e.read().decode("utf-8"))
        print(f"{name} -> HTTP {e.code}:")
        print(f"  Detail: {err_body.get('detail')}\n")
