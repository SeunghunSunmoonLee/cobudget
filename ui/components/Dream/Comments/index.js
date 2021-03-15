import AddComment from "./AddComment";
import Comment from "./Comment";
import Log from "./Log";

const Comments = ({
  currentOrgMember,
  currentOrg,
  comments,
  dream,
  event,
  logs,
}) => {
  // separate logs are deprecated, logs are now created as regular comments, but merging with them here to avoid migrations
  const items = [
    ...comments.map((comment) => ({ ...comment, _type: "COMMENT" })),
    ...logs.map((log) => ({ ...log, _type: "LOG" })),
  ].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div>
      {(comments.length > 0 || currentOrgMember?.currentEventMembership) && (
        <div className="flex justify-between items-center">
          <h2 className="mb-4 text-2xl font-medium" id="comments">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </h2>
          {dream.discourseTopicUrl && <a target="_blank" href={dream.discourseTopicUrl}>Read it on Discourse</a>}
        </div>
      )}
      {items.map((comment, index) => {
        if (comment._type === "LOG") return <Log log={comment} key={index} />;
        return (
          <Comment
            comment={comment}
            currentOrgMember={currentOrgMember}
            dreamId={dream.id}
            showBorderBottom={Boolean(index + 1 !== comments.length)}
            key={comment.id}
            event={event}
          />
        );
      })}
      {currentOrgMember && (
        <AddComment
          currentOrgMember={currentOrgMember}
          currentOrg={currentOrg}
          dreamId={dream.id}
          event={event}
        />
      )}
    </div>
  );
};

export default Comments;
