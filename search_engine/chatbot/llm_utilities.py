import os
import logging
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch

logger = logging.getLogger(__name__)

class LLMUtilities:
    def __init__(self, model_name="meta-llama/Llama-2-7b-hf", use_gpu=False):
        """
        Initialize the utility with the specified model and device configuration.

        Args:
            model_name (str): The Hugging Face model name to load.
            use_gpu (bool): Whether to use GPU for inference.
        """
        self.model_name = model_name
        self.use_gpu = use_gpu
        self.token = os.getenv("HF_TOKEN")
        if not self.token:
            logger.error("HF_TOKEN is not set. Please set it to access the Hugging Face model.")
            # Raise a more descriptive error
            raise EnvironmentError("Missing Hugging Face token. Set HF_TOKEN as an environment variable.")

        self.pipeline = self._load_model()

    def _load_model(self):
        """
        Load the specified model and tokenizer, optimized for GPU if enabled.
        Uses `device_map='auto'` to offload layers and `torch_dtype=torch.float16` to reduce memory usage.
        If no GPU is available, it will run on CPU automatically.

        Returns:
            pipeline: The Hugging Face pipeline for text generation.
        """
        logger.info(f"Loading model '{self.model_name}' with {'GPU' if self.use_gpu else 'CPU'} inference.")

        # Determine device map
        device_map = "auto"
        torch_dtype = torch.float16

        # If no GPU is available or USE_GPU is False, we still use 'auto', which should default to CPU.
        # For large models, consider using a smaller model or additional optimization methods.

        try:
            model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                token=self.token,
                trust_remote_code=True,
                device_map=device_map,
                torch_dtype=torch_dtype
            )
            tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                token=self.token,
                trust_remote_code=True
            )

            # Create a text generation pipeline
            # Note: We disable `pad_token_id` warnings by setting it to the `eos_token_id`
            return pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                torch_dtype=torch_dtype,
                device_map=device_map,
                pad_token_id=tokenizer.eos_token_id
            )
        except Exception as e:
            logger.error(f"Error loading model '{self.model_name}': {e}")
            raise e

    def generate_response(self, prompt, max_length=200, num_return_sequences=1):
        """
        Generate a response based on the provided prompt.

        Args:
            prompt (str): The input prompt for the model.
            max_length (int): Maximum length of the generated response.
            num_return_sequences (int): Number of response sequences to generate.

        Returns:
            str: The generated response.
        """
        try:
            response = self.pipeline(prompt, max_length=max_length, num_return_sequences=num_return_sequences)
            # The model might produce output with repeated prompt; consider post-processing if needed.
            return response[0]["generated_text"].strip()
        except Exception as e:
            logger.error(f"Error during response generation: {e}")
            return "Sorry, I couldn't generate a response."
