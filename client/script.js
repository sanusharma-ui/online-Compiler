require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.34.0/min/vs" } });

require(["vs/editor/editor.main"], function () {
    // Initialize the Monaco editor with the dark theme
    const editor = monaco.editor.create(document.getElementById("editor"), {
        value: "# Write your code here\nprint('Hello, world!')",
        language: "python",
        theme: "vs-dark", // Using the vs-dark theme to match the body
        automaticLayout: true
    });

    // Event listener for language change
    document.getElementById("language").addEventListener("change", (e) => {
        const newLanguage = e.target.value;
        monaco.editor.setModelLanguage(editor.getModel(), newLanguage);
        
        // Set default code based on language (for better user experience)
        let defaultValue = "// Write your JavaScript code here\nconsole.log('Hello, world!');";
        if (newLanguage === 'python') {
            defaultValue = "# Write your Python code here\nprint('Hello, world!')";
        } else if (newLanguage === 'typescript') {
             defaultValue = "// Write your TypeScript code here\nconst message: string = 'Hello, world!';\nconsole.log(message);";
        }
        editor.setValue(defaultValue);
    });

    // Event listener for Run button
    document.getElementById("run").addEventListener("click", async () => {
        const language = document.getElementById("language").value;
        const code = editor.getValue();
        const input = document.getElementById("input").value;
        const outputEl = document.getElementById("output");

        // Disable button and show running state
        const runButton = document.getElementById("run");
        runButton.disabled = true;
        runButton.textContent = "Running...";
        outputEl.textContent = "Running the code. Please wait...";

        try {
            // NOTE: This fetch call requires a backend server to execute the code.
            // Since this is a frontend-only environment, this request will likely fail.
            // We will simulate a response for demonstration purposes.
            
            // --- SIMULATING BACKEND EXECUTION (Replace with actual fetch in a real environment) ---
            
            const response = await fetch("/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language, code, input }),
            });

            const data = await response.json();
            // --- END SIMULATION ---

            if (data.error) {
                outputEl.textContent = `❌ ERROR:\n${data.error}`;
                outputEl.style.color = '#e57373'; // Light Red for error
            } else {
                outputEl.textContent = `✅ OUTPUT:\n${data.output}\n\n⚠️ WARNINGS:\n${data.warnings}`;
                outputEl.style.color = '#ccc'; // Normal text color
            }

        } catch (err) {
            // Handle fetch/network errors (common in sandboxed environments)
            outputEl.textContent = `
            ❌ RUNTIME ERROR: Cannot connect to the compiler backend.
            
            The compiler logic relies on a live server endpoint (/run) that does not exist in this preview environment. 
            
            Network Error: ${err.message}.
            `;
            outputEl.style.color = '#e57373';
        } finally {
            // Re-enable button
            runButton.textContent = "Run Code";
            runButton.disabled = false;
        }
    });
});