// frontend/components/markdown-renderer.tsx
interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const parseMarkdown = (text: string) => {
    // 1️⃣ Escape HTML trước (rất quan trọng)
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2️⃣ Headers
    text = text.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>');
    text = text.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>');

    // 3️⃣ Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // 4️⃣ Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">$1</code>');

    // 5️⃣ Code blocks (đặt sau escape để giữ nguyên cú pháp)
    text = text.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (_m, lang, code) =>
        `<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code class="font-mono text-sm language-${lang || 'text'}">${code}</code></pre>`
    );

    // 6️⃣ Lists
    text = text.replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>');
    text = text.replace(/(<li.*<\/li>)/gims, '<ul class="space-y-1 my-3">$1</ul>');

    // 7️⃣ Paragraphs
    text = text.replace(/\n\n/g, '</p><p class="leading-relaxed my-3">');

    return `<div class="prose prose-neutral max-w-none"><p class="leading-relaxed my-3">${text}</p></div>`;
  };

  return <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />;
}
