import { createFormHook } from "@tanstack/react-form";

import {
	RadioGroupField,
	SubscribeButton,
	TextField,
} from "@/components/ui/form";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		RadioGroupField,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
