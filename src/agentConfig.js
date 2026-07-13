
// ===== AGENT CONFIGURATION =====
const API_KEY = ""; // your API key
const API_URL = ""; // link url agent

// ===== AGENT API SERVICE =====
export const sendMessageToAgent = async (message) => {
  const requestBody = { 
"output_type": "chat",   
"input_type": "chat",
"input_value": message
};

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY
    },
    body: JSON.stringify(requestBody),
  };

  const response = await fetch(API_URL, requestOptions);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Có lỗi xảy ra khi gọi API");
  }

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
    console.log("Response structure:", data);
    apiResponseText = JSON.stringify(data, null, 2);
  }

  return { text: apiResponseText, hasError };
};

