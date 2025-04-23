import os

from dotenv import find_dotenv, load_dotenv

from impl import LoggerImpl
load_dotenv()


_log_impl = LoggerImpl(__name__)
logger = _log_impl.get_logger()


class Config:
    def __init__(self):
        load_dotenv(find_dotenv())

    def get_config(self):   
        try:
            default_config = {
                "WHITELIST_URL": os.environ.get("WHITELIST_URL", "*"),
                "PORT": os.environ.get("PORT", 8000),
                "DEFAULT_LLM_MODEL": os.environ.get("DEFAULT_LLM_MODEL", "gpt-3.5-turbo"),
                "USE_SQLITE": os.environ.get("USE_SQLITE", "False").lower() in ('true', '1', 't'),
                "SQLITE_DB_PATH": os.environ.get('SQLITE_DB_PATH', 'prompt_market.db'),
                "DEFAULT_IMAGE_MODEL": os.environ.get("DEFAULT_IMAGE_MODEL", "dall-e-2"),
            }
            return default_config
        except Exception as e:
            logger.error(f"Config.py: Error getting config: {str(e)}")
