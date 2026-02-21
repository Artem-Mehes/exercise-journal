import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		const templates = await ctx.db.query("templates").collect();

		return await Promise.all(
			templates.map(async (template) => {
				const exercises = await Promise.all(
					template.exercises.map(async (id) => {
						const exercise = await ctx.db.get(id);
						if (!exercise) return null;
						const group = exercise.groupId
							? await ctx.db.get(exercise.groupId)
							: null;
						return {
							_id: exercise._id,
							name: exercise.name,
							muscleGroup: group ? group.name : null,
						};
					}),
				);
				return {
					...template,
					exerciseDetails: exercises.filter(
						(e): e is NonNullable<typeof e> => e !== null,
					),
				};
			}),
		);
	},
});

export const getById = query({
	args: {
		templateId: v.id("templates"),
	},
	handler: async (ctx, args) => {
		const template = await ctx.db.get(args.templateId);
		if (!template) return null;

		const exercises = await Promise.all(
			template.exercises.map(async (id) => {
				const exercise = await ctx.db.get(id);
				if (!exercise) return null;
				const group = exercise.groupId
					? await ctx.db.get(exercise.groupId)
					: null;
				return {
					...exercise,
					muscleGroup: group,
				};
			}),
		);

		return {
			...template,
			exerciseDetails: exercises.filter(
				(e): e is NonNullable<typeof e> => e !== null,
			),
		};
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		exercises: v.array(v.id("exercises")),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("templates", {
			name: args.name,
			exercises: args.exercises,
		});
	},
});

export const update = mutation({
	args: {
		templateId: v.id("templates"),
		name: v.optional(v.string()),
		exercises: v.optional(v.array(v.id("exercises"))),
	},
	handler: async (ctx, args) => {
		const template = await ctx.db.get(args.templateId);
		if (!template) {
			throw new Error("Template not found");
		}

		const { templateId, ...updates } = args;
		await ctx.db.patch(templateId, updates);
		return templateId;
	},
});

export const remove = mutation({
	args: {
		templateId: v.id("templates"),
	},
	handler: async (ctx, args) => {
		const template = await ctx.db.get(args.templateId);
		if (!template) {
			throw new Error("Template not found");
		}
		await ctx.db.delete(args.templateId);
		return args.templateId;
	},
});
