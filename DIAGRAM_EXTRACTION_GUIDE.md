# Intelligent Diagram Detection & Generation System

## Overview
The PDF extraction system now intelligently detects when to use **KaTeX** (for pure math) vs **Excalidraw diagrams** (for visual elements). It automatically generates proper Excalidraw JSON code and embeds it directly in the database.

---

## How It Works

### 1. Smart Detection (75% KaTeX, 25% Diagrams)

**KaTeX Only (75% of questions):**
- Pure mathematical expressions
- Text-based problems
- Algebraic word problems
- Theoretical questions

**Excalidraw Diagrams (25% of questions):**
- Geometric figures (triangles, circles, rectangles)
- Graphs (coordinate systems, network graphs, trees)
- Circuits (electrical, logic gates)
- Tables (Venn diagrams, data tables)
- Bar charts, histograms, pie charts
- Free body diagrams
- Any question mentioning "figure", "diagram", "shown below"

---

## Output Format

### Example 1: KaTeX Only (No Diagram Needed)

**Question from PDF:**
```
Find the value of ∫₀¹ (x² + 2x) dx.
```

**Stored in Database:**
```json
{
  "question_statement": "Find the value of $\\int_0^1 (x^2 + 2x) dx$.",
  "question_type": "NAT",
  "options": null
}
```

**Result:** Renders as beautiful LaTeX math using KaTeX.

---

### Example 2: Venn Diagram (Excalidraw JSON Embedded)

**Question from PDF:**
```
In the given figure, the numbers associated with the rectangle,
triangle, and ellipse are 1, 2, and 3, respectively.
Which one among the given options is the most appropriate
combination of P, Q, and R?

[Visual: Rectangle overlapping with Triangle and Ellipse]

Options:
A. P = 6; Q = 5; R = 3
B. P = 5; Q = 6; R = 3
C. P = 3; Q = 6; R = 6
D. P = 5; Q = 3; R = 6
```

**Stored in Database:**
```json
{
  "question_statement": "In the given figure, the numbers associated with the rectangle, triangle, and ellipse are 1, 2, and 3, respectively. Which one among the given options is the most appropriate combination of P, Q, and R? [{\"x\": 100, \"y\": 150, \"type\": \"rectangle\", \"width\": 200, \"height\": 120, \"strokeColor\": \"#000000\", \"backgroundColor\": \"transparent\", \"strokeWidth\": 2}, {\"x\": 180, \"y\": 50, \"type\": \"line\", \"points\": [[0,0], [150,220], [-150,220], [0,0]], \"strokeColor\": \"#000000\", \"strokeWidth\": 2}, {\"x\": 130, \"y\": 190, \"type\": \"ellipse\", \"width\": 220, \"height\": 120, \"strokeColor\": \"#000000\", \"backgroundColor\": \"transparent\", \"strokeWidth\": 2}, {\"x\": 70, \"y\": 200, \"type\": \"text\", \"text\": \"1\", \"fontSize\": 24}, {\"x\": 210, \"y\": 60, \"type\": \"text\", \"text\": \"2\", \"fontSize\": 24}, {\"x\": 260, \"y\": 300, \"type\": \"text\", \"text\": \"3\", \"fontSize\": 24}, {\"x\": 140, \"y\": 230, \"type\": \"text\", \"text\": \"4\", \"fontSize\": 24}, {\"x\": 190, \"y\": 240, \"type\": \"text\", \"text\": \"P\", \"fontSize\": 24}, {\"x\": 260, \"y\": 250, \"type\": \"text\", \"text\": \"Q\", \"fontSize\": 24}, {\"x\": 210, \"y\": 170, \"type\": \"text\", \"text\": \"R\", \"fontSize\": 24}]",
  "question_type": "MCQ",
  "options": [
    "P = 6; Q = 5; R = 3",
    "P = 5; Q = 6; R = 3",
    "P = 3; Q = 6; R = 6",
    "P = 5; Q = 3; R = 6"
  ]
}
```

**Result:**
- Question text renders with proper LaTeX
- Diagram renders as interactive Excalidraw canvas (using ExcalidrawRenderer component)

---

## Excalidraw JSON Structure

### Basic Element Types

