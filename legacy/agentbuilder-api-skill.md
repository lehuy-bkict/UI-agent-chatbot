---
name: agent-builder-api-integration
description: Guide for connecting to Agent Builder API flows programmatically. Use this skill whenever Cline needs to help write code that calls Agent Builder flow APIs, whether the user is building a Python script, JavaScript frontend, or using cURL. Triggers for requests like "connect to my Agent Builder flow", "call an Agent Builder API", "integrate Agent Builder into my app", "build a chatbot that uses Agent Builder", "upload file to Agent Builder", or when the user provides a flow endpoint URL that needs API integration code.
---

# Agent Builder API Integration Skill

## ⚠️ IMPORTANT: Code Generation Principles

1. **ALWAYS read the project first** → Check framework, file structure, code organization
2. **Apply config pattern** → Use the pattern below as a template, adjust to fit the project and user needs
3. **ONLY create what the user needs** → If chat only then only create chat, if file needed then add file, do not add things not requested
4. **ASK the user** if needs are unclear → Chat only? Need file upload? Need session? Need streaming?

---

## Config File Pattern (template to apply)

This is the standard pattern for creating Agent Builder connection files. Adjust according to framework and needs of each project.

### JavaScript/React - Chat only (most common)

```javascript
// ===== AGENT CONFIGURATION =====
const API_KEY = "..."; // API Key from Agent Builder Settings > API Keys
const AGENT_ID = "..."; // Agent ID or Endpoint Name
const API_URL = `https://agent.sec.samsung.net/api/v1/run/${AGENT_ID}?stream=false`;
const SESSION_ID = crypto.randomUUID(); // Session ID for agent to remember context

// ===== AGENT API SERVICE =====
export const sendMessageToAgent = async (message) => {
  const requestBody = {
    input_type: "chat",
    output_type: "chat",
    input_value: message,
    session_id: SESSION_ID
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "An error occurred while calling the API");
  }

  // Parse chat type response: data.outputs[0].outputs[0].results.message
  let apiResponseText = "";
  let hasError = false;

  if (data.outputs && data.outputs.length > 0) {
    const firstOutput = data.outputs[0];
    if (firstOutput.outputs && firstOutput.outputs.length > 0) {
      const chatOutput = firstOutput.outputs[0];
      if (chatOutput.results && chatOutput.results.message) {
        const messageData = chatOutput.results.message;
        apiResponseText = messageData.text || "";
        hasError = messageData.error === true;
      }
    }
  }

  if (!apiResponseText && !hasError) {
    apiResponseText = JSON.stringify(data, null, 2);
  }

  return { text: apiResponseText, hasError };
};
```

### JavaScript/React - With File Upload

Add the following functions to the above pattern (only when the user needs it):

```javascript
// ===== FILE API SERVICE =====
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("https://agent.sec.samsung.net/api/v2/files/", {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: formData,
  });

  if (!response.ok) throw new Error("File upload failed");
  return await response.json(); // { id, name, path, size }
};

export const deleteFile = async (fileId) => {
  const response = await fetch(`https://agent.sec.samsung.net/api/v2/files/${fileId}`, {
    method: "DELETE",
    headers: { "x-api-key": API_KEY },
  });
  if (!response.ok) throw new Error("File deletion failed");
  return await response.json();
};
```

### JavaScript/React - Text Type (data processing)

```javascript
// ===== AGENT API SERVICE - TEXT TYPE =====
export const runAgent = async (componentInputs) => {
  const requestBody = {
    input_type: "text",
    output_type: "text",
    component_inputs: componentInputs
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "An error occurred while calling the API");
  }

  // Parse text type: may have multiple outputs
  const results = [];
  if (data.outputs && data.outputs.length > 0) {
    for (const output of data.outputs[0].outputs) {
      if (output.results?.text) {
        results.push(output.results.text.text || "");
      }
    }
  }

  return results.join("\n\n");
};
```

### Python - Chat only

```python
import requests
import uuid

# ===== AGENT CONFIGURATION =====
API_KEY = "..."
AGENT_ID = "..."
API_URL = f"https://agent.sec.samsung.net/api/v1/run/{AGENT_ID}?stream=false"
SESSION_ID = str(uuid.uuid4())

# ===== AGENT API SERVICE =====
def send_message_to_agent(message):
    payload = {
        "input_type": "chat",
        "output_type": "chat",
        "input_value": message,
        "session_id": SESSION_ID
    }
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    response = requests.post(API_URL, json=payload, headers=headers, timeout=30, verify=False, proxies={"https": None})
    response.raise_for_status()
    data = response.json()
    return data["outputs"][0]["outputs"][0]["results"]["message"]["text"]
```

---

## API Reference

### Main Endpoint
```
POST https://agent.sec.samsung.net/api/v1/run/{agent-id}?stream=false
```
**Headers:** `Content-Type: application/json` + `x-api-key: YOUR_API_KEY`

### Payload

| Field | Chat type | Text type |
|--------|-----------|-----------|
| `input_type` | `"chat"` | `"text"` |
| `output_type` | `"chat"` | `"text"` |
| `input_value` | User message | Not needed (use component_inputs) |
| `session_id` | UUID (if MessageHistory exists) | Not needed |
| `component_inputs` | Optional | Required |

### Component Inputs (optional)
```json
{
    "component_inputs": {
        "File-0bOpH": { "path": ["file-path-from-upload"] },
        "TextInput-tT8F4": { "input_value": "Text input here" }
    }
}
```
> **Get Component ID:** Click component → Controls → Copy ID
> **File path** is an array, allows multiple files.

### Response Parsing

| | Chat type | Text type |
|---|---|---|
| Parse path | `results.message.text` | `results.text.text` |
| Number of outputs | 1 | Multiple (loop through `outputs[0].outputs`) |
| `session_id` in response | Random UUID | = Agent ID |

### File API

| API | Method | URL | Notes |
|-----|--------|-----|---------|
| Upload | POST | `https://agent.sec.samsung.net/api/v2/files/` | FormData, response has `path` for component_inputs |
| List | GET | `https://agent.sec.samsung.net/api/v2/files/` | |
| Delete | DELETE | `https://agent.sec.samsung.net/api/v2/files/{file-id}` | |

---

## Important Notes

| Issue | Solution |
|--------|-----------|
| 401 Unauthorized | Check API Key in Settings > API Keys |
| 403 Forbidden | Proxy blocking → set `no_proxy=agent.sec.samsung.net` or `proxies={"https": None}` |
| 404 Not Found | Wrong Agent ID/Endpoint |
| 429 Too Many Requests | Limit 60 req/min/user |
| Session doesn't remember | Agent needs **MessageHistory** component |
| CORS (browser) | Use Chat Widget or configure proxy |
| File upload error | Cannot upload NASCA encoded files |

---

## Resources

- **Agent Builder URL**: https://agent.sec.samsung.net
- **API Keys**: Settings > API Keys
- **API Reference**: Click API button on Agent page
