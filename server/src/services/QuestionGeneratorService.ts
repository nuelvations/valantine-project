import getClient from ".";

const client = getClient();

interface GenerateQuestionsResponse {
  mood: string;
  moodDescription: string;
  questions: string[];
}

export class QuestionGeneratorService {
  async generateQuestions(
    mood: string,
    type: string,
    context?: string
  ): Promise<GenerateQuestionsResponse> {

    const moods = `
      1. Casual / Playful  
        Light, fun, low-pressure vibe. Perfect for early chatting, first matches, or when people want to laugh and break the ice without anything heavy. Questions focus on silly preferences, funny stories, "would you rather" style hypotheticals, everyday quirks, and gentle teasing.

      2. Flirty / Romantic  
        Sweet and charming with a touch of butterflies. Builds emotional + light physical attraction. Questions lean into compliments, dream dates, first impressions, love languages, cute "what if" scenarios, and romantic gestures — great for turning up the warmth without jumping straight to explicit territory.

      3. Deep / Intimate  
        More vulnerable and meaningful. Helps lovers truly connect on values, past experiences, dreams, fears, and relationship views. Questions explore childhood, life lessons, future visions, what makes someone feel loved/safe, or reflective "how do you feel about us" prompts. Ideal once some trust is built.

      4. Spicy / Sensual  
        Teasing and seductive, focusing on attraction, turn-ons, fantasies, and physical chemistry. Questions get bolder — preferences in touch/kissing, ideal intimate moments, playful "what would you do if..." scenarios, light dirty talk starters — but still classy/consensual (not full-on explicit unless you add a hotter tier).

      5. Erotic / Naughty  
        The hottest, most explicit mood. For established connections or bold users who want raw sexual exploration. Questions dive into kinks, specific fantasies, past hottest experiences, detailed desires, role-play ideas, boundaries, and very direct bedroom/sex talk. This acts as your "unlock the heat" option.
    `;

    const prompt = `
      Generate 5 thoughtful and engaging couple questions based on the following mood: "${mood}" and type: "${type}". 
      ${context ? `Additional context: ${context}` : ""} 

      The questions should:
      1. Be romantic and suited for couples
      2. Be aligned with the specified mood
      3. Help partners understand each other better, if type is conversation
      4. if the type of the user is "game", the questions should be fun, light-hearted and playful e.g "What is my favorite color?" or "What is my name" style questions, if the type is "conversation", the questions should be more deep and meaningful to spark a good conversation
      5. the questions should always have the question "Who is she/he to you?" as the last question to help the partners reflect on their relationship and feelings towards each other
      6. Be open-ended and encourage meaningful conversations if the type is "conversation"
      7. Range from light to deeper and intimate topics based on the mood
      8. Must be unique and not generic
      9. Avoid cliches and overused questions
      10. Be appropriate for all stages of a relationship, from new to long-term
      11. if the type is game, provide an option(answers) for each question, if the type is conversation, do not provide options and make sure the questions are open ended to spark a good conversation

      Here are some example moods and their descriptions to guide you:
      ${moods}

      Here is an example of a good question format you should follow if the type is game:
      {
        "mood": "Flirty / Romantic",
        "moodDescription": "Sweet and charming with a touch of butterflies. Builds emotional + light physical attraction. Questions lean into compliments, dream dates, first impressions, love languages, cute 'what if' scenarios, and romantic gestures — great for turning up the warmth without jumping straight to explicit territory.",
        "questions": [
          "What is my favourite color?",
          "What is my favourite food?",
          "What is my favourite movie?",
          "What is my favourite song?",
          "What is my favourite place to go on a date?"
        ],
        "options": [
          ["red", "blue", "green", "yellow"],
          ["pizza", "sushi", "pasta", "salad"],
          ["The Notebook", "Inception", "Titanic", "The Matrix"],
          ["Perfect by Ed Sheeran", "Shape of You by Ed Sheeran", "Bohemian Rhapsody by Queen", "Imagine by John Lennon"],
          ["the beach", "the park", "the restaurant", "the movies"]
        ]
      }

      Respond in a JSON format with the following structure:
      {
        "mood": "the mood",
        "moodDescription": "a brief description of why these questions fit this mood",
        "questions": ["question1", "question2", "question3", "question4", "question5"],
        "options": ["option1", "option2", "option3", "option4"] // only if the type is game
      }
    `;

    const message = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: "You are a relationship coach creating personalized questions for couples or friends based on their mood.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message?.choices[0]?.message?.content || "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to parse question generation response");
    }

    const result: GenerateQuestionsResponse = JSON.parse(jsonMatch[0]);
    return result;
  }
}

// const questionGenerator = new QuestionGeneratorService();

// questionGenerator.generateQuestions("Erotic / Naughty", "game", "They just started dating and want to have fun and get to know each other better")
//   .then((result) => {
//     console.log("Generated Questions:", result);
//   })
//   .catch((error) => {
//     console.error("Error generating questions:", error);
//   });