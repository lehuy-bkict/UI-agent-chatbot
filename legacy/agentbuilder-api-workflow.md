1. **Activate skill** → When user requests connecting to/creating Agent Builder API: "connect Agent Builder", "call Agent Builder API", "build chatbot using Agent Builder", "upload file to Agent Builder", or provides a flow endpoint URL. → Activate skill `agent-builder-api-integration`.
2. **Ask user about needs** → Chat (chat type + session_id)? | Data processing (text type + component_inputs)? | File processing (upload → component_inputs → run → delete)? | Do you have API Key and Agent ID yet?
3. **Read project context** → Check framework, file structure, code organization. Based on that, choose the appropriate pattern from the skill.
4. **Apply pattern** → Use the pattern from the skill as a template, adjust to fit the project: create a new config file or update existing file, following the project's style and conventions.
5. **Check gotchas** → Proxy/CORS? | MessageHistory component for session? | Rate limit 60/min | NASCA files cannot be uploaded
