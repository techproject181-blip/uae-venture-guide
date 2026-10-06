"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckboxField, CheckboxGroup, SelectField, TextAreaField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { EMIRATES, EXPERTISE, FUNDER_TYPES, SECTORS } from "@/lib/constants";
import { sendJson } from "@/lib/form-helpers";
import { funderProfileSchema, mentorProfileSchema } from "@/lib/schemas/community";
import { FormPart } from "@/components/form/form-part";
import { FormActions } from "@/components/layout";

function useProfileForm(schema) {
  const router = useRouter();
  return useApiForm({
    schema,
    send: (data) => sendJson("PUT", "/api/profile", data),
    onSuccess: () => {
      toast.success("Profile saved.");
      router.refresh();
    },
  });
}

export function MentorProfileForm({ name, profile }) {
  const { errors, formError, pending, handleSubmit, clearError } = useProfileForm(mentorProfileSchema);

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearError} className="space-y-6 lg:space-y-8">
      <FormAlert>{formError}</FormAlert>
      <FormPart legend="Who you are">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="name" label="Full name" autoComplete="name" defaultValue={name} error={errors.name} />
          <TextField
            id="yearsExperience"
            label="Years of experience"
            type="number"
            min="0"
            inputMode="numeric"
            defaultValue={profile?.yearsExperience ?? 0}
            error={errors.yearsExperience}
          />
        </div>
        <TextField
          id="headline"
          label="Headline"
          placeholder="For example: Founder of two cafés in Dubai"
          defaultValue={profile?.headline}
          error={errors.headline}
        />
        <TextAreaField
          id="bio"
          label="About you"
          rows={5}
          hint="Your experience, and how you like to help founders."
          defaultValue={profile?.bio}
          error={errors.bio}
        />
        <TextField
          id="linkedinUrl"
          label="LinkedIn profile (optional)"
          type="url"
          placeholder="https://www.linkedin.com/in/…"
          defaultValue={profile?.linkedinUrl}
          error={errors.linkedinUrl}
        />
      </FormPart>
      <FormPart legend="Where you can help">
        <CheckboxGroup
          id="expertise"
          label="What you can help with"
          options={EXPERTISE}
          defaultValues={profile?.expertise ?? []}
          error={errors.expertise}
        />
        <CheckboxGroup
          id="industries"
          label="Industries you know (optional)"
          options={SECTORS}
          defaultValues={profile?.industries ?? []}
          error={errors.industries}
        />
        <CheckboxGroup
          id="emirates"
          label="Emirates you know"
          options={EMIRATES}
          defaultValues={profile?.emirates ?? []}
          error={errors.emirates}
        />
      </FormPart>
      <FormPart
        id="requests"
        legend="Guidance requests"
        note="Turn this off when you are busy. Founders still see your profile, but cannot send you new requests."
      >
        <CheckboxField
          id="acceptingRequests"
          label="I am taking new guidance requests"
          defaultChecked={profile?.acceptingRequests ?? true}
        />
      </FormPart>
      <FormActions>
        <SubmitButton pending={pending} pendingText="Saving…">
          Save profile
        </SubmitButton>
      </FormActions>
    </form>
  );
}

export function FunderProfileForm({ name, profile }) {
  const { errors, formError, pending, handleSubmit, clearError } = useProfileForm(funderProfileSchema);

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearError} className="space-y-6 lg:space-y-8">
      <FormAlert>{formError}</FormAlert>
      <FormPart legend="Who you are">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="name" label="Full name" autoComplete="name" defaultValue={name} error={errors.name} />
          <TextField
            id="organization"
            label="Organisation"
            hint="Or your own name if you invest alone."
            defaultValue={profile?.organization}
            error={errors.organization}
          />
          <SelectField
            id="funderType"
            label="Type of funder"
            options={FUNDER_TYPES}
            placeholder="Choose…"
            defaultValue={profile?.funderType}
            error={errors.funderType}
          />
        </div>
      </FormPart>
      <FormPart legend="What you invest in">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="ticketMinAed"
            label="Smallest investment (AED)"
            type="number"
            min="0"
            inputMode="numeric"
            className="tabular-nums"
            defaultValue={profile?.ticketMinAed}
            error={errors.ticketMinAed}
          />
          <TextField
            id="ticketMaxAed"
            label="Largest investment (AED)"
            type="number"
            min="0"
            inputMode="numeric"
            className="tabular-nums"
            defaultValue={profile?.ticketMaxAed}
            error={errors.ticketMaxAed}
          />
        </div>
        <CheckboxGroup
          id="sectors"
          label="Sectors you invest in"
          options={SECTORS}
          defaultValues={profile?.sectors ?? []}
          error={errors.sectors}
        />
        <TextAreaField
          id="bio"
          label="What you look for"
          rows={5}
          hint="The kind of founders and ideas you like to support."
          defaultValue={profile?.bio}
          error={errors.bio}
        />
      </FormPart>
      <FormActions>
        <SubmitButton pending={pending} pendingText="Saving…">
          Save profile
        </SubmitButton>
      </FormActions>
    </form>
  );
}
