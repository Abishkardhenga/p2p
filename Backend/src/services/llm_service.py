from typing import Dict, Optional
from services.atoma.atoma_api import AtomaAPI
from services.openai.openai_api import OpenaiAPI

from constants import DEFAULT_LLM_MODEL, DEFAULT_LLM_SETTINGS

class LLMService:
    def __init__(self):
        # This is a placeholder for a real LLM service integration
        self.atoma_api = AtomaAPI()
        self.openai_api = OpenaiAPI()

        self.models = {
            'atoma': self.atoma_api.models_list,
            'openai': self.openai_api.models_list
        }
    
    async def generate_response(self, query: str, model: str, settings: Dict) -> str:
        """
        Generate a response using an LLM model.
        
        In a real implementation, this would call an actual API like OpenAI, Anthropic, etc.
        For this example, we're just returning a mock response.
        """
        # This is a placeholder implementation
        print(f"\n\n Generating response for query: '{query}' using model: '{model}' with settings: {settings}")

        return f"This is a simulated response from model {model} to the query: '{query}'"
    
    async def test_prompt(self, query: str, llm_model: str, llm_settings: Dict, system_prompt: Optional[str] = None) -> str:
        """
        Test a prompt with a specific model and settings.
        
        Args:
            query: The user query to test
            llm_model: The LLM model to use
            llm_settings: Configuration for the LLM call
            system_prompt: Optional system prompt to use
        """
        
        print(f"\n\n Testing prompt: '{query}' using model: '{llm_model}' with settings: {llm_settings}")


        if system_prompt:
            # In a real implementation, we would decrypt and use the system prompt
            print(f"System prompt: {system_prompt}")
            query = f"{system_prompt}\n user-query: {query}"
        
        if llm_model in self.models['atoma']:
            # return await self.generate_response(query, llm_model, llm_settings)
            return await self.atoma_api.query_atoma_async(query, llm_model, llm_settings)

        # elif llm_model in self.models['openai'] and llm_model in ["dall-e-3", "dall-e-2"]:
        #     # return await self.generate_response(query, llm_model, llm_settings)
        #     return await self.openai_api.generate_image(query, llm_model, llm_settings)
        
        elif llm_model in self.models['openai']:
            # return await self.generate_response(query, llm_model, llm_settings)
            return await self.openai_api.query_openai_async(query, llm_model)
        
        # gpt-4o-mini is cheap model so using it as default.
        return await self.openai_api.query_openai_async(query, DEFAULT_LLM_MODEL, llm_settings)
    
    def generate_image(self, query: str, llm_model: str, llm_settings: Dict, system_prompt: Optional[str] = None) -> str:
        if system_prompt:
            # In a real implementation, we would decrypt and use the system prompt
            print(f"System prompt: {system_prompt}")
            query = f"{system_prompt}\n user-query: {query}"

        return self.openai_api.generate_image(query, llm_model, llm_settings)
# Create a singleton LLM service instance
llm_service = LLMService()
