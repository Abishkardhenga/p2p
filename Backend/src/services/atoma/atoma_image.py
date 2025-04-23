# Does not work
# Seems like atoma used to have image generationi models, but now it does not
'''
# References:
Playground ma chai 3 ota text models matra chan:
https://cloud.atoma.network/playground

Image generation ko euta example chai cha yesma, tara yo error diyo:
No node found for model black-forest-labs/FLUX.1-schnell"
https://github.com/atoma-network/atoma-sdk-python/blob/main/docs/sdks/images/README.md#generate
'''

from atoma_sdk import AtomaSDK
import os

with AtomaSDK(
    bearer_auth=os.getenv("ATOMASDK_BEARER_AUTH", ""),
) as atoma_sdk:

    res = atoma_sdk.images.generate(model="black-forest-labs/FLUX.1-schnell", prompt="A cute baby sea otter floating on its back", n=1, quality="hd", response_format="url", size="1024x1024", style="vivid", user="user-1234")

    # Handle response
    print(res)
