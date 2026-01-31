import sys
import os

from utils.logger import logger
from utils.exception import SmartSaarthiException
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from services.rag import RAGService
from tools.generic_tools import GenericTools

from config.prompts import LLAMA_SYSTEM_PROMPT

from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
os.environ["HF_TOKEN"] = os.getenv("HUGGINGFACE_ACCESS_TOKEN")

class Llama(RAGService, GenericTools):
    def __init__(self, model_name: str, langchain_hub_name: str, chunk_size: int=1000, chunk_overlap: int=150):
        RAGService.__init__(self, chunk_size, chunk_overlap)
        GenericTools.__init__(self, langchain_hub_name=langchain_hub_name)
        self.model_name = model_name
        self.system_prompt = LLAMA_SYSTEM_PROMPT
        try:
            self.llm = ChatGroq(groq_api_key=GROQ_API_KEY, model_name=self.model_name)
            self.llm.bind_tools(self.get_generic_tools())
            self.prompt_template = ChatPromptTemplate.from_messages([
                self.system_prompt,
                ("system", "Relevant context (may be partial):\n{context}"),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{input}")
            ])
            self.chain = self.prompt_template | self.llm
        except Exception as e:
            logger.error(f"Error initializing LLaMA model: {str(e)}")
            raise SmartSaarthiException(f"Failed to initialize LLaMA model ({self.model_name})", sys)


    def generate_response(self, prompt: str, session_history: list, files: list, location: dict = None) -> dict:
        try:
            self._ingest_files(files)

            context = self._retrieve_context(prompt)

            history = session_history or []
            
            # Inject Usage Location into prompt if available
            augmented_prompt = prompt
            if location:
                augmented_prompt = f"{prompt}\n[System Note: User is currently at Latitude: {location.get('lat')}, Longitude: {location.get('lng')}. Use this precise location for any 'near me' or distance-related queries.]"

            # First invocation
            response_msg = self.chain.invoke({
                "history": history,
                "input": augmented_prompt,
                "context": context
            })
            
            final_response = {
                "content": response_msg.content if hasattr(response_msg, "content") else str(response_msg),
                "location": None,
                "action": None
            }
            
            # Handle Tool Calls
            if hasattr(response_msg, "tool_calls") and response_msg.tool_calls:
                for tool_call in response_msg.tool_calls:
                    if tool_call["name"] == "search_place":
                        query = tool_call["args"].get("query")
                        logger.info(f"Executing Google Maps Search for: {query}")
                        
                        from tools.google_maps_tool import GoogleMapsTools
                        tool_instance = GoogleMapsTools()
                        result = tool_instance.search_place(query)
                        
                        if isinstance(result, dict) and result.get("status") == "found":
                            final_response["location"] = result["location"]
                            final_response["action"] = "OPEN_MAPS"
                            final_response["place_name"] = result["name"]
                            final_response["address"] = result["address"]
                            final_response["content"] = f"I found {result['name']} at {result['address']}."
                        else:
                             final_response["content"] = "I couldn't find that location."

                    elif tool_call["name"] == "find_places_nearby":
                        keyword = tool_call["args"].get("keyword")
                        loc = tool_call["args"].get("location")
                        radius = tool_call["args"].get("radius", 5000)
                        logger.info(f"Executing Google Maps Nearby Search for: {keyword} near {loc}")
                        
                        from tools.google_maps_tool import GoogleMapsTools
                        tool_instance = GoogleMapsTools()
                        result = tool_instance.find_places_nearby(keyword, loc, radius)
                        
                        if isinstance(result, dict) and result.get("status") == "found":
                            final_response["location"] = result["location"]
                            final_response["action"] = "OPEN_MAPS"
                            final_response["place_name"] = result["name"]
                            final_response["address"] = result["address"]
                            final_response["content"] = f"The nearest {keyword} I found is {result['name']} at {result['address']}."
                        else:
                             final_response["content"] = f"I couldn't find any {keyword} nearby."

            return final_response

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise SmartSaarthiException(f"Failed to generate response from LLaMA model ({self.model_name})", sys)