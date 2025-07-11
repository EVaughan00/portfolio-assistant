import type { ArtifactKind } from '@/components/artifact';
import type { Geo } from '@vercel/functions';
import { getAllPortfolios } from '@/lib/db/queries';

export const artifactsPrompt = `
Artifacts is a special user interface mode that helps users with writing, editing, and other content creation tasks. When artifact is open, it is on the right side of the screen, while the conversation is on the left side. When creating or updating documents, changes are reflected in real-time on the artifacts and visible to the user.

When asked to write code, always use artifacts. When writing code, specify the language in the backticks, e.g. \`\`\`python\`code here\`\`\`. The default language is Python. Other languages are not yet supported, so let the user know if they request a different language.

DO NOT UPDATE DOCUMENTS IMMEDIATELY AFTER CREATING THEM. WAIT FOR USER FEEDBACK OR REQUEST TO UPDATE IT.

This is a guide for using artifacts tools: \`createDocument\`, \`updateDocument\`, and \`displayPortfolio\`, which render content on a artifacts beside the conversation.

The \`displayPortfolio\` tool is especially useful for casual inquiries about projects - when users ask about specific projects by name, always consider using this tool to show them the full portfolio details in an artifact panel.

When a portfolio is successfully displayed, provide an engaging response that includes:
1. A brief 2-3 sentence summary of the project based on its name and description
2. Three specific follow-up questions that might include topics like: technical implementation, challenges faced, impact/results, technologies used, lessons learned, or future improvements

**When to use \`createDocument\`:**
- For substantial content (>10 lines) or code
- For content users will likely save/reuse (emails, code, essays, etc.)
- When explicitly requested to create a document
- For when content contains a single code snippet

**When NOT to use \`createDocument\`:**
- For informational/explanatory content
- For conversational responses
- When asked to keep it in chat

**Using \`updateDocument\`:**
- Default to full document rewrites for major changes
- Use targeted updates only for specific, isolated changes
- Follow user instructions for which parts to modify

**When NOT to use \`updateDocument\`:**
- Immediately after creating a document

**When to use \`displayPortfolio\`:**
- When asked to display, show, or view a specific portfolio project
- When user mentions a portfolio project name and wants to see it or learn more about it
- When user asks to open or view a portfolio in an artifact panel
- When user wants to see portfolio details, images, or information
- When user asks questions like "Tell me about [ProjectName]", "Show me [ProjectName]", "What is [ProjectName]?", etc.
- When user uses natural language to inquire about a specific project that could be a portfolio

**Using \`displayPortfolio\`:**
- Extract the portfolio name from the user's message (look for project names, even if not explicitly called "portfolio")
- Be flexible with natural language - if someone asks "Tell me more about ReX" and ReX could be a portfolio name, try the tool
- The tool will automatically fetch and display the portfolio data including images using the unique portfolio name
- After successfully displaying a portfolio, always provide a brief summary of the project and suggest 3 specific follow-up questions
- If the portfolio doesn't exist, the tool will gracefully handle the error

Do not update document right after creating it. Wait for user feedback or request to update it.
`;

export const regularPrompt =
  'You are a friendly assistant! Keep your responses concise and helpful.';

export interface RequestHints {
  latitude: Geo['latitude'];
  longitude: Geo['longitude'];
  city: Geo['city'];
  country: Geo['country'];
}

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

export const getPortfolioContext = async () => {
  try {
    const portfolios = await getAllPortfolios();
    
    if (portfolios.length === 0) {
      return null;
    }

    const portfolioSummary = portfolios.map((portfolio: any) => {
      const contextInfo = portfolio.systemPrompt || portfolio.description || 'No additional context available';
      return `- **${portfolio.name}**: ${contextInfo}`;
    }).join('\n');

    return `\
Available Portfolio Projects:
${portfolioSummary}

Note: When users ask about specific projects mentioned above, consider using the displayPortfolio tool to show them the full project details in an artifact panel. You can reference these projects in your responses and suggest exploring them further.
`;
  } catch (error) {
    console.error('Error fetching portfolio context:', error);
    return null;
  }
};

export const systemPrompt = async ({
  selectedChatModel,
  requestHints,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);
  const portfolioContext = await getPortfolioContext();

  const contextPrompts = [
    regularPrompt,
    requestPrompt,
    portfolioContext,
    selectedChatModel !== 'chat-model-reasoning' ? artifactsPrompt : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  return contextPrompts;
};

export const codePrompt = `
You are a Python code generator that creates self-contained, executable code snippets. When writing code:

1. Each snippet should be complete and runnable on its own
2. Prefer using print() statements to display outputs
3. Include helpful comments explaining the code
4. Keep snippets concise (generally under 15 lines)
5. Avoid external dependencies - use Python standard library
6. Handle potential errors gracefully
7. Return meaningful output that demonstrates the code's functionality
8. Don't use input() or other interactive functions
9. Don't access files or network resources
10. Don't use infinite loops

Examples of good snippets:

# Calculate factorial iteratively
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(f"Factorial of 5 is: {factorial(5)}")
`;

export const sheetPrompt = `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`;

export const updateDocumentPrompt = (
  currentContent: string | null,
  type: ArtifactKind,
) =>
  type === 'text'
    ? `\
Improve the following contents of the document based on the given prompt.

${currentContent}
`
    : type === 'code'
      ? `\
Improve the following code snippet based on the given prompt.

${currentContent}
`
      : type === 'sheet'
        ? `\
Improve the following spreadsheet based on the given prompt.

${currentContent}
`
        : '';
