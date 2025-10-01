 
require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.34.0/min/vs" } });

require(["vs/editor/editor.main"], function () {
    // Initialize the Monaco editor with the dark theme
    const editor = monaco.editor.create(document.getElementById("editor"), {
        value: "# Write your code here\nprint('Hello, world!')",
        language: "python",
        theme: "vs-dark",
        automaticLayout: true
    });

    // === 2-Finger Scroll for Mobile Devices ===
    const editorContainer = document.getElementById("editor");
    let lastTouchX = 0;
    let lastTouchY = 0;
    let fingers = 0;

    editorContainer.addEventListener('touchstart', (e) => {
        fingers = e.touches.length;
        if (fingers === 2) {
            lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            e.preventDefault(); // prevent page scroll
        }
    }, { passive: false });

    editorContainer.addEventListener('touchmove', (e) => {
        if (fingers === 2) {
            const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;

            const deltaY = lastTouchY - currentY;
            const deltaX = lastTouchX - currentX;

            editorContainer.scrollTop += deltaY;
            editorContainer.scrollLeft += deltaX;

            lastTouchY = currentY;
            lastTouchX = currentX;

            e.preventDefault();
        }
    }, { passive: false });

    editorContainer.addEventListener('touchend', (e) => {
        fingers = e.touches.length;
    });

    // === Language Change ===
    document.getElementById("language").addEventListener("change", (e) => {
        const newLanguage = e.target.value;
        monaco.editor.setModelLanguage(editor.getModel(), newLanguage);

        // Set default code based on language
        let defaultValue = "// Write your JavaScript code here\nconsole.log('Hello, world!');";
        if (newLanguage === 'python') {
            defaultValue = "# Write your Python code here\nprint('Hello, world!')";
        } else if (newLanguage === 'typescript') {
            defaultValue = "// Write your TypeScript code here\nconst message: string = 'Hello, world!';\nconsole.log(message);";
        }
        editor.setValue(defaultValue);
    });

    // === Run Button ===
    document.getElementById("run").addEventListener("click", async () => {
        const language = document.getElementById("language").value;
        const code = editor.getValue();
        const input = document.getElementById("input").value;
        const outputEl = document.getElementById("output");

        const runButton = document.getElementById("run");
        runButton.disabled = true;
        runButton.textContent = "Running...";
        outputEl.textContent = "Running the code. Please wait...";

        try {
            const response = await fetch("/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language, code, input }),
            });

            const data = await response.json();

            if (data.error) {
                outputEl.textContent = `❌ ERROR:\n${data.error}`;
                outputEl.style.color = '#e57373';
            } else {
                outputEl.textContent = `✅ OUTPUT:\n${data.output}\n\n⚠️ WARNINGS:\n${data.warnings}`;
                outputEl.style.color = '#ccc';
            }

        } catch (err) {
            outputEl.textContent = `
❌ RUNTIME ERROR: Cannot connect to the compiler backend.

The compiler logic relies on a live server endpoint (/run) that does not exist in this preview environment.

Network Error: ${err.message}.
            `;
            outputEl.style.color = '#e57373';
        } finally {
            runButton.textContent = "Run Code";
            runButton.disabled = false;
        }
    });
});
