import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

load_dotenv(override=True)

def test_key():
    api_key = os.getenv("GROQ_API_KEY")
    print(f"Key preview: {api_key[:10]}...{api_key[-5:]}" if api_key else "No key found")
    
    try:
        llm = ChatGroq(
            api_key=api_key,
            model="llama3-70b-8192",
            temperature=0
        )
        response = llm.invoke([HumanMessage(content="Hello")])
        print("Success! Response received:")
        print(response.content)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_key()
