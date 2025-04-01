
import sys
import json
import importlib.util
import traceback

def run_function(input_data):
    try:
        # Load the function dynamically
        spec = importlib.util.spec_from_file_location("function", "/app/function/function.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        if not hasattr(module, "handler"):
            raise Exception("Function must define a 'handler' function")
        
        # Execute function
        result = module.handler(input_data)
        return result
    except Exception as e:
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

# This file is used by the container to execute functions
# It's not directly exposed to the API but used internally
if __name__ == "__main__":
    import sys
    import os
    import json
    
    # Keep this process running and listen for execution commands
    while True:
        try:
            # This process will be invoked by the Docker engine
            # Input will be passed via stdin or environment variables
            pass
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)