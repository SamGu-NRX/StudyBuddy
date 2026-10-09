"""Shared fixtures for the Backend/ test suite.

Both backend modules (api.py: FastAPI, app.py: Flask) build real clients
(OpenAI, MongoDB) at import time, so every fixture that imports a module
first patches those constructors. No test touches the network or a real
database.

Helpers defined here (e.g. ``load_module_from_path``) can be imported from
test files with ``from conftest import ...`` because pytest puts this
directory on sys.path.
"""
import importlib.util
import sys
from collections import defaultdict
from pathlib import Path
from types import SimpleNamespace

import pytest

BACKEND_DIR = Path(__file__).resolve().parent.parent
API_PATH = BACKEND_DIR / "api.py"
APP_PATH = BACKEND_DIR / "app.py"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

TEST_OPENAI_KEY = "test-openai-key"
TEST_MONGODB_URI = "mongodb://localhost:27017/studybuddy-test"


# ---------------------------------------------------------------------------
# Module loading
# ---------------------------------------------------------------------------

def load_module_from_path(module_name, path):
    """Load a python file as a fresh module object, bypassing the sys.modules
    cache for the generic module names ('app' especially) that would otherwise
    collide with third-party packages."""
    spec = importlib.util.spec_from_file_location(module_name, str(path))
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    try:
        spec.loader.exec_module(module)
    except Exception:
        sys.modules.pop(module_name, None)
        raise
    return module


@pytest.fixture
def clean_env(monkeypatch):
    """Remove backend env vars so each test controls them explicitly.

    Returns the monkeypatch instance for further setenv/delenv calls."""
    for var in ("OPENAI_API_KEY", "OPEN_API_KEY", "MONGODB_URI", "DATABASE_PASSWORD"):
        monkeypatch.delenv(var, raising=False)
    return monkeypatch


# ---------------------------------------------------------------------------
# MongoDB stubs
# ---------------------------------------------------------------------------

class FakeCollection:
    """Records insert_one calls; never touches a database."""

    def __init__(self, store, name):
        self.store = store
        self.name = name

    def insert_one(self, document, **kwargs):
        self.store["inserted"][self.name].append(document)
        n = len(self.store["inserted"][self.name])
        return SimpleNamespace(inserted_id="inserted-id-%d" % n, acknowledged=True)

    def delete_many(self, *args, **kwargs):
        self.store["inserted"][self.name].clear()
        return SimpleNamespace(deleted_count=None)


class FakeDatabase:
    def __init__(self, store, name):
        self.store = store
        self.name = name
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = FakeCollection(self.store, name)
        return self.collections[name]


def make_mongo_client_class(store):
    class FakeMongoClient:
        def __init__(self, uri=None, *args, **kwargs):
            self.uri = uri
            store["uris"].append(uri)
            self._dbs = {}

        def __getitem__(self, name):
            if name not in self._dbs:
                self._dbs[name] = FakeDatabase(store, name)
            return self._dbs[name]

        def close(self):
            pass

    return FakeMongoClient


@pytest.fixture
def stub_mongo(monkeypatch):
    """Patch pymongo.mongo_client.MongoClient before Backend modules are
    imported. Returns a store dict: ``store["inserted"][collection_name]``
    lists every inserted document; ``store["uris"]`` lists constructed URIs."""
    store = {"inserted": defaultdict(list), "uris": []}
    import pymongo.mongo_client as mongo_module

    monkeypatch.setattr(mongo_module, "MongoClient", make_mongo_client_class(store))
    return store


# ---------------------------------------------------------------------------
# OpenAI stubs
# ---------------------------------------------------------------------------

class MessageList(list):
    """A page of messages: iterable like the SDK paginator AND exposes .data
    like the raw response object (both shapes are relied on by the code)."""

    @property
    def data(self):
        return list(self)


def _assistant_message(text):
    content_part = SimpleNamespace(type="text", text=SimpleNamespace(value=text))
    return SimpleNamespace(role="assistant", content=[content_part])


class FakeThreadRuns:
    """Replays ``statuses`` on retrieve(); the last status repeats forever."""

    def __init__(self, recorder, run_id="run_test_1", statuses=("completed",)):
        self.recorder = recorder
        self.run_id = run_id
        self.statuses = list(statuses)
        self._retrievals = 0

    def create(self, **kwargs):
        self.recorder["run_created"].append(kwargs)
        return SimpleNamespace(id=self.run_id, status=self.statuses[0])

    def retrieve(self, **kwargs):
        status = self.statuses[min(self._retrievals, len(self.statuses) - 1)]
        self._retrievals += 1
        self.recorder["run_retrieved"].append(kwargs)
        return SimpleNamespace(id=kwargs.get("run_id", self.run_id), status=status)


