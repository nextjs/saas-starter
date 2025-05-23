import { redirect } from 'next/navigation';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import fs from 'fs';
import path from 'path';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink, Lock, Calendar, Clock } from 'lucide-react';

// Interfejs dla danych wyzwania
interface Challenge {
  id: string;
  challenge_id: number;
  title: string;
  description: string;
  time_duration: string;
}

export default async function ChallengesPage() {
  // Sprawdź, czy użytkownik jest zalogowany
  const user = await getUser();
  if (!user) {
    redirect('/login/sign-in');
  }

  // Sprawdź, czy użytkownik ma aktywną subskrypcję
  const team = await getTeamForUser(user.id);
  if (!team || !(team.subscriptionStatus === 'active' || team.subscriptionStatus === 'trialing')) {
    redirect('/pricing?access=premium');
  }

  // Załaduj dane z pliku challenges.json
  const filePath = path.join(process.cwd(), 'challenges.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { challenges } = JSON.parse(fileContents);

  // Sortuj wyzwania według challenge_id
  const sortedChallenges = [...challenges].sort((a, b) => a.challenge_id - b.challenge_id);
  
  // Zakładamy, że użytkownik może rozpocząć tylko pierwsze wyzwanie
  // Później będziemy musieli dodać śledzenie ukończonych wyzwań z bazy danych
  const completedChallenges: string[] = []; // Tu docelowo pobieranie z bazy danych
  
  // Pierwsze wyzwanie jest zawsze dostępne
  const availableChallenges = new Set<string>([sortedChallenges[0]?.id]);
  
  // Oznaczamy również jako dostępne kolejne wyzwanie po ukończonym
  if (completedChallenges.length > 0) {
    // Znajdź najwyższy challenge_id ukończonego wyzwania
    const maxCompletedId = Math.max(
      ...completedChallenges.map(id => 
        sortedChallenges.find(c => c.id === id)?.challenge_id || 0
      )
    );
    
    // Następne wyzwanie po ukończonym jest dostępne
    const nextChallenge = sortedChallenges.find(c => c.challenge_id === maxCompletedId + 1);
    if (nextChallenge) {
      availableChallenges.add(nextChallenge.id);
    }
  }

  const hasActiveSubscription = team.subscriptionStatus === 'active' || team.subscriptionStatus === 'trialing';

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Challenges</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedChallenges.map((challenge: Challenge) => {
          const isCompleted = completedChallenges.includes(challenge.id);
          const isAvailable = availableChallenges.has(challenge.id);
          
          return (
            <Card key={challenge.id} className={`shadow-lg rounded-lg overflow-hidden flex flex-col ${!isAvailable ? 'opacity-70' : ''}`}>
              <CardHeader className={`p-4 ${isCompleted ? 'bg-green-600' : isAvailable ? 'bg-gradient-to-r from-blue-500 to-teal-500' : 'bg-gray-500'}`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">{challenge.title}</CardTitle>
                  <div className="flex items-center text-white text-xs font-medium bg-white/20 rounded-full py-1 px-2">
                    <span>{challenge.challenge_id}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <p>{challenge.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="mr-3">Duration: {challenge.time_duration}</span>
                  {!isAvailable && (
                    <div className="flex items-center ml-auto">
                      <Lock className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-gray-500">Locked</span>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Completed
                    </div>
                  )}
                </div>
              </CardContent>
              {hasActiveSubscription && (
                <CardFooter className="p-4 border-t">
                  {isAvailable ? (
                    <Link 
                      href={`/challenges/${challenge.id}`}
                      className="flex items-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-md justify-center"
                    >
                                            <span>Open Challenge</span>
                    </Link>
                  ) : (
                    <button 
                      disabled
                      className="flex items-center gap-2 w-full px-4 py-2 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed justify-center"
                    >
                      <span>Complete Previous Challenge</span>
                      <Lock size={16} />
                    </button>
                  )}
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
