import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import TextField from "components/TextField";
import Button from "components/Button";
import { SelectField } from "../SelectInput";
import ColorPicker from "../ColorPicker";
import slugify from "../../utils/slugify";
import DeleteEventModal from "./DeleteEventModal";

const EDIT_EVENT = gql`
  mutation editEvent(
    $eventId: ID!
    $slug: String
    $title: String
    $archived: Boolean
    $registrationPolicy: RegistrationPolicy
    $color: String
  ) {
    editEvent(
      eventId: $eventId
      slug: $slug
      title: $title
      archived: $archived
      registrationPolicy: $registrationPolicy
      color: $color
    ) {
      id
      title
      slug
      archived
      registrationPolicy
      color
    }
  }
`;

export default function GeneralSettings({
  event,
  currentOrg,
  currentOrgMember,
}) {
  const [{ loading }, editEvent] = useMutation(EDIT_EVENT);
  const [color, setColor] = useState(event.color);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { isDirty },
  } = useForm();

  const startUrl = currentOrg.customDomain
    ? currentOrg.customDomain + "/"
    : `${currentOrg.subdomain}.${process.env.DEPLOY_URL}/`;

  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold">General</h2>
      <form
        onSubmit={handleSubmit((variables) => {
          editEvent({
            ...variables,
            eventId: event.id,
            totalBudget: Number(variables.totalBudget),
            grantValue: Number(variables.grantValue),
            grantsPerMember: Number(variables.grantsPerMember),
            dreamReviewIsOpen: variables.dreamReviewIsOpen === "true",
            archived: variables.archived === "true",
            color,
          })
            .then(() => alert("Settings updated!"))
            .catch((error) => alert(error.message));
        })}
      >
        <TextField
          name="title"
          label="Title"
          placeholder="Title"
          defaultValue={event.title}
          inputRef={register}
          className="my-4"
        />

        <TextField
          name="slug"
          label="URL"
          placeholder="Slug"
          defaultValue={event.slug}
          inputRef={register}
          startAdornment={startUrl}
          inputProps={{
            onBlur: (e) => {
              setValue("slug", slugify(e.target.value));
            },
          }}
          className="my-4"
        />

        <SelectField
          name="registrationPolicy"
          label="Registration policy"
          defaultValue={event.registrationPolicy}
          inputRef={register}
          className="my-4"
        >
          <option value="OPEN">Open</option>
          <option value="REQUEST_TO_JOIN">Request to join</option>
          <option value="INVITE_ONLY">Invite only</option>
        </SelectField>

        <ColorPicker color={color} setColor={(color) => setColor(color)} />

        {currentOrgMember.isOrgAdmin && (
          <SelectField
            name="archived"
            label="Archive event"
            defaultValue={event.archived ? "true" : "false"}
            inputRef={register}
            className="my-4"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </SelectField>
        )}

        {currentOrgMember.isOrgAdmin && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Danger Zone</h2>
            <Button
              onClick={() => setIsDeleteModalOpened(true)}
              variant="secondary"
              color="red"
            >
              Delete this event
            </Button>
          </>
        )}

        <div className="mt-2 flex justify-end">
          <Button
            color={color}
            type="submit"
            disabled={!(isDirty || event.color !== color)}
            loading={loading}
          >
            Save
          </Button>
        </div>
      </form>

      {isDeleteModalOpened && (
        <DeleteEventModal
          event={event}
          handleClose={() => {
            setIsDeleteModalOpened(false);
          }}
          currentOrg={currentOrg}
        />
      )}
    </div>
  );
}