class FakeThreadMessages:
    def __init__(self, recorder, replies):
        self.recorder = recorder
        self.replies = list(replies)

    def create(self, **kwargs):
        self.recorder["messages_created"].append(kwargs)
        return SimpleNamespace(id="msg_user_1")

    def list(self, **kwargs):
        return MessageList(_assistant_message(reply) for reply in self.replies)


class FakeThreads:
    def __init__(self, recorder, messages, runs):
        self.recorder = recorder
        self._messages = messages
        self._runs = runs
        self._created = []

    def create(self, **kwargs):
        thread_id = "thread_%d" % (len(self._created) + 1)
        self._created.append(thread_id)
        self.recorder["threads_created"].append(thread_id)
        return SimpleNamespace(id=thread_id)

    @property
    def messages(self):
        return self._messages

    @property
    def runs(self):
        return self._runs


class FakeOpenAIClient:
    """Mimics the slice of the OpenAI SDK surface used by the backend:
    ``client.beta.threads.create/messages.create/runs.create/runs.retrieve``
    and ``client.beta.threads.messages.list``."""

    def __init__(self, replies=("ok",), run_statuses=("completed",)):
        self.recorder = defaultdict(list)
        self.threads = FakeThreads(
            self.recorder,
            FakeThreadMessages(self.recorder, replies),
            FakeThreadRuns(self.recorder, statuses=run_statuses),
        )
        # api.py/app.py access client.beta.threads.*
        self.beta = SimpleNamespace(threads=self.threads)


@pytest.fixture
def make_fake_openai(monkeypatch):
    """Factory fixture.

    ``fake = make_fake_openai(replies=["..."], run_statuses=["completed"])``
    builds a fake client. With ``patch_class=True`` (default) it also patches
    ``openai.OpenAI`` so any code constructing a client gets the fake — that
    is what api.py's ``gpt()`` does per call. For app.py you can either patch
    the class before loading the module, or assign ``app_module.client = fake``
    directly after import."""
    installed = {}

    def _make(replies=("ok",), run_statuses=("completed",), patch_class=True):
        fake = FakeOpenAIClient(replies=replies, run_statuses=run_statuses)

        if patch_class:
            import openai as openai_module

            def _constructor(*args, **kwargs):
                fake.recorder["client_constructor"].append(
                    {"args": args, "kwargs": kwargs}
                )
                return fake

            monkeypatch.setattr(openai_module, "OpenAI", _constructor)

        installed["fake"] = fake
        return fake

    yield _make


# ---------------------------------------------------------------------------
# requests.delete stub (used by both delete_thread implementations)
# ---------------------------------------------------------------------------

class FakeDeleteResponse:
    def __init__(self, status_code=200, payload=None):
        self.status_code = status_code
        self._payload = payload if payload is not None else {"deleted": True}

    def json(self):
        return self._payload


@pytest.fixture
def fake_requests_delete(monkeypatch):
    """Patch requests.delete for both modules (they share the requests module).

    Returns a holder with ``calls`` (list of {"url": ..., **kwargs}) and a
    mutable ``response`` (a FakeDeleteResponse) tests can reconfigure."""
    import requests

    holder = SimpleNamespace(calls=[], response=FakeDeleteResponse())

    def _delete(url, **kwargs):
        recorded = {"url": url}
        recorded.update(kwargs)
        holder.calls.append(recorded)
        return holder.response

    monkeypatch.setattr(requests, "delete", _delete)
    return holder


# ---------------------------------------------------------------------------
# Ready-to-use backend modules
# ---------------------------------------------------------------------------

@pytest.fixture
def api_module(clean_env, stub_mongo):
    """Backend/api.py imported with Mongo stubbed and env vars set."""
    clean_env.setenv("OPEN_API_KEY", TEST_OPENAI_KEY)
    clean_env.setenv("MONGODB_URI", TEST_MONGODB_URI)
    module = load_module_from_path("studybuddy_api", API_PATH)
    yield module
    sys.modules.pop("studybuddy_api", None)


@pytest.fixture
def app_module(clean_env):
    """Backend/app.py imported with env vars set (no .env.local needed:
    the repo has none committed, so load_dotenv is a no-op here)."""
    clean_env.setenv("OPENAI_API_KEY", TEST_OPENAI_KEY)
    module = load_module_from_path("studybuddy_app", APP_PATH)
    yield module
    sys.modules.pop("studybuddy_app", None)