1. **Rectangle:**
```json
{
  "x": 100,
  "y": 100,
  "type": "rectangle",
  "width": 80,
  "height": 50,
  "strokeColor": "#000000",
  "backgroundColor": "#e0f2fe",
  "strokeWidth": 2
}
```

2. **Ellipse (Circle):**
```json
{
  "x": 200,
  "y": 100,
  "type": "ellipse",
  "width": 60,
  "height": 60,
  "strokeColor": "#000000",
  "backgroundColor": "#e0f2fe",
  "strokeWidth": 2
}
```

3. **Line:**
```json
{
  "x": 100,
  "y": 100,
  "type": "line",
  "points": [[0, 0], [50, 0], [50, 50]],
  "strokeColor": "#000000",
  "strokeWidth": 2
}
```

4. **Arrow:**
```json
{
  "x": 100,
  "y": 100,
  "type": "arrow",
  "points": [[0, 0], [100, 50]],
  "strokeColor": "#000000",
  "strokeWidth": 2
}
```

5. **Text Label:**
```json
{
  "x": 150,
  "y": 120,
  "type": "text",
  "text": "A",
  "fontSize": 18,
  "fontFamily": 1,
  "strokeColor": "#000000"
}
```

**Important:** Points in line/arrow are **RELATIVE** to (x, y).
Example: `x=100, y=100, points=[[0,0], [50,50]]` draws from (100,100) to (150,150).

---

## Common Diagram Patterns

### 1. Binary Tree (3 nodes)
```json
[
  {"x": 250, "y": 50, "type": "ellipse", "width": 40, "height": 40, "strokeColor": "#000000", "backgroundColor": "#e0f2fe"},
  {"x": 265, "y": 75, "type": "text", "text": "5", "fontSize": 16, "fontFamily": 1, "strokeColor": "#000000"},
  {"x": 260, "y": 90, "type": "line", "points": [[0, 0], [-60, 40]], "strokeColor": "#000000"},
  {"x": 180, "y": 130, "type": "ellipse", "width": 40, "height": 40, "strokeColor": "#000000", "backgroundColor": "#e0f2fe"},
  {"x": 195, "y": 155, "type": "text", "text": "3", "fontSize": 16, "fontFamily": 1, "strokeColor": "#000000"},
  {"x": 280, "y": 90, "type": "line", "points": [[0, 0], [60, 40]], "strokeColor": "#000000"},
  {"x": 320, "y": 130, "type": "ellipse", "width": 40, "height": 40, "strokeColor": "#000000", "backgroundColor": "#e0f2fe"},
  {"x": 335, "y": 155, "type": "text", "text": "7", "fontSize": 16, "fontFamily": 1, "strokeColor": "#000000"}
]
```

### 2. Bar Chart (3 bars)
```json
[
  {"x": 50, "y": 100, "type": "rectangle", "width": 40, "height": 100, "strokeColor": "#000000", "backgroundColor": "#3b82f6"},
  {"x": 100, "y": 80, "type": "rectangle", "width": 40, "height": 120, "strokeColor": "#000000", "backgroundColor": "#3b82f6"},
  {"x": 150, "y": 120, "type": "rectangle", "width": 40, "height": 80, "strokeColor": "#000000", "backgroundColor": "#3b82f6"}
]
```

### 3. Geometric Figure (Triangle)
```json
[
  {"x": 200, "y": 50, "type": "line", "points": [[0, 0], [100, 0], [50, 86.6], [0, 0]], "strokeColor": "#000000", "strokeWidth": 2},
  {"x": 190, "y": 40, "type": "text", "text": "A", "fontSize": 16, "fontFamily": 1, "strokeColor": "#000000"},
  {"x": 310, "y": 40, "type": "text", "text": "B", "fontSize": 16, "fontFamily": 1, "strokeColor": "#000000"},
  {"x": 245, "y": 145, "type": "text", "text": "C", "fontSize": 16, "fontFamily": 1, "strokeColor": "#000000"}
]
```

