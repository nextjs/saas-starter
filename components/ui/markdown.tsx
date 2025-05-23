interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  // Funkcja do przetwarzania tekstu Markdown na HTML
  const processMarkdown = (text: string) => {
    // Zamiana nagłówków
    let processedText = text
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
      .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold mt-3 mb-2">$1</h4>')
      .replace(/^##### (.+)$/gm, '<h5 class="text-base font-bold mt-3 mb-2">$1</h5>');
    
    // Zamiana **bold** i *italic*
    processedText = processedText
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\_\_(.+?)\_\_/g, '<strong>$1</strong>')
      .replace(/\_(.+?)\_/g, '<em>$1</em>');
    
    // Zamiana linków [text](url)
    processedText = processedText.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
    
    // Zamiana list
    processedText = processedText.replace(/^- (.+)$/gm, '<li class="ml-5 list-disc">$1</li>');
    processedText = processedText.replace(/((?:<li[^>]*>.*<\/li>\s*)+)/g, '<ul class="my-3">$1</ul>');
    
    // Zamiana numerowanych list
    processedText = processedText.replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal">$1</li>');
    
    // Zamiana bloków kodu
    processedText = processedText.replace(/```(.+?)```/gs, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono">$1</pre>');
    
    // Zamiana pojedynczych linii kodu
    processedText = processedText.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">$1</code>');
    
    // Zamiana cytowania
    processedText = processedText.replace(/^> (.+)$/gm, '<blockquote class="pl-4 border-l-4 border-gray-300 italic my-4">$1</blockquote>');
    
    // Zamiana poziomych linii
    processedText = processedText.replace(/^---$/gm, '<hr class="my-6 border-t border-gray-300" />');
    
    // Obsługa tabel
    const processTable = (text: string) => {
      // Szukaj tabel w formacie Markdown (linie zawierające |)
      const tableRegex = /(^\|.+\|\s*$\n)(^\|[-:\|\s]+\|\s*$\n)(^\|.+\|\s*$\n?)+/gm;
      
      return text.replace(tableRegex, (table) => {
        // Podziel tabelę na wiersze
        const rows = table.trim().split('\n');
        
        // Pierwszy wiersz to nagłówek
        const headerRow = rows[0];
        
        // Drugi wiersz to separator (ignorujemy, ale sprawdzamy wyrównanie)
        const separatorRow = rows[1];
        const alignments = separatorRow.split('|').filter(Boolean).map(cell => {
          if (cell.trim().startsWith(':') && cell.trim().endsWith(':')) return 'center';
          if (cell.trim().endsWith(':')) return 'right';
          return 'left';
        });
        
        // Pozostałe wiersze to dane
        const dataRows = rows.slice(2);
        
        // Tworzenie HTML dla nagłówka
        const headerHTML = headerRow
          .split('|')
          .filter(Boolean)
          .map((cell, index) => {
            const align = alignments[index] || 'left';
            return `<th class="p-2 bg-gray-100 border border-gray-300 text-${align}" align="${align}">${cell.trim()}</th>`;
          })
          .join('');
        
        // Tworzenie HTML dla danych
        const dataHTML = dataRows
          .map(row => {
            return row
              .split('|')
              .filter(Boolean)
              .map((cell, index) => {
                const align = alignments[index] || 'left';
                return `<td class="p-2 border border-gray-300 text-${align}" align="${align}">${cell.trim()}</td>`;
              })
              .join('');
          })
          .map(row => `<tr>${row}</tr>`)
          .join('');
        
        // Złożenie całej tabeli
        return `<div class="overflow-x-auto my-6">
          <table class="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>${headerHTML}</tr>
            </thead>
            <tbody>
              ${dataHTML}
            </tbody>
          </table>
        </div>`;
      });
    };
    
    // Przetwórz tabele przed paragrafami
    processedText = processTable(processedText);
    
    // Zamiana akapitów (musi być na końcu)
    // Pomijaj linie, które już są tagami HTML
    const paragraphs = processedText.split('\n');
    return paragraphs.map(paragraph => {
      // Jeśli linia jest pusta lub już zawiera tag HTML, zwróć ją bez zmian
      if (paragraph.trim() === '' || /^<\w+/.test(paragraph)) {
        return paragraph;
      }
      // W przeciwnym razie opakuj w paragraf
      return `<p class="mb-4 text-gray-700 leading-relaxed">${paragraph}</p>`;
    }).join('\n');
  };

  return (
    <div 
      className="prose prose-teal max-w-none"
      dangerouslySetInnerHTML={{ __html: processMarkdown(children) }}
    />
  );
} 