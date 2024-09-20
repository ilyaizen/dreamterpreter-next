# Dreamterpreter AI Chatbot

Dreamterpreter is an AI-powered dream interpretation chatbot built with Next.js and OpenAI's GPT-4o model. It provides users with insightful analyses of their dreams, offering potential interpretations while encouraging self-reflection.

## Features

- AI-powered dream interpretation
- Sentiment analysis of dreams
- Tagging of key dream symbols
- Summary of dream themes
- Dark mode support
- Responsive design

## Getting Started

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/dreamterpreter-next.git
cd dreamterpreter-next
npm install
```

Then, set up your environment variables:

1. Create a `.env.local` file in the root directory
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

Now, you can run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Contains the main application code
  - `api/`: API routes
  - `components/`: Reusable React components
  - `lib/`: Utility functions
  - `page.tsx`: Main page component
- `public/`: Static assets

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI API](https://openai.com/api/)
- [shadcn/ui](https://ui.shadcn.com/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
