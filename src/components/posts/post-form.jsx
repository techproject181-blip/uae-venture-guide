"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SelectField, TextAreaField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { sendJson } from "@/lib/form-helpers";
import { postSchema } from "@/lib/schemas/community";
import { FormPart } from "@/components/form/form-part";
import { FormActions } from "@/components/layout";

const CHART_TYPES = [
  { value: "", label: "No chart" },
  { value: "bar", label: "Bar chart" },
  { value: "line", label: "Line chart" },
  { value: "pie", label: "Pie chart" },
];


/** Writes a new experience post, or edits `post`. Five picture slots and six chart rows keep the form simple. */
export function PostForm({ post = null }) {
  const router = useRouter();
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: postSchema,
    send: (data) => (post ? sendJson("PATCH", `/api/posts/${post._id}`, data) : sendJson("POST", "/api/posts", data)),
    onSuccess: (result) => {
      toast.success(post ? "Post saved." : "Post published.");
      router.push(`/posts/${post ? post._id : result.id}`);
      router.refresh();
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearError} className="space-y-6 lg:space-y-8">
      <FormAlert>{formError}</FormAlert>
      <FormPart legend="Your post">
        <TextField id="title" label="Title" defaultValue={post?.title} error={errors.title} />
        <TextAreaField
          id="body"
          label="Your story"
          rows={12}
          hint="Markdown works: ## for a heading, **bold**, - for a list, [text](https://…) for a link."
          defaultValue={post?.body}
          error={errors.body}
        />
      </FormPart>

      <FormPart
        id="pictures"
        legend="Pictures (optional, up to five)"
        note="Paste the address of each picture, and describe it for people who cannot see it."
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="grid gap-3 sm:grid-cols-2">
            <TextField id={`imageUrl${n}`} label={`Picture ${n} address`} type="url" placeholder="https://" defaultValue={post?.images?.[n - 1]?.url} error={errors[`imageUrl${n}`]} />
            <TextField id={`imageAlt${n}`} label={`Picture ${n} description`} defaultValue={post?.images?.[n - 1]?.alt} error={errors[`imageAlt${n}`]} />
          </div>
        ))}
      </FormPart>

      <FormPart id="chart" legend="Chart (optional)">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField id="chartType" label="Type" options={CHART_TYPES} defaultValue={post?.chart?.type ?? ""} error={errors.chartType} />
          <TextField id="chartTitle" label="Chart title" defaultValue={post?.chart?.title} error={errors.chartTitle} />
        </div>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="grid grid-cols-[2fr_1fr] gap-2">
              <TextField id={`chartLabel${n}`} label={`Label ${n}`} defaultValue={post?.chart?.labels?.[n - 1]} error={errors[`chartLabel${n}`]} />
              <TextField
                id={`chartValue${n}`}
                label={`Value ${n}`}
                type="number"
                step="any"
                className="tabular-nums"
                defaultValue={post?.chart?.values?.[n - 1]}
                error={errors[`chartValue${n}`]}
              />
            </div>
          ))}
        </div>
      </FormPart>

      <FormActions>
        <SubmitButton pending={pending} pendingText="Saving…">
          {post ? "Save post" : "Publish post"}
        </SubmitButton>
      </FormActions>
    </form>
  );
}
