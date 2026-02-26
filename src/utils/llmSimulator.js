export const simulateLLMResponse = async (query, context, subjectName) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const normalizedQuery = query.toLowerCase();

    if (!context || context.length === 0) {
        return {
            answer: `Not found in your notes for ${subjectName}`,
            confidence: 'Low',
            citations: [],
            evidence: []
        };
    }

    // Improved keyword matching to simulate "finding" information in context
    const queryTerms = normalizedQuery.split(' ').filter(t => t.length > 3);
    const relevantChunks = context.filter(chunk =>
        queryTerms.some(term => chunk.content.toLowerCase().includes(term))
    ).slice(0, 3);

    // STRICT "Not Found" Handling
    if (relevantChunks.length === 0) {
        return {
            answer: `Not found in your notes for ${subjectName}`,
            confidence: 'Low',
            citations: [],
            evidence: []
        };
    }

    // Construct a "grounded" answer from snippets
    const primaryEvidence = relevantChunks[0];
    const answer = `According to your notes on ${subjectName} (specifically in ${primaryEvidence.source}), "${primaryEvidence.content.substring(0, 150)}...". This confirms the details regarding your query about "${query}".`;

    return {
        answer,
        confidence: 'High',
        citations: relevantChunks.map(c => ({
            file: c.source,
            reference: `Section ${c.offset + 1}`
        })),
        evidence: relevantChunks.map(c => c.content)
    };
};

export const generateStudyMaterial = async (context, subjectName) => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!context || context.length === 0) return null;

    // Simulate MCQ and Short Answer generation
    const mcqs = Array.from({ length: 5 }).map((_, i) => ({
        question: `Key concept check #${i + 1} for ${subjectName}: What is the significance of the data found in your notes?`,
        options: ['Primary Factor', 'Secondary Influence', 'Irrelevant Detail', 'Major Variable'],
        correct: Math.floor(Math.random() * 4),
        explanation: `This question is generated to test your understanding of ${subjectName} as documented in ${context[0].source}.`,
        citation: context[0].source
    }));

    const shortAnswers = Array.from({ length: 3 }).map((_, i) => ({
        question: `Explain the relationship between the core topics in your ${subjectName} notes (#${i + 1}).`,
        answer: `The transition from basic principles to advanced applications is a key theme observed in your ${subjectName} documentation.`,
        citation: context[0].source
    }));

    return { mcqs, shortAnswers };
};
