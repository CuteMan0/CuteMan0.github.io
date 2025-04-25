mixins.highlight = {
    data() {
        return { copying: false };
    },
    created() {
        hljs.configure({ ignoreUnescapedHTML: true });
        this.renderers.push(this.highlight);
    },
    methods: {
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        highlight() {
            console.log("🔦 highlight function running...");
            let codes = document.querySelectorAll("pre");

            for (let pre of codes) {
                const codeEl = pre.querySelector("code");

                if (!codeEl) continue;

                const rawCode = codeEl.textContent;
	const langMatch = codeEl.className.match(/(?:language-)?(\w+)/);
                const language = langMatch ? langMatch[1] : "plaintext";

                let highlighted;
                try {
                    if (hljs.getLanguage(language)) {
                        highlighted = hljs.highlight(rawCode, { language }).value;
                    } else {
                        highlighted = hljs.highlightAuto(rawCode).value;
                    }
                } catch (e) {
                    console.warn("Highlight error:", e);
                    highlighted = rawCode;
                }

                pre.innerHTML = `
                    <div class="code-content hljs">${highlighted}</div>
                    <div class="language">${language}</div>
                    <div class="copycode">
                        <i class="fa-solid fa-copy fa-fw"></i>
                        <i class="fa-solid fa-check fa-fw"></i>
                    </div>
                `;

                const content = pre.querySelector(".code-content");
                if (hljs.lineNumbersBlock) {
                    hljs.lineNumbersBlock(content, { singleLine: true });
                }

                const copycode = pre.querySelector(".copycode");
                copycode.addEventListener("click", async () => {
                    if (this.copying) return;
                    this.copying = true;
                    copycode.classList.add("copied");
                    await navigator.clipboard.writeText(rawCode);
                    await this.sleep(1000);
                    copycode.classList.remove("copied");
                    this.copying = false;
                });
            }
        },
    },
};
