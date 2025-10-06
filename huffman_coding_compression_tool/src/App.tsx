import { useState } from "react";
import { Toaster } from "sonner";

// Huffman Tree Node class
class HuffmanNode {
  char: string | null;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;

  constructor(char: string | null, freq: number, left: HuffmanNode | null = null, right: HuffmanNode | null = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

// Priority Queue implementation for Huffman Tree
class PriorityQueue {
  private items: HuffmanNode[] = [];

  enqueue(node: HuffmanNode) {
    this.items.push(node);
    this.items.sort((a, b) => a.freq - b.freq);
  }

  dequeue(): HuffmanNode | undefined {
    return this.items.shift();
  }

  size(): number {
    return this.items.length;
  }
}

// Build frequency table from input text
function buildFrequencyTable(text: string): Record<string, number> {
  const freqTable: Record<string, number> = {};
  for (const char of text) {
    freqTable[char] = (freqTable[char] || 0) + 1;
  }
  return freqTable;
}

// Build Huffman Tree using priority queue
function buildHuffmanTree(freqDict: Record<string, number>): HuffmanNode | null {
  if (Object.keys(freqDict).length === 0) return null;
  if (Object.keys(freqDict).length === 1) {
    const char = Object.keys(freqDict)[0];
    return new HuffmanNode(char, freqDict[char]);
  }

  const pq = new PriorityQueue();
  
  // Add all characters to priority queue
  for (const [char, freq] of Object.entries(freqDict)) {
    pq.enqueue(new HuffmanNode(char, freq));
  }

  // Build tree by combining nodes
  while (pq.size() > 1) {
    const left = pq.dequeue()!;
    const right = pq.dequeue()!;
    const merged = new HuffmanNode(null, left.freq + right.freq, left, right);
    pq.enqueue(merged);
  }

  return pq.dequeue() || null;
}

// Generate Huffman codes from tree
function generateCodes(root: HuffmanNode | null): Record<string, string> {
  if (!root) return {};
  
  const codes: Record<string, string> = {};
  
  function traverse(node: HuffmanNode, code: string) {
    if (node.char !== null) {
      // Leaf node - assign code (handle single character case)
      codes[node.char] = code || "0";
      return;
    }
    
    if (node.left) traverse(node.left, code + "0");
    if (node.right) traverse(node.right, code + "1");
  }
  
  traverse(root, "");
  return codes;
}

// Encode text using Huffman codes
function encodeText(text: string, codes: Record<string, string>): string {
  return text.split("").map(char => codes[char] || "").join("");
}

// Decode binary string using Huffman tree
function decodeText(encodedText: string, root: HuffmanNode | null): string {
  if (!root || !encodedText) return "";
  
  // Handle single character case
  if (root.char !== null) {
    return root.char.repeat(encodedText.length);
  }
  
  let decoded = "";
  let current = root;
  
  for (const bit of encodedText) {
    current = bit === "0" ? current.left! : current.right!;
    
    if (current.char !== null) {
      decoded += current.char;
      current = root;
    }
  }
  
  return decoded;
}

// Calculate compression ratio
function calculateCompressionRatio(originalText: string, encodedText: string): number {
  const originalBits = originalText.length * 8; // ASCII = 8 bits per char
  const compressedBits = encodedText.length;
  return originalBits > 0 ? ((originalBits - compressedBits) / originalBits) * 100 : 0;
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [frequencyTable, setFrequencyTable] = useState<Record<string, number>>({});
  const [huffmanCodes, setHuffmanCodes] = useState<Record<string, string>>({});
  const [encodedText, setEncodedText] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [compressionRatio, setCompressionRatio] = useState(0);
  const [huffmanTree, setHuffmanTree] = useState<HuffmanNode | null>(null);

  const handleCompress = () => {
    if (!inputText.trim()) {
      alert("Please enter some text to compress!");
      return;
    }

    // Step 1: Build frequency table
    const freqTable = buildFrequencyTable(inputText);
    setFrequencyTable(freqTable);

    // Step 2: Build Huffman tree
    const tree = buildHuffmanTree(freqTable);
    setHuffmanTree(tree);

    // Step 3: Generate codes
    const codes = generateCodes(tree);
    setHuffmanCodes(codes);

    // Step 4: Encode text
    const encoded = encodeText(inputText, codes);
    setEncodedText(encoded);

    // Step 5: Calculate compression ratio
    const ratio = calculateCompressionRatio(inputText, encoded);
    setCompressionRatio(ratio);

    // Clear previous decode result
    setDecodedText("");
  };

  const handleDecompress = () => {
    if (!encodedText || !huffmanTree) {
      alert("Please compress some text first!");
      return;
    }

    const decoded = decodeText(encodedText, huffmanTree);
    setDecodedText(decoded);
  };

  const handleClear = () => {
    setInputText("");
    setFrequencyTable({});
    setHuffmanCodes({});
    setEncodedText("");
    setDecodedText("");
    setCompressionRatio(0);
    setHuffmanTree(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Huffman Coding Compression Tool</h1>
          <p className="text-gray-600">
            Enter text below to compress using Huffman coding algorithm. 
            View character frequencies, generated codes, and compression statistics.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Input Text</h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter or paste your text here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCompress}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Compress
              </button>
              <button
                onClick={handleDecompress}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Decompress
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Compression Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Compression Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Original Size:</span>
                <span className="font-mono">{inputText.length * 8} bits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compressed Size:</span>
                <span className="font-mono">{encodedText.length} bits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compression Ratio:</span>
                <span className="font-mono font-semibold text-green-600">
                  {compressionRatio.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Space Saved:</span>
                <span className="font-mono">
                  {Math.max(0, (inputText.length * 8) - encodedText.length)} bits
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Character Frequencies */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Character Frequencies</h2>
            <div className="max-h-64 overflow-y-auto">
              {Object.keys(frequencyTable).length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Character</th>
                      <th className="text-right py-2">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(frequencyTable)
                      .sort(([,a], [,b]) => b - a)
                      .map(([char, freq]) => (
                        <tr key={char} className="border-b border-gray-100">
                          <td className="py-1 font-mono">
                            {char === ' ' ? '(space)' : char === '\n' ? '(newline)' : char}
                          </td>
                          <td className="text-right py-1 font-mono">{freq}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 italic">No data to display</p>
              )}
            </div>
          </div>

          {/* Huffman Codes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Huffman Codes</h2>
            <div className="max-h-64 overflow-y-auto">
              {Object.keys(huffmanCodes).length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Character</th>
                      <th className="text-right py-2">Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(huffmanCodes)
                      .sort(([,a], [,b]) => a.length - b.length || a.localeCompare(b))
                      .map(([char, code]) => (
                        <tr key={char} className="border-b border-gray-100">
                          <td className="py-1 font-mono">
                            {char === ' ' ? '(space)' : char === '\n' ? '(newline)' : char}
                          </td>
                          <td className="text-right py-1 font-mono text-blue-600">{code}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 italic">No codes generated yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Encoded/Decoded Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Encoded Binary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Encoded Binary String</h2>
            <div className="bg-gray-50 p-4 rounded-md max-h-48 overflow-y-auto">
              {encodedText ? (
                <p className="font-mono text-sm break-all text-blue-600">{encodedText}</p>
              ) : (
                <p className="text-gray-500 italic">No encoded data yet</p>
              )}
            </div>
          </div>

          {/* Decoded Text */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Decoded Text</h2>
            <div className="bg-gray-50 p-4 rounded-md max-h-48 overflow-y-auto">
              {decodedText ? (
                <div>
                  <p className="font-mono text-sm whitespace-pre-wrap">{decodedText}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className={`text-sm font-medium ${
                      decodedText === inputText ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {decodedText === inputText ? '✓ Decoding successful!' : '✗ Decoding failed!'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Click "Decompress" to decode the binary data</p>
              )}
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">How to Use:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Enter or paste text in the input area</li>
            <li>Click "Compress" to encode using Huffman algorithm</li>
            <li>View character frequencies, generated codes, and compression statistics</li>
            <li>Click "Decompress" to decode the binary back to original text</li>
            <li>Verify the decoded text matches your original input</li>
            <li>Use "Clear" to reset and try with different text</li>
          </ol>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
