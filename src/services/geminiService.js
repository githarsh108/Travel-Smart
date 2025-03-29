// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Initialize Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// export const generateItinerary = async (tripData) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//     // Calculate number of days
//     const startDate = new Date(tripData.startDate);
//     const endDate = new Date(tripData.endDate);
//     const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

//     // Create a detailed prompt for Gemini
//     const prompt = `Create a detailed day-by-day travel itinerary for ${tripData.destination} with the following details:
//     - Number of travelers: ${tripData.travelers}
//     - Purpose: ${tripData.purpose}
//     - Budget: INR ${tripData.budget} (total for ${numberOfDays} days)
//     - Accommodation type: ${tripData.accommodation}
//     - Transportation: ${tripData.transportation}
//     - Interested activities: ${tripData.activities.join(", ")}
//     - Number of days: ${numberOfDays}
    
//     Please provide a detailed itinerary that includes:
//     1. Day-by-day breakdown of activities
//     2. Estimated costs for each activity
//     3. Transportation between locations
//     4. Meal suggestions
//     5. Tips for each day
    
//     Format the response as a JSON object with the following structure:
//     {
//       "days": [
//         {
//           "day": 1,
//           "date": "YYYY-MM-DD",
//           "activities": [
//             {
//               "time": "HH:MM",
//               "activity": "Activity name",
//               "location": "Location name",
//               "cost": "Estimated cost in INR",
//               "duration": "Duration in hours",
//               "tips": "Tips for this activity"
//             }
//           ],
//           "meals": {
//             "breakfast": "Suggestion",
//             "lunch": "Suggestion",
//             "dinner": "Suggestion"
//           },
//           "transportation": [
//             {
//               "from": "Location A",
//               "to": "Location B",
//               "mode": "Transportation mode",
//               "cost": "Estimated cost in INR"
//             }
//           ],
//           "totalCost": "Total cost for the day in INR"
//         }
//       ],
//       "summary": {
//         "totalBudget": "Total budget in INR",
//         "estimatedTotalCost": "Estimated total cost in INR",
//         "remainingBudget": "Remaining budget in INR",
//         "tips": ["General tips for the trip"]
//       }
//     }`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
    
//     // Parse the JSON response
//     const itinerary = JSON.parse(text);
//     return itinerary;
//   } catch (error) {
//     console.error("Error generating itinerary:", error);
//     throw new Error("Failed to generate itinerary. Please try again later.");
//   }
// }; 