from config import Config

_config = Config()

PORT = int(_config.get_config()["PORT"])
WHITELIST_URL = _config.get_config()["WHITELIST_URL"].split(",")



# Default settings
DEFAULT_LLM_MODEL = _config.get_config()["DEFAULT_LLM_MODEL"]
DEFAULT_IMAGE_MODEL = _config.get_config()["DEFAULT_IMAGE_MODEL"]
DEFAULT_LLM_SETTINGS = {
    "temperature": 0.7,           # Controls randomness: 0 (deterministic) to 2 (more random)
    "top_p": 1.0,                 # Nucleus sampling: 1.0 considers all tokens
    "max_tokens": 1024,           # Limits the response length
    "frequency_penalty": 0.0,     # Discourages repetition: -2.0 to 2.0
    "presence_penalty": 0.0       # Encourages new topics: -2.0 to 2.0
}

DEFAULT_IMAGE_SETTINGS = {
    "size": "1024x1024",
    # "quality": "standard",
    "n": 1
}

USE_SQLITE = _config.get_config()["USE_SQLITE"]
SQLITE_DB_PATH = _config.get_config()["SQLITE_DB_PATH"]
