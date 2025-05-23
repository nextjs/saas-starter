import { redirect } from 'next/navigation';
import { getUser, getTeamForUser, getUserChallengeProgress, startChallenge } from '@/lib/db/queries';
import fs from 'fs';
import path from 'path';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle, Lock, Clock } from 'lucide-react';

interface ChallengeDayContent {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  content: string;
}

interface ChallengeParams {
  params: {
    id: string;
  };
}

// Function to calculate the number of days available based on start date
const getAvailableDays = (startDate: Date | null, lastCompletedDay: number): number => {
  // If no start date, only show day 1
  if (!startDate) return 1; 
  
  const now = new Date();
  
  // Calculate calendar day difference, not just 24-hour periods
  // By resetting hours to compare just calendar days
  const startDay = new Date(startDate);
  startDay.setHours(0, 0, 0, 0);
  
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  // Calculate days between dates (inclusive of start and end dates)
  const diffTime = today.getTime() - startDay.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If challenge started today, diffDays will be 0
  // If challenge started yesterday, diffDays will be 1, etc.
  const calendarDaysElapsed = diffDays;
  
  // Available days is startDay (1) + calendar days elapsed
  const maxAvailableDays = calendarDaysElapsed + 1;
  
  // Debug logging
  console.log('Start day (midnight):', startDay);
  console.log('Today (midnight):', today);
  console.log('Calendar days elapsed:', calendarDaysElapsed);
  console.log('Max available days:', maxAvailableDays);
  console.log('Last completed day:', lastCompletedDay);
  
  return maxAvailableDays;
};

// Format date to readable format
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default async function ChallengePage({ params }: ChallengeParams) {
  // Make sure to await params first per Next.js recommendation
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

  // Verify user is logged in
  const user = await getUser();
  if (!user) {
    redirect('/login/sign-in');
  }

  // Verify user has active subscription
  const team = await getTeamForUser(user.id);
  if (!team || !(team.subscriptionStatus === 'active' || team.subscriptionStatus === 'trialing')) {
    redirect('/pricing?access=premium');
  }

  // Load data from challenges.json
  const filePath = path.join(process.cwd(), 'challenges.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { challenges, data } = JSON.parse(fileContents);

  // Find the challenge by ID
  const challenge = challenges.find((c: any) => c.id === id);
  if (!challenge) {
    redirect('/challenges');
  }

  // Get challenge content
  const challengeContent = data[id] || [];
  
  // Get user's progress for this challenge, or start it if they haven't started yet
  let userProgress = await getUserChallengeProgress(user.id, id);
  
  if (!userProgress) {
    // Auto-start the challenge when user first views it
    userProgress = await startChallenge(user.id, id);
  }
  
  // Determine how many days should be available
  const availableDays = getAvailableDays(
    userProgress.startDate ? new Date(userProgress.startDate) : null,
    userProgress.lastCompletedDay
  );
  
  // For development testing, uncomment to override:
  // const availableDays = 3; // Shows first 3 days

  // Get completion dates from progress
  const completionDates = userProgress.dayCompletionDates || {};

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/challenges" 
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Challenges
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
        <p className="text-gray-600 mb-4">{challenge.description}</p>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Duration: {challenge.time_duration}</span>
        </div>
      </div>

      {/* Show the day progress indicator */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Challenge Progress</h2>
        <div className="flex flex-wrap gap-2">
          {challengeContent.map((day: ChallengeDayContent, index: number) => {
            const dayNumber = index + 1;
            const isAvailable = dayNumber <= availableDays;
            const isCompleted = dayNumber <= userProgress.lastCompletedDay;
            
            return (
              <div 
                key={day.id}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-green-500 text-white' : isAvailable ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
                  ${dayNumber === availableDays && !isCompleted ? 'ring-2 ring-blue-300' : ''}
                `}
                title={
                  isCompleted 
                    ? `Day ${dayNumber}: Completed ${completionDates[dayNumber.toString()] ? 'on ' + formatDate(completionDates[dayNumber.toString()]) : ''}` 
                    : isAvailable 
                      ? `Day ${dayNumber}: Available` 
                      : `Day ${dayNumber}: Unlocks ${dayNumber === availableDays + 1 ? 'tomorrow' : `in ${dayNumber - availableDays} days`}`
                }
              >
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : dayNumber}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {challengeContent.length > 0 ? (
          challengeContent.map((day: ChallengeDayContent, index: number) => {
            const dayNumber = index + 1;
            const isAvailable = dayNumber <= availableDays;
            const isCompleted = dayNumber <= userProgress.lastCompletedDay;
            const completionDate = completionDates[dayNumber.toString()];
            
            // Only show available days
            if (!isAvailable) {
              return (
                <Card key={day.id} className="shadow-md opacity-60">
                  <CardHeader className="flex flex-row items-center gap-4 p-4 bg-gray-100">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <CardTitle>Day {dayNumber}: Locked</CardTitle>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {dayNumber === availableDays + 1 
                            ? "Unlocks tomorrow" 
                            : `Unlocks in ${dayNumber - availableDays} days`}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            }
            
            return (
              <Card key={day.id} className={`shadow-md ${isCompleted ? 'border-green-400 border-2' : ''}`}>
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : day.image ? (
                      <img src={day.image} alt={day.title} className="h-8 w-8" />
                    ) : (
                      <i className={`${day.icon || 'fa-solid fa-lightbulb'} text-blue-600`}></i>
                    )}
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <CardTitle>{day.title}</CardTitle>
                    {isCompleted && (
                      <div className="flex flex-col items-end">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Completed
                        </span>
                        {completionDate && (
                          <span className="text-xs text-gray-500 mt-1">
                            {formatDate(completionDate)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="mb-4 font-bold">{day.description}</p>
                  
                  {day.image && (
                    <div className="flex justify-center my-6">
                      <img 
                        src={day.image} 
                        alt={day.title} 
                        className="max-h-48 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="prose max-w-none mb-4">
                    {day.content}
                  </div>
                </CardContent>
                {!isCompleted && (
                  <CardFooter className="px-4 pb-4 pt-0 flex justify-end">
                    <form action={`/api/challenges/progress`} method="POST">
                      <input type="hidden" name="challengeId" value={id} />
                      <input type="hidden" name="action" value="complete" />
                      <input type="hidden" name="day" value={dayNumber} />
                      <Button 
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Mark as Complete
                      </Button>
                    </form>
                  </CardFooter>
                )}
              </Card>
            );
          })
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No content available for this challenge yet.</p>
          </div>
        )}
      </div>
    </div>
  );
} 