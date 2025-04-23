import requests

from dotenv import load_dotenv
import os
load_dotenv()

from openai import OpenAI, AsyncOpenAI, models

from constants import DEFAULT_LLM_MODEL, DEFAULT_LLM_SETTINGS, DEFAULT_IMAGE_MODEL, DEFAULT_IMAGE_SETTINGS

class OpenaiAPI:
    def __init__(self):
         # Set OpenAI api token
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        if openai_api_key !=None:
            self.openai_client = OpenAI(api_key=openai_api_key)
            self.openai_client_async = AsyncOpenAI(api_key=openai_api_key)
            
            print('Initializing openai models list...', end='')
            self.models_list = self.get_models_list()
            print('done.')
        else:
            print('OpenAI API key not found in .env')
            self.openai_client = None
            self.openai_client_async = None

            self.models_list = []

    def get_models_list(self):
        models_list = []
        
        try:
            res = models.list()
            for model in res.data:
                    models_list.append(model.id)
        except Exception as ex:
            print(ex)
        
        return models_list

    
    def query_openai(self, query, model_name=DEFAULT_LLM_MODEL, llm_settings=DEFAULT_LLM_SETTINGS):
        print(f"openai: query: {query}, model_name: {model_name}, llm_settings: {llm_settings}")
        try:
            print(f'one of gpt models. using {model_name} model')
            completion = self.openai_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": query}
                ],
                **(llm_settings or {})
            )
            # print(completion.choices[0].message.content)
            return completion.choices[0].message.content
        except requests.RequestException as e:
            return f"Error: {str(e)}"
    
    def generate_image(self, prompt="A white siamese cat", model_name=DEFAULT_IMAGE_MODEL, llm_settings=DEFAULT_IMAGE_SETTINGS):
        '''
    
        '''
        print(f"openai: prompt: {prompt}, model_name: {model_name}, llm_settings: {llm_settings}")
        try:
            print(f'Using model: {model_name}')
            response = self.openai_client.images.generate(
                model=model_name,
                prompt=prompt,
                **(llm_settings or {})
            )
            return response.data[0].url
        except requests.RequestException as e:
            return f"Error: {str(e)}"
    
    async def query_openai_async(self, query, model_name=DEFAULT_LLM_MODEL, llm_settings=DEFAULT_LLM_SETTINGS):
        print(f"openai: query: {query}, model_name: {model_name}, llm_settings: {llm_settings}")
        try:
            print(f'Using model: {model_name}')
            completion = await self.openai_client_async.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": query}
                ],
                **(llm_settings or {})
            )
            # print(completion.choices[0].message.content)
            return completion.choices[0].message.content
        except Exception as e:
            print(f'Error in query_openai: {e}')
            return f"Error: {str(e)}"


if __name__ == "__main__":
    # Test if above class works as expected
    
    openai_api = OpenaiAPI()
    
    # list models
    print(f'models list: {openai_api.models_list}')
    
    # normal request
    response = openai_api.query_openai_async('hi!','gpt-4-0613')
    print(f'normal response for query hi!: {response}')

    # Async function
    import asyncio
    response = asyncio.run(openai_api.query_openai_async('hi','gpt-4-0613'))
    print(f'async response for query hi!: {response}')
    