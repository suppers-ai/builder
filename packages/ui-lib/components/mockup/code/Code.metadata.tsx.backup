import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { CodeMockup } from "./CodeMockup.tsx";

const codeExamples: ComponentExample[] = [
  {
    title: "Basic Code Block",
    description: "Simple code block with syntax highlighting",
    code: `<CodeMockup
  language="javascript"
  filename="hello.js"
  code={\`function hello() {
  console.log('Hello World!');
  return true;
}\`}
/>`,
    showCode: true,
  },
  {
    title: "Code with Prefix",
    description: "Terminal-style code block with command prefix",
    code: `<CodeMockup
  language="bash"
  prefix="$"
  code={\`npm install react
npm start
echo "Server running on port 3000"\`}
  showLineNumbers={false}
/>`,
    showCode: true,
  },
  {
    title: "Multi-line Code",
    description: "Complex code example with line numbers",
    code: `<CodeMockup
  language="typescript"
  filename="api.ts"
  showLineNumbers
  code={\`interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
}

export { User, fetchUser };\`}
/>`,
    showCode: true,
  },
  {
    title: "Colored Code Theme",
    description: "Code block with custom color theme",
    code: `<CodeMockup
  language="python"
  filename="data_analysis.py"
  theme="dark"
  showLineNumbers
  code={\`import pandas as pd
import numpy as np

def analyze_data(df):
    # Calculate statistics
    mean_values = df.mean()
    std_values = df.std()
    
    return {
        'mean': mean_values,
        'std': std_values,
        'count': len(df)
    }

# Load and analyze data
data = pd.read_csv('dataset.csv')
results = analyze_data(data)
print(f"Analysis complete: {results['count']} records processed")\`}
/>`,
    showCode: true,
  },
  {
    title: "Responsive Code Block",
    description: "Code block that adapts to different screen sizes",
    code: `<CodeMockup
  language="css"
  filename="responsive.css"
  responsive
  code={\`.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
}\`}
/>`,
    showCode: true,
  },
];

export const codeMetadata: ComponentMetadata = {
  name: "Code",
  description: "Code block mockup",
  category: ComponentCategory.MOCKUP,
  path: "/components/mockup/code",
  tags: ["code", "mockup", "terminal", "syntax", "programming", "editor"],
  examples: codeExamples,
  relatedComponents: ["browser", "kbd", "diff"],
  preview: (
    <div class="w-80">
      <CodeMockup
        language="javascript"
        filename="example.js"
        code={`function hello() {\n  console.log('Hello World!');\n  return true;\n}`}
        showLineNumbers
      />
    </div>
  ),
};
