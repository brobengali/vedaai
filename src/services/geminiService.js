const API_URL = "/api/analyze-exam";

/**
 * Converts a browser File object to base64 inlineData for Gemini API.
 */
export const fileToGenerativePart = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      let mimeType = file.type;
      // Fallback mime type detection
      if (!mimeType || mimeType === 'application/octet-stream') {
        const ext = file.name.split('.').pop().toLowerCase();
        const mimeMap = {
          pdf: 'application/pdf',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          webp: 'image/webp',
          gif: 'image/gif',
        };
        mimeType = mimeMap[ext] || 'image/jpeg';
      }
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file: ' + file.name));
    reader.readAsDataURL(file);
  });
};

/**
 * Sends Question Paper and Answer Sheet to Gemini 3.6 Flash for:
 *   - OCR of printed + handwritten text
 *   - Question extraction (with sub-parts)
 *   - Answer extraction and mapping
 *   - Grading and AI feedback
 *   - Bounding box region estimation
 */
export const analyzeExamDocuments = async (questionPaperFile, answerSheetFile, onProgress) => {
  // Progress callback: 'encoding' | 'sending' | 'parsing'
  if (onProgress) onProgress('encoding');

  const [qpPart, asPart] = await Promise.all([
    fileToGenerativePart(questionPaperFile),
    fileToGenerativePart(answerSheetFile)
  ]);

  if (onProgress) onProgress('sending');

  const prompt = `You are an expert AI exam grading and OCR system.

INPUT:
- Document 1: A printed Question Paper.
- Document 2: A student's handwritten Answer Sheet (could be multi-page).

TASK — perform ALL of these steps:

1. QUESTION EXTRACTION: Extract every question from Document 1 in exact printed order.
   - Treat labelled sub-parts as SEPARATE items: e.g. "11(a)" and "11(b)" become id: "11a" and id: "11b".
   - Preserve original numbering exactly as printed.

2. HANDWRITTEN OCR: Read the student's handwriting in Document 2 carefully.
   - Transcribe each answer as accurately as possible.
   - Note: handwriting may be messy — do your best.

3. ANSWER MAPPING: Match each extracted answer to its corresponding question.
   - Handle answers written out of order.
   - For unanswered questions: do NOT include an answer entry.
   - For extra answers that don't match any question: include them with qId "extra_1", "extra_2" etc.

4. GRADING: For each answered question:
   - Evaluate correctness based on the question content.
   - Assign marksGiven (0 to max marks for that question).
   - Set isCorrect to true if marksGiven equals full marks, false otherwise.

5. BOUNDING BOX REGIONS: For each answer, estimate where it appears on Document 2 as a percentage of the page:
   - "region": { "top": "X%", "left": "Y%", "width": "W%", "height": "H%" }
   - These are approximate visual positions.

6. CONFIDENCE: Set "confidence" to "low" if handwriting was unclear or mapping was uncertain, otherwise "high".
   Also set "lowConfidence": true on the question object if confidence is low.

OUTPUT: Return ONLY a single valid JSON object (no markdown, no backticks, no explanation) with this exact schema:
{
  "studentName": "Student Submission",
  "className": "Exam Review",
  "date": "${new Date().toLocaleDateString()}",
  "score": <total marks scored>,
  "maxScore": <total marks possible>,
  "questions": [
    { "id": "1", "text": "Full question text", "marks": 5, "lowConfidence": false }
  ],
  "answers": [
    { "qId": "1", "text": "Transcribed answer text", "isCorrect": true, "marksGiven": 5, "confidence": "high", "region": { "top": "10%", "left": "5%", "width": "90%", "height": "15%" } }
  ]
}

IMPORTANT:
- The "id" field in questions and the "qId" field in answers MUST match exactly (same string).
- Every id/qId must be a string type.
- Calculate score and maxScore correctly from the individual marks.
- Return ONLY valid JSON. No text before or after.`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: "Document 1 — Question Paper:" },
          qpPart,
          { text: "Document 2 — Student Handwritten Answer Sheet:" },
          asPart,
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1
    }
  };

  // Retry logic for transient errors (503, 429)
  const MAX_RETRIES = 3;
  let lastError = null;
  const bodyStr = JSON.stringify(requestBody);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 1 && onProgress) {
      onProgress('sending');
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyStr
    });

    if (response.ok) {
      // Success — continue to parsing below
      if (onProgress) onProgress('parsing');

      const resJson = await response.json();
      const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        const blockReason = resJson.candidates?.[0]?.finishReason;
        throw new Error(`Gemini returned no content. Reason: ${blockReason || 'unknown'}. Try clearer document images.`);
      }

      // Clean any accidental markdown fencing
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }

      let result;
      try {
        result = JSON.parse(cleaned);
      } catch {
        console.error("Failed to parse Gemini response:", cleaned);
        throw new Error("AI returned malformed data. Please try again with clearer images.");
      }

      // Ensure arrays exist
      if (!Array.isArray(result.questions)) result.questions = [];
      if (!Array.isArray(result.answers)) result.answers = [];

      // Normalize all IDs to strings
      result.questions.forEach(q => { q.id = String(q.id); });
      result.answers.forEach(a => { a.qId = String(a.qId); });

      // Recalculate score/maxScore from individual marks for reliability
      let totalMax = 0;
      let totalScore = 0;
      result.questions.forEach(q => { totalMax += (Number(q.marks) || 0); });
      result.answers.forEach(a => { totalScore += (Number(a.marksGiven) || 0); });
      result.maxScore = totalMax || result.maxScore || 0;
      result.score = totalScore;

      return result;
    }

    // Error handling
    const errBody = await response.text();
    let msg = `Gemini API Error (${response.status})`;
    try {
      const parsed = JSON.parse(errBody);
      msg = parsed.error?.message || msg;
    } catch { /* use default */ }

    lastError = new Error(msg);

    // Only retry on transient errors
    if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES) {
      const waitMs = attempt * 3000; // 3s, 6s
      if (onProgress) onProgress('sending'); // show "retrying"
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }

    throw lastError;
  }

  throw lastError || new Error("Failed after retries.");
};
