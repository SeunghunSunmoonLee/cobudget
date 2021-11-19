import { useForm } from "react-hook-form";
import { useMutation, useQuery, gql } from "@apollo/client";
import Button from "components/Button";
import { SelectField } from "components/SelectInput";
import HappySpinner from "../../HappySpinner";

const EDIT_EVENT = gql`
  mutation editEvent($eventId: ID!, $discourseCategoryId: Int) {
    editEvent(eventId: $eventId, discourseCategoryId: $discourseCategoryId) {
      id
      discourseCategoryId
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
    }
  }
`;

const Discourse = ({ event, currentOrg }) => {
  const [editEvent, { loading }] = useMutation(EDIT_EVENT, {
    variables: { eventId: event.id },
  });

  const { data: { categories } = { categories: [] } } = useQuery(
    CATEGORIES_QUERY
  );

  const {
    handleSubmit,
    register,
    formState: { isDirty },
  } = useForm();

  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold mb-2">Category</h2>
      <p className="text-gray-700 mb-4">
        Select the discourse category that buckets in this collection will be
        posted to
      </p>
      <form
        onSubmit={handleSubmit((variables) => {
          editEvent({
            variables: {
              ...variables,
              discourseCategoryId: parseInt(variables.discourseCategoryId),
            },
          })
            //.then(() => handleClose())
            .catch((error) => alert(error.message));
        })}
      >
        {categories.length > 0 ? (
          <SelectField
            name="discourseCategoryId"
            defaultValue={event.discourseCategoryId}
            inputRef={register}
            className="my-4"
          >
            {categories.map((c) => (
              <option key={c.id} value={parseInt(c.id)}>
                {c.name}
              </option>
            ))}
          </SelectField>
        ) : (
          <HappySpinner />
        )}

        <div className="mt-2 flex justify-end">
          <Button
            color={event.color}
            type="submit"
            disabled={!isDirty}
            loading={loading}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Discourse;