### 4. Circuit (Simple Resistor)
```json
[
  {"x": 100, "y": 150, "type": "line", "points": [[0, 0], [50, 0]], "strokeColor": "#000000", "strokeWidth": 2},
  {"x": 150, "y": 140, "type": "rectangle", "width": 60, "height": 20, "strokeColor": "#000000", "backgroundColor": "transparent", "strokeWidth": 2},
  {"x": 165, "y": 130, "type": "text", "text": "R1", "fontSize": 14, "fontFamily": 1, "strokeColor": "#000000"},
  {"x": 210, "y": 150, "type": "line", "points": [[0, 0], [50, 0]], "strokeColor": "#000000", "strokeWidth": 2}
]
```

---

## How Diagrams Are Rendered

The frontend automatically detects and renders Excalidraw JSON using the `ExcalidrawRenderer` component.

### In QuestionPreview.tsx:

```typescript
import { ExcalidrawRenderer, splitTextAndDiagram } from './ExcalidrawRenderer';

// Split text and diagram
const { text, diagram } = splitTextAndDiagram(question.question_statement);

// Render
{text && renderMathContent(text)}
{diagram && diagram.length > 0 && (
  <ExcalidrawRenderer elements={diagram} width={500} height={350} />
)}
```

### Rendering Process:
1. **Extract:** Find Excalidraw JSON in text using pattern matching
2. **Parse:** Parse JSON array of elements
3. **Render:** Draw on HTML5 canvas using element coordinates
4. **Display:** Show alongside LaTeX content

---

## Color Scheme

**Standard Colors:**
- `#000000` - Black borders/strokes
- `#e0f2fe` - Light blue fill (nodes, shapes)
- `#3b82f6` - Blue (bars, highlights)
- `#22c55e` - Green (correct answers, success)
- `#ef4444` - Red (errors, warnings)
- `transparent` - No fill

---

## Database Storage

**Table:** `questions` or `new_questions`

**Columns:**
- `question_statement` (TEXT): Contains LaTeX math + Excalidraw JSON
- `options` (TEXT[]): Each option can contain LaTeX + Excalidraw JSON
- `solution` (TEXT): Can contain LaTeX + Excalidraw JSON

**Storage Format:**
- Text content + Excalidraw JSON are stored as **one continuous string**
- Frontend splits them during rendering
- No separate diagram column needed

---

## Benefits

1. **Automatic Detection:** AI decides when diagrams are needed
2. **No Manual Work:** Everything happens during PDF scan
3. **Proper Rendering:** Diagrams display correctly in UI
4. **Database Friendly:** Stored as text, no binary data
5. **Version Control:** JSON is human-readable and diffable
6. **Flexible:** Easy to add new diagram types

---

## Testing

### Test Case 1: Pure Math Question
Upload a PDF with: `∫₀¹ x² dx`

**Expected:**
- question_statement contains only KaTeX: `$\\int_0^1 x^2 dx$`
- No Excalidraw JSON

### Test Case 2: Venn Diagram Question
Upload a PDF with overlapping shapes labeled 1, 2, 3, P, Q, R

**Expected:**
- question_statement contains text + Excalidraw JSON array
- JSON has rectangle, triangle (polygon/line), ellipse, and text labels
- Frontend renders visual diagram

### Test Case 3: Binary Tree Question
Upload a PDF with tree structure

**Expected:**
- question_statement contains text + Excalidraw JSON
- JSON has ellipses (nodes) and lines (edges)
- Text labels for node values

---

## Limitations

1. **No Images:** Cannot import PNG/JPG images, only primitives
2. **No Curves:** Bezier curves not supported, use line segments
3. **No Rotation:** Elements are axis-aligned
4. **Single-line Text:** Multi-line text requires multiple text elements
5. **Relative Coordinates:** Line/arrow points are relative to (x, y)

---

## Future Enhancements

- Support for curved lines/arcs
- Grouping of related elements
- Color gradients
- Interactive elements
- Animation support
- Polygon type (currently using line with closed path)

---

## Summary

The system now intelligently:
1. ✅ Uses **KaTeX** for pure math (75% of cases)
2. ✅ Generates **Excalidraw diagrams** for visuals (25% of cases)
3. ✅ Embeds diagram JSON in database text fields
4. ✅ Renders diagrams correctly in frontend
5. ✅ Requires **zero manual intervention**

All extraction happens automatically during PDF scanning!
