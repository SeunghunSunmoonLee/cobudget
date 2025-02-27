import { useEffect, useState } from "react";
import { useQuery, gql } from "urql";
import Link from "next/link";
import DreamCard from "../../../components/DreamCard";
import Filterbar from "../../../components/Filterbar";
import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";
import Button from "../../../components/Button";
import NewDreamModal from "../../../components/NewDreamModal";
import EditableField from "../../../components/EditableField";
import LoadMore from "../../../components/LoadMore";

export const BUCKET_STATUS_QUERY = gql`
  query BucketStatus($collectionSlug: String!, $orgSlug: String) {
    collection(collectionSlug: $collectionSlug, orgSlug: $orgSlug) {
      id
      bucketStatusCount {
        PENDING_APPROVAL
        OPEN_FOR_FUNDING
        FUNDED
        CANCELED
        COMPLETED
      }
    }
  }
`;

export const BUCKETS_QUERY = gql`
  query Buckets(
    $collectionId: ID!
    $textSearchTerm: String
    $tag: String
    $offset: Int
    $limit: Int
    $status: [StatusType!]
  ) {
    bucketsPage(
      collectionId: $collectionId
      textSearchTerm: $textSearchTerm
      tag: $tag
      offset: $offset
      limit: $limit
      status: $status
    ) {
      moreExist
      buckets {
        id
        description
        summary
        title
        minGoal
        maxGoal
        income
        totalContributions
        noOfComments
        published
        approved
        canceled
        customFields {
          value
          customField {
            id
            name
            type
            limit
            description
            isRequired
            position
            createdAt
          }
        }
        images {
          id
          small
          large
        }
      }
    }
  }
`;

const Page = ({
  variables,
  isLastPage,
  isFirstPage,
  onLoadMore,
  router,
  collection,
  org,
  statusFilter,
}) => {
  const { tag, s } = router.query;

  const [{ data, fetching, error }] = useQuery({
    query: BUCKETS_QUERY,
    variables: {
      collectionId: collection.id,
      offset: variables.offset,
      limit: variables.limit,
      status: statusFilter,
      ...(!!s && { textSearchTerm: s }),
      ...(!!tag && { tag }),
    },
  });

  const moreExist = data?.bucketsPage.moreExist;
  const buckets = data?.bucketsPage.buckets ?? [];

  if (error) {
    console.error(error);
  }

  return (
    <>
      {buckets.map((bucket) => (
        <Link
          href={`/${org?.slug ?? "c"}/${collection.slug}/${bucket.id}`}
          key={bucket.id}
        >
          <a className="flex focus:outline-none focus:ring rounded-lg">
            <DreamCard
              dream={bucket}
              collection={collection}
              currentOrg={org}
            />
          </a>
        </Link>
      ))}
      {isFirstPage && buckets.length === 0 && !fetching && (
        <div className="absolute w-full flex justify-center items-center h-64">
          <h1 className="text-3xl text-gray-500 text-center ">No buckets...</h1>
        </div>
      )}
      {isLastPage && moreExist && (
        <div className="absolute bottom-0 justify-center flex w-full">
          <LoadMore
            moreExist={moreExist}
            loading={fetching}
            onClick={() =>
              onLoadMore({
                limit: variables.limit,
                offset: variables.offset + buckets.length,
              })
            }
          />{" "}
        </div>
      )}
    </>
  );
};

const stringOrArrayIntoArray = (stringOrArray) => {
  if (stringOrArray instanceof Array) return stringOrArray;
  return stringOrArray ? [stringOrArray] : [];
};

const getStandardFilter = (bucketStatusCount) => {
  let stdFilter = [];

  // if there is either pending or open for funding buckets, show those categories
  if (
    bucketStatusCount["PENDING_APPROVAL"] ||
    bucketStatusCount["OPEN_FOR_FUNDING"]
  ) {
    if (bucketStatusCount["PENDING_APPROVAL"])
      stdFilter.push("PENDING_APPROVAL");
    if (bucketStatusCount["OPEN_FOR_FUNDING"])
      stdFilter.push("OPEN_FOR_FUNDING");
  } else {
    // otherwise show every other
    const statusNames = Object.keys(bucketStatusCount);
    const values = Object.values(bucketStatusCount);
    stdFilter = statusNames.filter((status, i) => !!values[i]);
  }
  return stdFilter;
};

const CollectionPage = ({ collection, router, currentOrg, currentUser }) => {
  const [newDreamModalOpen, setNewDreamModalOpen] = useState(false);
  const [pageVariables, setPageVariables] = useState([
    { limit: 12, offset: 0 },
  ]);
  const [
    {
      data: { collection: { bucketStatusCount } } = {
        collection: { bucketStatusCount: {} },
      },
    },
  ] = useQuery({
    query: BUCKET_STATUS_QUERY,
    variables: {
      collectionSlug: collection?.slug,
      orgSlug: currentOrg?.slug ?? "c",
    },
  });

  const { tag, s, f } = router.query;

  const [statusFilter, setStatusFilter] = useState(stringOrArrayIntoArray(f));

  useEffect(() => {
    setStatusFilter(stringOrArrayIntoArray(f));
  }, [f]);

  // apply standard filter (hidden from URL)
  useEffect(() => {
    const filter = f ?? getStandardFilter(bucketStatusCount);
    setStatusFilter(stringOrArrayIntoArray(filter));
  }, [bucketStatusCount]);

  if (!collection) return null;
  const canEdit =
    currentUser?.currentOrgMember?.isAdmin ||
    currentUser?.currentCollMember?.isAdmin;
  return (
    <div>
      <SubMenu currentUser={currentUser} collection={collection} />
      <PageHero>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-2">
            <EditableField
              defaultValue={collection.info}
              name="info"
              label="Add homepage message"
              placeholder={`# Welcome to ${collection.title}'s dream page`}
              canEdit={canEdit}
              className="h-10"
              MUTATION={gql`
                mutation EditHomepageMessage(
                  $collectionId: ID!
                  $info: String
                ) {
                  editCollection(collectionId: $collectionId, info: $info) {
                    id
                    info
                  }
                }
              `}
              variables={{ collectionId: collection.id }}
              required
            />
          </div>
          <div className="flex justify-end items-start">
            {collection.bucketCreationIsOpen &&
              currentUser?.currentCollMember?.isApproved && (
                <>
                  <Button
                    size="large"
                    color={collection.color}
                    onClick={() => setNewDreamModalOpen(true)}
                  >
                    New bucket
                  </Button>
                  {newDreamModalOpen && (
                    <NewDreamModal
                      collection={collection}
                      handleClose={() => setNewDreamModalOpen(false)}
                      currentOrg={currentOrg}
                    />
                  )}
                </>
              )}
          </div>
        </div>
      </PageHero>

      <div className="page flex-1">
        <Filterbar
          collection={collection}
          currentOrg={currentOrg}
          textSearchTerm={s}
          tag={tag}
          statusFilter={statusFilter}
          bucketStatusCount={bucketStatusCount}
        />
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 relative pb-20">
          {pageVariables.map((variables, i) => {
            return (
              <Page
                org={currentOrg}
                router={router}
                collection={collection}
                key={"" + variables.limit + i}
                variables={variables}
                isFirstPage={i === 0}
                isLastPage={i === pageVariables.length - 1}
                onLoadMore={({ limit, offset }) => {
                  setPageVariables([...pageVariables, { limit, offset }]);
                }}
                statusFilter={statusFilter}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
