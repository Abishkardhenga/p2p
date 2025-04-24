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
    
    async def test_prompt(self, query: str, llm_model: str, llm_settings: Dict, prompt: Optional[str] = None, description: Optional[str] = None) -> str:
        """
        Test a prompt with a specific model and settings.
        
        Args:
            query: The user query to test
            llm_model: The LLM model to use
            llm_settings: Configuration for the LLM call
            prompt: Optional system prompt to use
        """
        print(f"fucking prompt:{prompt}")
        the_prompt=""
        if prompt:
            # In a real implementation, we would decrypt and use the system prompt
            # print(f"System prompt: {prompt}")
            the_prompt += f"\n ## prompt: \n {prompt}"
        
        if description:
            # In a real implementation, we would decrypt and use the description
            # print(f"Description: {description}")
            the_prompt += f"\n## Description: {description}"
        
        the_prompt += f"\n## User Query: {query}"
        
        print(f"\n\n----- Testing prompt: '{the_prompt}'\n ----- using model: '{llm_model}' with settings: {llm_settings}\n")

        if llm_model in self.models['atoma']:
            # return await self.generate_response(the_prompt, llm_model, llm_settings)
            return await self.atoma_api.query_atoma_async(the_prompt, llm_model, llm_settings)

        # elif llm_model in self.models['openai'] and llm_model in ["dall-e-3", "dall-e-2"]:
        #     # return await self.generate_response(query, llm_model, llm_settings)
        #     return await self.openai_api.generate_image(query, llm_model, llm_settings)
        
        elif llm_model in self.models['openai']:
            # return await self.generate_response(query, llm_model, llm_settings)
            return await self.openai_api.query_openai_async(the_prompt, llm_model)
        
        # gpt-4o-mini is cheap model so using it as default.
        return await self.openai_api.query_openai_async(the_prompt, DEFAULT_LLM_MODEL, llm_settings)
    
    '''
    test_request.query,
        llm_model,
        llm_settings,
        prompt,
        description
    '''
    def generate_image(self, query: str, llm_model: str, llm_settings: Dict, prompt: Optional[str] = None, description: Optional[str] = None) -> str:
        print(f"got image gen. request:  query:{query}, llm_setting:{llm_settings}, prompt:{prompt}, description:{description}")
        the_prompt = ""
        if prompt:
            # In a real implementation, we would decrypt and use the system prompt
            # print(f"System prompt: {prompt}")
            the_prompt += f"\n## prompt: \n {prompt}"
        if description:
            the_prompt += f"\n## description: \n {description}"
        
        the_prompt += f"\n## Additional Information: \n {query}"
        
        print(f"\n\n----- Testing prompt: '{the_prompt}'\n ----- using model: '{llm_model}' with settings: {llm_settings}\n")
        # return {}

        return self.openai_api.generate_image(the_prompt, llm_model, llm_settings)
# Create a singleton LLM service instance
llm_service = LLMService()
