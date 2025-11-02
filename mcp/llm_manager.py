# llm_manager.py
import os
from typing import Callable, Optional, Dict, Any

BACKEND = os.getenv("LLM_BACKEND", "mock")  # 'mock', 'transformers', 'ollama', 'vllm'
INIT_PROMPT = os.getenv("INIT_PROMPT", "You are a Support Resolution Assistant.")

class LLMManager:
    def __init__(self, backend: str = BACKEND, init_prompt: str = INIT_PROMPT, **kwargs):
        self.backend = backend
        self.init_prompt = init_prompt
        self.model = None
        self.device = kwargs.get("device", "cpu")
        if self.backend == "transformers":
            self._init_transformers(kwargs.get("model_name"))
        elif self.backend == "ollama":
            self.ollama_url = kwargs.get("ollama_url", "http://localhost:11434")
            # no init required
        elif self.backend == "vllm":
            # vLLM integration stub: in-production use vllm.Client or vllm.LLM class
            # self.client = vllm.Client(...)
            pass
        else:
            # mock backend does nothing
            pass

    def _init_transformers(self, model_name: Optional[str] = None):
        model_name = model_name or "gpt2"
        try:
            # lightweight template; for large models you'll need GPU and bitsandbytes
            from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForCausalLM.from_pretrained(model_name)
            self.generate_fn = self._generate_transformers
        except Exception as e:
            print("Transformers model init failed:", e)
            self.backend = "mock"

    def init(self):
        """
        Optionally run an init prompt session (keeps system context if supported).
        For stateless models, we just store the init prompt.
        """
        # For advanced backends you might send the init prompt to a chat session.
        self.system_prompt = self.init_prompt

    def generate(self, prompt: str, max_tokens: int = 256) -> str:
        """
        Generate text using the selected backend. Returns string.
        """
        if self.backend == "mock":
            return self._generate_mock(prompt)
        elif self.backend == "transformers":
            return self._generate_transformers(prompt, max_tokens)
        elif self.backend == "ollama":
            return self._generate_ollama(prompt)
        elif self.backend == "vllm":
            return self._generate_vllm(prompt, max_tokens)
        else:
            return self._generate_mock(prompt)

    def _generate_mock(self, prompt: str) -> str:
        # VERY small deterministic mock: extract ticket phrase and return templated sections
        header = f"(MOCK LLM RESPONDING)\nPrompt snippet: {prompt[:200]}\n\n"
        return header + (
            "1) Troubleshooting Suggestions:\n- Check Wi-Fi driver versions\n- Try Device Manager update (use version 20.70.6.1 if XPS 13 9360)\n\n"
            "2) Steps to Fix:\n1. Uninstall current driver\n2. Reboot\n3. Update driver from Device Manager\n\n"
            "3) Client Communication Script:\nHello {client}, please try the steps listed and report back.\n\n"
            "4) Resolution Summary:\nPossible driver compatibility issue resolved by installing driver v20.70.6.1.\n"
        )

    def _generate_transformers(self, prompt: str, max_tokens: int = 256) -> str:
        from transformers import pipeline
        if not self.model:
            return self._generate_mock(prompt)
        pipe = pipeline("text-generation", model=self.model, tokenizer=self.tokenizer, device=0 if self.device.startswith("cuda") else -1)
        out = pipe(prompt, max_new_tokens=max_tokens, do_sample=False)[0]["generated_text"]
        # naive post-process: remove prompt prefix
        if prompt in out:
            out = out.split(prompt, 1)[1]
        return out

    def _generate_ollama(self, prompt: str) -> str:
        # small http client to ollama server (assumes ollama is running)
        import httpx
        url = os.getenv("OLLAMA_API", "http://localhost:11434/api/generate")
        payload = {"model": os.getenv("OLLAMA_MODEL", "qwen-7b"), "prompt": prompt, "max_tokens": 512}
        with httpx.Client(timeout=60.0) as client:
            r = client.post(url, json=payload)
            if r.status_code == 200:
                return r.json().get("text", "")
            else:
                return f"[OLLAMA ERROR {r.status_code}] {r.text}"

    def _generate_vllm(self, prompt: str, max_tokens: int) -> str:
        # Placeholder: integrate vLLM client here when running vLLM runtime
        # e.g. from vllm import LLM; llm = LLM(model="path"); out = llm.generate(prompt)
        return "[vLLM backend not configured in this prototype.]"
