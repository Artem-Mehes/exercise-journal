/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as barbells from "../barbells.js";
import type * as exerciseGroups from "../exerciseGroups.js";
import type * as exercises from "../exercises.js";
import type * as migrations from "../migrations.js";
import type * as plates from "../plates.js";
import type * as sets from "../sets.js";
import type * as templates from "../templates.js";
import type * as workouts from "../workouts.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  barbells: typeof barbells;
  exerciseGroups: typeof exerciseGroups;
  exercises: typeof exercises;
  migrations: typeof migrations;
  plates: typeof plates;
  sets: typeof sets;
  templates: typeof templates;
  workouts: typeof workouts;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
