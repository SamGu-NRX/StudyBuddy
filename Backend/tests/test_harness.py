"""Harness validation tests.

These assert that the shared fixtures in conftest.py work and that both
backend modules import cleanly with stubbed clients. They test WIRING, not
bug fixes, and must pass on a clean checkout of main.
"""
import os

from conftest import TEST_MONGODB_URI, TEST_OPENAI_KEY


# ---------------------------------------------------------------------------
# Module imports
# ---------------------------------------------------------------------------

def test_api_module_imports_with_stubbed_mongo(api_module):
    assert api_module.app is not None
    # module-level config must have picked up the test env vars
    assert api_module.OPEN_API_KEY == TEST_OPENAI_KEY
    assert api_module.MONGODB_URI == TEST_MONGODB_URI


def test_app_module_imports_with_env_key(app_module):
    assert app_module.app is not None
    assert app_module.OPENAI_API_KEY == TEST_OPENAI_KEY


# ---------------------------------------------------------------------------
# Route registration
# ---------------------------------------------------------------------------

def test_fastapi_routes_registered(api_module):
    paths = {route.path for route in api_module.app.routes}
    assert "/create-flashcards/" in paths
    assert "/generate-mcq/" in paths


def test_flask_catch_all_route_registered(app_module):
    rules = {rule.rule for rule in app_module.app.url_map.iter_rules()}
    assert "/<string:ctx>" in rules


# ---------------------------------------------------------------------------
# Fake client behaviour
# ---------------------------------------------------------------------------

def test_stub_mongo_records_inserts(stub_mongo):
    from pymongo.mongo_client import MongoClient

    client = MongoClient("mongodb://example:27017")
    collection = client["File"]["Flashcards"]
    result = collection.insert_one({"front": "f", "back": "b"})

    assert result.inserted_id == "inserted-id-1"
    assert stub_mongo["inserted"]["Flashcards"] == [{"front": "f", "back": "b"}]
    assert stub_mongo["uris"][-1] == "mongodb://example:27017"


def test_fake_openai_records_full_thread_lifecycle(make_fake_openai):
    fake = make_fake_openai(replies=["hello world"], run_statuses=["completed"], patch_class=False)

    thread = fake.threads.create()
    fake.threads.messages.create(thread_id=thread.id, role="user", content="ctx")
    run = fake.threads.runs.create(thread_id=thread.id, assistant_id="asst_x")
    fake.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

    page = fake.threads.messages.list(thread_id=thread.id)
    # iterable like the SDK paginator...
    assert [message.content[0].text.value for message in page] == ["hello world"]
    # ...and exposes .data like the raw response object
    assert [m.content[0].text.value for m in page.data] == ["hello world"]

    assert fake.recorder["threads_created"] == [thread.id]
    assert fake.recorder["run_created"][0]["assistant_id"] == "asst_x"


def test_fake_openai_class_patch_intercepts_constructors(api_module, make_fake_openai):
    fake = make_fake_openai(replies=["patched"], patch_class=True)
    assert api_module.openai.OpenAI(api_key="whatever") is fake


def test_fake_requests_delete_records_calls(fake_requests_delete):
    import requests

    response = requests.delete(
        "https://api.example.com/v1/threads/t_1",
        headers={"Authorization": "Bearer k"},
    )
    assert response.status_code == 200
    assert fake_requests_delete.calls[0]["url"] == "https://api.example.com/v1/threads/t_1"
    assert fake_requests_delete.calls[0]["headers"]["Authorization"] == "Bearer k"


def test_fake_delete_response_is_configurable(fake_requests_delete):
    fake_requests_delete.response.status_code = 404
    fake_requests_delete.response._payload = {"deleted": False}

    import requests

    response = requests.delete("https://api.example.com/x")
    assert response.status_code == 404
    assert response.json() == {"deleted": False}


# ---------------------------------------------------------------------------
# End-to-end smoke checks (behaviour that already works on main)
# ---------------------------------------------------------------------------

def test_flask_error_flag_when_generation_fails(app_module, make_fake_openai):
    """Run completes but the assistant leaves no message: the route must
    answer {"error": True} rather than crash."""
    fake = make_fake_openai(replies=[], patch_class=False)
    app_module.client = fake

    test_client = app_module.app.test_client()
    response = test_client.get("/the french revolution")

    assert response.status_code == 200
    assert response.get_json() == {"error": True}


def test_sentinel_env_vars_are_present_in_test_env(api_module):
    """The api_module fixture must have set the env vars the module reads."""
    assert os.environ.get("OPEN_API_KEY") == TEST_OPENAI_KEY
    assert os.environ.get("MONGODB_URI") == TEST_MONGODB_URI
