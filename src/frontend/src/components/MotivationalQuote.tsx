import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const motivationalQuotes = [
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Education is not the filling of a pail, but the lighting of a fire.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Learning is a treasure that will follow its owner everywhere.",
  "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
];

export default function MotivationalQuote() {
  // Get day of year to select a consistent quote for the day
  const getDayOfYear = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const dayOfYear = getDayOfYear();
  const quoteIndex = dayOfYear % motivationalQuotes.length;
  const todaysQuote = motivationalQuotes[quoteIndex];

  return (
    <Card className="shadow-soft bg-gradient-to-br from-sage/10 via-cream/20 to-terracotta/10 border-sage/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-sage/20 flex items-center justify-center">
              <Quote className="w-6 h-6 text-sage" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-foreground italic leading-relaxed">
              "{todaysQuote}"
            </p>
            <p className="text-sm text-muted-foreground mt-3">Daily Motivation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
