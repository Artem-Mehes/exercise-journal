import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
	"cleanup past planned exercises",
	{ hourUTC: 5, minuteUTC: 0 },
	internal.plannedExercises.cleanupPastPlans,
);

export default crons;
