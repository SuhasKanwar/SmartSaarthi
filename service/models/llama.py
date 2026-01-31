import sys
import os
import json

from utils.logger import logger
from utils.exception import SmartSaarthiException
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.prebuilt import create_react_agent

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
            self.llm = ChatGroq(groq_api_key=GROQ_API_KEY, model_name=self.model_name, temperature=0.5)
            self.tools = self.get_generic_tools()
            
            # Create the agent using LangGraph prebuilt
            # This is the modern replacement for AgentExecutor
            self.agent = create_react_agent(self.llm, self.tools)
            
        except Exception as e:
            logger.error(f"Error initializing LLaMA model: {str(e)}")
            raise SmartSaarthiException(f"Failed to initialize LLaMA model ({self.model_name})", sys)


    def generate_response(self, prompt: str, session_history: list, files: list, location: dict = None) -> dict:
        try:
            self._ingest_files(files)

            context = self._retrieve_context(prompt)

            history = session_history or []
            
            # Prepare Input Messages
            input_messages = []
            
            # 1. System Prompt with RAG Context
            sys_content = self.system_prompt.content
            if context:
                sys_content += f"\n\nRelevant Context:\n{context}"
            
            if location:
                sys_content += f"\n\n[System Note: User is currently at Latitude: {location.get('lat')}, Longitude: {location.get('lng')}. Use this precise location for any 'near me' or distance-related queries.]"
            
            input_messages.append(SystemMessage(content=sys_content))
            
            # 2. History
            input_messages.extend(history)
            
            # 3. New User Message
            input_messages.append(HumanMessage(content=prompt))

            # Execute Agent
            # LangGraph agent expects {"messages": [...]}
            result = self.agent.invoke({"messages": input_messages})
            
            # Result contains all messages including tool calls and outputs
            output_messages = result.get("messages", [])
            last_message = output_messages[-1]
            final_content = last_message.content if hasattr(last_message, "content") else str(last_message)
            
            final_response = {
                "content": final_content,
                "location": None,
                "action": None
            }
            
            # Iterate backwards to find the last successful Google Maps tool output
            for msg in reversed(output_messages):
                if isinstance(msg, ToolMessage):
                    # Tool output is in msg.content, usually as string. We need to parse it if it's JSON.
                    # Or check msg.name if available, but ToolMessage usually acts on tool_call_id.
                    # We have to infer from the content or check the preceding AIMessage's tool_calls.
                    
                    try:
                        # Attempt to parse specific known tool outputs
                        # Since our tool returns a dict, LangChain stringifies it.
                        content_str = msg.content
                        if "lat" in content_str and "lng" in content_str and "status" in content_str: # Heuristic check
                            # Try parsing loose JSON or just dict string representation? 
                            # If it's real JSON:
                            import ast
                            try:
                                observation = json.loads(content_str)
                            except:
                                try:
                                    observation = ast.literal_eval(content_str)
                                except:
                                    observation = {}
                                    
                            if isinstance(observation, dict) and observation.get("status") == "found":
                                final_response["location"] = observation.get("location")
                                final_response["action"] = "OPEN_MAPS"
                                final_response["place_name"] = observation.get("name")
                                final_response["address"] = observation.get("address")
                                break # Found the latest location
                    except:
                        continue

            return final_response

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise SmartSaarthiException(f"Failed to generate response from LLaMA model ({self.model_name})", sys)