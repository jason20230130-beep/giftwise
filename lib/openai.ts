type OpenAiResult = {
  output_text?: unknown;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

export function extractOpenAiOutputText(result: OpenAiResult) {
  if (typeof result.output_text === "string") return result.output_text;
  return result.output
    ?.flatMap((item) => item.content || [])
    .find((content) => content.type === "output_text" && typeof content.text === "string")
    ?.text;
}

export async function createStructuredResponse(name: string, schema: Record<string, unknown>, input: Array<{ role: string; content: string }>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input,
      text: {
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema
        }
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI request failed: ${message}`);
  }

  const result = await response.json() as OpenAiResult;
  const outputText = extractOpenAiOutputText(result);
  if (typeof outputText !== "string") throw new Error("OpenAI response did not include output_text.");
  return JSON.parse(outputText) as unknown;
}
