import requests

from dotenv import load_dotenv
import os
load_dotenv()

from atoma_sdk import AtomaSDK
from constants import DEFAULT_LLM_SETTINGS

'''
DEFAULT_LLM_SETTINGS = {
    "temperature": 0.7,           # Controls randomness: 0 (deterministic) to 2 (more random)
    "top_p": 1.0,                 # Nucleus sampling: 1.0 considers all tokens
    "max_tokens": 1024,           # Limits the response length
    "frequency_penalty": 0.0,     # Discourages repetition: -2.0 to 2.0
    "presence_penalty": 0.0       # Encourages new topics: -2.0 to 2.0
}
'''

class AtomaAPI:
    def __init__(self):
        # Set atoma api token
        atoma_api_token = os.environ.get('ATOMA_BEARER')
        assert atoma_api_token !=None, "No atoma bearer found in .env"
        self.atoma_api_token = atoma_api_token

        print('Initializing atoma models list...', end='')
        self.models_list = self.get_models_list()
        print('done.')
    
    def get_models_list(self):
        atoma_models = []
        try:
            with AtomaSDK(
                bearer_auth=self.atoma_api_token,
            ) as atoma_sdk:
                res = atoma_sdk.models_.models_list()
                # Handle response
                # print(res)
                for model in res.data:
                    atoma_models.append(model.id)
                return atoma_models
                # print(atoma_models)
        except Exception as ex:
            print(ex)
            return []

    async def query_atoma_async(self, query, model_name, llm_settings=DEFAULT_LLM_SETTINGS, exclude_thinking_text=True,):
        print(f"atoma: query_atoma_async: {query}, {model_name}, {llm_settings}, {exclude_thinking_text}")
        try:
            async with AtomaSDK(  # Use async with
                bearer_auth=self.atoma_api_token,
            ) as atoma_sdk:
                res = await atoma_sdk.chat.create_async(  # Use create_async and await
                    messages=[
                        {
                            "content": query,
                            "role": "user",
                        },
                    ],
                    model=model_name,
                    frequency_penalty=llm_settings.get('frequency_penalty', 0.0),
                    max_tokens=llm_settings.get('max_tokens', 1024),
                    n=llm_settings.get('n', 1),
                    presence_penalty=llm_settings.get('presence_penalty', 0.0),
                    seed=123,
                    stop=[
                        "json([\"stop\", \"halt\"])",
                    ],
                    temperature=llm_settings.get('temperature', 0.7),
                    top_p=llm_settings.get('top_p', 1.0),
                    user="user-1234"
                )

                # deepseek r1 have option to include thinking text
                if 'r1' in model_name and exclude_thinking_text:
                    # Remove thinking text from r1 model
                    return res.choices[0].message.content.split('</think>')[-1].strip()

                # llm response without any modifications.
                return res.choices[0].message.content
        except Exception as ex:
            print(f' error query llm: {ex}')
            return f"error query llm: {ex}"

    def query_atoma(self, query, model_name, llm_settings = DEFAULT_LLM_SETTINGS, exclude_thinking_text=True):
        print(f"atoma: query: {query}, model_name: {model_name}, llm_settings: {llm_settings}")
        try:
            with AtomaSDK(
                bearer_auth=self.atoma_api_token,
            ) as atoma_sdk:
                res = atoma_sdk.chat.create(messages=[
                    {
                        "content": query,
                        "role": "user",
                    },
                ],
                
                model=model_name,
                frequency_penalty=llm_settings.get('frequency_penalty', 0.0),
                max_tokens=llm_settings.get('max_tokens', 1024),
                n=llm_settings.get('n', 1),
                presence_penalty=llm_settings.get('presence_penalty', 0.0),
                seed=123,
                stop=[
                    "json([\"stop\", \"halt\"])",
                ],
                temperature=llm_settings.get('temperature', 0.7),
                top_p=llm_settings.get('top_p', 1.0),
                user="user-1234")
                
                # deepseek r1 have option to include thinking text
                if 'r1' in model_name and not exclude_thinking_text:
                    # Remove thinking text from r1 model
                    return res.choices[0].message.content.split('</think>')[-1].strip()
                
                # llm response without any modifications.
                return res.choices[0].message.content
        except Exception as ex:
            print(f' error query llm: {ex}')
            return f"error query llm: {ex}"
    
    def generate_image(self, model_name="black-forest-labs/FLUX.1-schnell", prompt="A cute baby sea otter floating on its back"):
        try:
            with AtomaSDK(
                    bearer_auth=self.atoma_api_token,
            ) as atoma_sdk:

                res = atoma_sdk.images.generate(
                    model=model_name,
                    prompt=prompt,
                    n=1,
                    quality="hd",
                    response_format="url",
                    size="1024x1024",
                    style="vivid",
                    user="user-1234"
                )
                
                # Handle response
                print(res)
                return res
        except Exception as ex:
            print(f' error generate image: {ex}')
            return f"error generate image: {ex}"



if __name__ == "__main__":
    # Test if above class works as expected
    
    atoma_api = AtomaAPI()
    
    # list models
    print(f'models list: {atoma_api.models_list}')
    
    # normal request
    response = atoma_api.query_atoma('hi!','neuralmagic/DeepSeek-R1-Distill-Llama-70B-FP8-dynamic')
    print(f'normal response for query hi!: {response}')

    # Async function
    import asyncio
    response = asyncio.run(atoma_api.query_atoma_async('hi','neuralmagic/DeepSeek-R1-Distill-Llama-70B-FP8-dynamic'))
    print(f'async response for query hi!: {response}')
    